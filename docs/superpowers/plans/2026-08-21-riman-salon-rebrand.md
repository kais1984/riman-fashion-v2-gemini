# Riman Fashion — "The Salon" Rebrand Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebrand the site to "The Salon" direction — distinctive typography (Fraunces/Archivo/Newsreader/Amiri), five-chapter bespoke-first homepage, booking thread, demoted commerce — per spec `docs/superpowers/specs/2026-08-21-riman-salon-rebrand-design.md`.

**Architecture:** Token-level changes cascade first (`src/index.css` `@theme`), then new isolated "salon" components are built TDD-style, then pages are rewritten/restyled on top. No backend, cart, Stripe, or routing changes.

**Tech Stack:** React 18 + Vite + TypeScript, Tailwind CSS v4 (`@theme` in `src/index.css`), vitest + @testing-library/react (jsdom), motion/react (existing), lucide-react.

## Global Constraints

- Palette (verbatim): `gold #A2492B`, `gold-light #C45A3C`, `gold-dark #7A3520`, `onyx #161513`, `bone #EFEAE2`, **new** `champagne #F6F0E6`.
- Fonts (verbatim): headings **Fraunces**, labels/nav **Archivo Light** tracked ≥0.25em uppercase, body/editorial **Newsreader**, Arabic display **Amiri**, Arabic body Cairo + IBM Plex Sans Arabic (unchanged).
- Motion: fades/slow reveals only, 600–900ms ease-out; image hover zoom ≤1.05 scale, ~1600ms; everything gated by `prefers-reduced-motion`. No shimmer, no float, no bounce.
- Every new user-facing string gets BOTH `'en'` and `'ar'` keys in `src/contexts/LanguageContext.tsx`. Locales are exactly `'en' | 'ar'`.
- Gold is ornament (hairlines, numerals, rules) — never large filled surfaces.
- NO changes to: cart logic, Stripe, Supabase services, routes, `Product` type, admin pages.
- Verification commands: `npm run lint` (tsc --noEmit), `npm run build` (vite build), `npm run test` (vitest run).
- Commit style: conventional commits (`feat:`, `style:`, `docs:`, `chore:`).
- Product detail route: `/product/:id`. Appointments route: `/appointment`.

---

### Task 1: Design tokens & typography foundation

**Files:**
- Modify: `src/index.css`

**Interfaces:**
- Produces: Tailwind utilities `font-heading` (Fraunces), `font-editorial`/`font-body` (Newsreader), `font-label` (Archivo), `font-arabic-heading` (Amiri), color class `bg-champagne`/`text-champagne` etc., `.btn-luxury` (restyled). All later tasks consume these.

- [ ] **Step 1: Check shimmer/float usage outside the homepage**

Run: `rg -n "animate-shimmer|animate-float" src --glob "!src/pages/Index.tsx"`
- If **no output**: proceed to Step 2 (tokens stay removed).
- If **matches exist**: after Step 2, re-add to `@theme` the four lines below (and keep using them elsewhere; do not delete their keyframes):

```css
  --animate-float: float 6s ease-in-out infinite;
  --animate-shimmer: shimmer 3s infinite linear;
  @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
  @keyframes shimmer { from { background-position: -200% 0; } to { background-position: 200% 0; } }
```

- [ ] **Step 2: Replace the font import (line 1)**

Replace the entire line 1 `@import url(...)` with:

```css
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Archivo:wght@300;400;500&family=Cairo:wght@300;400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,300..600;1,6..72,300..600&display=swap');
```

- [ ] **Step 3: Replace the `@theme` block (lines 4–42)**

Replace wholesale with:

```css
@theme {
  --font-heading: "Fraunces", serif;
  --font-editorial: "Newsreader", serif;
  --font-body: "Newsreader", serif;
  --font-label: "Archivo", sans-serif;
  --font-arabic: "Cairo", "IBM Plex Sans Arabic", sans-serif;
  --font-arabic-heading: "Amiri", serif;
  --font-jewelry: "Fraunces", serif;

  --color-gold: #A2492B;
  --color-gold-light: #C45A3C;
  --color-gold-dark: #7A3520;
  --color-onyx: #161513;
  --color-bone: #EFEAE2;
  --color-ivory: var(--color-bone);
  --color-champagne: #F6F0E6;
  --color-pearl: #E8E3D9;
  --color-jewelry: linear-gradient(45deg, #7A3520 0%, #A2492B 45%, #C45A3C 50%, #A2492B 55%, #7A3520 100%);

  --animate-fade-up: fade-up 0.8s ease-out forwards;
  --animate-fade-in: fade-in 1s ease-out forwards;

  @keyframes fade-up {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
}
```

