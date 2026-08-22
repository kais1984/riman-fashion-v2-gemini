export interface DbProduct {
  id: string;
  name: string;
  product_type: string;
  sale_price: number | null;
  rental_price: number | null;
  is_active: boolean;
}

export interface ClientOrderItem {
  product_id: string;
  intent: 'sale' | 'rent';
  quantity: number;
  size?: string;
  rental_start_date?: string;
  rental_end_date?: string;
  security_deposit?: number;
}

export interface VerifiedOrderItem {
  product_id: string;
  product_name: string;
  product_type: string;
  size?: string;
  quantity: number;
  unit_price: number;
  rental_start_date?: string;
  rental_end_date?: string;
  security_deposit?: number;
}

export type VerifyResult =
  | { ok: true; items: VerifiedOrderItem[]; subtotal: number }
  | { ok: false; error: string };

export function isVerifyError(result: VerifyResult): result is { ok: false; error: string } {
  return !result.ok;
}

export function resolveUnitPrice(product: DbProduct, intent: 'sale' | 'rent'): number {
  return intent === 'rent' ? (product.rental_price ?? 0) : (product.sale_price ?? 0);
}

export function verifyOrderItems(
  items: ClientOrderItem[],
  dbProducts: DbProduct[],
): VerifyResult {
  if (!items.length) {
    return { ok: false, error: 'No items provided' };
  }

  const productMap = new Map(dbProducts.map(p => [p.id, p]));

  const verified: VerifiedOrderItem[] = [];

  for (const item of items) {
    const db = productMap.get(item.product_id);
    if (!db || !db.is_active) {
      return { ok: false, error: `Invalid or inactive product: ${item.product_id}` };
    }

    if (item.quantity < 1) {
      return { ok: false, error: 'Invalid quantity' };
    }

    const unitPrice = resolveUnitPrice(db, item.intent);
    if (unitPrice <= 0) {
      return { ok: false, error: `Product "${db.name}" is not available for ${item.intent}` };
    }

    verified.push({
      product_id: db.id,
      product_name: db.name,
      product_type: db.product_type,
      size: item.size,
      quantity: item.quantity,
      unit_price: unitPrice,
      rental_start_date: item.rental_start_date,
      rental_end_date: item.rental_end_date,
      security_deposit: item.security_deposit,
    });
  }

  const subtotal = verified.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);

  return { ok: true, items: verified, subtotal };
}
