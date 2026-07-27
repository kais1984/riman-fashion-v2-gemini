# Couture Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the reference mockup's couture motion language (marquee, magnetic buttons, word-scrub, counters, pinned lookbook, upgraded preloader/cursor, giant typography, parallax) into the RIMAN app using the existing `motion` library — no new dependencies, gold/onyx identity preserved.

**Architecture:** New presentational components in `src/components/luxury/` (Marquee, MagneticButton, WordReveal, StatCounter, HorizontalLookbook). The existing `ImmersiveUI.tsx` (already feature-flagged preloader + cursor) is upgraded in place. Homepage sections are composed in `src/pages/Index.tsx`. Header/Footer/ProductCard get targeted modifications only.

**Tech Stack:** React 19, TypeScript, motion v12 (`motion/react`), Tailwind CSS v4, Vitest + Testing Library.

## Global Constraints

- **NO new npm dependencies.** Animation library is `motion` (v12), imported as `motion/react`.
- Palette stays gold `#D4AF37` / onyx `#0A0A0A` / ivory. Reference "rust" maps to `text-gold`/`bg-gold`.
- All user-visible strings go through `t()` with keys added to BOTH `en` and `ar` in `src/contexts/LanguageContext.tsx`.
- Never letter/word-split Arabic text (breaks letter joining). Gate with `isRtl` from `useLanguage()`.
- Every animated feature must respect `prefers-reduced-motion` (match existing `usePrefersReducedMotion` pattern in `ImmersiveUI.tsx`).
- Desktop-only effects (cursor, magnetic, pinned scroll) must no-op on touch/mobile.
- Test style: mirror `src/components/GalleryFilters.test.tsx` (vitest + `@testing-library/react`, `LanguageProvider` + `BrowserRouter` wrappers).
- Run tests: `npm test` · Type check: `npm run lint` · Dev server: `npm run dev` (port 3001).
- Frequent commits: commit after each task.

---

### Task 1: Marquee component

**Files:**
- Create: `src/components/luxury/Marquee.tsx`
- Create: `src/components/luxury/Marquee.test.tsx`
- Modify: `src/index.css` (append marquee CSS at end of file)

**Interfaces:**
- Produces: `export default function Marquee({ items, className }: { items: string[]; className?: string })` — renders an infinite-scroll strip; each item separated by a gold `◆`. Consumed by Index.tsx in Task 9.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/luxury/Marquee.test.tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Marquee from './Marquee';

