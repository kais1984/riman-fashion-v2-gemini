import * as Sentry from '@sentry/react';
import { browserTracingIntegration } from '@sentry/browser';

export function initSentry() {
  const dsn = import.meta.env.SENTRY_DSN;
  if (!dsn) {
    console.info('[Sentry] No SENTRY_DSN provided — error tracking disabled');
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION || 'unknown',
    integrations: [
      browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.01,
    replaysOnErrorSampleRate: 1.0,
    beforeSend(event, hint) {
      // Filter out noisy errors
      if (event.exception) {
        const error = hint.originalException;
        if (error instanceof Error) {
          // Ignore network errors we can't control
          if (error.name === 'NetworkError' || error.message.includes('NetworkError')) {
            return null;
          }
          // Ignore ResizeObserver loop errors (browser quirk)
          if (error.message.includes('ResizeObserver loop')) {
            return null;
          }
        }
      }
      return event;
    },
    ignoreErrors: [
      'Non-Error promise rejection captured',
      'ResizeObserver loop limit exceeded',
      'NetworkError',
      'Failed to fetch',
      'Load failed',
    ],
    denyUrls: [
      /browserlink/,
      /chrome-extension/,
      /moz-extension/,
    ],
  });

  console.log('[Sentry] Initialized');
}

export { Sentry };