import { describe, it, expect } from 'vitest';
import { cn, formatPrice } from './utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('text-red', 'bg-blue')).toBe('text-red bg-blue');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });

  it('handles undefined values', () => {
    expect(cn('a', undefined, 'b')).toBe('a b');
  });
});

describe('formatPrice', () => {
  it('formats number with commas', () => {
    expect(formatPrice(45000)).toBe('AED 45,000');
  });

  it('formats zero', () => {
    expect(formatPrice(0)).toBe('AED 0');
  });

  it('formats small numbers', () => {
    expect(formatPrice(850)).toBe('AED 850');
  });
});
