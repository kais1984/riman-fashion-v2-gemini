# Rental Calendar Redesign — Accessibility & Light Polish

**Date:** 2026-08-24
**Status:** Approved design
**Scope:** `src/components/AvailabilityCalendar.tsx`, new `src/lib/calendar.ts`, translation keys in `src/contexts/LanguageContext.tsx`, e2e test additions.

## Problem

The rental date picker (`src/components/AvailabilityCalendar.tsx`) renders ~35–42 day cells as plain `<div onClick>` elements. Only the month-navigation arrows are keyboard-reachable; there is no keyboard path to pick a rental date and no quick way to jump to the next open day. Screen readers receive no cell semantics, dates, or availability status. On availability-fetch failure the component silently falls back to static prop data, risking bookings on genuinely taken dates.

## Goals

1. Full keyboard operability using the WAI-ARIA grid pattern.
2. A "Next available date" shortcut that jumps, selects, and announces.
3. Screen-reader semantics: per-cell labels with date + status, live announcements for month changes and selection.
4. Disclosed availability-fetch failure with retry, instead of silent fallback.
5. Light visual polish within DESIGN.md rules (flat, terracotta accent, sharp edges).

## Non-goals

- No selection-model change: single start-date pick; the 7-day rental window remains computed at checkout (`Checkout.tsx` untouched).
- No new dependencies.
- No layout overhaul (no two-month view, no hover previews).
- No changes to `ProductDetail.tsx` (component props stay identical), cart payload shape (`lib/cart.ts`), or the admin variant (`AdminCalendar.tsx`, `AdminProducts.tsx` block-row insertion).

## Approach chosen

**WAI-ARIA grid with roving tabindex** ("Approach A"). Rejected alternatives:

- *Tab-through buttons + native `<input type="date">`:* 35–42 Tab stops per month is poor keyboard UX; two controls can desync; native input chrome conflicts with the luxury aesthetic.
- *`react-day-picker` dependency:* restyling cost against DESIGN.md, unverified RTL behavior, contradicts the repo's zero-UI-library conventions.

Rationale: matches native date-picker keyboard expectations, self-contained, no deps, and the global `button:focus-visible` terracotta ring (index.css:52–55) applies automatically once cells become buttons.

## Architecture

Three pieces:

1. **`src/lib/calendar.ts` (new)** — pure functions, no React/DOM imports:
   - `buildMonthMatrix(month: Date): Date[][]` — weeks of dates starting Sunday (matches existing `startOfWeek` usage); includes out-of-month leading/trailing days.
   - `nextAvailableDate(bookedIso: string[], from?: Date, horizonDays = 180): string | null` — first non-past date not in the booked set, scanning up to `horizonDays`; returns ISO string or `null`.
   - `isUnavailable(date: Date, bookedSet: Set<string>): boolean` — true if before today or its ISO key is in the set.
2. **`src/components/AvailabilityCalendar.tsx`** — view + interaction. Props unchanged: `{ productId?, bookedDates?, onDateSelect?, selectedDate? }`. New internal state:
   - `focusedDate: Date` — roving-tabindex anchor; exactly one cell has `tabIndex={0}` at a time.
   - `announcement: string` — fed to a visually-hidden polite live region.
   - Derived `bookedSet: Set<string>` from the existing `fetchBookedDates(productId)` flow.
3. **`src/contexts/LanguageContext.tsx`** — new translation keys only (en + ar), listed under i18n below.

## Availability semantics

- A day is **unavailable** if it is before today or present in `bookedSet`. Today itself stays selectable (current behavior preserved).
- Booked rows come from `rental_bookings` where `status != 'cancelled'`; admin blocks dates by inserting `status:'blocked'` rows — both already covered by `fetchBookedDates`.
- If a refetch/retry reveals the currently `selectedDate` is now booked, clear the selection and announce it.

## Interaction spec

| Key | Behavior |
|---|---|
| `Tab` | Enters grid at `focusedDate` (the only tabbable cell); exits to next control |
| `←` / `→` | ∓1 day; direction inverts under RTL (`isRtl`) to match the visual grid |
| `↑` / `↓` | ∓7 days |
| `PageUp` / `PageDown` | Previous / next month, same day-of-month, clamped to valid range |
| `Home` / `End` | First / last day of the focused week |
| `Enter` / `Space` | Select if available; no-op otherwise |

Focus may rest on booked/past/out-of-month cells (navigation is always allowed; selection is not). Month changes via `PageUp/PageDown` or nav arrows move focus to the clamped same-day-of-month cell. Nav arrow buttons remain ordinary tab stops preceding the grid.

## ARIA semantics

- Grid container: `role="grid"` + `aria-labelledby` pointing at the visible month heading (`id="availability-month"`).
- Weekday header row: `role="row"` with `role="columnheader"` cells.
- Day cells: `role="gridcell"` wrapping a real `<button>`; button label = full localized date + status, e.g. *"4 September 2026, available"* / *"…, booked"* / *"…, past"*.
- Selected cell: `aria-selected="true"`; today: `aria-current="date"`; unavailable: `aria-disabled="true"`.
- Announcements (polite live region, visually hidden): month change, selection made/cleared, next-available result, availability-load failure.

## Visual polish (DESIGN.md compliant)

- **Selected-date summary line** beneath the grid: localized *"Selected: Friday 4 September"* + existing `product.rental_7day` copy for the 7-day tail.
- **States:** past days dim (~40% opacity, no dot); booked days keep the stone dot indicator + `cursor-not-allowed`; out-of-month cells muted; selected = terracotta fill (as today). No added shadows.
- **Loading:** skeleton pulse on cells instead of blank grid.
- **"Next available date"** renders as `.btn-luxury-outline` (secondary weight vs. "Add to Bag"), placed above the grid beside the month nav.

## Data flow & error handling

Fetch contract unchanged: `fetchBookedDates(productId): Promise<string[]>` → `Set<string>`. On fetch error: fall back to static `bookedDates` prop **with** an inline notice (*"Availability couldn't be loaded — showing approximate data"*) plus a **Retry** link that refetches. Selection remains enabled (page never bricks); the approximation risk is disclosed.

## i18n

New keys in LanguageContext, English + Arabic, following existing comma-split naming conventions:

- `calendar.nextAvailable` — "Next available date"
- `calendar.statusAvailable` / `calendar.statusBooked` / `calendar.statusPast`
- `calendar.selectedPrefix` — "Selected:"
- `calendar.noAvailability` — "No availability in the next 6 months."
- `calendar.fallbackNotice` — approximate-data notice
- `calendar.retry`

Localized month/weekday names continue via the comma-split strings already used by the component. RTL handled through `isRtl` (arrow inversion + chevron swap, which already exists).

## Testing & verification

- **e2e (Playwright)** — extend `e2e/interactive-pages.spec.ts`: open a rentable product; Tab into grid; arrows move focus; Enter selects an available day and the summary line appears; Enter on a booked day does nothing; "Next available" jumps months, selects, announces. Run in both `en` and `ar` locales.
- **Manual:** keyboard-only pass through the full rental selection; one screen-reader spot check of labels/announcements; confirm checkout still receives correct `rental_start_date`.
- **Static:** `npm run lint` and typecheck must pass.

## Success criteria

Keyboard-only users can complete a rental date selection end-to-end; screen reader announces each cell's date + status; "Next available" resolves in one activation; failed availability fetches are visibly disclosed with a working retry; zero console errors on the product page in both languages.
