import { useEffect, useRef } from 'react';

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id: string) => void;
      remove: (id: string) => void;
    };
  }
}

interface Props {
  onToken: (token: string | null) => void;
}

/**
 * Cloudflare Turnstile bot protection for auth forms.
 * If VITE_TURNSTILE_SITE_KEY is not set (dashboard CAPTCHA not enabled yet),
 * renders nothing and auth works exactly as before — zero lockout risk.
 */
export default function TurnstileCaptcha({ onToken }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const cb = useRef(onToken);
  cb.current = onToken;

  useEffect(() => {
    if (!SITE_KEY || !ref.current) return;
    let cancelled = false;

    const render = () => {
      if (cancelled || !ref.current || !window.turnstile || widgetId.current) return;
      widgetId.current = window.turnstile.render(ref.current, {
        sitekey: SITE_KEY,
        callback: (token: string) => cb.current(token),
        'expired-callback': () => cb.current(null),
        'error-callback': () => cb.current(null),
      });
    };

    if (window.turnstile) {
      render();
    } else {
      const script = document.querySelector(`script[src="${SCRIPT_SRC}"]`) || (() => {
        const s = document.createElement('script');
        s.src = SCRIPT_SRC;
        s.async = true;
        s.defer = true;
        document.head.appendChild(s);
        return s;
      })();
      script.addEventListener('load', render);
      return () => {
        cancelled = true;
        script.removeEventListener('load', render);
      };
    }

    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) {
        try { window.turnstile.remove(widgetId.current); } catch { /* noop */ }
        widgetId.current = null;
      }
    };
  }, []);

  if (!SITE_KEY) return null;
  return <div ref={ref} className="flex justify-center my-4" />;
}

export function resetTurnstile() {
  // Tokens are single-use; parent clears its state and the widget auto-refreshes on expiry.
}
