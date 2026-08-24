# Rental Calendar Accessibility & Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the rental date picker fully keyboard-operable (WAI-ARIA grid), add a "Next available date" shortcut, give screen readers real semantics, and disclose availability-fetch failures — per spec `docs/superpowers/specs/2026-08-24-rental-calendar-a11y-design.md`.

**Architecture:** Pure date helpers move to `src/lib/calendar.ts`; `src/components/AvailabilityCalendar.tsx` is rewritten as an ARIA grid with roving tabindex over real `<button>`s, a polite live region for announcements, and a retry path on fetch failure. Translation keys are added to the inline dictionary in `LanguageContext.tsx` (en + ar). Props stay call-compatible with `ProductDetail.tsx`.

**Tech Stack:** React 19 + TypeScript, date-fns, Tailwind v4, Vitest + Testing Library (jsdom), Playwright (`testDir: ./tests`, baseURL `http://localhost:3001`).

## Global Constraints

- No new dependencies (spec Non-goals).
- DESIGN.md: flat surfaces, sharp edges (no border-radius), terracotta `--color-gold` accent only, global `button:focus-visible` ring comes free — never remove it.
- Every new UI string gets BOTH `en` and `ar` entries in `LanguageContext.tsx`.
- Selection model unchanged: single start date; 7-day window computed at checkout.
- Today remains bookable; only strictly-past days are unavailable.
- RTL: ArrowLeft/ArrowRight invert direction when `isRtl`.
- `onDateSelect` widens to `(date: Date | null) => void` (nullable only — required for the clear-selection-on-refetch rule). Existing caller `setBookingDate` is already compatible.
- No code comments in new/modified source (repo style).
- Commands: `npm run lint` (= `tsc --noEmit`), `npm test` (= `vitest run`), `npx playwright test <file>`.

---

### Task 1: Pure calendar helpers (`src/lib/calendar.ts`)

**Files:**
- Create: `src/lib/calendar.ts`
- Create: `src/lib/calendar.test.ts`

**Interfaces:**
- Consumes: `date-fns` only.
- Produces (used by Tasks 3–4):
  - `isoKey(date: Date): string` — `"yyyy-MM-dd"` local-date key
  - `buildMonthMatrix(month: Date): Date[][]` — weeks (Sunday-start), padded with out-of-month days
  - `isUnavailable(date: Date, bookedSet: Set<string>, today: Date): boolean` — strict past OR booked
  - `nextAvailableDate(bookedIso: string[], from?: Date, horizonDays?: number): string | null` — default `from = startOfToday()`, default `horizonDays = 180`
  - `clampToMonth(month: Date, daySource: Date): Date` — same day-of-month as `daySource`, clamped into `month`

- [ ] **Step 1: Write the failing test**

