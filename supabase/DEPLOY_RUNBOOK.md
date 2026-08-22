# Supabase Edge Functions — Deploy Runbook

Use this when you have **Stripe** and **Resend** accounts and their API keys.
Until then, checkout/orders still work (client-side) and emails are no-ops — the
site is fully usable without this step.

## What gets deployed
| Function            | Purpose                                  | Required secrets (you set)        |
|---------------------|------------------------------------------|-----------------------------------|
| `create-checkout`   | Creates a Stripe Checkout session        | `STRIPE_SECRET_KEY`, `APP_URL`    |
| `create-order`      | Writes the order to the DB (server-side) | *(none extra — uses project keys)*|
| `send-notification` | Sends confirmation emails via Resend     | `RESEND_API_KEY`                  |
| `stripe-webhook`    | Verifies Stripe events, updates status   | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are **auto-injected** by Supabase
for every function — you do NOT set those.

Your function URLs will all be:
`https://vbuavhnpemnfsuguglqn.supabase.co/functions/v1/<function-name>`

---

## Step 1 — Get the keys
- **Stripe**: stripe.com → Developers → API keys → copy **Secret key** (`sk_live_...`).
  Also create a **webhook** (Developers → Webhooks → Add endpoint) pointing at the
  `stripe-webhook` URL from Step 3, listening to `checkout.session.completed`;
  copy its **Signing secret** (`whsec_...`).
- **Resend**: resend.com → API Keys → create key (`re_...`).

## Step 2 — Deploy the 4 functions
**Dashboard method (no CLI needed):**
1. Supabase dashboard → **Edge Functions** (left sidebar).
2. Click **New function**, name it exactly `create-checkout`, paste the contents of
   `supabase/functions/create-checkout/index.ts`, click **Deploy**.
3. Repeat for `create-order`, `send-notification`, `stripe-webhook`
   (paste each `supabase/functions/<name>/index.ts`).
> If a function fails to deploy because it imports a shared file, use the CLI instead
> (below). Single-file paste works for these four as written.

**CLI method (if dashboard paste fails):** on any machine with the Supabase CLI:
```
supabase login
supabase link --project-ref vbuavhnpemnfsuguglqn
supabase functions deploy create-checkout
supabase functions deploy create-order
supabase functions deploy send-notification
supabase functions deploy stripe-webhook
```

## Step 3 — Set the secrets
Dashboard → **Settings** → **API** → **Edge Functions Secrets** → **Add secret** for each:
- `STRIPE_SECRET_KEY` = your Stripe secret key
- `STRIPE_WEBHOOK_SECRET` = your Stripe webhook signing secret
- `RESEND_API_KEY` = your Resend key
- `APP_URL` = `https://your-domain.com` (or `http://localhost:3001` for testing)

## Step 4 — Point Stripe webhook at the function
In Stripe (Developers → Webhooks), set the endpoint URL to:
`https://vbuavhnpemnfsuguglqn.supabase.co/functions/v1/stripe-webhook`

## Step 5 — Wire the app endpoints
In your project's `.env`, set:
```
VITE_STRIPE_CHECKOUT_ENDPOINT=https://vbuavhnpemnfsuguglqn.supabase.co/functions/v1/create-checkout
VITE_CREATE_ORDER_ENDPOINT=https://vbuavhnpemnfsuguglqn.supabase.co/functions/v1/create-order
VITE_NOTIFICATION_WEBHOOK=https://vbuavhnpemnfsuguglqn.supabase.co/functions/v1/send-notification
```
Then **restart the dev server** (`npm run dev`).

## Step 6 — Verify
1. Log in as admin → add a product, confirm it persists (DB-backed).
2. As a customer, place a test order → you should get a confirmation email and the
   order should appear in `/admin/orders`.

---

## Notes
- Catalog is already seeded (16 products) — no action needed for that.
- If you ever expose the service-role key (used only for seeding), rotate it:
  Dashboard → Settings → API → service_role key → **Roll**.