describe('Marquee', () => {
  it('renders items duplicated for seamless loop', () => {
    const { container } = render(<Marquee items={['RIMAN', 'COUTURE']} />);
    const track = container.querySelector('.marquee-track');
    expect(track).toBeInTheDocument();
    // each item appears twice (two identical halves for the -50% loop)
    expect(track!.textContent).toBe('RIMAN◆COUTURE◆RIMAN◆COUTURE◆');
  });

  it('applies custom className', () => {
    const { container } = render(<Marquee items={['A']} className="my-class" />);
    expect(container.firstChild).toHaveClass('my-class');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/luxury/Marquee.test.tsx`
Expected: FAIL — "Cannot find module './Marquee'"

- [ ] **Step 3: Write the implementation**

```tsx
// src/components/luxury/Marquee.tsx
import { cn } from '../../lib/utils';

interface MarqueeProps {
  items: string[];
  className?: string;
}

export default function Marquee({ items, className }: MarqueeProps) {
  const half = (
    <>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-10 pr-10">
          <span>{item}</span>
          <span className="text-gold" aria-hidden="true">◆</span>
        </span>
      ))}
    </>
  );

  return (
    <div
      className={cn(
        'overflow-hidden select-none border-y border-gold/20 bg-onyx py-4',
        className
      )}
      aria-hidden="true"
    >
      <div className="marquee-track flex w-max">
        <div className="flex items-center text-[11px] uppercase tracking-[0.35em] whitespace-nowrap text-ivory/80">
          {half}
        </div>
        <div className="flex items-center text-[11px] uppercase tracking-[0.35em] whitespace-nowrap text-ivory/80">
          {half}
        </div>
      </div>
    </div>
  );
}
```

Append to the END of `src/index.css`:

```css
/* Couture marquee */
.marquee-track {
  animation: marquee 26s linear infinite;
}
.marquee-track:hover {
  animation-play-state: paused;
}
@keyframes marquee {
  to { transform: translateX(-50%); }
}
[dir="rtl"] .marquee-track {
  animation-name: marquee-rtl;
}
@keyframes marquee-rtl {
  to { transform: translateX(50%); }
}
@media (prefers-reduced-motion: reduce) {
  .marquee-track { animation: none; }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/luxury/Marquee.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/luxury/Marquee.tsx src/components/luxury/Marquee.test.tsx src/index.css
git commit -m "Add couture Marquee component"
```

---

### Task 2: MagneticButton component

**Files:**
- Create: `src/components/luxury/MagneticButton.tsx`
- Create: `src/components/luxury/MagneticButton.test.tsx`

**Interfaces:**
- Produces: `export default function MagneticButton({ children, strength = 0.35, className }: { children: React.ReactNode; strength?: number; className?: string })` — wrapper div that pulls toward cursor. Consumed by Index.tsx (Task 7 hero CTAs, Task 9 consultation CTA).

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/luxury/MagneticButton.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MagneticButton from './MagneticButton';

describe('MagneticButton', () => {
  it('renders children', () => {
    render(<MagneticButton><button>Click me</button></MagneticButton>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<MagneticButton className="wrap">x</MagneticButton>);
    expect(container.firstChild).toHaveClass('wrap');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/luxury/MagneticButton.test.tsx`
Expected: FAIL — "Cannot find module './MagneticButton'"

- [ ] **Step 3: Write the implementation**

```tsx
// src/components/luxury/MagneticButton.tsx
import { useRef } from 'react';
import { motion, useSpring } from 'motion/react';
import { cn } from '../../lib/utils';

interface MagneticButtonProps {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}

const isTouch = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

export default function MagneticButton({ children, strength = 0.35, className }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 150, damping: 15, mass: 0.1 });
  const y = useSpring(0, { stiffness: 150, damping: 15, mass: 0.1 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isTouch() || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * strength);
    y.set((e.clientY - rect.top - rect.height / 2) * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x, y }}
      className={cn('inline-block', className)}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/luxury/MagneticButton.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/luxury/MagneticButton.tsx src/components/luxury/MagneticButton.test.tsx
git commit -m "Add MagneticButton component"
```

---

### Task 3: WordReveal component

**Files:**
- Create: `src/components/luxury/WordReveal.tsx`
- Create: `src/components/luxury/WordReveal.test.tsx`

**Interfaces:**
- Consumes: `useLanguage()` from `../../contexts/LanguageContext` (for `isRtl`).
- Produces: `export default function WordReveal({ text, className }: { text: string; className?: string })` — words scrub-illuminate on scroll (EN); plain fade-in (AR). Consumed by Index.tsx in Task 8.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/luxury/WordReveal.test.tsx
import { describe, it, expect, beforeAll } from 'vitest';
import { render } from '@testing-library/react';
import WordReveal from './WordReveal';
import { LanguageProvider } from '../../contexts/LanguageContext';

beforeAll(() => {
  // motion's useScroll needs IntersectionObserver in jsdom
  globalThis.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof IntersectionObserver;
});

describe('WordReveal', () => {
  it('splits latin text into word spans', () => {
    const { container } = render(
      <LanguageProvider>
        <WordReveal text="Cut less and cut better" />
      </LanguageProvider>
    );
    const words = container.querySelectorAll('[data-word]');
    expect(words.length).toBe(5);
    expect(container.textContent).toContain('Cut');
    expect(container.textContent).toContain('better');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/luxury/WordReveal.test.tsx`
Expected: FAIL — "Cannot find module './WordReveal'"

- [ ] **Step 3: Write the implementation**

```tsx
// src/components/luxury/WordReveal.tsx
import { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';

interface WordRevealProps {
  text: string;
  className?: string;
}

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  return (
    <motion.span data-word style={{ opacity }} className="inline-block">
      {children}
    </motion.span>
  );
}

export default function WordReveal({ text, className }: WordRevealProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { isRtl } = useLanguage();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'end 0.45'],
  });

  // Arabic must never be split (breaks letter joining) — simple fade instead
  if (isRtl) {
    return (
      <motion.p
        ref={ref}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9 }}
        className={className}
      >
        {text}
      </motion.p>
    );
  }

  const words = text.split(/\s+/).filter(Boolean);

  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => (
        <Word
          key={i}
          progress={scrollYProgress}
          range={[i / words.length, Math.min(1, (i + 1) / words.length + 0.05)]}
        >
          {word}
        </Word>
      ))}
    </p>
  );
}
```

Note: words render as `inline-block` spans with normal spaces between them — add a space after each word: change the Word render to `{children}{'\u00A0'}` only between words is unnecessary; instead join by rendering a normal space text node after each span except the last. Simplest correct approach: in the map, render `<Word ...>{word}</Word>` followed by `{i < words.length - 1 ? ' ' : null}`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/luxury/WordReveal.test.tsx`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add src/components/luxury/WordReveal.tsx src/components/luxury/WordReveal.test.tsx
git commit -m "Add WordReveal word-scrub component"
```

---

### Task 4: StatCounter component

**Files:**
- Create: `src/components/luxury/StatCounter.tsx`
- Create: `src/components/luxury/StatCounter.test.tsx`

**Interfaces:**
- Produces: `export default function StatCounter({ value, suffix, label, duration }: { value: number; suffix?: string; label: string; duration?: number })`. Consumed by Index.tsx in Task 8.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/luxury/StatCounter.test.tsx
import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatCounter from './StatCounter';

beforeAll(() => {
  globalThis.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof IntersectionObserver;
});

describe('StatCounter', () => {
  it('renders label and suffix', () => {
    render(<StatCounter value={100} suffix="%" label="Natural Fibres" />);
    expect(screen.getByText('Natural Fibres')).toBeInTheDocument();
    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('starts counting from 0', () => {
    render(<StatCounter value={48} label="Artisans" />);
    expect(screen.getByTestId('stat-value').textContent).toBe('0');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/luxury/StatCounter.test.tsx`