Create `src/lib/calendar.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { addDays, parseISO, setDate, startOfMonth } from 'date-fns';
import { buildMonthMatrix, clampToMonth, isUnavailable, isoKey, nextAvailableDate } from './calendar';

const TODAY = new Date(2026, 7, 24);

describe('isoKey', () => {
  it('formats local dates as yyyy-MM-dd', () => {
    expect(isoKey(new Date(2026, 8, 4))).toBe('2026-09-04');
  });
});

describe('buildMonthMatrix', () => {
  it('pads to whole weeks starting Sunday', () => {
    const weeks = buildMonthMatrix(new Date(2026, 8, 15));
    expect(weeks.length).toBeGreaterThanOrEqual(5);
    for (const week of weeks) {
      expect(week).toHaveLength(7);
      expect(week[0].getDay()).toBe(0);
    }
    const first = weeks[0][0];
    const last = weeks[weeks.length - 1][6];
    expect(first.getTime()).toBeLessThanOrEqual(startOfMonth(new Date(2026, 8, 15)).getTime());
    expect(last.getDay()).toBe(6);
  });
});

describe('isUnavailable', () => {
  it('flags strictly-past days, not today', () => {
    expect(isUnavailable(addDays(TODAY, -1), new Set(), TODAY)).toBe(true);
    expect(isUnavailable(TODAY, new Set(), TODAY)).toBe(false);
  });
  it('flags booked days', () => {
    expect(isUnavailable(new Date(2026, 8, 10), new Set(['2026-09-10']), TODAY)).toBe(true);
    expect(isUnavailable(new Date(2026, 8, 11), new Set(['2026-09-10']), TODAY)).toBe(false);
  });
});

describe('nextAvailableDate', () => {
  it('returns the first open day scanning forward', () => {
    const booked = ['2026-08-24', '2026-08-25'];
    expect(nextAvailableDate(booked, TODAY)).toBe('2026-08-26');
  });
  it('returns today when free', () => {
    expect(nextAvailableDate([], TODAY)).toBe('2026-08-24');
  });
  it('returns null when the horizon is exhausted', () => {
    const far = Array.from({ length: 31 }, (_, i) => isoKey(addDays(TODAY, i)));
    expect(nextAvailableDate(far, TODAY, 30)).toBeNull();
  });
});

describe('clampToMonth', () => {
  it('clamps day-of-month into shorter months', () => {
    const march31 = new Date(2026, 2, 31);
    expect(clampToMonth(new Date(2026, 1, 1), march31)).toEqual(setDate(startOfMonth(new Date(2026, 1, 1)), 28));
  });
  it('keeps the same day when it fits', () => {
    expect(clampToMonth(parseISO('2026-09-01'), new Date(2026, 7, 24))).toEqual(parseISO('2026-09-24'));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/calendar.test.ts`
Expected: FAIL — cannot resolve `./calendar` (module does not exist yet).

- [ ] **Step 3: Write the implementation**

Create `src/lib/calendar.ts`:

```ts
import { addDays, eachDayOfInterval, endOfMonth, startOfMonth, startOfWeek, endOfWeek, format, setDate, startOfToday } from 'date-fns';

export function isoKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function buildMonthMatrix(month: Date): Date[][] {
  const start = startOfWeek(startOfMonth(month));
  const end = endOfWeek(endOfMonth(month));
  const days = eachDayOfInterval({ start, end });
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

function midnight(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function isUnavailable(date: Date, bookedSet: Set<string>, today: Date): boolean {
  return midnight(date) < midnight(today) || bookedSet.has(isoKey(date));
}

export function nextAvailableDate(bookedIso: string[], from?: Date, horizonDays = 180): string | null {
  const booked = new Set(bookedIso);
  const start = from ?? startOfToday();
  for (let i = 0; i <= horizonDays; i++) {
    const key = isoKey(addDays(start, i));
    if (!booked.has(key)) return key;
  }
  return null;
}

export function clampToMonth(month: Date, daySource: Date): Date {
  const target = startOfMonth(month);
  const day = Math.min(daySource.getDate(), endOfMonth(target).getDate());
  return setDate(target, day);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/calendar.test.ts`
Expected: PASS (all suites green).

- [ ] **Step 5: Commit**

```bash
git add src/lib/calendar.ts src/lib/calendar.test.ts
git commit -m "feat(rental): pure calendar helpers (month matrix, next-available, clamping)"
```

---

### Task 2: Translation keys (en + ar)

**Files:**
- Modify: `src/contexts/LanguageContext.tsx` (en block after `'calendar.next': 'Next month',` ~line 350; ar block after `'calendar.next': 'الشهر التالي',` ~line 1088)

**Interfaces:**
- Produces (consumed by Tasks 3–4): `calendar.nextAvailable`, `calendar.statusAvailable`, `calendar.statusBooked`, `calendar.statusPast`, `calendar.selectedPrefix`, `calendar.noAvailability`, `calendar.fallbackNotice`, `calendar.retry`. Pre-existing keys reused: `calendar.prev`, `calendar.next`, `calendar.months`, `calendar.days`, `product.rental_7day`.

- [ ] **Step 1: Add English keys**

In the `// Calendar` block of the English translations, directly after `'calendar.next': 'Next month',` add:

