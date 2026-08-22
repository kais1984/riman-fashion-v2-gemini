import type { Product } from '../types';

export type OrderType = 'sale' | 'rental' | 'mixed';

export interface OrderItem {
  id: string;
  name: string;
  productType: Product['productType'];
  quantity: number;
  intent: 'sale' | 'rent';
}

export function deriveOrderType(items: OrderItem[]): OrderType {
  const hasRental = items.some(i => i.productType === 'rent' || i.productType === 'both');
  if (!hasRental) return 'sale';
  const hasSale = items.some(i => i.productType === 'sale');
  return hasSale ? 'mixed' : 'rental';
}

export interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isCartEmpty(items: { length: number } | unknown[]): boolean {
  return (items as unknown[]).length === 0;
}

export function validateCheckoutStep(step: number, data: CheckoutFormData): string[] {
  const invalid: string[] = [];

  if (step === 1) {
    if (!data.firstName.trim()) invalid.push('firstName');
    if (!data.lastName.trim()) invalid.push('lastName');
    if (!data.email.trim() || !EMAIL_RE.test(data.email)) invalid.push('email');
    if (!data.phone.trim() || data.phone.trim().length < 7) invalid.push('phone');
  } else if (step === 2) {
    if (!data.address.trim()) invalid.push('address');
    if (!data.city.trim()) invalid.push('city');
    if (!data.country.trim()) invalid.push('country');
  }

  return invalid;
}

