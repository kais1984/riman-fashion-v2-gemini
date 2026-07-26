function getEndpoint(): string {
  return import.meta.env.VITE_STRIPE_CHECKOUT_ENDPOINT || '';
}

export async function createCheckoutSession(orderData: {
  items: Array<{
    product_id: string;
    name: string;
    price: number;
    quantity: number;
    productType: string;
    intent: 'sale' | 'rent';
  }>;
  subtotal: number;
  orderType: string;
  successUrl: string;
  cancelUrl: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  customerCity?: string;
  customerCountry?: string;
  notes?: string;
}): Promise<string | null> {
  const endpoint = getEndpoint();
  if (!endpoint) {
    console.info('[Riman] Stripe checkout not configured — set VITE_STRIPE_CHECKOUT_ENDPOINT');
    return null;
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[Riman] Checkout session creation failed:', err);
      return null;
    }

    const { url } = await response.json();
    return url;
  } catch (err) {
    console.error('[Riman] Failed to create checkout session:', err);
    return null;
  }
}

export async function verifyCheckoutSession(sessionId: string): Promise<{
  paid: boolean;
  orderId?: string;
  customerEmail?: string;
} | null> {
  const endpoint = getEndpoint();
  if (!endpoint) return null;

  try {
    const response = await fetch(`${endpoint}?session_id=${sessionId}`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export function isStripeConfigured(): boolean {
  return Boolean(getEndpoint());
}
