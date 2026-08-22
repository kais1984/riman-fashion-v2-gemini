import { describe, it, expect } from 'vitest';
import { calculateSubtotal, calculateTotalItems, addItemToCart, removeItemFromCart, updateQuantityInCart, type CartItem } from './cart';
import type { Product } from '../types';

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'p1',
  name: 'Test Gown',
  description: '',
  productType: 'both',
  salePrice: 1000,
  rentalPrice: 100,
  images: [],
  category: 'Bridal Gown',
  style: [],
  color: [],
  sizes: [],
  ...overrides,
});

const makeCartItem = (overrides: Partial<CartItem> = {}): CartItem => ({
  ...makeProduct(),
  quantity: 1,
  intent: 'sale',
  ...overrides,
});

describe('calculateSubtotal', () => {
  it('prices sale items by salePrice times quantity', () => {
    const items: CartItem[] = [makeCartItem({ intent: 'sale', salePrice: 1000, quantity: 3 })];
    expect(calculateSubtotal(items)).toBe(3000);
  });

  it('prices rent items by rentalPrice times quantity', () => {
    const items: CartItem[] = [makeCartItem({ intent: 'rent', rentalPrice: 100, quantity: 2 })];
    expect(calculateSubtotal(items)).toBe(200);
  });

  it('sums a mixed cart of sale and rent items', () => {
    const items: CartItem[] = [
      makeCartItem({ id: 'a', intent: 'sale', salePrice: 1000, quantity: 2 }),
      makeCartItem({ id: 'b', intent: 'rent', rentalPrice: 100, quantity: 4 }),
    ];
    expect(calculateSubtotal(items)).toBe(2000 + 400);
  });

  it('treats missing prices as zero', () => {
    const items: CartItem[] = [makeCartItem({ intent: 'sale', salePrice: undefined, quantity: 5 })];
    expect(calculateSubtotal(items)).toBe(0);
  });

  it('returns zero for an empty cart', () => {
    expect(calculateSubtotal([])).toBe(0);
  });

  it('counts total quantity across items', () => {
    const items: CartItem[] = [
      makeCartItem({ id: 'a', quantity: 2 }),
      makeCartItem({ id: 'b', quantity: 3 }),
    ];
    expect(calculateTotalItems(items)).toBe(5);
  });

  it('returns zero total items for an empty cart', () => {
    expect(calculateTotalItems([])).toBe(0);
  });
});

describe('addItemToCart', () => {
  const baseProduct = makeProduct({ id: 'p1', salePrice: 1000 });

  it('appends a new item with quantity 1', () => {
    const result = addItemToCart([], baseProduct, 'sale');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('p1');
    expect(result[0].quantity).toBe(1);
    expect(result[0].intent).toBe('sale');
  });

  it('merges into an existing item when id, size and intent match, incrementing quantity', () => {
    const start: CartItem[] = [makeCartItem({ id: 'p1', salePrice: 1000, quantity: 2, intent: 'sale', selectedSize: 'M' })];
    const result = addItemToCart(start, baseProduct, 'sale', 'M');
    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(3);
  });

  it('does not merge items with different size', () => {
    const start: CartItem[] = [makeCartItem({ id: 'p1', salePrice: 1000, quantity: 1, intent: 'sale', selectedSize: 'M' })];
    const result = addItemToCart(start, baseProduct, 'sale', 'L');
    expect(result).toHaveLength(2);
  });

  it('does not merge items with different intent', () => {
    const start: CartItem[] = [makeCartItem({ id: 'p1', salePrice: 1000, quantity: 1, intent: 'sale' })];
    const result = addItemToCart(start, baseProduct, 'rent');
    expect(result).toHaveLength(2);
  });

  it('caps quantity at MAX_QUANTITY (10) and leaves the cart unchanged when exceeded', () => {
    const start: CartItem[] = [makeCartItem({ id: 'p1', salePrice: 1000, quantity: 10, intent: 'sale', selectedSize: 'M' })];
    const result = addItemToCart(start, baseProduct, 'sale', 'M');
    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(10);
  });
});

describe('removeItemFromCart', () => {
  it('removes the item matching id, size and intent', () => {
    const start: CartItem[] = [
      makeCartItem({ id: 'p1', quantity: 1, intent: 'sale', selectedSize: 'M' }),
      makeCartItem({ id: 'p1', quantity: 1, intent: 'sale', selectedSize: 'L' }),
    ];
    const result = removeItemFromCart(start, 'p1', 'M', 'sale');
    expect(result).toHaveLength(1);
    expect(result[0].selectedSize).toBe('L');
  });

  it('leaves the cart unchanged when nothing matches', () => {
    const start: CartItem[] = [makeCartItem({ id: 'p1', quantity: 1, intent: 'sale' })];
    const result = removeItemFromCart(start, 'pX', undefined, 'sale');
    expect(result).toHaveLength(1);
  });
});

describe('updateQuantityInCart', () => {
  it('sets the quantity for the matching item, clamped to a minimum of 1', () => {
    const start: CartItem[] = [makeCartItem({ id: 'p1', quantity: 5, intent: 'sale', selectedSize: 'M' })];
    const result = updateQuantityInCart(start, 'p1', 2, 'M', 'sale');
    expect(result[0].quantity).toBe(2);
  });

  it('ignores quantities above MAX_QUANTITY, leaving the cart unchanged', () => {
    const start: CartItem[] = [makeCartItem({ id: 'p1', quantity: 5, intent: 'sale', selectedSize: 'M' })];
    const result = updateQuantityInCart(start, 'p1', 99, 'M', 'sale');
    expect(result[0].quantity).toBe(5);
  });

  it('clamps a zero or negative quantity up to 1', () => {
    const start: CartItem[] = [makeCartItem({ id: 'p1', quantity: 5, intent: 'sale', selectedSize: 'M' })];
    const result = updateQuantityInCart(start, 'p1', 0, 'M', 'sale');
    expect(result[0].quantity).toBe(1);
  });
});
