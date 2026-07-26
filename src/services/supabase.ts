import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        fetch: (...args: [input: RequestInfo, init?: RequestInit]) => {
          const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
          return fetch(...args).catch(err => {
            if (err instanceof TypeError && err.message === 'Failed to fetch') {
              console.error(
                `%c[Riman] Network Error: Failed to fetch from: ${url}\n` +
                'This usually means the URL is unreachable, blocked by CSP/CORS, or you are offline.',
                'color: #ff4d4d; font-weight: bold;'
              );
            }
            throw err;
          });
        }
      }
    })
  : (null as unknown as SupabaseClient);

export const isSupabaseConfigured = isConfigured;

if (isConfigured) {
  const maskedUrl = supabaseUrl.replace(/(https?:\/\/).{5}/, '$1*****');
  console.info(`%c[Riman] Connecting to Supabase: ${maskedUrl}`, 'color: #d4a574; font-weight: bold;');
}

if (!isConfigured) {
  console.warn(
    '[Riman] Supabase is not configured. Using offline/local mode. ' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file to enable the backend.'
  );
}