```ts
    'calendar.nextAvailable': 'Next available date',
    'calendar.statusAvailable': 'available',
    'calendar.statusBooked': 'booked',
    'calendar.statusPast': 'past',
    'calendar.selectedPrefix': 'Selected:',
    'calendar.noAvailability': 'No availability in the next 6 months.',
    'calendar.fallbackNotice': "Availability couldn't be loaded — showing approximate data.",
    'calendar.retry': 'Retry',
```

- [ ] **Step 2: Add Arabic keys**

In the `// Calendar` block of the Arabic translations, directly after `'calendar.next': 'الشهر التالي',` add:

```ts
    'calendar.nextAvailable': 'أقرب تاريخ متاح',
    'calendar.statusAvailable': 'متاح',
    'calendar.statusBooked': 'محجوز',
    'calendar.statusPast': 'ماضٍ',
    'calendar.selectedPrefix': 'المحدد:',
    'calendar.noAvailability': 'لا توجد مواعيد متاحة خلال الأشهر الستة القادمة.',
    'calendar.fallbackNotice': 'تعذّر تحميل التوفر — تُعرض بيانات تقريبية.',
    'calendar.retry': 'إعادة المحاولة',
```

- [ ] **Step 3: Verify types compile**

Run: `npm run lint`
Expected: exit 0, no output.

- [ ] **Step 4: Commit**

```bash
git add src/contexts/LanguageContext.tsx
git commit -m "i18n(calendar): keyboard a11y + next-available strings (en/ar)"
```

---

### Task 3: Rewrite `AvailabilityCalendar` as an accessible ARIA grid

**Files:**
- Modify: `src/components/AvailabilityCalendar.tsx` (full rewrite, 138 → ~250 lines)
- Modify: `src/pages/ProductDetail.tsx:420-422` (drop its duplicate selected-date echo; keep hint only pre-selection)
- Test: `src/components/AvailabilityCalendar.test.tsx`

**Interfaces:**
- Consumes: `fetchBookedDates(productId: string): Promise<string[]>` from `src/services/rentals.ts` (unchanged); helpers from Task 1; keys from Task 2; `useLanguage()` → `{ t, isRtl, language }`.
- Produces: exported default component, same props except `onDateSelect?: (date: Date | null) => void`. Grid exposes `role="grid"` with `data-testid="availability-grid"`; day buttons carry `data-date="yyyy-MM-dd"`; summary line carries `data-testid="rental-summary"`; live region carries `role="status"`.

- [ ] **Step 1: Write failing component tests**

