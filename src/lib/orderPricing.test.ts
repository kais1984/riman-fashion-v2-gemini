import { describe, it, expect } from 'vitest';
import { resolveUnitPrice, verifyOrderItems, isVerifyError, type DbProduct, type ClientOrderItem } from './orderPricing';

const dbProduct = (overrides: Partial<DbProduct> = {}): DbProduct => ({
  id: 'p1',
  name: 'Gown',
  product_type: 'sale',
  sale_price: 1000,
  rental_price: 100,
  is_active: true,
  ...overrides,
});

const clientItem = (overrides: Partial<ClientOrderItem> = {}): ClientOrderItem => ({
  product_id: 'p1',
  intent: 'sale',
  quantity: 2,
  ...overrides,
});

describe('resolveUnitPrice', () => {
  it('returns sale_price for sale intent', () => {
    expect(resolveUnitPrice(dbProduct(), 'sale')).toBe(1000);
  });

  it('returns rental_price for rent intent', () => {
    expect(resolveUnitPrice(dbProduct(), 'rent')).toBe(100);
  });

  it('falls back to 0 when the relevant price is null', () => {
    expect(resolveUnitPrice(dbProduct({ sale_price: null }), 'sale')).toBe(0);
  });
});

describe('verifyOrderItems', () => {
  it('returns verified items with server-derived prices and subtotal', () => {
    const result = verifyOrderItems(
      [clientItem({ quantity: 2 }), clientItem({ product_id: 'p2', intent: 'rent', quantity: 1 })],
      [dbProduct(), dbProduct({ id: 'p2', sale_price: 500, rental_price: 50, product_type: 'rent' })],
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.items[0].unit_price).toBe(1000);
      expect(result.items[1].unit_price).toBe(50);
      expect(result.subtotal).toBe(2000 + 50);
    }
  });

  it('rejects when a product id is not found in the database', () => {
    const result = verifyOrderItems([clientItem({ product_id: 'missing' })], [dbProduct()]);
    expect(result.ok).toBe(false);
    if (isVerifyError(result)) expect(result.error).toMatch(/missing/i);
  });

  it('rejects an inactive product', () => {
    const result = verifyOrderItems([clientItem()], [dbProduct({ is_active: false })]);
    expect(result.ok).toBe(false);
  });

  it('rejects a quantity below 1', () => {
    const result = verifyOrderItems([clientItem({ quantity: 0 })], [dbProduct()]);
    expect(result.ok).toBe(false);
  });

  it('rejects when the server price for the intent is zero or negative', () => {
    const result = verifyOrderItems(
      [clientItem({ intent: 'rent' })],
      [dbProduct({ rental_price: 0 })],
    );
    expect(result.ok).toBe(false);
  });

  it('rejects an empty cart', () => {
    const result = verifyOrderItems([], [dbProduct()]);
    expect(result.ok).toBe(false);
  });
});
