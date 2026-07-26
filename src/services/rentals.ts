import { supabase } from './supabase';

export interface RentalBooking {
  id?: string;
  order_item_id?: string;
  product_id: string;
  user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  start_date: string;
  end_date: string;
  status: string;
  deposit_collected?: number;
  deposit_refunded?: number;
  condition_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export async function fetchRentalBookings(): Promise<RentalBooking[]> {
  const { data, error } = await supabase
    .from('rental_bookings')
    .select('*')
    .order('start_date', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function fetchBookedDates(productId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('rental_bookings')
    .select('start_date, end_date')
    .eq('product_id', productId)
    .neq('status', 'cancelled');

  if (error) throw error;

  const dates: string[] = [];
  (data || []).forEach((booking) => {
    const start = new Date(booking.start_date);
    const end = new Date(booking.end_date);
    const current = new Date(start);
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
  });

  return dates;
}

export async function createRentalBooking(booking: RentalBooking): Promise<RentalBooking> {
  const { data, error } = await supabase
    .from('rental_bookings')
    .insert(booking)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateRentalBookingStatus(id: string, status: string, notes?: string): Promise<RentalBooking> {
  const updates: any = { status, updated_at: new Date().toISOString() };
  if (notes) updates.condition_notes = notes;

  const { data, error } = await supabase
    .from('rental_bookings')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function returnRental(id: string, refundAmount: number, conditionNotes: string): Promise<RentalBooking> {
  const { data, error } = await supabase
    .from('rental_bookings')
    .update({
      status: 'returned',
      deposit_refunded: refundAmount,
      condition_notes: conditionNotes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}