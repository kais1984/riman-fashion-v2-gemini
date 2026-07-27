# Couture Motion — Design Spec

**Date:** 2026-07-27
**Status:** Approved (approach + section plan confirmed by user)
**Checkpoint:** Git tag `checkpoint-pre-couture-redesign` (restore point before this work)

## Goal

Apply the interaction design and motion language of the reference mockup (`website-b017f207...zip`, a "RIMAN — Maison de Couture" single-page design) to the existing RIMAN luxury e-commerce app, **without losing the current gold/onyx luxury identity or any existing homepage sections**.

## Confirmed Decisions

| Decision | Choice |
|---|---|
| Color identity | Keep current gold (#D4AF37) / onyx (#0A0A0A) / ivory palette. Reference accents (rust) map to gold |
| Animation stack | **Approach A** — pure `motion` (v12, already installed). No GSAP, no Lenis, no new dependencies |
| Hero | Keep cinematic video; layer giant outlined RIMAN typography over it |
| Lookbook content | Featured images from existing gallery system (`useGallery({ featured: true })`) |
| Feature scope | ALL reference features (preloader, cursor, marquee, lookbook, word-scrub, counters, giant footer, magnetic buttons, smart nav, card hovers, parallax campaign) |

## New Components (`src/components/luxury/`)

### `Preloader.tsx`
- Fixed overlay (onyx bg), RIMAN letters rise with stagger, 0→100 counter bottom-right, curtain slides up on complete
- Shows **once per session** (`sessionStorage`); total duration ≤ 2.5s
- Skipped entirely when `prefers-reduced-motion`
- Locks scroll while visible; unlocks on exit (`AnimatePresence`)

### `CustomCursor.tsx`
- Gold dot (6px) + trailing ring (34px, spring-lerped), ring expands on `a, button, [data-hover]`
- Optional label mode via `data-cursor="Label"` (ring fills onyx, shows text)
- Rendered in `Layout`; only active on `(hover: hover) and (pointer: fine)`; hidden on touch
- Does NOT set `cursor: none` globally — only over the homepage immersive zones (safer for admin/forms)

### `Marquee.tsx`
- Pure CSS infinite scroll strip, gold text on onyx: "RIMAN ◆ COUTURE ◆ SAVOIR-FAIRE ◆ ..."
- Pauses on hover; direction flips in RTL (`[dir="rtl"]`)
- Reusable: `<Marquee items={[...]} />`

### `MagneticButton.tsx`
- Wrapper: tracks mousemove, translates children ≤35% toward cursor via spring, elastic snap-back on leave
- Desktop-only (no-op on touch); applied to primary CTAs only (hero buttons, consultation CTA)

### `HorizontalLookbook.tsx`
- Desktop: outer section height = `100vh * panels`, inner sticky viewport, `useScroll` progress drives `x` transform of the track; gold progress bar (`scaleX`)
- Mobile (`< md`): plain vertical stack, no pin
- Content: `useGallery({ featured: true, limit: 6 })`; each panel = image + caption (title / category)
- Final panel: "View the Collection" link → `/collection/all`
- Falls back gracefully when gallery is empty (renders nothing)

### `WordReveal.tsx`
- Splits a **Latin-only** string into word spans; each word's opacity driven by section scroll progress (staggered scrub)
- Never applied to Arabic translations (letter splitting breaks Arabic joining); Arabic locale renders as a simple fade-in
- Used for the Philosophy statement

### `StatCounter.tsx`
- Counts 0 → N on `useInView` (once), `animate()` with `power2.out`, ~1.6s
- Props: `value`, `suffix?`, `label`

## Modified Files

### `src/pages/Index.tsx`
1. **Hero** — keep video; add two layers of giant `RIMAN` letters (fill layer behind video at low opacity, `-webkit-text-stroke` outline layer in front). Letters rise on load (stagger), drift up on scroll (`useScroll` parallax); video gently drifts down. Corner meta: "Maison de Couture" / "FW 2025" / animated scroll line / "Silhouettes in Motion"
2. **Marquee** inserted after hero
3. **HorizontalLookbook** inserted after Featured Collection
4. **Philosophy section** (NEW, onyx): `WordReveal` statement + 3 `StatCounter`s (Years of Craft / Natural Fibres % / Bespoke Clients) — inserted after lookbook, before Bespoke Journey
5. **Consultation Banner** — add parallax campaign image behind content (image `yPercent` scrub), dark overlay retained for legibility

### `src/components/ProductCard.tsx`
- Quick-add bar slides up on hover (`translateY(101%)` → `0`)
- Inner frame: 1px gold border, `inset` 12px → 16px on hover
- Image zoom eased to 1.07 over 1.3s (cinematic)

### `src/components/Header.tsx`
- Smart nav: hide (`translateY(-110%)`) on scroll down past 140px, reveal on scroll up; never hides while a menu/overlay is open

### `src/components/Footer.tsx`
- Giant `RIMAN®` text (fluid `clamp()` sizing, `leading .78`) above the bottom bar, gold at low opacity

## Safety Rails (all mandatory)

- `prefers-reduced-motion`: preloader skipped; cursor/magnetic/scrub/parallax disabled (content statically visible)
- Mobile: no custom cursor, no magnetic, lookbook unpins
- RTL: marquee flips direction; no letter/word splitting on Arabic; giant text stays Latin "RIMAN"
- No changes to cart, checkout, payments, Supabase services, or admin logic
- Zero new npm dependencies

## Phase 2 — Bug Audit & Hardening

1. `npm run lint` (tsc --noEmit) — fix all type errors
2. `npm test` (vitest) — fix all failing tests
3. `npm run build` — must pass clean
4. Launch dev server; screenshot homepage (desktop + mobile widths), collection, product, cart, checkout, auth, admin; fix visual/console errors found
5. Commit fixes separately from feature commits

## Testing

- Existing vitest suite must pass
- Add unit tests for `StatCounter` (count-up completes) and `Marquee` (renders items, RTL direction) — mirror existing test style
- Manual verification: desktop 1440/1280/1024 + mobile screenshots, RTL toggle, reduced-motion emulation

## Out of Scope

- Adopting the reference's bone/ink/rust palette
- Replacing the video hero with the pure typography hero
- New pages, backend changes, dependency additions
