export type VocabField = 'fabric' | 'category' | 'silhouette';

export const AR_VOCAB: Record<VocabField, Record<string, string>> = {
  fabric: {
    '14k Gold, Citrine': 'ذهب 14 قيراط مع حجر السيترين',
    'Beaded Lace with Cathedral Train': 'دانتيل مطرز بالخرز مع ذيل كاتدرائي',
    'Beaded Tulle with 3D Silk Florals': 'تول مطرز بالخرز مع زهور حريرية ثلاثية الأبعاد',
    'Cathedral Tulle with 3D Silk Blossoms': 'تول كاتدرائي مع أزهار حريرية ثلاثية الأبعاد',
    'Chiffon Layers': 'طبقات شيفون',
    'Crepe with Beaded Detail': 'كريب بتفاصيل مطرزة بالخرز',
    'Crystal-embellished Illusion Tulle': 'تول شفاف مزين بالكريستال',
    'Crystal-Embellished Tulle': 'تول مزين بالكريستال',
    'Duchess Satin': 'ساتان دوتشيس',
    'Duchess Satin with 3D Floral Veil': 'ساتان دوتشيس مع طرحة بزهور ثلاثية الأبعاد',
    'Duchess Satin with Beaded Cape': 'ساتان دوتشيس مع كيب مطرز بالخرز',
    'Duchess Satin with Crystal Beadwork': 'ساتان دوتشيس مع تطريز الكريستال',
    'Duchess Satin with Crystal-beaded Sleeves': 'ساتان دوتشيس بأكمام مزينة بالكريستال والخرز',
    'Embroidered Crepe': 'كريب مطرز',
    'Embroidered Lace with 3D Botanical Appliqués': 'دانتيل مطرز بتطريقات نباتية ثلاثية الأبعاد',
    'Embroidered Lace with 3D Petal Appliqués': 'دانتيل مطرز بتطريقات بتلات ثلاثية الأبعاد',
    'Embroidered Lace with Cathedral Veil': 'دانتيل مطرز مع طرحة كاتدرائية',
    'Embroidered Lace with Pearl Corsetry': 'دانتيل مطرز مع مشد اللؤلؤ',
    'Embroidered Silk Organza': 'أورغانزا حرير مطرزة',
    'Floral Appliqué Tulle': 'تول بتطريقات الزهور',
    'Flowing Chiffon with Hand Beading': 'شيفون منسدل بخرز يدوي',
    'French Lace with Pearl-scattered Tulle': 'دانتيل فرنسي مع تول مرصع باللؤلؤ',
    'Hand-beaded Crystal Tulle': 'تول كريستالي مرصع يدويًا بالخرز',
    'Hand-crystalled Rose Clutch': 'حقيبة كلاتش وردية مرصعة يدويًا بالكريستال',
    'Layered Tulle with Crystal Work': 'طبقات تول بأعمال الكريستال',
    'Liquid Lamé with 3D Crystal Florals': 'لاميه لامع بزهور كريستالية ثلاثية الأبعاد',
    'Pearl-Beaded Lace': 'دانتيل مطرز باللؤلؤ',
    'Pearl-scattered Cathedral Tulle': 'تول كاتدرائي مرصع باللؤلؤ',
    'Shimmer Jersey': 'جيرسي لامع',
    'Silk Mikado': 'ميكادو حريري',
    'Silk Satin with Hand-set Crystal Embroidery': 'ساتان حرير بتطريز كريستالي مرصوع يدويًا',
    'Silk Satin with Lace Train': 'ساتان حرير مع ذيل دانتيل',
    'Soft Tulle': 'تول ناعم',
    'Tulle with 3D Florals, Illusion Corset': 'تول بزهور ثلاثية الأبعاد ومشد شفاف',
    'Velvet and Silk Blend': 'مزيج المخمل والحرير',
  },
  category: {
    Accessory: 'إكسسوار',
    'Bridal Gown': 'فستان زفاف',
    'Evening Dress': 'فستان سهرة',
    'Fine Jewelry': 'مجوهرات ثمينة',
  },
  silhouette: {
    'A-Line': 'قطعة A',
    Ballgown: 'فستان أميرة',
    Column: 'قصة مستقيمة',
    Kaftan: 'قفطان',
    Mermaid: 'حورية البحر',
    'One Size': 'مقاس واحد',
  },
};

export function translateProductValue(field: VocabField, value: string | undefined | null, language: 'en' | 'ar'): string {
  if (!value) return '';
  if (language !== 'ar') return value;
  return AR_VOCAB[field][value] ?? value;
}

export function localizedContent(product: { name: string; nameAr?: string; description: string; descriptionAr?: string }, language: 'en' | 'ar'): { name: string; description: string } {
  if (language !== 'ar') return { name: product.name, description: product.description };
  return {
    name: product.nameAr || product.name,
    description: product.descriptionAr || product.description,
  };
}
