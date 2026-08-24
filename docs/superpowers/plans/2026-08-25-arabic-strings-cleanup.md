# Arabic Strings Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate English residue on Arabic customer-facing pages: translate all hardcoded UI literals, add Arabic dictionaries for product fabric/category/silhouette values, and harden `t()` with an en-block fallback.

**Architecture:** All copy lives in the two established places — the inline translations object in `LanguageContext.tsx` and a new typed vocab module `src/lib/productVocab.ts`. Render sites consume `t()` / `translateProductValue`. No new dependencies, no data-model change.

**Tech Stack:** React 19 + TS, Vitest + Testing Library, Playwright (`tests/`, port 3001).

## Global Constraints

- No new dependencies; NO code comments in source files.
- Every new key exists in BOTH `'en'` and `'ar'` blocks, byte-exact to this plan's tables.
- Brand marks stay untranslated verbatim: "Riman", "Riman Fashion", "Atelier Riman", "Riman Atelier", "Maison de Couture", "Stripe".
- `translateProductValue` returns the ORIGINAL string when language is `'en'` or value unmapped — never throws, never returns empty.
- Working tree is dirty with unrelated changes: touch ONLY files named in each task; `git add` exactly those paths; do not push.
- Commands: `npm run lint` (=tsc), `npm test` (vitest), `npx playwright test <file>`.

---

### Task 1: i18n keys + t() fallback chain

**Files:**
- Modify: `src/contexts/LanguageContext.tsx`

**Interfaces:**
- Produces: keys consumed by Tasks 3–4 (tables below); changed `t()` behavior: missing-in-lang key falls back to en block before raw key.

- [ ] **Step 1: Harden the fallback**

Find (end of file, ~line 1521):

```ts
return translations[language][key] || key;
```

Replace with:

```ts
return translations[language][key] || translations.en[key] || key;
```

- [ ] **Step 2: Add English keys**

Insert a new block after the existing `// Calendar` block in the EN section:

```ts
    // Checkout extras
    'checkout.secured_stripe': 'Secured by Stripe',
    'checkout.secure_order_atelier': 'Secure Order — Payment at Atelier',
    'checkout.order_failed': 'Failed to place order. Please try again.',
    'checkout.country_default': 'United Arab Emirates',

    // Payment cancel
    'payment.cancel.title': 'Payment Cancelled',
    'payment.cancel.body': 'No charges were made. Your order has not been placed.',
    'payment.cancel.return_checkout': 'Return to Checkout',
    'payment.cancel.continue_browsing': 'Continue Browsing',

    // Wedding checklist
    'wedding.checklist.eyebrow': 'The Road to I Do',
    'wedding.checklist.title': 'Wedding Planning Checklist',
    'wedding.checklist.m12': '12 Months Before',
    'wedding.checklist.t12': 'Set your wedding date and venue.',
    'wedding.checklist.m11': '11 Months Before',
    'wedding.checklist.t11': 'Book your first Riman Atelier consultation.',
    'wedding.checklist.m9': '9 Months Before',
    'wedding.checklist.t9': 'Finalize your silhouette and fabric selection.',
    'wedding.checklist.m6': '6 Months Before',
    'wedding.checklist.t6': 'First fitting and embroidery details.',
    'wedding.checklist.m3': '3 Months Before',
    'wedding.checklist.t3': 'Accessorize with veils and headpieces.',
    'wedding.checklist.m1': '1 Month Before',
    'wedding.checklist.t1': 'Final fitting and secure collection.',

    // Wedding timeline
    'wedding.timeline.title': 'Wedding Timeline',
    'wedding.timeline.subtitle': 'Planning your journey to I DO',
    'wedding.timeline.return_home': 'Return Home',

    // Newsletter modal
    'newsletter.title': 'The Atelier Circle',
    'newsletter.body': 'Join for exclusive previews of our new bridal collections and private viewings in Sharjah.',
    'newsletter.email_placeholder': 'E-mail Address',
    'newsletter.email_aria': 'Email address',
    'newsletter.cta': 'Join The Society',

    // Cookie banner
    'cookies.heading': 'Privacy & Elegance',
    'cookies.body': 'We use cookies to curate a personalized atelier experience.',
    'cookies.learn': 'Learn details',
    'cookies.accept': 'Accept & Explore',

    // Errors & common
    'errors.tech_title': 'A Technical Moment',
    'errors.tech_body': 'Our digital atelier is experiencing a brief pause. Please refresh the page or return to our home collection.',
    'errors.return_atelier': 'Return to Atelier',
    'common.close': 'Close',
    'common.retry': 'Retry',
    'threed.initializing': 'Initializing 3D Detail',

    // Toasts & fallbacks
    'product.toast_suffix_rental': 'rental booked',
    'product.toast_suffix_added': 'added to your collection',
    'product.fabric_default': 'Luxury Blend',
    'auth.profile_missing_title': 'Profile not found',
    'auth.load_fail_title': 'Could not load account',
    'auth.limited_msg': 'Some features may be limited.',
```

