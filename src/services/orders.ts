import { supabase } from './supabase';

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  product_name: string;
  product_type: string;
  size?: string;
  quantity: number;
  unit_price: number;
  rental_start_date?: string;
  rental_end_date?: string;
  security_deposit?: number;
  deposit_status?: string;
  deposit_deductions?: number;
  deposit_notes?: string;
}

export interface Order {
  id?: string;
  customer_id?: string;
  user_id?: string;
  status: string;
  type: string;
  subtotal: number;
  notes?: string;
  admin_notes?: string;
  payment_method?: string;
  payment_status?: string;
  stripe_session_id?: string;
  items?: OrderItem[];
  created_at?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  customer_city?: string;
  customer_country?: string;
}

export async function createOrder(order: Order, items: OrderItem[]): Promise<Order> {
  const { data: { user } } = await supabase.auth.getUser();

  let customerId: string | undefined;

  const { data: existingCustomer } = await supabase
    .from('customers')
    .select('id')
    .eq('email', order.customer_email || '')
    .maybeSingle();

  if (existingCustomer) {
    customerId = existingCustomer.id;
  } else if (order.customer_name && order.customer_email) {
    const { data: newCustomer, error: customerError } = await supabase
      .from('customers')
      .insert({
        name: order.customer_name,
        email: order.customer_email,
        phone: order.customer_phone,
        address: order.customer_address,
        city: order.customer_city,
        country: order.customer_country || 'United Arab Emirates',
      })
      .select()
      .single();

    if (customerError) throw customerError;
    customerId = newCustomer.id;
  }

  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_id: customerId,
      user_id: user?.id,
      status: order.status || 'pending',
      type: order.type,
      subtotal: order.subtotal,
      notes: order.notes,
    })
    .select()
    .single();

  if (orderError) throw orderError;

  const orderItems = items.map(item => ({
    ...item,
    order_id: orderData.id,
  }));

  const { data: insertedItems, error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)
    .select();

  if (itemsError) throw itemsError;

  for (const item of insertedItems) {
    if (item.rental_start_date && item.rental_end_date) {
      await supabase.from('rental_bookings').insert({
        order_item_id: item.id,
        product_id: item.product_id,
        user_id: user?.id,
        customer_name: order.customer_name || '',
        customer_email: order.customer_email || '',
        customer_phone: order.customer_phone,
        start_date: item.rental_start_date,
        end_date: item.rental_end_date,
        status: 'confirmed',
        deposit_collected: item.security_deposit || 0,
      });
    }
  }

  return { ...orderData, items: insertedItems };
}

export async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customers:customer_id (name, email, phone),
      order_items (*)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapDbOrder);
}

export async function fetchOrderById(id: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customers:customer_id (name, email, phone),
      order_items (*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data ? mapDbOrder(data) : null;
}

export async function updateOrderStatus(id: string, status: string, adminNotes?: string): Promise<Order> {
  const updates: any = { status, updated_at: new Date().toISOString() };
  if (adminNotes !== undefined) updates.admin_notes = adminNotes;

  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapDbOrder(data);
}

function mapDbOrder(row: any): Order {
  return {
    id: row.id,
    customer_id: row.customer_id,
    user_id: row.user_id,
    status: row.status,
    payment_method: row.payment_method,
    payment_status: row.payment_status,
    stripe_session_id: row.stripe_session_id,
    type: row.type,
    subtotal: row.subtotal,
    notes: row.notes,
    admin_notes: row.admin_notes,
    items: row.order_items?.map((item: any) => ({
      id: item.id,
      order_id: item.order_id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_type: item.product_type,
      size: item.size,
      quantity: item.quantity,
      unit_price: item.unit_price,
      rental_start_date: item.rental_start_date,
      rental_end_date: item.rental_end_date,
      security_deposit: item.security_deposit,
      deposit_status: item.deposit_status,
      deposit_deductions: item.deposit_deductions,
      deposit_notes: item.deposit_notes,
    })) || [],
    created_at: row.created_at,
    customer_name: row.customers?.name,
    customer_email: row.customers?.email,
    customer_phone: row.customers?.phone,
  };
}