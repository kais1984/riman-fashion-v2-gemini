// Supabase Edge Function: create-checkout
// Deploy: supabase functions deploy create-checkout --no-verify-jwt
// Set secrets: supabase secrets set STRIPE_SECRET_KEY=sk_xxx
// Also set: supabase secrets set RESEND_API_KEY=re_xxx (for order confirmation email)
// Also set: supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const FROM_EMAIL = 'Atelier Riman <orders@rimanfashion.com>';
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
const APP_URL = Deno.env.get('APP_URL') || 'http://localhost:3001';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface CheckoutRequest {
  items: Array<{
    product_id: string;
    name: string;
    price: number;
    quantity: number;
    productType: string;
    intent: 'sale' | 'rent';
  }>;
  subtotal: number;
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
  if (intent === 'rent') return product.rental_price ?? 0;
  return product.sale_price ?? 0;
}

serve(async (req) => {
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('session_id');
    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Missing session_id' }), { status: 400 });
    }
    return handleVerify(sessionId);
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const payload: CheckoutRequest = await req.json();

    if (!STRIPE_SECRET_KEY) {
      return new Response(
        JSON.stringify({ error: 'Stripe not configured' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (!payload.items?.length) {
      return new Response(JSON.stringify({ error: 'No items provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // --- Server-side price verification ---
    const productIds = [...new Set(payload.items.map((i) => i.product_id))];
    const { data: dbProducts, error: prodError } = await supabase
      .from('products')
      .select('id, name, product_type, sale_price, rental_price, is_active')
      .in('id', productIds);

    if (prodError) throw prodError;

    const productMap = new Map<string, ProductRow>();
    for (const p of dbProducts ?? []) productMap.set(p.id, p as ProductRow);

    const verifiedItems: Array<{
      name: string;
      price: number;
      quantity: number;
      productType: string;
    }> = [];

    for (const item of payload.items) {
      const db = productMap.get(item.product_id);
      if (!db || !db.is_active) {
        return new Response(
          JSON.stringify({ error: `Invalid or inactive product: ${item.product_id}` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }

      const intent = item.intent === 'rent' ? 'rent' : 'sale';
      const serverPrice = resolveUnitPrice(db, intent);

      if (serverPrice <= 0) {
        return new Response(
          JSON.stringify({ error: `Product "${db.name}" is not available for ${intent}` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }

      if (item.quantity < 1) {
        return new Response(
          JSON.stringify({ error: 'Invalid quantity' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }

      verifiedItems.push({
        name: db.name,
        price: serverPrice,
        quantity: item.quantity,
        productType: db.product_type,
      });
    }

    const verifiedSubtotal = verifiedItems.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0,
    );

    // 1. Create an order in pending_payment status
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', payload.customerEmail)
      .maybeSingle();

    let customerId = customer?.id;
    if (!customerId) {
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

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customerId,
        status: 'pending',
        type: payload.orderType,
        subtotal: verifiedSubtotal,
        notes: payload.notes,
        payment_method: 'card',
        payment_status: 'processing',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Create Stripe Checkout Session
    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'mode': 'payment',
        'success_url': `${APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        'cancel_url': `${APP_URL}/payment/cancel`,
        'customer_email': payload.customerEmail,
        'metadata[order_id]': order.id,
        ...verifiedItems.reduce((params, item, i) => {
          params[`line_items[${i}][price_data][currency]`] = 'aed';
          params[`line_items[${i}][price_data][product_data][name]`] = item.name;
          params[`line_items[${i}][price_data][unit_amount]`] = String(item.price * 100); // cents
          params[`line_items[${i}][quantity]`] = String(item.quantity);
          return params;
        }, {} as Record<string, string>),
      }),
    });

    const session = await stripeRes.json();

    if (!stripeRes.ok) {
      // Clean up the pending order
      await supabase.from('orders').delete().eq('id', order.id);
      throw new Error(session.error?.message || 'Failed to create Stripe session');
    }

    // Update order with Stripe session ID
    await supabase
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('id', order.id);

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('create-checkout error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

async function handleVerify(sessionId: string) {
  try {
    const sessionRes = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${sessionId}`,
      { headers: { 'Authorization': `Bearer ${STRIPE_SECRET_KEY}` } },
    );
    const session = await sessionRes.json();

    if (!sessionRes.ok) {
      return new Response(JSON.stringify({ paid: false }), { status: 200 });
    }

    const paid = session.payment_status === 'paid';
    const orderId = session.metadata?.order_id;

    let customerEmail = session.customer_details?.email || '';
    let orderData = null;

    if (orderId) {
      const { data } = await supabase
        .from('orders')
        .select('*, customers!inner(*)')
        .eq('id', orderId)
        .single();
      orderData = data;
      customerEmail = orderData?.customers?.email || customerEmail;

      if (paid && orderData?.payment_status !== 'paid') {
        await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            status: 'confirmed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId);
      }
    }

    // Send confirmation email if paid and Resend is configured
    if (paid && orderData && RESEND_API_KEY) {
      try {
        const htmlBody = `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"></head>
          <body style="font-family: Georgia, serif; color: #1a1a1a; padding: 40px;">
            <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e5e5e5; padding: 40px;">
              <h1 style="font-size: 20px; letter-spacing: 4px; text-transform: uppercase; color: #b8860b; margin-bottom: 30px; text-align: center;">Atelier Riman</h1>
              <p>Dear ${orderData.customer_name || 'Valued Client'},</p>
              <p>Thank you for your order. Your payment has been received and your pieces are being prepared at our Sharjah atelier.</p>
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Total Paid:</strong> AED ${(orderData.subtotal || 0).toLocaleString()}</p>
              <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;">
              <p style="font-size: 12px; color: #666; text-align: center;">Al Zahra St, Sharjah, UAE | hello@rimanfashion.com</p>
            </div>
          </body>
          </html>
        `;

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: customerEmail,
            subject: `Payment Confirmed — ${orderId?.slice(0, 8)} | Atelier Riman`,
            html: htmlBody,
          }),
        });
      } catch (emailErr) {
        console.error('Failed to send confirmation email:', emailErr);
      }
    }

    return new Response(JSON.stringify({
      paid,
      orderId: orderId || undefined,
      customerEmail,
    }), { status: 200 });
  } catch (err) {
    console.error('Verify error:', err);
    return new Response(JSON.stringify({ paid: false }), { status: 200 });
  }
}
