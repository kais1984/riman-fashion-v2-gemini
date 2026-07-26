param(
  [string]$SupabaseAccessToken,
  [string]$ResendApiKey,
  [string]$StripeSecretKey,
  [string]$StripeWebhookSecret,
  [string]$AppUrl = "http://localhost:3000"
)

$ErrorActionPreference = "Stop"

if (-not $SupabaseAccessToken) {
  Write-Host "ERROR: -SupabaseAccessToken is required" -ForegroundColor Red
  Write-Host "Get one from: https://supabase.com/dashboard/account/tokens" -ForegroundColor Yellow
  exit 1
}

$env:SUPABASE_ACCESS_TOKEN = $SupabaseAccessToken

Write-Host "=== Linking to Supabase project ===" -ForegroundColor Cyan
npx supabase link --project-ref gebhmvdyrbxnlpxgjwne

Write-Host "`n=== Deploying send-notification ===" -ForegroundColor Cyan
npx supabase functions deploy send-notification --no-verify-jwt
if ($ResendApiKey) {
  npx supabase secrets set RESEND_API_KEY=$ResendApiKey
}

Write-Host "`n=== Deploying create-checkout ===" -ForegroundColor Cyan
npx supabase functions deploy create-checkout --no-verify-jwt
if ($StripeSecretKey) {
  npx supabase secrets set STRIPE_SECRET_KEY=$StripeSecretKey
}
if ($AppUrl) {
  npx supabase secrets set APP_URL=$AppUrl
}

Write-Host "`n=== Deploying stripe-webhook ===" -ForegroundColor Cyan
npx supabase functions deploy stripe-webhook --no-verify-jwt
if ($StripeWebhookSecret) {
  npx supabase secrets set STRIPE_WEBHOOK_SECRET=$StripeWebhookSecret
}

Write-Host "`n=== Setting shared secrets ===" -ForegroundColor Cyan
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=$env:SUPABASE_SERVICE_ROLE_KEY

Write-Host "`n=== Done ===" -ForegroundColor Green
Write-Host "`nAfter deployment, configure .env locally:" -ForegroundColor Yellow
Write-Host "  VITE_STRIPE_CHECKOUT_ENDPOINT=https://gebhmvdyrbxnlpxgjwne.supabase.co/functions/v1/create-checkout" -ForegroundColor White
Write-Host "  VITE_NOTIFICATION_WEBHOOK=https://gebhmvdyrbxnlpxgjwne.supabase.co/functions/v1/send-notification" -ForegroundColor White

Write-Host "`nFor stripe-webhook, configure the webhook endpoint in Stripe Dashboard:" -ForegroundColor Yellow
Write-Host "  URL: https://gebhmvdyrbxnlpxgjwne.supabase.co/functions/v1/stripe-webhook" -ForegroundColor White
Write-Host "  Events: checkout.session.completed, checkout.session.expired" -ForegroundColor White
