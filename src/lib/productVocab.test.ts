import { describe, it, expect } from 'vitest';
import { products } from '../data/products';
import { AR_VOCAB, translateProductValue, localizedContent } from './productVocab';

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

describe('localizedContent', () => {
  const p = { name: 'Test Gown', nameAr: 'فستان تجريبي', description: 'Desc', descriptionAr: 'وصف' };
  it('returns en fields for en', () => {
    expect(localizedContent(p, 'en')).toEqual({ name: 'Test Gown', description: 'Desc' });
  });
  it('returns ar fields for ar', () => {
    expect(localizedContent(p, 'ar')).toEqual({ name: 'فستان تجريبي', description: 'وصف' });
  });
  it('falls back to en fields when ar fields missing', () => {
    const p2 = { name: 'X', description: 'Y' };
    expect(localizedContent(p2, 'ar')).toEqual({ name: 'X', description: 'Y' });
  });
});