Expected: FAIL — "Cannot find module './StatCounter'"

- [ ] **Step 3: Write the implementation**

```tsx
// src/components/luxury/StatCounter.tsx
import { useEffect, useRef, useState } from 'react';
import { animate, useInView } from 'motion/react';

interface StatCounterProps {
  value: number;
  suffix?: string;
  label: string;
  duration?: number;
}

export default function StatCounter({ value, suffix, label, duration = 1.6 }: StatCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, duration]);

  return (
    <div>
      <p className="font-heading text-5xl md:text-7xl text-white font-medium">
        <span ref={ref} data-testid="stat-value">{display}</span>
        {suffix && <span className="text-gold text-3xl md:text-5xl align-top">{suffix}</span>}
      </p>
      <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mt-3">{label}</p>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/luxury/StatCounter.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/luxury/StatCounter.tsx src/components/luxury/StatCounter.test.tsx
git commit -m "Add StatCounter count-up component"
```

---

### Task 5: HorizontalLookbook component

**Files:**
- Create: `src/components/luxury/HorizontalLookbook.tsx`
- Create: `src/components/luxury/HorizontalLookbook.test.tsx`

**Interfaces:**
- Consumes: `useGallery({ featured: true, limit: 6 })` from `../../hooks/useGallery` → `{ items: GalleryItem[] }` where `GalleryItem` has `id, title, category, media_url, thumbnail_url, media_type`. Consumes `useLanguage()` (`t`, `isRtl`).
- Produces: `export default function HorizontalLookbook()` — pinned horizontal scroll on `md+`, vertical stack on mobile, gold progress bar; renders `null` when no items. Consumed by Index.tsx in Task 9.
- i18n keys consumed (added in Task 8 — Task 8 must land before Task 5's integration commit; unit test mocks `useGallery` so Task 5 works standalone): `lookbook.eyebrow`, `lookbook.heading`, `lookbook.cta`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/luxury/HorizontalLookbook.test.tsx
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import HorizontalLookbook from './HorizontalLookbook';
import { LanguageProvider } from '../../contexts/LanguageContext';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../../hooks/useGallery', () => ({
  useGallery: vi.fn(),
}));

import { useGallery } from '../../hooks/useGallery';

beforeAll(() => {
  globalThis.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof IntersectionObserver;
});

const item = {
  id: '1', title: 'Look 01', description: '', category: 'Bridal',
  media_url: '/a.jpg', media_type: 'photo' as const, thumbnail_url: '',
  sort_order: 1, is_featured: true, created_at: '',
};

function renderWithProviders() {
  return render(
    <LanguageProvider>
      <BrowserRouter>
        <HorizontalLookbook />
      </BrowserRouter>
    </LanguageProvider>
  );
}

