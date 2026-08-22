import { describe, it, expect } from 'vitest';
import { calculateDiscount, getFinalTotal, getItemUnitPrice, type Coupon, type PricedItem } from './pricing';

describe('calculateDiscount', () => {
  const percentCoupon: Coupon = { code: 'SAVE10', type: 'percent', value: 10 };
  const fixedCoupon: Coupon = { code: 'OFF500', type: 'fixed', value: 500 };
  const minCoupon: Coupon = { code: 'BIG', type: 'percent', value: 20, minSubtotal: 1000 };

  it('applies a percentage coupon to the subtotal', () => {
    expect(calculateDiscount(1000, percentCoupon)).toBe(100);
  });

  it('applies a fixed coupon, capped at the subtotal', () => {
    expect(calculateDiscount(300, fixedCoupon)).toBe(300);
    expect(calculateDiscount(800, fixedCoupon)).toBe(500);
  });

  it('returns zero discount for a coupon below its minimum subtotal', () => {
    expect(calculateDiscount(900, minCoupon)).toBe(0);
    expect(calculateDiscount(1000, minCoupon)).toBe(200);
  });

  it('returns zero discount when no coupon is supplied', () => {
    expect(calculateDiscount(1000, null)).toBe(0);
  });
});

describe('getFinalTotal', () => {
  const percentCoupon: Coupon = { code: 'SAVE10', type: 'percent', value: 10 };

  it('subtracts the discount from the subtotal', () => {
    expect(getFinalTotal(1000, percentCoupon)).toBe(900);
  });

  it('never returns a negative total', () => {
    const hugeFixed: Coupon = { code: 'X', type: 'fixed', value: 99999 };
    expect(getFinalTotal(500, hugeFixed)).toBe(0);
  });

  it('returns the subtotal unchanged with no coupon', () => {
    expect(getFinalTotal(750, null)).toBe(750);
  });
});

describe('getItemUnitPrice', () => {
  it('uses rentalPrice for a rental item', () => {
    const item: PricedItem = { intent: 'rent', salePrice: 1000, rentalPrice: 100 };
    expect(getItemUnitPrice(item)).toBe(100);
  });

  it('uses salePrice for a sale item', () => {
    const item: PricedItem = { intent: 'sale', salePrice: 1000, rentalPrice: 100 };
    expect(getItemUnitPrice(item)).toBe(1000);
  });

  it('falls back to zero when the relevant price is missing', () => {
    expect(getItemUnitPrice({ intent: 'rent', salePrice: 1000 })).toBe(0);
    expect(getItemUnitPrice({ intent: 'sale', rentalPrice: 100 })).toBe(0);
  });
});
