import { describe, it, expect, vi, beforeEach } from 'vitest';

beforeEach(() => {
  vi.restoreAllMocks();
  global.fetch = vi.fn();
});

describe('createCheckoutSession', () => {
  it('returns null when endpoint is not configured', async () => {
    vi.stubEnv('VITE_STRIPE_CHECKOUT_ENDPOINT', '');
    const { createCheckoutSession } = await import('./payment');
    const result = await createCheckoutSession({
      items: [],
      subtotal: 1000,
      orderType: 'sale',
      successUrl: 'http://localhost:3001/success',
      cancelUrl: 'http://localhost:3001/cancel',
      customerName: 'Jane Doe',
      customerEmail: 'jane@example.com',
    });
    expect(result).toBeNull();
  });

  it('returns URL on successful session creation', async () => {
    vi.stubEnv('VITE_STRIPE_CHECKOUT_ENDPOINT', 'https://example.com/create-checkout');
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ url: 'https://checkout.stripe.com/session_123' }),
    });
    const { createCheckoutSession } = await import('./payment');

    const result = await createCheckoutSession({
      items: [{ name: 'Test Gown', price: 45000, quantity: 1, productType: 'sale' }],
      subtotal: 45000,
      orderType: 'sale',
      successUrl: 'http://localhost:3001/success',
      cancelUrl: 'http://localhost:3001/cancel',
      customerName: 'Jane Doe',
      customerEmail: 'jane@example.com',
    });

    expect(result).toBe('https://checkout.stripe.com/session_123');
  });

  it('returns null on API error', async () => {
    vi.stubEnv('VITE_STRIPE_CHECKOUT_ENDPOINT', 'https://example.com/create-checkout');
    (global.fetch as any).mockResolvedValue({
      ok: false,
      text: () => Promise.resolve('Service unavailable'),
    });
    const { createCheckoutSession } = await import('./payment');

    const result = await createCheckoutSession({
      items: [],
      subtotal: 1000,
      orderType: 'sale',
      successUrl: 'http://localhost:3001/success',
      cancelUrl: 'http://localhost:3001/cancel',
      customerName: 'Jane Doe',
      customerEmail: 'jane@example.com',
    });

    expect(result).toBeNull();
  });
});

describe('verifyCheckoutSession', () => {
  it('returns null when endpoint is not configured', async () => {
    vi.stubEnv('VITE_STRIPE_CHECKOUT_ENDPOINT', '');
    const { verifyCheckoutSession } = await import('./payment');
    const result = await verifyCheckoutSession('cs_test_123');
    expect(result).toBeNull();
  });

  it('returns payment status on success', async () => {
    vi.stubEnv('VITE_STRIPE_CHECKOUT_ENDPOINT', 'https://example.com/create-checkout');
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ paid: true, orderId: 'order_123', customerEmail: 'jane@example.com' }),
    });
    const { verifyCheckoutSession } = await import('./payment');

    const result = await verifyCheckoutSession('cs_test_123');
    expect(result?.paid).toBe(true);
    expect(result?.orderId).toBe('order_123');
  });
});

describe('isStripeConfigured', () => {
  it('returns false when env var is not set', async () => {
    vi.stubEnv('VITE_STRIPE_CHECKOUT_ENDPOINT', '');
    const { isStripeConfigured } = await import('./payment');
    expect(isStripeConfigured()).toBe(false);
  });

  it('returns true when env var is set', async () => {
    vi.stubEnv('VITE_STRIPE_CHECKOUT_ENDPOINT', 'https://example.com/create-checkout');
    const { isStripeConfigured } = await import('./payment');
    expect(isStripeConfigured()).toBe(true);
  });
});