- [ ] **Step 3: Add Arabic keys**

Insert the mirror block after the AR `// Calendar` block:

```ts
    // Checkout extras
    'checkout.secured_stripe': 'مؤمَّن عبر Stripe',
    'checkout.secure_order_atelier': 'طلب آمن — الدفع في الأتيليه',
    'checkout.order_failed': 'تعذّر إنشاء الطلب. يرجى المحاولة مرة أخرى.',
    'checkout.country_default': 'الإمارات العربية المتحدة',

    // Payment cancel
    'payment.cancel.title': 'تم إلغاء الدفع',
    'payment.cancel.body': 'لم يتم خصم أي مبالغ، ولم يتم إنشاء طلبك.',
    'payment.cancel.return_checkout': 'العودة إلى الحقيبة',
    'payment.cancel.continue_browsing': 'متابعة التصفح',

    // Wedding checklist
    'wedding.checklist.eyebrow': 'الطريق إلى نعم',
    'wedding.checklist.title': 'قائمة التخطيط للزفاف',
    'wedding.checklist.m12': 'قبل 12 شهرًا',
    'wedding.checklist.t12': 'حددي تاريخ الزفاف والمكان.',
    'wedding.checklist.m11': 'قبل 11 شهرًا',
    'wedding.checklist.t11': 'احجزي استشارتك الأولى في أتيليه ريمان.',
    'wedding.checklist.m9': 'قبل 9 أشهر',
    'wedding.checklist.t9': 'حسدي اختيار القصة والقماش.',
    'wedding.checklist.m6': 'قبل 6 أشهر',
    'wedding.checklist.t6': 'أول بروفة وتفاصيل التطريز.',
    'wedding.checklist.m3': 'قبل 3 أشهر',
    'wedding.checklist.t3': 'استكملي الإطلالة بالطرح وإكسسوارات الرأس.',
    'wedding.checklist.m1': 'قبل شهر',
    'wedding.checklist.t1': 'البروفة النهائية واستلام الفستان.',

    // Wedding timeline
    'wedding.timeline.title': 'الجدول الزمني للزفاف',
    'wedding.timeline.subtitle': 'نرسم معكِ الطريق إلى نعم',
    'wedding.timeline.return_home': 'العودة إلى الرئيسية',

    // Newsletter modal
    'newsletter.title': 'دائرة الأتيليه',
    'newsletter.body': 'انضمي للحصول على عروض حصرية لمجموعات الزفاف الجديدة ودعوات المعاينات الخاصة في الشارقة.',
    'newsletter.email_placeholder': 'البريد الإلكتروني',
    'newsletter.email_aria': 'البريد الإلكتروني',
    'newsletter.cta': 'انضمي إلى الجمعية',

    // Cookie banner
    'cookies.heading': 'الخصوصية والأناقة',
    'cookies.body': 'نستخدم ملفات تعريف الارتباط لتوفير تجربة أتيليه مخصصة لكِ.',
    'cookies.learn': 'اعرفي المزيد',
    'cookies.accept': 'الموافقة والاستكشاف',

    // Errors & common
    'errors.tech_title': 'لحظة تقنية',
    'errors.tech_body': 'أتيليهنا الرقمي يمر بوقفة قصيرة. يرجى تحديث الصفحة أو العودة إلى مجموعتنا الرئيسية.',
    'errors.return_atelier': 'العودة إلى الأتيليه',
    'common.close': 'إغلاق',
    'common.retry': 'إعادة المحاولة',
    'threed.initializing': 'جارٍ تحميل التفاصيل ثلاثية الأبعاد',

    // Toasts & fallbacks
    'product.toast_suffix_rental': 'تم حجز الإيجار',
    'product.toast_suffix_added': 'أُضيف إلى مجموعتك',
    'product.fabric_default': 'مزيج فاخر',
    'auth.profile_missing_title': 'لم يتم العثور على الملف الشخصي',
    'auth.load_fail_title': 'تعذر تحميل الحساب',
    'auth.limited_msg': 'قد تكون بعض الميزات محدودة.',
```

