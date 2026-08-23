# Fix Report — Salon Rebrand Critical+Important Review Fixes

**Branch:** `salon-rebrand`
**Status:** DONE
**Commit:** `b6c1fdba1d350b6c858050f92d9932d13cb61c40`

## Fixes Applied (10/10)

| # | Severity | Fix | File(s) |
|---|----------|-----|---------|
| 1 | Critical | ScrollReveal `delay={100}`→`{0.1}`, `delay={200}`→`{0.2}` (seconds, not ms) | `src/pages/Index.tsx` |
| 2 | Critical | Quick-add bar opacity scoped to `md:` — visible on mobile, hover-reveal on desktop | `src/components/ProductCard.tsx` |
| 3 | Important | 3× `<InvitationRule>` added after Ch I (`bg-bone`) / Ch II (`bg-champagne`) / Ch III (`bg-champagne`) | `src/pages/Index.tsx` |
| 4 | Important | Hero video restored to `playbackRate = 0.7` via ref callback | `src/pages/Index.tsx` |
| 5 | Important | `film-grain` class restored on `<main>` | `src/pages/Index.tsx` |
| 6 | Important | i18n: `disciplines.discover` keys added (en/ar); "Discover" → `{t('disciplines.discover')}`; "Look"/"Enquire" → `t('silhouettes.look')`/`t('silhouettes.enquire')` | `Index.tsx`, `ProductCard.tsx`, `LanguageContext.tsx` |
| 7 | Important | `pl-11` added to name/email/phone inputs (icon clearance) | `src/pages/AppointmentPage.tsx` |
| 8 | Important | Stale `"Reem Kufi"` RTL font declarations → `var(--font-arabic-heading)` (4 decls; `.font-body` Cairo rule untouched) | `src/index.css` |
| 9 | Important | `useReducedMotion()` guard added — renders children without animation when OS prefers reduced motion | `src/components/ScrollReveal.tsx` |
| 10 | Important | Image zoom: `duration-[1300ms]`→`duration-[1600ms]`, `scale-[1.07]`→`scale-[1.05]` | `src/components/ProductCard.tsx` |

## Verification

- `npm run lint` (tsc --noEmit): ✅ PASS
- `npm run build` (vite): ✅ PASS (pre-existing chunk-size warnings only)
- `grep "Reem Kufi" src/`: ✅ zero matches remaining

## Files Changed (code)

- src/pages/Index.tsx
- src/components/ProductCard.tsx
- src/components/ScrollReveal.tsx
- src/contexts/LanguageContext.tsx
- src/pages/AppointmentPage.tsx
- src/index.css

Note: commit also includes pre-existing untracked `.superpowers/sdd/*` artifacts via the prescribed `git add -A`.
