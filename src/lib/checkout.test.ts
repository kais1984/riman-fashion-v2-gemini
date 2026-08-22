import { describe, it, expect } from 'vitest';
import { deriveOrderType, validateCheckoutStep, isCartEmpty, type OrderItem, type CheckoutFormData } from './checkout';
import type { Product } from '../types';

const makeItem = (productType: Product['productType']): OrderItem => ({
  id: 'p1',
  name: 'Gown',
  productType,
  quantity: 1,
  intent: 'sale',
});

const validForm: CheckoutFormData = {
  firstName: 'Alya',
  lastName: 'Rashid',
  email: 'alya@example.com',
  phone: '971553730792',
  address: '1 Marina Rd',
  city: 'Dubai',
  country: 'United Arab Emirates',
};

describe('deriveOrderType', () => {
  it("returns 'sale' for an all-sale cart", () => {
    expect(deriveOrderType([makeItem('sale')])).toBe('sale');
  });

  it("returns 'rental' when every item is rent or both", () => {
    expect(deriveOrderType([makeItem('rent')])).toBe('rental');
    expect(deriveOrderType([makeItem('both')])).toBe('rental');
  });

  it("returns 'mixed' when the cart has both sale and rental items", () => {
    expect(deriveOrderType([makeItem('sale'), makeItem('rent')])).toBe('mixed');
    expect(deriveOrderType([makeItem('both'), makeItem('sale')])).toBe('mixed');
  });

  it("returns 'sale' for an empty cart", () => {
    expect(deriveOrderType([])).toBe('sale');
  });
});

describe('isCartEmpty', () => {
  it('is true for an empty cart', () => {
    expect(isCartEmpty([])).toBe(true);
  });

  it('is false when the cart has items', () => {
    expect(isCartEmpty([makeItem('sale')])).toBe(false);
  });
});

describe('validateCheckoutStep', () => {
  it('reports no invalid fields for a valid step 1', () => {
    expect(validateCheckoutStep(1, validForm)).toEqual([]);
  });

  it('flags missing firstName, lastName, email and short phone on step 1', () => {
    const result = validateCheckoutStep(1, {
      ...validForm,
      firstName: '',
      lastName: '',
      email: 'not-an-email',
      phone: '123',
    });
    expect(result).toEqual(expect.arrayContaining(['firstName', 'lastName', 'email', 'phone']));
  });

  it('reports no invalid fields for a valid step 2', () => {
    expect(validateCheckoutStep(2, validForm)).toEqual([]);
  });

  it('flags missing address and city on step 2', () => {
    const result = validateCheckoutStep(2, { ...validForm, address: '', city: '' });
    expect(result).toEqual(expect.arrayContaining(['address', 'city']));
  });

  it('flags a missing country on step 2', () => {
    const result = validateCheckoutStep(2, { ...validForm, country: '' });
    expect(result).toEqual(expect.arrayContaining(['country']));
  });

  it('returns an empty list for unknown steps', () => {
    expect(validateCheckoutStep(99, validForm)).toEqual([]);
  });
});