Create `src/components/AvailabilityCalendar.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LanguageProvider } from '../contexts/LanguageContext';
import AvailabilityCalendar from './AvailabilityCalendar';
import { fetchBookedDates } from '../services/rentals';
import { addDays, format } from 'date-fns';

vi.mock('../services/rentals', () => ({
  fetchBookedDates: vi.fn(),
}));

const mockedFetch = vi.mocked(fetchBookedDates);
const TODAY = new Date();

function renderCalendar(props: Partial<Parameters<typeof AvailabilityCalendar>[0]> = {}) {
  const onDateSelect = vi.fn();
  render(
    <LanguageProvider>
      <AvailabilityCalendar onDateSelect={onDateSelect} {...props} />
    </LanguageProvider>
  );
  return onDateSelect;
}

function dayButton(offsetDays: number) {
  const d = addDays(TODAY, offsetDays);
  return document.querySelector(`[data-date="${format(d, 'yyyy-MM-dd')}"]`) as HTMLButtonElement;
}

beforeEach(() => {
  localStorage.setItem('riman_lang', 'en');
  mockedFetch.mockResolvedValue([format(addDays(TODAY, 5), 'yyyy-MM-dd')]);
});

describe('AvailabilityCalendar', () => {
  it('renders an ARIA grid with labelled day buttons', async () => {
    renderCalendar();
    expect(screen.getByRole('grid')).toBeDefined();
    await waitFor(() => {
      expect(document.querySelector(`[data-date="${format(addDays(TODAY, 30), 'yyyy-MM-dd')}"]`)).toBeTruthy();
    });
    const future = screen.getByRole('button', { name: new RegExp(`${format(addDays(TODAY, 30), 'd')}`) });
    expect(future.getAttribute('aria-label')).toContain(', available');
  });

  it('marks booked days unavailable and ignores clicks on them', async () => {
    const onDateSelect = renderCalendar();
    const booked = await waitFor(() => dayButton(5));
    expect(booked.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(booked);
    expect(onDateSelect).not.toHaveBeenCalled();
  });

  it('selects an available day on click and shows the summary line', async () => {
    const onDateSelect = renderCalendar({ selectedDate: null });
    const target = await waitFor(() => dayButton(30));
    fireEvent.click(target);
    expect(onDateSelect).toHaveBeenCalledWith(expect.any(Date));
  });

  it('moves focus with arrow keys and selects with Enter', async () => {
    const onDateSelect = renderCalendar();
    const grid = screen.getByTestId('availability-grid');
    const todayCell = document.querySelector(`[data-date="${format(TODAY, 'yyyy-MM-dd')}"]`) as HTMLButtonElement;
    todayCell.focus();
    fireEvent.keyDown(grid, { key: 'ArrowRight' });
    expect(document.activeElement?.getAttribute('data-date')).toBe(format(addDays(TODAY, 1), 'yyyy-MM-dd'));
    fireEvent.keyDown(grid, { key: 'Enter' });
    expect(onDateSelect).toHaveBeenCalled();
  });

  it('pages months with PageUp/PageDown keeping the focused day', async () => {
    renderCalendar();
    const grid = screen.getByTestId('availability-grid');
    const todayCell = document.querySelector(`[data-date="${format(TODAY, 'yyyy-MM-dd')}"]`) as HTMLButtonElement;
    todayCell.focus();
    fireEvent.keyDown(grid, { key: 'PageDown' });
    expect(screen.getByRole('heading', { level: 3 })).toBeDefined();
    const nextMonthSameDay = format(new Date(TODAY.getFullYear(), TODAY.getMonth() + 1, Math.min(TODAY.getDate(), 28)), 'yyyy-MM-dd');
    expect(document.activeElement?.getAttribute('data-date')).toBe(nextMonthSameDay);
  });

  it('jumps to the next open day via the shortcut button', async () => {
    const onDateSelect = renderCalendar({ selectedDate: null });
    await waitFor(() => expect(mockedFetch).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: /next available date/i }));
    expect(onDateSelect).toHaveBeenCalledWith(addDays(new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate()), 1));
    expect(screen.getByRole('status').textContent?.length ?? 0).toBeGreaterThan(0);
  });

  it('shows the fallback notice on fetch failure and retries', async () => {
    mockedFetch.mockRejectedValueOnce(new Error('offline'));
    renderCalendar();
    const retry = await screen.findByRole('button', { name: /retry/i });
    fireEvent.click(retry);
    await waitFor(() => expect(screen.queryByRole('button', { name: /retry/i })).toBeNull());
  });

  it('flips horizontal arrow direction under RTL', async () => {
    localStorage.setItem('riman_lang', 'ar');
    renderCalendar();
    const grid = screen.getByTestId('availability-grid');
    const todayCell = document.querySelector(`[data-date="${format(TODAY, 'yyyy-MM-dd')}"]`) as HTMLButtonElement;
    todayCell.focus();
    fireEvent.keyDown(grid, { key: 'ArrowRight' });
    expect(document.activeElement?.getAttribute('data-date')).toBe(format(addDays(TODAY, -1), 'yyyy-MM-dd'));
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/components/AvailabilityCalendar.test.tsx`
Expected: FAIL — old component has no `data-testid="availability-grid"` / `data-date` attributes (and no shortcut button).

- [ ] **Step 3: Implement the rewritten component**

Replace the entire contents of `src/components/AvailabilityCalendar.tsx` with:

```tsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { addDays, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, isBefore, startOfToday, format, setDate } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchBookedDates } from '../services/rentals';
import { useLanguage } from '../contexts/LanguageContext';
import { buildMonthMatrix, clampToMonth, isUnavailable, isoKey, nextAvailableDate } from '../lib/calendar';

interface AvailabilityCalendarProps {
  productId?: string;
  bookedDates?: Date[];
  onDateSelect?: (date: Date | null) => void;
  selectedDate?: Date | null;
}

export default function AvailabilityCalendar({ productId, bookedDates: initialBookedDates = [], onDateSelect, selectedDate }: AvailabilityCalendarProps) {
  const today = startOfToday();
  const { t, isRtl } = useLanguage();
  const months = t('calendar.months').split(',');
  const dayNames = t('calendar.days').split(',');
  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  const [currentMonth, setCurrentMonth] = useState<Date>(() => today);
  const [bookedIso, setBookedIso] = useState<string[]>(() => initialBookedDates.map(isoKey));
  const [loading, setLoading] = useState(false);
  const [stale, setStale] = useState(false);
  const [focusedDate, setFocusedDate] = useState<Date>(() => today);
  const [announcement, setAnnouncement] = useState('');
  const gridRef = useRef<HTMLDivElement>(null);
  const interactedRef = useRef(false);
  const selectedRef = useRef(selectedDate);
  selectedRef.current = selectedDate;

  const load = useCallback(() => {
    if (!productId) return;
    setLoading(true);
    setStale(false);
    fetchBookedDates(productId)
      .then(dates => {
        setBookedIso(dates);
        if (selectedRef.current && dates.includes(isoKey(selectedRef.current))) {
          onDateSelect?.(null);
          setAnnouncement(t('calendar.statusBooked'));
        }
      })
      .catch(() => setStale(true))
      .finally(() => setLoading(false));
  }, [productId, onDateSelect, t]);

  useEffect(() => { load(); }, [load]);

  const bookedSet = useMemo(() => new Set(bookedIso), [bookedIso]);
  const canSelect = useCallback(
    (d: Date) => isSameMonth(d, currentMonth) && !isUnavailable(d, bookedSet, today),
    [currentMonth, bookedSet, today]
  );

  useEffect(() => {
    if (!interactedRef.current) return;
    const el = gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${isoKey(focusedDate)}"]`);
    el?.focus();
  }, [focusedDate, currentMonth]);

  const describe = useCallback(
    (d: Date) => `${dayNames[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`,
    [dayNames, months]
  );

  const goToMonth = (delta: number) => {
    const next = delta < 0 ? subMonths(currentMonth, 1) : addMonths(currentMonth, 1);
    setCurrentMonth(next);
    setFocusedDate(clampToMonth(next, focusedDate));
    setAnnouncement(`${months[next.getMonth()]} ${next.getFullYear()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const dir = isRtl ? -1 : 1;
    let next: Date | undefined;
    let nextMonth: Date | undefined;
    switch (e.key) {
      case 'ArrowUp': next = addDays(focusedDate, -7); break;
      case 'ArrowDown': next = addDays(focusedDate, 7); break;
      case 'ArrowLeft': next = addDays(focusedDate, -dir); break;
      case 'ArrowRight': next = addDays(focusedDate, dir); break;
      case 'Home': next = startOfWeek(focusedDate); break;
      case 'End': next = endOfWeek(focusedDate); break;
      case 'PageUp': nextMonth = subMonths(currentMonth, 1); break;
      case 'PageDown': nextMonth = addMonths(currentMonth, 1); break;
      case ' ':
      case 'Enter':
        e.preventDefault();
        interactedRef.current = true;
        if (!canSelect(focusedDate)) {
          setAnnouncement(describe(focusedDate));
          return;
        }
        onDateSelect?.(focusedDate);
        setAnnouncement(`${t('calendar.selectedPrefix')} ${describe(focusedDate)}`);
        return;
      default: return;
    }
    e.preventDefault();
    interactedRef.current = true;
    if (nextMonth) {
      setCurrentMonth(nextMonth);
      setFocusedDate(clampToMonth(nextMonth, focusedDate));
      setAnnouncement(`${months[nextMonth.getMonth()]} ${nextMonth.getFullYear()}`);
    } else if (next) {
      if (!isSameMonth(next, currentMonth)) setCurrentMonth(startOfMonth(next));
      setFocusedDate(next);
    }
  };

  const jumpToNextAvailable = () => {
    interactedRef.current = true;
    const found = nextAvailableDate([...bookedSet], today);
    if (!found) {
      setAnnouncement(t('calendar.noAvailability'));
      return;
    }
    const [y, m, d] = found.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    setCurrentMonth(startOfMonth(date));
    setFocusedDate(date);
    onDateSelect?.(date);
    setAnnouncement(`${t('calendar.nextAvailable')}: ${describe(date)}`);
  };

  const weeks = useMemo(() => buildMonthMatrix(currentMonth), [currentMonth]);
  const headingId = 'availability-month';

  return (
    <div className="bg-ivory p-4">
      <div className="flex items-center justify-between px-2 mb-4">
        <h3 id={headingId} className="font-heading text-lg text-stone-800 uppercase tracking-widest">
          {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => goToMonth(-1)}
            className="p-1 hover:text-gold transition-colors"
            aria-label={t('calendar.prev')}
          >
            <PrevIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => goToMonth(1)}
            className="p-1 hover:text-gold transition-colors"
            aria-label={t('calendar.next')}
          >
            <NextIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={jumpToNextAvailable}
        className="btn-luxury-outline w-full mb-4 py-2 text-micro uppercase tracking-widest"
      >
        {t('calendar.nextAvailable')}
      </button>

      {stale && (
        <p className="mb-3 text-center text-micro text-stone-600 italic">
          {t('calendar.fallbackNotice')}{' '}
          <button type="button" onClick={load} className="underline text-gold uppercase tracking-widest">
            {t('calendar.retry')}
          </button>
        </p>
      )}

      <div className="grid grid-cols-7 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-micro font-bold text-stone-600 uppercase tracking-widest text-center py-2">
            {day}
          </div>
        ))}
      </div>

      <div
        ref={gridRef}
        role="grid"
        data-testid="availability-grid"
        aria-labelledby={headingId}
        aria-busy={loading}
        onKeyDown={handleKeyDown}
        className="grid grid-cols-7 gap-px bg-stone-100 border border-stone-100"
      >
        {weeks.map((week, wi) => (
          <div role="row" key={`w${wi}`} className="contents">
            {week.map(date => {
              const inMonth = isSameMonth(date, currentMonth);
              const past = isBefore(date, today);
              const booked = bookedSet.has(isoKey(date));
              const selectable = inMonth && !past && !booked;
              const isSelected = !!selectedDate && isSameDay(date, selectedDate);
              const statusLabel = past
                ? t('calendar.statusPast')
                : booked
                  ? t('calendar.statusBooked')
                  : t('calendar.statusAvailable');
              return (
                <div
                  role="gridcell"
                  key={isoKey(date)}
                  aria-selected={isSelected}
                  className="relative aspect-square"
                >
                  <button
                    type="button"
                    data-date={isoKey(date)}
                    tabIndex={isSameDay(date, focusedDate) ? 0 : -1}
                    aria-disabled={!selectable}
                    aria-current={isSameDay(date, today) ? 'date' : undefined}
                    aria-label={`${describe(date)}, ${statusLabel}`}
                    onFocus={() => setFocusedDate(date)}
                    onClick={() => selectable && onDateSelect?.(date)}
                    className={cn(
                      'w-full h-full flex items-center justify-center text-micro transition-all bg-ivory',
                      loading && 'animate-pulse opacity-60',
                      !inMonth && 'text-stone-200',
                      (past || booked) && inMonth && 'bg-stone-50 text-stone-500 cursor-not-allowed',
                      selectable && 'hover:bg-gold/10 cursor-pointer text-stone-700',
                      isSelected && 'bg-gold text-white hover:bg-gold'
                    )}
                  >
                    <span>{format(date, 'd')}</span>
                  </button>
                  {booked && inMonth && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-stone-400 rounded-full pointer-events-none" />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {selectedDate ? (
        <p data-testid="rental-summary" className="mt-4 text-center text-micro text-stone-700 uppercase tracking-widest">
          {t('calendar.selectedPrefix')} {describe(selectedDate)} · {t('product.rental_7day')}
        </p>
      ) : (
        <div className="mt-6 flex flex-wrap gap-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gold rounded-full" />
            <span className="text-micro uppercase tracking-widest text-stone-600">{t('calendar.available')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-stone-100 rounded-full" />
            <span className="text-micro uppercase tracking-widest text-stone-600">{t('calendar.booked')}</span>
          </div>
        </div>
      )}

      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </div>
  );
}
```

Then in `src/pages/ProductDetail.tsx`, replace lines 420-422:

```tsx
                    <p className="text-micro text-stone-600 leading-relaxed italic text-center mt-3">
                      {bookingDate ? `${t('product.selected_date')}: ${bookingDate.toLocaleDateString(language === 'ar' ? 'ar-AE' : 'en-AE')}` : t('product.select_date_hint')}
                    </p>
```

with:

```tsx
                    {!bookingDate && (
                      <p className="text-micro text-stone-600 leading-relaxed italic text-center mt-3">
                        {t('product.select_date_hint')}
                      </p>
                    )}
```

If `language` becomes unused in that scope after this edit, leave it — it is used elsewhere in the file (verify with `npm run lint`).

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/components/AvailabilityCalendar.test.tsx`
Expected: PASS (all 8 tests). If the RTL test fails because `LanguageProvider` caches language module-state, reset via `localStorage.setItem('riman_lang','ar')` in the test *before* importing/rendering (already ordered that way) and re-run.

- [ ] **Step 5: Run the full vitest suite for regressions**

Run: `npm test`
Expected: PASS — no previously-green suite turns red (especially anything rendering `ProductDetail` or `AvailabilityCalendar`).

- [ ] **Step 6: Commit**

```bash
git add src/components/AvailabilityCalendar.tsx src/components/AvailabilityCalendar.test.tsx src/pages/ProductDetail.tsx
git commit -m "a11y(rental): ARIA grid calendar with roving tabindex, next-available shortcut, disclosed fetch failures"
```

---

### Task 4: Playwright e2e coverage

**Files:**
- Create: `tests/rental-calendar.spec.ts`

**Interfaces:**
- Consumes: running app via Playwright webServer (`npm run dev`, port 3001); rentable product `/product/17` (`productType: 'both'` in `src/data/products.ts:5-8`); selectors produced by Task 3 (`[role="grid"]`, `[data-date]`, `[data-testid="rental-summary"]`, shortcut button name).
- Produces: automated proof of the spec's Success criteria for keyboard + shortcut + Arabic locale.

- [ ] **Step 1: Write the spec**

Create `tests/rental-calendar.spec.ts`:

```ts
import { test, expect, type Page } from '@playwright/test';
import { addDays, format } from 'date-fns';

const PRODUCT_URL = '/product/17';

async function openRental(page: Page, lang: 'en' | 'ar') {
  await page.addInitScript(l => localStorage.setItem('riman_lang', l), lang);
  await page.goto(PRODUCT_URL);
  const grid = page.getByRole('grid');
  await expect(grid).toBeVisible();
  return grid;
}

test.describe('Rental calendar accessibility', () => {
  test('keyboard-only selection: arrows move focus, Enter selects', async ({ page }) => {
    const grid = await openRental(page, 'en');
    const seed = format(addDays(new Date(), 20), 'yyyy-MM-dd');
    await grid.locator(`[data-date="${seed}"]`).focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator(`[data-date="${format(addDays(new Date(), 21), 'yyyy-MM-dd')}"]`)).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('rental-summary')).toBeVisible();
  });

  test('unavailable days are announced and not selectable', async ({ page }) => {
    const grid = await openRental(page, 'en');
    const yesterday = grid.locator(`[data-date="${format(addDays(new Date(), -1), 'yyyy-MM-dd')}"]`);
    await expect(yesterday).toHaveAttribute('aria-disabled', 'true');
    await yesterday.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('rental-summary')).toHaveCount(0);
  });

  test('"Next available date" jumps, selects, and announces', async ({ page }) => {
    await openRental(page, 'en');
    await page.getByRole('button', { name: /next available date/i }).click();
    const summary = page.getByTestId('rental-summary');
    await expect(summary).toBeVisible();
    const status = page.locator('[role="status"]');
    await expect(status).not.toHaveText('');
    const selectedCell = page.locator('[role="gridcell"][aria-selected="true"] button');
    await expect(selectedCell).toBeFocused();
  });

  test('Arabic locale: labels localize and horizontal arrows invert', async ({ page }) => {
    const grid = await openRental(page, 'ar');
    const seed = format(addDays(new Date(), 20), 'yyyy-MM-dd');
    await grid.locator(`[data-date="${seed}"]`).focus();
    const before = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
    await page.keyboard.press('ArrowRight');
    const after = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
    expect(before).not.toEqual(after);
    await expect(page.getByRole('button', { name: /أقرب تاريخ متاح/ })).toBeVisible();
  });
});
```

- [ ] **Step 2: Run the spec**

Run: `npx playwright test tests/rental-calendar.spec.ts`
Expected: 4 passed (config auto-starts the dev server on port 3001; retries=1 absorbs first-run flakes). If port 3001 is busy from another session, stop that server first.

- [ ] **Step 3: Run the full Playwright suite for regressions**

Run: `npx playwright test`
Expected: all existing specs in `tests/` plus the new one pass.

- [ ] **Step 4: Commit**

```bash
git add tests/rental-calendar.spec.ts
git commit -m "test(e2e): rental calendar keyboard, next-available, and RTL coverage"
```

---

### Task 5: Final verification sweep

**Files:** none created; fixes (if any) land in the files touched by Tasks 1–4.

**Interfaces:**
- Consumes: everything shipped in Tasks 1–4.
- Produces: evidence the spec's Success criteria hold.

- [ ] **Step 1: Static checks**

Run: `npm run lint`
Expected: exit 0.

- [ ] **Step 2: Unit/component suite**

Run: `npm test`
Expected: all green.

- [ ] **Step 3: Live manual pass (browser)**

With `npm run dev` running:
1. Open `http://localhost:3001/product/17`, tab from "Add to Bag"-adjacent controls into the calendar — exactly ONE day cell receives the terracotta focus ring.
2. Keyboard-only: arrows/Home/End/PageUp/PageDown navigate; Enter books; Escape-path not required (spec has no dialog).
3. Click "Next available date" — lands on the earliest white cell, summary line reads `Selected: … · 7-day rental`.
4. Switch language to Arabic (header toggle) — repeat step 1; confirm ←/→ feel correct against the mirrored grid and no layout breaks.
5. DevTools console: zero errors on both locales.
6. Screen-reader spot check (NVDA/VoiceOver): cell focus announces date + availability word; month paging announces month/year; shortcut announces the jumped date.

- [ ] **Step 4: Fix-and-commit loop (only if needed)**

Any failure above → fix in the owning task's files, re-run that task's tests, then:

```bash
git add -A src tests
git commit -m "fix(rental): address verification findings from final sweep"
```

Skip this step entirely when Steps 1–3 are clean.

---

## Plan Self-Review Notes

- **Spec coverage:** Goals 1–5 map to Tasks 3 (keyboard/SR/shortcut), 3 (retry disclosure), 2+3 (polish/i18n), 1 (helpers), 4+5 (verification). Non-goals respected (no cart/checkout/admin changes; `ProductDetail.tsx` touched only to de-duplicate the selected-date echo, permitted as light polish).
- **Type consistency:** `isoKey`/`buildMonthMatrix`/`isUnavailable`/`nextAvailableDate`/`clampToMonth` signatures identical between Task 1 definition and Task 3 usage; `onDateSelect` nullable widening stated once (Global Constraints) and used consistently.
- **Known fragility flagged in-plan:** RTL test ordering (localStorage set before render), Playwright port collision, Supabase-dependent booked-day counts avoided in e2e (uses past-day instead of booked-day assertions where availability data isn't seeded).