- [ ] **Step 4: Verify**

Run: `npm run lint`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/contexts/LanguageContext.tsx
git commit -m "i18n: arabic-page residue keys + en-fallback chain"
```

---

### Task 2: Product vocabulary module

**Files:**
- Create: `src/lib/productVocab.ts`
- Create: `src/lib/productVocab.test.ts`

**Interfaces:**
- Consumes: `src/data/products.ts` (default export array) for exhaustiveness test only.
- Produces: `translateProductValue(field: VocabField, value: string | undefined | null, language: 'en' | 'ar'): string`; `type VocabField = 'fabric' | 'category' | 'silhouette'`.

- [ ] **Step 1: Write failing tests**

Create `src/lib/productVocab.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import products from '../data/products';
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
```

Note: check `products.ts` export style first — if it uses a named export instead of default, adapt the import line accordingly (keep everything else identical).

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/lib/productVocab.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement**

Create `src/lib/productVocab.ts`:

```ts
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
```

CRITICAL: dictionary KEYS must byte-match the products.ts source values exactly (including case like `Crystal-embellished` vs `Crystal-Embellished`, accented `Appliqués`/`Lamé`). The exhaustiveness test enforces this — if it fails, fix the DICTIONARY KEY to match the source, never the reverse.

- [ ] **Step 4: Verify GREEN + full suite**

Run: `npm test -- src/lib/productVocab.test.ts` then `npm run lint`.
Expected: PASS, lint clean.

- [ ] **Step 5: Commit**

```bash
git add src/lib/productVocab.ts src/lib/productVocab.test.ts
git commit -m "feat(i18n): product value vocabulary (fabric/category/silhouette ar)"
```

---

### Task 3: Whole-page wiring (PaymentCancel, WeddingChecklist, WeddingTimeline)

**Files:**
- Modify: `src/pages/PaymentCancel.tsx`
- Modify: `src/pages/WeddingChecklist.tsx`
- Modify: `src/pages/WeddingTimeline.tsx`

**Interfaces:**
- Consumes: Task 1 keys; `useLanguage()` from `../contexts/LanguageContext`.

- [ ] **Step 1: PaymentCancel.tsx**

Add `import { useLanguage } from '../contexts/LanguageContext';` and inside the component `const { t } = useLanguage();`. Replace:
- `<h1 ...>Payment Cancelled</h1>` → `{t('payment.cancel.title')}`
- `<p ...>No charges were made. Your order has not been placed.</p>` → `{t('payment.cancel.body')}`
- `Return to Checkout` link text → `{t('payment.cancel.return_checkout')}`
- `Continue Browsing` link text → `{t('payment.cancel.continue_browsing')}`

Keep all classNames exactly as-is.

- [ ] **Step 2: WeddingChecklist.tsx**

Add the useLanguage import + hook call. Replace the `steps` array literal with keyed steps:

```tsx
const steps = [
  { month: t('wedding.checklist.m12'), task: t('wedding.checklist.t12') },
  { month: t('wedding.checklist.m11'), task: t('wedding.checklist.t11') },
  { month: t('wedding.checklist.m9'), task: t('wedding.checklist.t9') },
  { month: t('wedding.checklist.m6'), task: t('wedding.checklist.t6') },
  { month: t('wedding.checklist.m3'), task: t('wedding.checklist.t3') },
  { month: t('wedding.checklist.m1'), task: t('wedding.checklist.t1') },
];
```

Replace `The Road to I Do` → `{t('wedding.checklist.eyebrow')}` and `Wedding Planning Checklist` → `{t('wedding.checklist.title')}`.

- [ ] **Step 3: WeddingTimeline.tsx**

Same import/hook pattern. Replace `Wedding Timeline` → `{t('wedding.timeline.title')}`, `Planning your journey to I DO` → `{t('wedding.timeline.subtitle')}`, `Return Home` → `{t('wedding.timeline.return_home')}`.

- [ ] **Step 4: Verify + commit**

Run: `npm run lint` (exit 0). Grep the three files for remaining ASCII-only JSX text nodes — none expected.

```bash
git add src/pages/PaymentCancel.tsx src/pages/WeddingChecklist.tsx src/pages/WeddingTimeline.tsx
git commit -m "i18n: wire payment-cancel and wedding pages to translations"
```

---

### Task 4: Components, checkout, PDP, toasts

**Files:**
- Modify: `src/App.tsx` (provider reorder ONLY)
- Modify: `src/pages/Checkout.tsx`
- Modify: `src/components/GlobalFeatures.tsx`
- Modify: `src/components/GlobalErrorBoundary.tsx`
- Modify: `src/components/ThreeDViewer.tsx`
- Modify: `src/pages/ProductDetail.tsx`
- Modify: `src/components/ProductCard.tsx`
- Modify: `src/components/salon/EditorialPlate.tsx`
- Modify: `src/contexts/AuthContext.tsx`

**Interfaces:**
- Consumes: Task 1 keys; Task 2 `translateProductValue`; `useLanguage()` → also exposes `language`.

- [ ] **Step 1: Provider swap (App.tsx)**

Reorder so LanguageProvider wraps AuthProvider (Language depends on nothing here; Auth needs it for translated toasts):

```tsx
<SettingsProvider>
<LanguageProvider>
<AuthProvider>
<WishlistProvider>
<CartProvider>
...
</CartProvider>
</WishlistProvider>
</AuthProvider>
</LanguageProvider>
</SettingsProvider>
```

(Close tags in mirrored order; move the closing `</LanguageProvider>` accordingly.)

- [ ] **Step 2: Checkout.tsx**

1. Trust box (:831): replace the ternary literals with:
   `{paymentMethod === 'card' ? t('checkout.secured_stripe') : t('checkout.secure_order_atelier')}`
2. Error fallback (:260): `setSubmitError(err.message || t('checkout.order_failed'));` — verify `t` is in scope there; if not, hoist via the component's existing `useLanguage()` call.
3. Country default (:51): `country: ''` stays as-is in state BUT the form field must display localized default — simplest correct approach: initialize `country: 'United Arab Emirates'` → leave state empty-string and set placeholder/default via render? NO — orders persist country into metadata; keep data behavior identical by translating only DISPLAY: change initial value to `''` is a behavior change (forbidden). Instead: keep stored value English but localize what the user SEES: in the country Input and review step render, wrap display with `value === 'United Arab Emirates' && language === 'ar' ? t('checkout.country_default') : value`. Apply at both render sites (form field ~:485 area and review step). State/payload unchanged.

- [ ] **Step 3: GlobalFeatures.tsx**

Newsletter modal: `The Atelier Circle`→`{t('newsletter.title')}`, body paragraph→`{t('newsletter.body')}`, `placeholder=`{t('newsletter.email_placeholder')}``, `aria-label=`{t('newsletter.email_aria')}``, button text→`{t('newsletter.cta')}`, `aria-label="Close"`(:72)→`aria-label={t('common.close')}`.
Cookie banner: heading→`{t('cookies.heading')}`, sentence→`{t('cookies.body')} <Link...>{t('cookies.learn')}</Link>.`, button→`{t('cookies.accept')}`.

- [ ] **Step 4: GlobalErrorBoundary.tsx (class component pattern)**

Extract the error UI into a function child so hooks work:

```tsx
function ErrorFallback() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-6 text-center">
      <div className="max-w-md">
        <h1 className="font-heading text-4xl text-stone-800 mb-4">{t('errors.tech_title')}</h1>
        <p className="font-body text-stone-500 text-sm mb-8 italic">
          {t('errors.tech_body')}
        </p>
        <button onClick={() => window.location.href = '/'} className="btn-luxury">
          {t('errors.return_atelier')}
        </button>
      </div>
    </div>
  );
}
```

Class render becomes `if (this.state.hasError) return <ErrorFallback />;` (rest of class unchanged).

- [ ] **Step 5: ThreeDViewer.tsx**

Replace `Initializing 3D Detail` → `{t('threed.initializing')}` and the `Retry` label → `{t('common.retry')}` (hook up `useLanguage` if not already imported).

- [ ] **Step 6: AuthContext.tsx**

Now inside LanguageProvider (Step 1): `const { t } = useLanguage();` where accessible (it's a provider itself — call useLanguage() INSIDE its own component body; nesting now guarantees availability):
- `'Profile not found'`→`t('auth.profile_missing_title')`, `'Could not load account'`→`t('auth.load_fail_title')`, message `'Some features may be limited.'`→`t('auth.limited_msg')` (both toast calls).

- [ ] **Step 7: ProductDetail.tsx**

1. Toast (:168): `message: `${product.name} — ${intent === 'rent' ? t('product.toast_suffix_rental') : t('product.toast_suffix_added')}``
2. Fabric fallbacks (~:349 and ~:505): replace hardcoded `'Luxury Blend'` with `t('product.fabric_default')`, and wrap the fabric VALUE with `translateProductValue('fabric', product.fabric, language)` (grab `language` from the existing `useLanguage()` destructure).
3. Wherever category/silhouette render raw (details table region ~:340-360 and any other site — grep `\bproduct\.(category|silhouette|fabric)\b` within the file): wrap with `translateProductValue(field, expr, language)`.

- [ ] **Step 8: ProductCard.tsx + EditorialPlate.tsx**

ProductCard :239: `{product.fabric}` → `{translateProductValue('fabric', product.fabric, language)}` (destructure `language` from useLanguage).
EditorialPlate :35-36: same treatment for its fabric expression.

- [ ] **Step 9: Component test for cookie banner (ar)**

Add `src/components/GlobalFeatures.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GlobalFeatures from './GlobalFeatures';
import { LanguageProvider } from '../contexts/LanguageContext';

