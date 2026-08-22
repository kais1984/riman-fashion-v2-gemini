import type { Product } from '../types';
import { getItemUnitPrice } from './pricing';

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedDate?: string;
  intent: 'sale' | 'rent';
}

export const MAX_QUANTITY = 10;

export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + getItemUnitPrice(item) * item.quantity, 0);
}

export function calculateTotalItems(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

function matchesKey(item: CartItem, id: string, size: string | undefined, intent: 'sale' | 'rent'): boolean {
  return item.id === id && item.selectedSize === size && item.intent === intent;
}

export function addItemToCart(
  items: CartItem[],
  product: Product,
  intent: 'sale' | 'rent',
  size?: string,
  date?: Date,
): CartItem[] {
  const existingIndex = items.findIndex(item => matchesKey(item, product.id, size, intent));

  if (existingIndex > -1) {
    const existing = items[existingIndex];
    if (existing.quantity >= MAX_QUANTITY) return items;
    const newItems = [...items];
    newItems[existingIndex] = { ...existing, quantity: existing.quantity + 1 };
    return newItems;
  }

  return [
    ...items,
    {
      ...product,
      quantity: 1,
      selectedSize: size,
      intent,
      selectedDate: date ? date.toISOString() : undefined,
    },
  ];
}

export function removeItemFromCart(
  items: CartItem[],
  id: string,
  size?: string,
  intent?: 'sale' | 'rent',
): CartItem[] {
  return items.filter(item => !(matchesKey(item, id, size, intent || item.intent)));
}

export function updateQuantityInCart(
  items: CartItem[],
  id: string,
  quantity: number,
  size?: string,
  intent?: 'sale' | 'rent',
): CartItem[] {
  if (quantity > MAX_QUANTITY) return items;
  return items.map(item =>
    matchesKey(item, id, size, intent || item.intent)
      ? { ...item, quantity: Math.max(1, quantity) }
      : item,
  );
}