(Leave the marquee keyframes block at lines ~225–241 untouched — the `Marquee` component still exists.)

- [ ] **Step 4: Rewrite `.btn-luxury` (lines ~137–141)**

Replace the whole rule with:

```css
.btn-luxury {
  @apply inline-flex items-center justify-center px-10 py-5 font-label text-xs tracking-[0.25em] uppercase transition-colors duration-700 bg-onyx text-bone hover:text-gold;
}
```

- [ ] **Step 5: Append RTL heading font + reduced-motion guard at end of file**

```css
/* Arabic display type takes over headings under RTL */
[dir="rtl"] h1, [dir="rtl"] h2, [dir="rtl"] h3 {
  font-family: var(--font-arabic-heading);
  letter-spacing: normal;
}

/* Respect reduced motion globally */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 6: Verify**

Run: `npm run lint && npm run build`
Expected: both pass. Then `npm run dev` and eyeball the homepage: fonts changed site-wide (some layouts will look off until Tasks 5–8 — that is expected).

- [ ] **Step 7: Commit**

```bash
git add src/index.css
git commit -m "feat(salon): swap type system to Fraunces/Archivo/Newsreader/Amiri, add champagne token, ivory alias, reduced-motion guard"
```

---

### Task 2: Salon primitives — ChapterLabel + CalligraphicAccent (TDD)

**Files:**
- Create: `src/components/salon/ChapterLabel.tsx`
- Create: `src/components/salon/ChapterLabel.test.tsx`
- Create: `src/components/salon/CalligraphicAccent.tsx`
- Create: `src/components/salon/CalligraphicAccent.test.tsx`
- Modify: `src/contexts/LanguageContext.tsx` (add 4 keys)

**Interfaces:**
- Consumes: `useLanguage()` from `../../contexts/LanguageContext` (returns `{ language, t }`; `t(key: string) => string`).
- Produces: `ChapterLabel({ numeral: string; titleKey: string })`, `CalligraphicAccent({ word: string; className?: string })` — consumed by Task 6.

- [ ] **Step 1: Write failing tests**

`src/components/salon/ChapterLabel.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { LanguageProvider } from '../../contexts/LanguageContext';
import ChapterLabel from './ChapterLabel';

describe('ChapterLabel', () => {
  it('renders numeral and translated chapter title', () => {
    render(
      <LanguageProvider>
        <ChapterLabel numeral="I" titleKey="chapter.atelier" />
      </LanguageProvider>
    );
    expect(screen.getByText('I')).toBeInTheDocument();
    expect(screen.getByText("L'Atelier")).toBeInTheDocument();
  });
});
```

`src/components/salon/CalligraphicAccent.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import CalligraphicAccent from './CalligraphicAccent';

