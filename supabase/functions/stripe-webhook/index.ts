// Supabase Edge Function: stripe-webhook
// Deploy: supabase functions deploy stripe-webhook --no-verify-jwt
// Set secrets: supabase secrets set STRIPE_SECRET_KEY=sk_xxx STRIPE_WEBHOOK_SECRET=whsec_xxx
// Map to Stripe webhook URL: https://your-project.supabase.co/functions/v1/stripe-webhook

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') || '';
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function verifyStripeSignature(body: string, signature: string): Promise<any> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(STRIPE_WEBHOOK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  );

  const parts = signature.split(',');
  const timestampPart = parts.find((p: string) => p.startsWith('t='));
  const signaturePart = parts.find((p: string) => p.startsWith('v1='));
  if (!timestampPart || !signaturePart) throw new Error('Invalid signature format');

  const timestamp = timestampPart.slice(2);
  const expectedSig = signaturePart.slice(3);
  const payload = `${timestamp}.${body}`;

  const valid = await crypto.subtle.verify(
    'HMAC',
    key,
    hexToBytes(expectedSig),
    encoder.encode(payload),
  );

  if (!valid) throw new Error('Invalid signature');
  return JSON.parse(body);
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature') || '';

    let event;
    try {
      event = await verifyStripeSignature(body, signature);
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401 });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.metadata?.order_id;

      if (orderId) {
        const { error } = await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            payment_method: 'card',
            stripe_session_id: session.id,
            stripe_payment_intent_id: session.payment_intent,
            status: 'confirmed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId);

        if (error) {
          console.error('Failed to update order:', error);
          return new Response(JSON.stringify({ error: 'Database update failed' }), { status: 500 });
        }
      }
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object;
      const orderId = session.metadata?.order_id;

      if (orderId) {
        await supabase
          .from('orders')
          .update({
            payment_status: 'failed',
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId);
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 });
  }
});
