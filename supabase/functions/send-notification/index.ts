// Supabase Edge Function: send-notification
// Deploy: supabase functions deploy send-notification --no-verify-jwt
// Set secrets: supabase secrets set RESEND_API_KEY=re_xxx

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
const FROM_EMAIL = 'Atelier Riman <orders@rimanfashion.com>';

interface NotificationPayload {
  type: 'order_confirmed' | 'appointment_booked' | 'contact_submitted';
  to: string;
  subject: string;
  data: Record<string, any>;
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const payload: NotificationPayload = await req.json();

    if (!payload.to || !payload.subject) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const htmlBody = buildHtml(payload);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: payload.to,
        subject: payload.subject,
        html: htmlBody,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend API error:', err);
      return new Response(JSON.stringify({ error: 'Failed to send email' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Edge function error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

function buildHtml(payload: NotificationPayload): string {
  const { type, data } = payload;

  const orderRows = type === 'order_confirmed'
    ? `<p><strong>Order ID:</strong> ${data.order_id}</p>
       <p><strong>Customer:</strong> ${data.customer_name}</p>
       <p><strong>Total:</strong> AED ${data.total?.toLocaleString()}</p>
       <p><strong>Type:</strong> ${data.type}</p>`
    : '';

  const appointmentRows = type === 'appointment_booked'
    ? `<p><strong>Name:</strong> ${data.name}</p>
       <p><strong>Date:</strong> ${data.date}</p>
       <p><strong>Time:</strong> ${data.time}</p>
       <p><strong>Service:</strong> ${data.service}</p>`
    : '';

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Georgia, serif; color: #1a1a1a; padding: 40px;">
      <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e5e5e5; padding: 40px;">
        <h1 style="font-size: 20px; letter-spacing: 4px; text-transform: uppercase; color: #b8860b; margin-bottom: 30px; text-align: center;">Atelier Riman</h1>
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;">
        ${orderRows}
        ${appointmentRows}
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;">
        <p style="font-size: 12px; color: #666; text-align: center;">Al Zahra St, Sharjah, UAE | hello@rimanfashion.com</p>
      </div>
    </body>
    </html>
  `;
}
