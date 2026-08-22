/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_STRIPE_CHECKOUT_ENDPOINT: string;
  readonly VITE_CREATE_ORDER_ENDPOINT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}