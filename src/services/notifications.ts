const NOTIFICATION_ENDPOINT = import.meta.env.VITE_NOTIFICATION_WEBHOOK || '';

interface OrderNotification {
  type: 'order_confirmed' | 'appointment_booked' | 'contact_submitted';
  to: string;
  subject: string;
  data: Record<string, any>;
}

export async function sendNotification(notification: OrderNotification): Promise<boolean> {
  if (!NOTIFICATION_ENDPOINT) {
    console.info('[Riman] Notification skipped — no VITE_NOTIFICATION_WEBHOOK configured.');
    return false;
  }

  try {
    const response = await fetch(NOTIFICATION_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notification),
    });
    return response.ok;
  } catch (err) {
    console.error('[Riman] Notification failed:', err);
    return false;
  }
}

export function buildOrderConfirmationEmail(order: {
  id?: string;
  customer_name?: string;
  customer_email?: string;
  subtotal: number;
  type: string;
}): OrderNotification {
  return {
    type: 'order_confirmed',
    to: order.customer_email || '',
    subject: `Order Confirmed — ${order.id?.slice(0, 8)} | Atelier Riman`,
    data: {
      order_id: order.id,
      customer_name: order.customer_name,
      total: order.subtotal,
      type: order.type,
    },
  };
}

export function buildAppointmentEmail(appointment: {
  name: string;
  email: string;
  date: string;
  time: string;
  service_type: string;
}): OrderNotification {
  return {
    type: 'appointment_booked',
    to: appointment.email,
    subject: `Appointment Confirmed — ${appointment.date} | Atelier Riman`,
    data: {
      name: appointment.name,
      date: appointment.date,
      time: appointment.time,
      service: appointment.service_type,
    },
  };
}