describe('GlobalFeatures cookie banner', () => {
  it('renders Arabic copy under ar locale when not yet accepted', () => {
    localStorage.setItem('riman_lang', 'ar');
    localStorage.removeItem('cookies_accepted');
    render(
      <LanguageProvider>
        <GlobalFeatures />
      </LanguageProvider>
    );
    expect(screen.getByText('الخصوصية والأناقة')).toBeDefined();
  });
});
```

Adapt the localStorage flag name to whatever GlobalFeatures actually checks (read its top section first; e.g. `cookieConsent`) — the banner must be force-visible in the test. If the banner is delay-gated, advance timers per existing patterns or export nothing new — mock-free approach preferred; document adaptation in report.

- [ ] **Step 10: Verify + commit**

Run: `npm run lint` → 0; `npm test -- src/components/GlobalFeatures.test.tsx` → green; `npm test` full → green.

```bash
git add src/App.tsx src/pages/Checkout.tsx src/components/GlobalFeatures.tsx src/components/GlobalErrorBoundary.tsx src/components/ThreeDViewer.tsx src/pages/ProductDetail.tsx src/components/ProductCard.tsx src/components/salon/EditorialPlate.tsx src/contexts/AuthContext.tsx src/components/GlobalFeatures.test.tsx
git commit -m "i18n: wire components, checkout, pdp, and toasts; localize product values"
```

---

### Task 5: Verification sweep

**Files:** none created except throwaway sweep script `.superpowers/sdd/ar-sweep.mjs` (not committed).

- [ ] **Step 1: Static + suites**

`npm run lint` exit 0; `npm test` all green; `npx playwright test tests/rental-calendar.spec.ts` 4/4 (regression guard).

- [ ] **Step 2: Arabic no-English browser sweep**

Write `.superpowers/sdd/ar-sweep.mjs` (playwright library, chromium): start dev server (spawn `npm run dev`, poll port 3001, kill after). For locale ar via `addInitScript(localStorage.setItem('riman_lang','ar'))` visit `/payment/cancel`, `/timeline`, `/wedding-checklist`, `/` ; collect `document.body.innerText`; assert every visible LINE matching `/^[A-Za-z][A-Za-z0-9 ,.&'’—-]{8,}$/` belongs to an ALLOWLIST of brand marks: Riman, Atelier Riman, Riman Atelier, Maison de Couture, Stripe. Print PASS/FAIL per page + offending lines. Then repeat `/checkout` reachability only IF a cart can be seeded via localStorage without backend (inspect CartContext persistence key; if seeding is non-trivial, SKIP checkout in sweep and cover the trust box via the existing Checkout component tests/manual note — record which path taken).

- [ ] **Step 3: Report + fix loop**

Full report to `.superpowers/sdd/ar-task-5-report.md`. Any failure → fix in owning file, re-run covering suite, single commit `fix(i18n): address sweep findings`.

---

## Self-Review Notes

- Spec coverage: trust box ✓(T4), whole pages ✓(T3), cookie/newsletter ✓(T4), toasts ✓(T4+T1), Luxury Blend ✓(T4), enum values ✓(T2), t() fallback ✓(T1), provider ordering ✓(T4 Step 1), sweep ✓(T5).
- Type consistency: `translateProductValue(field, value, lang)` signature used identically in T2 def and T4 call sites; `VocabField` excludes designer/color intentionally.
- Known risk flagged: products.ts accent characters (Appliqués/Lamé) must match dict keys byte-for-byte — exhaustiveness test is the enforcement gate; GlobalFeatures localStorage flag name to be read before writing its test.