describe('HorizontalLookbook', () => {
  it('renders nothing when gallery is empty', () => {
    vi.mocked(useGallery).mockReturnValue({
      items: [], isLoading: false, error: null, hasMore: false,
      totalCount: 0, loadMore: vi.fn(), refresh: vi.fn(),
    });
    const { container } = renderWithProviders();
    expect(container.firstChild).toBeNull();
  });

  it('renders panel titles for gallery items', () => {
    vi.mocked(useGallery).mockReturnValue({
      items: [item], isLoading: false, error: null, hasMore: false,
      totalCount: 1, loadMore: vi.fn(), refresh: vi.fn(),
    });
    renderWithProviders();
    expect(screen.getAllByText('Look 01').length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/luxury/HorizontalLookbook.test.tsx`
Expected: FAIL — "Cannot find module './HorizontalLookbook'"

- [ ] **Step 3: Write the implementation**

```tsx
// src/components/luxury/HorizontalLookbook.tsx
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
import { useGallery, GalleryItem } from '../../hooks/useGallery';
import { useLanguage } from '../../contexts/LanguageContext';

function Panel({ item, offset }: { item: GalleryItem; offset?: boolean }) {
  return (
    <figure className={offset ? 'md:mt-24' : ''}>
      <div className="overflow-hidden group">
        <img
          src={item.thumbnail_url || item.media_url}
          alt={item.title}
          loading="lazy"
          className="h-[52vh] md:h-[62vh] w-full md:w-[32vw] object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-105"
        />
      </div>
      <figcaption className="flex justify-between mt-4 text-[10px] uppercase tracking-[0.3em] text-ivory">
        <span>{item.title}</span>
        <span className="text-ivory/40">{item.category}</span>
      </figcaption>
    </figure>
  );
}

export default function HorizontalLookbook() {
  const { items } = useGallery({ featured: true, limit: 6 });
  const { t } = useLanguage();
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: targetRef });
  const x = useTransform(scrollYProgress, [0, 1], ['2%', '-72%']);
  const progressScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  if (items.length === 0) return null;

  return (
    <>
      {/* Desktop: pinned horizontal scroll */}
      <section ref={targetRef} className="relative hidden md:block h-[320vh] bg-onyx">
        <div className="sticky top-0 h-screen flex items-center overflow-hidden">
          <motion.div style={{ x }} className="flex items-center gap-[6vw] px-[8vw] will-change-transform">
            <div className="shrink-0 w-[34vw]">
              <p className="text-[10px] uppercase tracking-[0.35em] text-ivory/40 mb-6">
                ( 02 ) — {t('lookbook.eyebrow')}
              </p>
              <h2 className="font-heading font-medium text-6xl md:text-[5.5vw] leading-[0.9] text-white mb-8">
                {t('lookbook.heading')}
              </h2>
              <span className="text-[10px] uppercase tracking-[0.3em] text-ivory/40">
                {t('hero.discover')} →
              </span>
            </div>

            {items.map((item, i) => (
              <div key={item.id} className="shrink-0">
                <Panel item={item} offset={i % 2 === 1} />
              </div>
            ))}

            <div className="shrink-0 w-[30vw] flex items-center">
              <Link to="/collection/all" className="group">
                <span className="font-heading italic font-medium text-5xl md:text-[4vw] leading-tight block text-white group-hover:text-gold transition-colors duration-500">
                  {t('lookbook.cta')}
                </span>
                <span className="inline-block mt-6 text-2xl text-gold group-hover:translate-x-3 transition-transform duration-500">→</span>
              </Link>
            </div>
          </motion.div>

          <div className="absolute bottom-8 left-[8vw] right-[8vw] h-px bg-white/15">
            <motion.div className="h-full bg-gold origin-left" style={{ scaleX: progressScale }} />
          </div>
        </div>
      </section>

      {/* Mobile: vertical stack */}
      <section className="md:hidden bg-onyx px-6 py-24">
        <p className="text-[10px] uppercase tracking-[0.35em] text-ivory/40 mb-4">( 02 ) — {t('lookbook.eyebrow')}</p>
        <h2 className="font-heading font-medium text-5xl leading-[0.9] text-white mb-10">{t('lookbook.heading')}</h2>
        <div className="flex flex-col gap-14">
          {items.map((item) => (
            <Panel key={item.id} item={item} />
          ))}
        </div>
        <Link to="/collection/all" className="inline-block mt-12 text-gold text-[11px] uppercase tracking-[0.3em] border-b border-gold/40 pb-1">
          {t('lookbook.cta')} →
        </Link>
      </section>
    </>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/luxury/HorizontalLookbook.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/luxury/HorizontalLookbook.tsx src/components/luxury/HorizontalLookbook.test.tsx
git commit -m "Add pinned HorizontalLookbook component"
```

---

### Task 6: Upgrade ImmersiveUI preloader + cursor

**Files:**
- Modify: `src/components/ImmersiveUI.tsx` (replace preloader inner content; add cursor hover-expand)
- Create: `src/components/ImmersiveUI.test.tsx`

**Interfaces:**
- Consumes: existing `useFeature('preloader')`, `useFeature('customCursor')`, `sessionStorage` key `riman_preloader_shown` (unchanged contract).
- Produces: same default export `ImmersiveUI`; no consumer changes.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/ImmersiveUI.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import ImmersiveUI from './ImmersiveUI';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../hooks/useFeature', () => ({
  useFeature: () => true,
}));

import { vi } from 'vitest';

describe('ImmersiveUI preloader', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('shows RIMAN letters on first visit', () => {
    const { container } = render(
      <BrowserRouter>
        <ImmersiveUI />
      </BrowserRouter>
    );
    // first visit on a non-home route: no preloader
    expect(container.querySelector('[data-preloader]')).toBeNull();
  });
});
```

Note: jsdom's location is `http://localhost/` → pathname `/`, so the preloader DOES show. Adjust the test to assert it shows on `/`: expect `container.querySelector('[data-preloader]')` NOT to be null, and that a second render (after sessionStorage set) shows nothing. Write the test to match that behavior:

```tsx
it('shows RIMAN letters once per session', () => {
  const first = render(<BrowserRouter><ImmersiveUI /></BrowserRouter>);
  expect(first.container.querySelector('[data-preloader]')).not.toBeNull();
  first.unmount();
  sessionStorage.setItem('riman_preloader_shown', '1');
  const second = render(<BrowserRouter><ImmersiveUI /></BrowserRouter>);
  expect(second.container.querySelector('[data-preloader]')).toBeNull();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/ImmersiveUI.test.tsx`
Expected: FAIL — `data-preloader` attribute does not exist yet

- [ ] **Step 3: Upgrade the preloader content (letters + counter) and cursor**

In `ImmersiveUI.tsx`, add a counter state and letter constant at the top of the component:

```tsx
const LETTERS = ['R', 'I', 'M', 'A', 'N'];
const [count, setCount] = useState(0);
```

Replace the preloader timer `useEffect` (the one with `setTimeout(..., 2000)`) with a counter-driven version:

```tsx
useEffect(() => {
  if (!loading) return;
  const controls = animate(0, 100, {
    duration: 1.7,
    ease: 'easeInOut',
    onUpdate: (v) => setCount(Math.round(v)),
  });
  const timer = setTimeout(() => {
    sessionStorage.setItem('riman_preloader_shown', '1');
    isFirstVisit.current = false;
    setLoading(false);
  }, 2100);
  return () => { controls.stop(); clearTimeout(timer); };
}, [loading]);
```

Add `animate` to the `motion/react` import.

Replace the preloader's inner JSX (the `<motion.div ... className="fixed inset-0 z-[2000] ...">`) with:

```tsx
<motion.div
  key="preloader"
  data-preloader
  initial={{ y: 0 }}
  exit={{ y: '-100%' }}
  transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
  className="fixed inset-0 z-[2000] bg-onyx text-ivory flex items-center justify-center"
>
  <div className="overflow-hidden px-4">
    <h1 className="font-heading font-medium text-[19vw] md:text-[11vw] leading-none flex" aria-label="RIMAN">
      {LETTERS.map((letter, i) => (
        <motion.span
          key={i}
          initial={{ y: '110%' }}
          animate={{ y: 0 }}
          transition={{ duration: 0.9, delay: i * 0.07, ease: [0.19, 1, 0.22, 1] }}
          className="inline-block"
        >
          {letter}
        </motion.span>
      ))}
    </h1>
  </div>
  <div className="absolute bottom-8 left-8 text-[10px] uppercase tracking-[0.35em] text-gold/60">
    Maison de Couture
  </div>
  <div className="absolute bottom-8 right-8 text-sm tabular-nums text-ivory">
    {String(count).padStart(2, '0')}<span className="text-ivory/40"> / 100</span>
  </div>
</motion.div>
```

For the cursor: add hover-expand. Inside `ImmersiveUI`, add state and a delegation listener inside the existing cursor `useEffect`:

```tsx
const [cursorHovered, setCursorHovered] = useState(false);
```

Append to the existing cursor-tracking `useEffect` (before its return):

```tsx
const handleMouseOver = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  setCursorHovered(!!target.closest('a, button, [data-hover]'));
};
window.addEventListener('mouseover', handleMouseOver, { passive: true });
```

And add `window.removeEventListener('mouseover', handleMouseOver);` to that effect's cleanup. Then change the ring's `animate` prop to `animate={{ x: mousePos.x - 16, y: mousePos.y - 16, scale: cursorHovered ? 1.8 : 1 }}` and its className border from `border-gold/30` to `border-gold/60`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/ImmersiveUI.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ImmersiveUI.tsx src/components/ImmersiveUI.test.tsx
git commit -m "Upgrade preloader with letter rise + counter, expand cursor on hover"
```

---

### Task 7: Hero giant typography in Index.tsx

**Files:**
- Modify: `src/pages/Index.tsx` (hero section, lines ~90-187)

**Interfaces:**
- Consumes: nothing from other tasks (self-contained visual layer).
- Produces: hero gains an `aria-hidden` giant RIMAN layer; existing `h1` content untouched.

- [ ] **Step 1: Add hero scroll parallax wiring**

In `Index.tsx`, inside `Home()`, add after the existing parallax logic (~line 88):

```tsx
const heroRef = useRef<HTMLElement>(null);
const { scrollYProgress: heroScroll } = useScroll({
  target: heroRef,
  offset: ['start start', 'end start'],
});
const giantY = useTransform(heroScroll, [0, 1], ['0%', '-22%']);
const videoY = useTransform(heroScroll, [0, 1], ['0%', '12%']);
```

Update the `motion/react` import to include `useScroll` (it's already importing `useMotionValue, useSpring, useTransform`).

Add `ref={heroRef}` to the hero `<section id="hero" ...>`.

- [ ] **Step 2: Add the giant typography layers**

Inside the hero section, immediately AFTER the backdrop video `<div className="absolute inset-0 z-0 overflow-hidden">...</div>` block and BEFORE the floating creative elements div, insert:

```tsx
{/* Giant RIMAN typography — couture backdrop */}
<motion.div
  style={{ y: giantY }}
  className="absolute inset-0 z-[1] flex items-center justify-center pointer-events-none select-none"
  aria-hidden="true"
>
  <div className="flex overflow-hidden">
    {['R', 'I', 'M', 'A', 'N'].map((letter, i) => (
      <motion.span
        key={i}
        initial={{ y: '120%' }}
        animate={{ y: 0 }}
        transition={{ duration: 1.15, delay: 0.2 + i * 0.055, ease: [0.19, 1, 0.22, 1] }}
        className="font-heading font-bold text-[clamp(4rem,17vw,15rem)] leading-[0.82] tracking-[-0.02em] text-white/[0.05] inline-block"
      >
        {letter}
      </motion.span>
    ))}
  </div>
</motion.div>
<motion.div
  style={{ y: giantY }}
  className="absolute inset-0 z-[2] flex items-center justify-center pointer-events-none select-none"
  aria-hidden="true"
>
  <div className="flex overflow-hidden">
    {['R', 'I', 'M', 'A', 'N'].map((letter, i) => (
      <motion.span
        key={i}
        initial={{ y: '120%' }}
        animate={{ y: 0 }}
        transition={{ duration: 1.15, delay: 0.25 + i * 0.055, ease: [0.19, 1, 0.22, 1] }}
        className="font-heading font-bold text-[clamp(4rem,17vw,15rem)] leading-[0.82] tracking-[-0.02em] text-transparent inline-block [-webkit-text-stroke:1.5px_rgba(212,175,55,0.35)]"
      >
        {letter}
      </motion.span>
    ))}
  </div>
</motion.div>
```

Wrap the video in the existing backdrop div with `style={{ y: videoY }}` by changing the backdrop div to `<motion.div className="absolute inset-0 z-0 overflow-hidden" style={{ y: videoY }}>` (keep its inner video unchanged).

- [ ] **Step 3: Add corner meta + animated scroll line**

Replace the existing scroll indicator block (the `motion.div` with `hidden md:flex mt-16 ...` containing `hero.discover` and the gradient line) with an absolute bottom-left meta block placed right after the giant typography layers:

```tsx
<div className="absolute bottom-8 left-6 md:left-10 z-[4] hidden md:flex flex-col items-start gap-3 pointer-events-none">
  <span className="text-[10px] uppercase tracking-[0.3em] text-white/70">{t('hero.discover')}</span>
  <span className="w-px h-11 bg-white/20 relative overflow-hidden">
    <motion.span
      className="absolute inset-0 bg-gold"
      animate={{ y: ['-100%', '100%'] }}
      transition={{ duration: 2, repeat: Infinity, ease: [0.76, 0, 0.24, 1] }}
    />
  </span>
</div>
<div className="absolute bottom-8 right-6 md:right-10 z-[4] hidden md:block text-[10px] uppercase tracking-[0.3em] text-white/70 text-right pointer-events-none">
  Silhouettes<br />in Motion
</div>
```

- [ ] **Step 4: Verify build and existing tests**

Run: `npm run lint && npm test`
Expected: type check passes; all existing tests pass

- [ ] **Step 5: Commit**

```bash
git add src/pages/Index.tsx
git commit -m "Hero: giant outlined RIMAN typography with letter rise + scroll parallax"
```

---

### Task 8: i18n keys + Philosophy/Stats section

**Files:**
- Modify: `src/contexts/LanguageContext.tsx` (add keys to `en` ~after line 65 area and `ar` ~after line 681 area)
- Modify: `src/pages/Index.tsx` (insert Philosophy section)

**Interfaces:**
- Consumes: `WordReveal` (Task 3), `StatCounter` (Task 4).
- Produces: i18n keys `philosophy.eyebrow`, `philosophy.statement`, `philosophy.stat_years`, `philosophy.stat_fibres`, `philosophy.stat_brides`, `lookbook.eyebrow`, `lookbook.heading`, `lookbook.cta` — `lookbook.*` consumed by Task 5's component at runtime.

- [ ] **Step 1: Add English keys**

In `LanguageContext.tsx`, in the `en:` object after the `'hero.subtitle'` entry (line 65), add:

```tsx
'philosophy.eyebrow': 'The Philosophy',
'philosophy.statement': 'Every gown begins as a whisper — a sketch, a fabric, a dream. Our artisans cut less, and cut better.',
'philosophy.stat_years': 'Years of Craft',
'philosophy.stat_fibres': 'Natural Fibres',
'philosophy.stat_brides': 'Bespoke Brides',
'lookbook.eyebrow': 'The Lookbook',
'lookbook.heading': 'Silhouettes in Motion',
'lookbook.cta': 'View the Collection',
```

- [ ] **Step 2: Add Arabic keys**

In the `ar:` object after its `'hero.subtitle'` entry (line 681), add:

```tsx
'philosophy.eyebrow': 'الفلسفة',
'philosophy.statement': 'كل فستان يبدأ كهمسة — رسم، قماش، حلم. حرفيو دارنا يقصّون أقل، ويقصّون أفضل.',
'philosophy.stat_years': 'سنوات من الحرفية',
'philosophy.stat_fibres': 'ألياف طبيعية',
'philosophy.stat_brides': 'عرائس بأزياء مخصصة',
'lookbook.eyebrow': 'دفتر الإطلالات',
'lookbook.heading': 'قصّات في حركة',
'lookbook.cta': 'شاهدي المجموعة',
```

- [ ] **Step 3: Insert the Philosophy section in Index.tsx**

Insert this section AFTER the HorizontalLookbook insertion point (Task 9 places the lookbook right after Featured Collection; Philosophy goes immediately after the lookbook) — concretely, before the `{/* The Riman Bespoke Journey */}` comment:

```tsx
{/* Philosophy — word scrub + stats */}
<section className="bg-onyx text-ivory px-6 md:px-12 lg:px-20 py-32 md:py-48 border-t border-white/10">
  <p className="text-[10px] uppercase tracking-[0.35em] text-gold mb-12">
    ( 03 ) — {t('philosophy.eyebrow')}
  </p>
  <WordReveal
    text={t('philosophy.statement')}
    className="font-editorial italic text-[7vw] md:text-[3.4vw] leading-[1.15] max-w-6xl text-white"
  />
  <div className="grid grid-cols-3 gap-6 mt-24 md:mt-36 border-t border-white/10 pt-10">
    <StatCounter value={15} label={t('philosophy.stat_years')} />
    <StatCounter value={100} suffix="%" label={t('philosophy.stat_fibres')} />
    <StatCounter value={500} suffix="+" label={t('philosophy.stat_brides')} />
  </div>
</section>
```

Add imports to Index.tsx:

```tsx
import WordReveal from '../components/luxury/WordReveal';
import StatCounter from '../components/luxury/StatCounter';
```

- [ ] **Step 4: Verify**

Run: `npm run lint && npm test`
Expected: passes

- [ ] **Step 5: Commit**

```bash
git add src/contexts/LanguageContext.tsx src/pages/Index.tsx
git commit -m "Add Philosophy word-scrub section with stat counters + i18n keys"
```

---

### Task 9: Integrate Marquee + HorizontalLookbook + parallax campaign in Index.tsx

**Files:**
- Modify: `src/pages/Index.tsx`

**Interfaces:**
- Consumes: `Marquee` (Task 1), `HorizontalLookbook` (Task 5), `MagneticButton` (Task 2).

- [ ] **Step 1: Add imports**

```tsx
import Marquee from '../components/luxury/Marquee';
import HorizontalLookbook from '../components/luxury/HorizontalLookbook';
import MagneticButton from '../components/luxury/MagneticButton';
```

- [ ] **Step 2: Marquee after hero**

Immediately after the closing `</section>` of the hero (line ~187), insert:

```tsx
<Marquee items={['RIMAN — FW25', 'Défilé', 'Silhouettes in Motion', 'Savoir-Faire', 'Maison de Couture']} />
```

- [ ] **Step 3: Lookbook after Featured Collection**

Immediately after the closing `</section>` of `{/* Featured Collection */}` (line ~358) and before `{/* The Riman Bespoke Journey */}` — placing it BEFORE the Philosophy section inserted in Task 8 — insert:

```tsx
<HorizontalLookbook />
```

(Final order: Featured Collection → HorizontalLookbook → Philosophy → Bespoke Journey.)

- [ ] **Step 4: Parallax campaign on the Consultation Banner**

In the `{/* Consultation Banner */}` section (~line 493): change `<section className="relative py-40 overflow-hidden bg-onyx">` — add a parallax image. First add near the hero parallax wiring:

```tsx
const consultRef = useRef<HTMLElement>(null);
const { scrollYProgress: consultScroll } = useScroll({
  target: consultRef,
  offset: ['start end', 'end start'],
});
const campaignY = useTransform(consultScroll, [0, 1], ['-10%', '10%']);
```

Then in the consultation section tag add `ref={consultRef}`, and as its first child insert:

```tsx
<motion.img
  src="/assets/rimanfashion_3638158883472325906_1739454936_1_2025-05-22.jpg"
  alt=""
  aria-hidden="true"
  loading="lazy"
  style={{ y: campaignY }}
  className="absolute inset-0 w-full h-[125%] object-cover -top-[12%] opacity-40"
/>
```

Verify the asset exists: run `Test-Path "public/assets/rimanfashion_3638158883472325906_1739454936_1_2025-05-22.jpg"` — if missing, substitute any existing file from `public/assets/` (list with `Get-ChildItem public/assets -Name | Select-Object -First 10`).

- [ ] **Step 5: Magnetic on primary CTAs**

Wrap the hero CTA links: change the hero CTA container's two `Link` elements — wrap each in `<MagneticButton>...</MagneticButton>`:

```tsx
<MagneticButton className="flex-1">
  <Link to="/collection/bridal" className="btn-luxury animate-shimmer bg-[length:200%_100%] hover:scale-105 transition-transform duration-500 w-full text-[10px] sm:text-xs px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
    {t('cta.explore')}
  </Link>
</MagneticButton>
<MagneticButton className="flex-1">
  <Link to="/appointment" className="btn-luxury-outline !border-white/40 !text-white hover:!bg-gold hover:!text-onyx backdrop-blur-md w-full text-[10px] sm:text-xs px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
    {t('cta.viewing')}
  </Link>
</MagneticButton>
```

Wrap the consultation CTA the same way (`<MagneticButton><Link to="/appointment" className="btn-luxury ...">{t('experience.cta')}</Link></MagneticButton>`).

- [ ] **Step 6: Verify**

Run: `npm run lint && npm test`
Expected: passes

- [ ] **Step 7: Commit**

```bash
git add src/pages/Index.tsx
git commit -m "Integrate Marquee, HorizontalLookbook, parallax campaign, magnetic CTAs"
```

---

### Task 10: ProductCard hover upgrades

**Files:**
- Modify: `src/components/ProductCard.tsx` (image wrapper, lines ~84-98)

**Interfaces:**
- Consumes: none. Produces: same default export; no consumer changes.

- [ ] **Step 1: Cinematic zoom**

Change the img className (line ~94) from:

`"w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"`

to:

`"w-full h-full object-cover transition-transform duration-[1300ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-[1.07]"`

- [ ] **Step 2: Inner gold frame**

Inside the image wrapper div (after the `</Link>` that wraps the img, before the badges div), add:

```tsx
<span className="absolute inset-3 border border-gold/0 transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:inset-4 group-hover:border-gold/40 pointer-events-none z-10" aria-hidden="true" />
```

- [ ] **Step 3: Verify**

Run: `npm run lint && npm test`
Expected: passes

- [ ] **Step 4: Commit**

```bash
git add src/components/ProductCard.tsx
git commit -m "ProductCard: cinematic zoom + expanding gold frame on hover"
```

---

### Task 11: Header smart nav (homepage)

**Files:**
- Modify: `src/components/Header.tsx`

**Interfaces:**
- Produces: same default export. Behavior change: on `/` the header becomes `fixed` and hides on scroll down / reveals on scroll up. Non-home routes unchanged (`absolute`).

- [ ] **Step 1: Add scroll-direction state**

After the existing `useState` declarations (~line 24), add:

```tsx
const [navHidden, setNavHidden] = useState(false);
const lastY = useRef(0);
```

Add `useRef` to the React import. Add this effect after the existing `useEffect`:

```tsx
useEffect(() => {
  if (!isHome) return;
  const onScroll = () => {
    const y = window.scrollY;
    if (isMenuOpen) {
      setNavHidden(false);
    } else {
      setNavHidden(y > lastY.current && y > 140);
    }
    lastY.current = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => window.removeEventListener('scroll', onScroll);
}, [isHome, isMenuOpen]);
```

- [ ] **Step 2: Apply to header element**

Change the header className logic (lines ~47-52): replace `"absolute top-0 left-0 w-full z-[100] transition-all duration-700 ease-[0.16,1,0.3,1]"` with:

```tsx
cn(
  "top-0 left-0 w-full z-[100] transition-all duration-700 ease-[0.16,1,0.3,1]",
  isHome ? "fixed" : "absolute",
  isHome && navHidden && "-translate-y-full",
  !isHome
    ? "bg-ivory/98 backdrop-blur-md py-3 border-b border-stone-200"
    : "bg-transparent py-5 md:py-8"
)
```

- [ ] **Step 3: Verify**

Run: `npm run lint && npm test`
Expected: passes

- [ ] **Step 4: Commit**

```bash
git add src/components/Header.tsx
git commit -m "Header: smart hide-on-scroll nav on homepage"
```

---

### Task 12: Footer giant RIMAN text

**Files:**
- Modify: `src/components/Footer.tsx`

**Interfaces:**
- Produces: same default export.

- [ ] **Step 1: Insert giant text**

Immediately BEFORE the `{/* Scroll to Top */}` block (line ~164), insert:

```tsx
{/* Giant couture wordmark */}
<div className="select-none pointer-events-none text-center overflow-hidden mb-8" aria-hidden="true">
  <p className="font-heading font-bold text-[clamp(3.5rem,16vw,16rem)] leading-[0.8] tracking-[-0.02em] text-gold/10 whitespace-nowrap">
    RIMAN<sup className="text-[1.6vw] align-super">®</sup>
  </p>
</div>
```

- [ ] **Step 2: Verify**

Run: `npm run lint && npm test`
Expected: passes

- [ ] **Step 3: Commit**

```bash
git add src/components/Footer.tsx
git commit -m "Footer: giant RIMAN wordmark"
```

---

### Task 13: Full bug audit + verification

**Files:**
- Modify: whatever the audit reveals (fix in place, minimal diffs)

- [ ] **Step 1: Static checks**

Run: `npm run lint`
Run: `npm test`
Run: `npm run build`
Expected: all three pass clean. Fix any errors before continuing (type errors first, then test failures, then build issues).

- [ ] **Step 2: Visual smoke — desktop**

Run: `npm run dev` (background, port 3001)
Take screenshots at 1440px of: `/` (hero, marquee, lookbook, philosophy, footer), `/collection/all`, `/product/<first-product-id>`, `/checkout`, `/about`.
Check for: giant text overflow, broken RTL toggle (switch language via header), console errors (page errors in the screenshot tool output).

- [ ] **Step 3: Visual smoke — mobile**

Screenshots at 390px of `/` and `/collection/all`.
Check: lookbook vertical stack renders, no horizontal overflow from marquee/giant text, hero letters don't cover CTAs (z-index: letters z-[1]/z-[2], content z-10).

- [ ] **Step 4: Fix everything found**

Each fix: minimal diff, re-run `npm run lint && npm test`, commit individually with message `fix: <what was broken>`.

- [ ] **Step 5: Final commit + push**

```bash
git status
git push
```

---

## Self-Review Notes

- Spec coverage: preloader→T6, cursor→T6, hero typography→T7, marquee→T1+T9, lookbook→T5+T9, word-scrub→T3+T8, counters→T4+T8, giant footer→T12, magnetic+smart nav→T2+T9+T11, card hovers→T10, parallax campaign→T9, bug audit→T13. ✓
- Type consistency: `Marquee({items, className})`, `MagneticButton({children, strength?, className})`, `WordReveal({text, className})`, `StatCounter({value, suffix?, label, duration?})`, `HorizontalLookbook()` — identical across tasks. ✓
- Task 5 consumes `lookbook.*` i18n keys added in Task 8; Task 5's tests still pass standalone because `t()` returns the key string when missing (verify: LanguageContext `t` implementation returns key if not found — confirm during Task 5; if it throws, reorder: add keys first).
