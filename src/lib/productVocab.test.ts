import { describe, it, expect } from 'vitest';
import { products } from '../data/products';
import { AR_VOCAB, translateProductValue } from './productVocab';

describe('translateProductValue', () => {
  it('returns the original value for en', () => {
    expect(translateProductValue('fabric', 'Duchess Satin', 'en')).toBe('Duchess Satin');
  });
  it('translates known fabric/category/silhouette values for ar', () => {
    expect(translateProductValue('fabric', 'Duchess Satin', 'ar')).toBe('ساتان دوتشيس');
    expect(translateProductValue('category', 'Bridal Gown', 'ar')).toBe('فستان زفاف');
    expect(translateProductValue('silhouette', 'Mermaid', 'ar')).toBe('حورية البحر');
  });
  it('returns original for unknown values and nullish input', () => {
    expect(translateProductValue('fabric', 'Unobtainium Weave', 'ar')).toBe('Unobtainium Weave');
    expect(translateProductValue('fabric', undefined, 'ar')).toBe('');
    expect(translateProductValue('fabric', null, 'ar')).toBe('');
  });
});

describe('vocab exhaustiveness', () => {
  it('covers every fabric/category/silhouette value in products.ts', () => {
    const missing: string[] = [];
    for (const p of products) {
      if (p.fabric && !AR_VOCAB.fabric[p.fabric]) missing.push(`fabric:${p.fabric}`);
      if (p.category && !AR_VOCAB.category[p.category]) missing.push(`category:${p.category}`);
      if (p.silhouette && !AR_VOCAB.silhouette[p.silhouette]) missing.push(`silhouette:${p.silhouette}`);
    }
    expect(missing).toEqual([]);
  });
});
