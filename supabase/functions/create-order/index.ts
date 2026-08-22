// Supabase Edge Function: create-order
// Deploy: supabase functions deploy create-order --no-verify-jwt
// Set secrets: supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
//
// Server-trusted order creation for the in-atelier / pay-in-person flow.
// Prices are ALWAYS re-derived from the database here; client-sent prices are ignored.
// This lets you lock down client writes to `orders`/`order_items` via RLS, since the
// only trusted insert path is this service-role function.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
};

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface OrderRequestItem {
  product_id: string;
  intent: 'sale' | 'rent';
  quantity: number;
  size?: string;
  rental_start_date?: string;
  rental_end_date?: string;
  security_deposit?: number;
}

interface OrderRequest {
  items: OrderRequestItem[];
  orderType: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  customerCity?: string;
  customerCountry?: string;
  notes?: string;
}

interface ProductRow {
  id: string;
  name: string;
  product_type: string;
  sale_price: number | null;
  rental_price: number | null;
  is_active: boolean;
}

function resolveUnitPrice(product: ProductRow, intent: 'sale' | 'rent'): number {
  return intent === 'rent' ? (product.rental_price ?? 0) : (product.sale_price ?? 0);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const payload: OrderRequest = await req.json();

    if (!payload.items?.length) {
      return new Response(JSON.stringify({ error: 'No items provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- Server-side shipping validation (authoritative) ---
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.customerEmail || '');
    if (
      !payload.customerName?.trim() ||
      !payload.customerEmail?.trim() ||
      !emailValid ||
      !payload.customerPhone?.trim() ||
      (payload.customerPhone?.trim().length ?? 0) < 7 ||
      !payload.customerAddress?.trim() ||
      !payload.customerCity?.trim() ||
      !payload.customerCountry?.trim()
    ) {
      return new Response(
        JSON.stringify({ error: 'Invalid or incomplete shipping details' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // --- Server-side price verification (authoritative) ---
    const productIds = [...new Set(payload.items.map((i) => i.product_id))];
    const { data: dbProducts, error: prodError } = await supabase
      .from('products')
      .select('id, name, product_type, sale_price, rental_price, is_active')
      .in('id', productIds);

    if (prodError) throw prodError;

    const productMap = new Map<string, ProductRow>();
    for (const p of dbProducts ?? []) productMap.set(p.id, p as ProductRow);

    const verifiedItems: Array<{
      product_id: string;
      product_name: string;
      product_type: string;
      size?: string;
      quantity: number;
      unit_price: number;
      rental_start_date?: string;
      rental_end_date?: string;
      security_deposit?: number;
    }> = [];

    for (const item of payload.items) {
      const db = productMap.get(item.product_id);
      if (!db || !db.is_active) {
        return new Response(
          JSON.stringify({ error: `Invalid or inactive product: ${item.product_id}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      if (item.quantity < 1) {
        return new Response(JSON.stringify({ error: 'Invalid quantity' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const unitPrice = resolveUnitPrice(db, item.intent);
      if (unitPrice <= 0) {
        return new Response(
          JSON.stringify({ error: `Product "${db.name}" is not available for ${item.intent}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      verifiedItems.push({
        product_id: db.id,
        product_name: db.name,
        product_type: db.product_type,
        size: item.size,
        quantity: item.quantity,
        unit_price: unitPrice,
        rental_start_date: item.rental_start_date,
        rental_end_date: item.rental_end_date,
        security_deposit: item.security_deposit,
      });
    }

    const verifiedSubtotal = verifiedItems.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);

    // --- Customer (upsert by email) ---
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', payload.customerEmail)
      .maybeSingle();

    let customerId = existingCustomer?.id;
    if (!customerId && payload.customerName && payload.customerEmail) {
      const { data: newCustomer } = await supabase
        .from('customers')
        .insert({
          name: payload.customerName,
          email: payload.customerEmail,
          phone: payload.customerPhone,
          address: payload.customerAddress,
          city: payload.customerCity,
          country: payload.customerCountry || 'United Arab Emirates',
        })
        .select()
        .single();
      customerId = newCustomer?.id;
    }

    // --- Order ---
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customerId,
        status: 'pending',
        type: payload.orderType,
        subtotal: verifiedSubtotal,
        notes: payload.notes,
        payment_method: 'atelier',
        payment_status: 'pending',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const { data: insertedItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(verifiedItems.map((i) => ({ ...i, order_id: order.id })))
      .select();

    if (itemsError) throw itemsError;

    for (const item of insertedItems ?? []) {
      if (item.rental_start_date && item.rental_end_date) {
        await supabase.from('rental_bookings').insert({
          order_item_id: item.id,
          product_id: item.product_id,
          customer_name: payload.customerName,
          customer_email: payload.customerEmail,
          customer_phone: payload.customerPhone,
          start_date: item.rental_start_date,
          end_date: item.rental_end_date,
          status: 'confirmed',
          deposit_collected: item.security_deposit || 0,
        });
      }
    }

    return new Response(JSON.stringify({ orderId: order.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('create-order error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