describe('CalligraphicAccent', () => {
  it('renders decorative Arabic word, hidden from assistive tech', () => {
    render(<CalligraphicAccent word="أناقة" className="text-9xl" />);
    const el = screen.getByText('أناقة');
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(el.className).toContain('pointer-events-none');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- src/components/salon`
Expected: FAIL — cannot resolve `./ChapterLabel` / `./CalligraphicAccent`.

- [ ] **Step 3: Add i18n keys**

In `src/contexts/LanguageContext.tsx`, inside the `en` object next to the `// Hero` keys (line ~64), add:

```ts
    // Salon chapters
    'chapter.atelier': "L'Atelier",
    'chapter.silhouettes': 'Les Silhouettes',
    'chapter.savoir_faire': 'Le Savoir-Faire',
```

Inside the `ar` object next to its `// Hero` keys (line ~738), add:

```ts
    // Salon chapters
    'chapter.atelier': 'الأتيليه',
    'chapter.silhouettes': 'القصات',
    'chapter.savoir_faire': 'الحرفية',
```

- [ ] **Step 4: Implement components**

`src/components/salon/ChapterLabel.tsx`:

```tsx
import { useLanguage } from '../../contexts/LanguageContext';

interface ChapterLabelProps {
  numeral: string;
  titleKey: string;
}

export default function ChapterLabel({ numeral, titleKey }: ChapterLabelProps) {
  const { t } = useLanguage();
  return (
    <div className="flex items-center gap-4 md:gap-6">
      <span className="font-label text-xs tracking-[0.3em] uppercase text-gold">{numeral}</span>
      <span className="h-px w-12 bg-gold/40" aria-hidden="true" />
      <h2 className="font-heading text-3xl md:text-5xl font-light tracking-normal normal-case text-stone-800">
        {t(titleKey)}
      </h2>
    </div>
  );
}
```

`src/components/salon/CalligraphicAccent.tsx`:

```tsx
interface CalligraphicAccentProps {
  word: string;
  className?: string;
}

export default function CalligraphicAccent({ word, className }: CalligraphicAccentProps) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute select-none font-arabic-heading leading-none text-gold/10 ${className ?? ''}`}
    >
      {word}
    </span>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run test -- src/components/salon`
Expected: PASS (2 tests).

- [ ] **Step 6: Verify key parity**

Run: `rg -c "'chapter\." src/contexts/LanguageContext.tsx`
Expected: `6` total matches (3 en + 3 ar).

- [ ] **Step 7: Commit**

```bash
git add src/components/salon src/contexts/LanguageContext.tsx
git commit -m "feat(salon): add ChapterLabel and CalligraphicAccent primitives with en/ar keys"
```

---

### Task 3: Booking thread — InvitationRule (TDD)

**Files:**
- Create: `src/components/salon/InvitationRule.tsx`
- Create: `src/components/salon/InvitationRule.test.tsx`
- Modify: `src/contexts/LanguageContext.tsx` (add 6 keys)

**Interfaces:**
- Consumes: `useLanguage()`, react-router `Link`.
- Produces: `InvitationRule({ className?: string })` — recurring end-of-chapter invitation linking to `/appointment`; consumed by Task 6. Key `nav.private_viewing` consumed by Task 5.

- [ ] **Step 1: Write failing test**

`src/components/salon/InvitationRule.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '../../contexts/LanguageContext';
import InvitationRule from './InvitationRule';

describe('InvitationRule', () => {
  it('renders invitation line and link to appointments', () => {
    render(
      <MemoryRouter>
        <LanguageProvider>
          <InvitationRule />
        </LanguageProvider>
      </MemoryRouter>
    );
    expect(screen.getByText('Continue the conversation — request a private viewing.')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /request a private viewing/i });
    expect(link).toHaveAttribute('href', '/appointment');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/components/salon`
Expected: FAIL — cannot resolve `./InvitationRule`.

- [ ] **Step 3: Add i18n keys**

In `en` object (near the Task 2 keys):

```ts
    'invitation.line': 'Continue the conversation — request a private viewing.',
    'invitation.cta': 'Request a Private Viewing',
    'nav.private_viewing': 'Private Viewing',
```

In `ar` object:

```ts
    'invitation.line': 'أكمِل الحوار — اطلب زيارة خاصة.',
    'invitation.cta': 'اطلب زيارة خاصة',
    'nav.private_viewing': 'زيارة خاصة',
```

- [ ] **Step 4: Implement component**

`src/components/salon/InvitationRule.tsx`:

```tsx
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface InvitationRuleProps {
  className?: string;
}

export default function InvitationRule({ className }: InvitationRuleProps) {
  const { t } = useLanguage();
  return (
    <div className={`flex flex-col items-center gap-4 py-16 text-center ${className ?? ''}`}>
      <span className="h-px w-24 bg-gold/40" aria-hidden="true" />
      <p className="font-editorial italic text-lg text-stone-600">{t('invitation.line')}</p>
      <Link
        to="/appointment"
        className="group inline-flex items-center gap-2 font-label text-xs tracking-[0.25em] uppercase text-stone-800 transition-colors duration-700 hover:text-gold"
      >
        {t('invitation.cta')}
        <ArrowRight className="w-4 h-4 transition-transform duration-700 group-hover:translate-x-1 rtl:rotate-180" />
      </Link>
    </div>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run test -- src/components/salon`
Expected: PASS (3 tests total).

- [ ] **Step 6: Commit**

```bash
git add src/components/salon src/contexts/LanguageContext.tsx
git commit -m "feat(salon): add InvitationRule booking-thread component with en/ar keys"
```

---

### Task 4: EditorialPlate (TDD)

**Files:**
- Create: `src/components/salon/EditorialPlate.tsx`
- Create: `src/components/salon/EditorialPlate.test.tsx`
- Modify: `src/contexts/LanguageContext.tsx` (add 4 keys)

**Interfaces:**
- Consumes: `Product` from `../../types` (fields used: `id`, `name`, `images: string[]`, `fabric?`).
- Produces: `EditorialPlate({ product: Product; index: number; reverse?: boolean })` — numbered couture plate; consumed by Task 6.

- [ ] **Step 1: Write failing test**

`src/components/salon/EditorialPlate.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '../../contexts/LanguageContext';
import EditorialPlate from './EditorialPlate';
import { Product } from '../../types';

const gown: Product = {
  id: 'p1',
  name: 'Ivory Mikado Gown',
  description: 'test',
  productType: 'sale',
  images: ['/assets/gown.jpg'],
  category: 'Bridal Gown',
  style: [],
  color: [],
  sizes: [],
  fabric: 'Mikado Silk',
};

describe('EditorialPlate', () => {
  it('renders look number, name, fabric and enquire link', () => {
    render(
      <MemoryRouter>
        <LanguageProvider>
          <EditorialPlate product={gown} index={0} />
        </LanguageProvider>
      </MemoryRouter>
    );
    expect(screen.getByAltText('Ivory Mikado Gown')).toHaveAttribute('src', '/assets/gown.jpg');
    expect(screen.getByText('Look 01')).toBeInTheDocument();
    expect(screen.getByText('Mikado Silk')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /enquire/i })).toHaveAttribute('href', '/product/p1');
  });

  it('omits fabric line when absent', () => {
    render(
      <MemoryRouter>
        <LanguageProvider>
          <EditorialPlate product={{ ...gown, fabric: undefined }} index={1} />
        </LanguageProvider>
      </MemoryRouter>
    );
    expect(screen.queryByText('Mikado Silk')).not.toBeInTheDocument();
    expect(screen.getByText('Look 02')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- src/components/salon`
Expected: FAIL — cannot resolve `./EditorialPlate`.

- [ ] **Step 3: Add i18n keys**

In `en`:

```ts
    'silhouettes.look': 'Look',
    'silhouettes.enquire': 'Enquire',
```

In `ar`:

```ts
    'silhouettes.look': 'إطلالة',
    'silhouettes.enquire': 'استفسار',
```

- [ ] **Step 4: Implement component**

`src/components/salon/EditorialPlate.tsx`:

```tsx
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLanguage } from '../../contexts/LanguageContext';
import { Product } from '../../types';

interface EditorialPlateProps {
  product: Product;
  index: number;
  reverse?: boolean;
}

export default function EditorialPlate({ product, index, reverse }: EditorialPlateProps) {
  const { t } = useLanguage();
  const lookNumber = String(index + 1).padStart(2, '0');

  return (
    <figure className="group grid gap-6 md:grid-cols-12 md:gap-10 items-end">
      <div className={cn('relative overflow-hidden md:col-span-7', reverse && 'md:order-2')}>
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="aspect-[3/4] w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.04]"
        />
        <span className="absolute top-4 left-4 font-heading text-6xl font-light text-white/90 drop-shadow-md">
          {lookNumber}
        </span>
      </div>
      <figcaption className={cn('flex flex-col gap-3 md:col-span-5', reverse && 'md:order-1')}>
        <span className="font-label text-xs tracking-[0.3em] uppercase text-gold">
          {t('silhouettes.look')} {lookNumber}
        </span>
        <h3 className="font-heading text-2xl md:text-3xl font-light text-stone-800">{product.name}</h3>
        {product.fabric && (
          <p className="font-editorial italic text-stone-600">{product.fabric}</p>
        )}
        <Link
          to={`/product/${product.id}`}
          className="group/link inline-flex items-center gap-2 font-label text-xs tracking-[0.25em] uppercase text-stone-800 transition-colors duration-700 hover:text-gold mt-2"
        >
          {t('silhouettes.enquire')}
          <ArrowRight className="w-4 h-4 transition-transform duration-700 group-hover/link:translate-x-1 rtl:rotate-180" />
        </Link>
      </figcaption>
    </figure>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run test -- src/components/salon`
Expected: PASS (5 tests total).

- [ ] **Step 6: Commit**

```bash
git add src/components/salon src/contexts/LanguageContext.tsx
git commit -m "feat(salon): add EditorialPlate couture plate component with en/ar keys"
```

---

### Task 5: Header restyle + Private Viewing link

**Files:**
- Modify: `src/components/Header.tsx` (navLinks lines 11–18; `text-sunset` blocks at lines ~96–105 and ~145–150)

**Interfaces:**
- Consumes: i18n key `nav.private_viewing` (from Task 3), utility `font-label` (from Task 1).
- Produces: nav order per spec §8; zero `text-sunset` usages.

- [ ] **Step 1: Replace the navLinks array (lines 11–18)**

```ts
const navLinks = [
  { label: "Our Story", path: "/about", key: 'nav.about' },
  { label: "Bridal", path: "/collection/bridal", key: 'nav.bridal' },
  { label: "Evening", path: "/collection/evening", key: 'nav.evening' },
  { label: "Rentals", path: "/collection/rental", key: 'nav.rentals' },
  { label: "Contact", path: "/contact", key: 'nav.contact' },
  { label: "Private Viewing", path: "/appointment", key: 'nav.private_viewing' },
];
```

- [ ] **Step 2: Fix dead token + label font in both nav className blocks**

Both blocks (lines ~96–105 and ~145–150) contain the identical string `"font-heading text-xs tracking-[0.2em] uppercase transition-all duration-300",`. Replace **all occurrences** of:

```
"font-heading text-xs tracking-[0.2em] uppercase transition-all duration-300",
```

with:

```
"font-label text-xs tracking-[0.25em] uppercase transition-all duration-300",
```

Then replace **all occurrences** of `hover:text-sunset` with `hover:text-gold-dark`.

- [ ] **Step 3: Verify**

Run: `rg -c "text-sunset" src ; npm run lint`
Expected: `rg` exits with no matches (exit code 1); lint passes.

- [ ] **Step 4: Commit**

```bash
git add src/components/Header.tsx
git commit -m "feat(salon): header nav — Archivo labels, gold-dark hover fix, Private Viewing thread"
```

---

### Task 6: Homepage rewrite — five chapters

**Files:**
- Modify: `src/pages/Index.tsx` (full rewrite; old file is 609 lines)
- Modify: `src/contexts/LanguageContext.tsx` (add 14 keys)

**Interfaces:**
- Consumes: `ChapterLabel`, `CalligraphicAccent`, `InvitationRule`, `EditorialPlate` (Tasks 2–4); `useData()` → `{ products }`; `testimonials` from `../data/products`; keys `hero.title/subtitle/discover`, `cta.viewing/explore`, `cat.bridal/evening/rentals`.
- Produces: five-chapter homepage per spec §6.

- [ ] **Step 1: Extract existing category-tile media paths**

Run: `git show HEAD:src/pages/Index.tsx | sed -n '301,330p'`
Note the image/video `src` values used by the Bridal, Evening, Rentals tiles — you will paste them into `DISCIPLINES` in Step 3.

- [ ] **Step 2: Add i18n keys**

In `en`:

```ts
    // Salon homepage
    'atelier.heading': 'Mastering The Legacy Icon',
    'atelier.quote': 'It begins with a tension — the architecture of Mikado silk against the whisper of French tulle.',
    'atelier.body': 'Since 2011 our Sharjah atelier has cut by hand, fitted by eye, and finished by patience. Fewer gowns, finer gowns.',
    'savoir.p1': 'Cut less, cut better. We drape Mikado silk and French tulle by hand, letting the fabric decide the line.',
    'savoir.p2': 'Every discipline of the maison — bridal, evening, rental — begins at the same table: fabric, thread, patience.',
    'disciplines.bridal': 'Gowns made once, for one day, forever.',
    'disciplines.evening': 'Red-carpet presence, tailored to the moment.',
    'disciplines.rentals': 'Couture for a night, kept flawless.',
    'invitation.heading': 'Experience The Riman Touch',
    'invitation.contact_line': 'Sharjah · By Appointment Only',
```

In `ar`:

```ts
    // Salon homepage
    'atelier.heading': 'إتقان أيقونة الإرث',
    'atelier.quote': 'يبدأ كل شيء بتوترٍ جميل — هندسة حرير الميكادو في مواجهة همس التول الفرنسي.',
    'atelier.body': 'من مرسمنا في الشارقة، نقطع باليد، ونقاس بالنظر، ونُنهي العمل بالصبر. فساتين أقل، وإتقانًا أكبر.',
    'savoir.p1': 'نقلّ القليل لنُتقن أكثر. نُشكّل الحرير الميكادو والتول الفرنسي يدويًا، تاركين للقماش أن يرسم الخط.',
    'savoir.p2': 'كل تخصصات الدار — الزفاف، السهرة، الإيجار — تبدأ من الطاولة نفسها: قماش، خيط، وصبر.',
    'disciplines.bridal': 'فساتين تُخلَّد لِيومٍ واحد، وتبقى للأبد.',
    'disciplines.evening': 'حضور سجادة حمراء، مفصّل للحظة.',
    'disciplines.rentals': 'كوتور ليلة واحدة، يبقى بلا عيب.',
    'invitation.heading': 'عِش لمسة ريمان',
    'invitation.contact_line': 'الشارقة · بموعد مسبق فقط',
```

- [ ] **Step 3: Replace `src/pages/Index.tsx` entirely with**

```tsx
import { Link } from 'react-router-dom';
import { testimonials } from '../data/products';
import ScrollReveal from '../components/ScrollReveal';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import ChapterLabel from '../components/salon/ChapterLabel';
import CalligraphicAccent from '../components/salon/CalligraphicAccent';
import InvitationRule from '../components/salon/InvitationRule';
import EditorialPlate from '../components/salon/EditorialPlate';

const DISCIPLINES = [
  { titleKey: 'cat.bridal', descKey: 'disciplines.bridal', media: 'PASTE_BRIDAL_MEDIA', alt: 'Bridal', to: '/collection/bridal' },
  { titleKey: 'cat.evening', descKey: 'disciplines.evening', media: 'PASTE_EVENING_MEDIA', alt: 'Evening', to: '/collection/evening' },
  { titleKey: 'cat.rentals', descKey: 'disciplines.rentals', media: 'PASTE_RENTALS_MEDIA', alt: 'Rentals', to: '/collection/rental' },
];

export default function Index() {
  const { products } = useData();
  const { t } = useLanguage();

  const featured = products.filter((p) => p.isFeatured).slice(0, 4);
  const plates = featured.length >= 2 ? featured : products.slice(0, 4);
  const quote = testimonials[0];

  return (
    <main>
      {/* ARRIVAL */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center bg-onyx overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/assets/rimanfashion_3panel_split.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-onyx/70 via-onyx/40 to-onyx/80" aria-hidden="true" />
        <CalligraphicAccent
          word="أناقة"
          className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[clamp(10rem,30vw,28rem)]"
        />
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto animate-fade-in">
          <p className="font-label text-[11px] md:text-xs tracking-[0.35em] uppercase text-white/70 mb-8">
            {t('hero.subtitle')}
          </p>
          <h1 className="font-heading text-white font-light leading-[0.95] text-[clamp(3.5rem,11vw,9rem)] mb-12">
            {t('hero.title').split('&').map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && <em className="font-editorial italic text-gold">&</em>}
              </span>
            ))}
          </h1>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/appointment" className="btn-luxury">
              {t('cta.viewing')}
            </Link>
            <a
              href="#atelier"
              className="font-label text-xs tracking-[0.25em] uppercase text-white/80 hover:text-gold transition-colors duration-700 border-b border-white/30 hover:border-gold pb-1"
            >
              {t('cta.explore')}
            </a>
          </div>
        </div>
        <span className="absolute bottom-8 left-1/2 -translate-x-1/2 font-label text-[10px] tracking-[0.3em] uppercase text-white/60">
          {t('hero.discover')}
        </span>
      </section>

      {/* CHAPTER I — L'ATELIER */}
      <section id="atelier" className="bg-bone py-24 md:py-36 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-10 md:gap-16">
          <div className="md:col-span-4">
            <div className="md:sticky md:top-32">
              <ChapterLabel numeral="I" titleKey="chapter.atelier" />
            </div>
          </div>
          <div className="md:col-span-8 flex flex-col gap-10">
            <ScrollReveal>
              <h3 className="font-heading text-3xl md:text-5xl font-light text-stone-800 leading-tight">
                {t('atelier.heading')}
              </h3>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <p className="font-editorial italic text-xl md:text-2xl text-gold-dark leading-relaxed max-w-2xl">
                {t('atelier.quote')}
              </p>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <p className="font-body text-stone-600 leading-loose max-w-2xl">{t('atelier.body')}</p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CHAPTER II — LES SILHOUETTES */}
      <section className="bg-champagne py-24 md:py-36 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <ChapterLabel numeral="II" titleKey="chapter.silhouettes" />
          <div className="mt-16 md:mt-24 flex flex-col gap-24 md:gap-36">
            {plates.map((product, i) => (
              <ScrollReveal key={product.id}>
                <EditorialPlate product={product} index={i} reverse={i % 2 === 1} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CHAPTER III — LE SAVOIR-FAIRE */}
      <section className="bg-bone py-24 md:py-36 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <ChapterLabel numeral="III" titleKey="chapter.savoir_faire" />
          <div className="mt-12 grid md:grid-cols-2 gap-10 max-w-4xl">
            <p className="font-body text-stone-600 leading-loose">{t('savoir.p1')}</p>
            <p className="font-body text-stone-600 leading-loose">{t('savoir.p2')}</p>
          </div>
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            {DISCIPLINES.map((d) => (
              <ScrollReveal key={d.titleKey}>
                <Link to={d.to} className="group block">
                  <div className="overflow-hidden">
                    <img
                      src={d.media}
                      alt={d.alt}
                      loading="lazy"
                      className="aspect-[3/4] w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.04]"
                    />
                  </div>
                  <h3 className="font-heading text-2xl font-light text-stone-800 mt-5">{t(d.titleKey)}</h3>
                  <p className="font-editorial italic text-stone-600 mt-2">{t(d.descKey)}</p>
                  <span className="inline-block mt-3 font-label text-xs tracking-[0.25em] uppercase text-gold border-b border-gold/40 pb-1">
                    Discover
                  </span>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* L'INVITATION */}
      <section className="bg-champagne py-24 md:py-36 px-6 text-center relative overflow-hidden">
        <CalligraphicAccent
          word="دعوة"
          className="top-8 right-8 text-[clamp(6rem,18vw,16rem)]"
        />
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="font-heading text-4xl md:text-6xl font-light text-stone-800">{t('invitation.heading')}</h2>
          {quote && (
            <blockquote className="mt-12">
              <p className="font-editorial italic text-xl md:text-2xl text-stone-600 leading-relaxed">
                “{quote.content}”
              </p>
              <footer className="mt-6 font-label text-xs tracking-[0.25em] uppercase text-gold">
                {quote.authorName} — {quote.authorRole}
              </footer>
            </blockquote>
          )}
          <div className="mt-12 flex flex-col items-center gap-6">
            <Link to="/appointment" className="btn-luxury">
              {t('cta.viewing')}
            </Link>
            <p className="font-label text-[11px] tracking-[0.3em] uppercase text-stone-500">
              {t('invitation.contact_line')}
            </p>
          </div>
        </div>
      </section>

      {/* Recurring booking thread */}
      <InvitationRule className="bg-champagne border-t border-gold/15" />
    </main>
  );
}
```

Then replace the three `PASTE_*_MEDIA` values with the URLs extracted in Step 1.

- [ ] **Step 4: Verify compile + suite**

Run: `npm run lint && npm run build && npm run test`
Expected: all pass. (Old luxury-component tests still pass — those components remain in the repo, just unused here.)

- [ ] **Step 5: Visual smoke**

Run: `npm run dev` → http://localhost:3001
Checklist: hero video + giant Fraunces H1 + gold `&`; chapter numerals I/II/III; plates alternate; disciplines tiles show real imagery; invitation CTA links to `/appointment`.

- [ ] **Step 6: Commit**

```bash
git add src/pages/Index.tsx src/contexts/LanguageContext.tsx
git commit -m "feat(salon): rebuild homepage as five-chapter maison narrative"
```

---

### Task 7: ProductCard plate restyle

**Files:**
- Modify: `src/components/ProductCard.tsx`

**Interfaces:**
- Consumes: `font-label`/`font-editorial` utilities; `/product/:id` route.
- Produces: `ProductCardProps` gains optional `lookNumber?: string`; cart/wishlist behavior unchanged.

- [ ] **Step 1: Extend props interface (lines 14–17)**

```ts
interface ProductCardProps {
  product: Product;
  key?: string | number;
  lookNumber?: string;
}
```

And destructure it in the component signature: `({ product, lookNumber }: ProductCardProps)` (remove `key` from destructuring if present — React consumes it).

- [ ] **Step 2: Promote Enquire + fabric line in the card body**

Locate where the product name is rendered in the card's lower body. Immediately **above** the name element, insert:

```tsx
        {lookNumber && (
          <span className="font-label text-[10px] tracking-[0.3em] uppercase text-gold">
            Look {lookNumber}
          </span>
        )}
```

Immediately **below** the name element, insert:

```tsx
        {product.fabric && (
          <p className="font-editorial italic text-sm text-stone-500">{product.fabric}</p>
        )}
        <Link
          to={`/product/${product.id}`}
          className="inline-flex items-center gap-1.5 font-label text-[10px] tracking-[0.25em] uppercase text-stone-800 hover:text-gold transition-colors duration-500 mt-2"
        >
          Enquire
          <ArrowRight className="w-3 h-3" />
        </Link>
```

Add `Link` from `react-router-dom` and `ArrowRight` from `lucide-react` to the imports if not already imported.

- [ ] **Step 3: De-emphasize the quick-add bar (lines ~178–215)**

On the wrapper div `<div className="flex bg-onyx/95 backdrop-blur-sm border-t border-gold/20">` add hover-only reveal:

```tsx
          <div className="flex bg-onyx/95 backdrop-blur-sm border-t border-gold/20 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
```

(If the card root lacks `group`, add `group` to its root className.)

- [ ] **Step 4: Verify**

Run: `npm run lint && npm run build`
Expected: pass. Manual: on `/collection/bridal`, cards show fabric line + Enquire; cart/wishlist bar appears only on hover; add-to-cart still works.

- [ ] **Step 5: Commit**

```bash
git add src/components/ProductCard.tsx
git commit -m "feat(salon): ProductCard plate aesthetic — fabric line, Enquire promotion, hover-only actions"
```

---

### Task 8: AppointmentPage + Footer restyle

**Files:**
- Modify: `src/pages/AppointmentPage.tsx` (outer div line ~119; h1 lines ~135, ~103; h2 lines ~160, ~202, ~250; form fields)
- Modify: `src/components/Footer.tsx` (h4 line ~21; ghost wordmark line ~166)

**Interfaces:**
- Consumes: `bg-champagne`, Fraunces via `font-heading` (Task 1 cascade).

- [ ] **Step 1: AppointmentPage ground + headings**

Line ~119: `bg-ivory` → `bg-champagne`:

```tsx
    <div className="pt-24 min-h-screen bg-champagne">
```

Line ~135 h1 — replace className with:

```tsx
<h1 className="font-heading text-4xl md:text-5xl font-light text-stone-800 mb-4">{t('appointment.heading')}</h1>
```

Line ~103 confirmation h1 — same treatment:

```tsx
<h1 className="font-heading text-4xl font-light text-stone-800 mb-4">{t('appointment.booked')}</h1>
```

Lines ~160, ~202, ~250 h2s — replace `className="font-heading text-xl text-stone-800 tracking-widest uppercase"` with:

```tsx
className="font-heading text-2xl font-light text-stone-800"
```

- [ ] **Step 2: Hairline form fields**

For each `<input>`, `<select>`, `<textarea>` in the form that has boxed borders, set/replace classes to:

```
w-full bg-transparent border-0 border-b border-stone-300 focus:border-gold focus:ring-0 rounded-none py-3 outline-none transition-colors duration-500
```

Preserve any existing `register({...})` props and handlers exactly.

- [ ] **Step 3: Footer touches**

Line ~21 column heading: `font-body` → `font-label`:

```tsx
<h4 className="font-label text-xs tracking-[0.3em] uppercase text-gold font-bold ...">
```

(keep the remaining classes as-is). Line ~166 ghost wordmark: change `font-heading font-bold` → `font-heading font-light` (Fraunces light at 16vw).

- [ ] **Step 4: Verify**

Run: `npm run lint && npm run build`
Expected: pass. Manual: `/appointment` renders on champagne ground, serif normal-case headings, underline-only fields; booking flow still submits (step through all 3 steps).

- [ ] **Step 5: Commit**

```bash
git add src/pages/AppointmentPage.tsx src/components/Footer.tsx
git commit -m "style(salon): appointment page + footer adopt salon design language"
```

---

### Task 9: Cleanup, full verification, RTL + reduced-motion pass

**Files:**
- Modify: `tailwind.config.js` (vestigial comment only)

- [ ] **Step 1: Mark legacy config vestigial**

Prepend to `tailwind.config.js`:

```js
/* VESTIGIAL: Tailwind v4 reads the theme from src/index.css (@theme). Values below are NOT applied.
   See docs/superpowers/specs/2026-08-21-riman-salon-rebrand-design.md */
```

- [ ] **Step 2: Dead-class sweep**

Run: `rg -n "text-sunset|animate-shimmer|animate-float" src`
Expected: no matches. If matches appear outside `src/pages/Index.tsx`, stop and report — do not silently edit unrelated features.

- [ ] **Step 3: Full automated verification**

Run: `npm run test && npm run lint && npm run build`
Expected: vitest suite green (including 5 new salon tests), typecheck clean, production build succeeds.

- [ ] **Step 4: Manual verification checklist (`npm run dev`)**

1. Desktop 1440px: all five chapters render; no marquee/stat-counters/icon-journey/carousel anywhere.
2. Mobile 390px: hero type scales via clamp; plates stack; nav usable.
3. Switch language to Arabic: hero, chapters, header, appointment page render RTL; headings render in Amiri; no overflow.
4. OS reduced-motion on: animations effectively disabled.
5. Every chapter's InvitationRule + header "Private Viewing" navigate to `/appointment`.
6. Commerce regression: from any collection page, hover a card → quick-add → item lands in cart; checkout page loads.

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.js
git commit -m "chore(salon): mark legacy tailwind config vestigial; rebrand verification pass"
```

---

## Self-Review Notes

- **Spec coverage:** §5.1→T1; §5.2→T2+T6; §5.3→T1; §5.4→T1+T4; §6→T6; §7→T3+T5+T8; §8→T5+T7; §9→keys in T2–T6 + RTL rule in T1; §10.1→T5, §10.2→T1, §10.3→T1, §10.4→T9; §11 all files touched; §12→T9. Deviation: spec §8 "look number" on ProductCard implemented as optional `lookNumber` prop (no caller passes it yet) — plates carry numerals in Chapter II; noted rather than silently dropped.
- **Type consistency:** `EditorialPlate({product, index, reverse})` matches Task 6 usage; `ChapterLabel({numeral, titleKey})` matches; `InvitationRule({className})` matches; i18n keys referenced in JSX (`chapter.silhouettes`, `cta.viewing`, `cat.*`) all exist — `chapter.silhouettes` is added in Task 2 Step 3.
