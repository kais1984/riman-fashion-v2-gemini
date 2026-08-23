# Perfect-Polish Pass — Design Spec

**Date:** 2026-08-23
**Status:** Approved (approach A + 5-part design, "all above" scope)
**Predecessor:** booking-first conversion (commits b664b48..0e0ea58)

## Goal

Clear the remaining audit findings that cap the site below 9/10:
the P0 micro-typography/accessibility issues, brand-doc drift, and
content dead-ends — without losing the luxury uppercase aesthetic.

Out of scope: Journal page build (decision: remove links), checkout
review surface, state-color drift (no longer flagged after rebrand).

## Background Facts

- Tailwind **v4**: theme lives in `src/index.css` `@theme` block.
  Custom font-size utilities are declared as `--text-*` tokens.
- RTL overrides already exist: `[dir="rtl"] .text-\[8px\] { font-size: 11px }`
  etc. (index.css:100-104). Arabic mode is already legible; **the P0 is
  LTR/English rendering**. New tokens need matching RTL rules.
- Brand colors in code: `--color-gold: #A2492B` (terracotta), fonts
  Fraunces / Newsreader / Archivo / Cairo / Amiri. `DESIGN.md` still
  documents a stale gold `#D4AF37` + Plus Jakarta/Playfair/Inter identity.
- Journal: `BlogPage.tsx` served at `/blog`, linked from Header.tsx:17,
  Header.tsx:258, Footer.tsx:127, App.tsx:24+206, seo.ts:53. Its buttons
  navigate nowhere; its newsletter form has no backend. `journal.*`
  translation keys are orphaned (no component consumes them).
- Footer newsletter form (Footer.tsx ~85-98): validates email, shows
  "submitted", persists nothing. Second dead-end.
- Prior detector run: 408 findings — 363× off-ramp font sizes, 24× color,
  7× gray-on-color, 7× font, 4× radius, 2× bounce-easing, 1× overused-font.

## Design

### 1. Typography floor via semantic tokens

Add to `@theme` in `src/index.css`:

```css
--text-micro: 11px;     /* eyebrow / label / metadata floor */
--text-caption: 12px;   /* secondary caption text */
```

with RTL overrides following the existing +25-30% pattern:

```css
[dir="rtl"] .text-micro { font-size: 14px; }
[dir="rtl"] .text-caption { font-size: 15px; }
```

Migration rules (all of src/, ~100+ instances across ~25 files):

| Old | New |
|---|---|
| `text-[8px]` | `text-micro` |
| `text-[9px]` | `text-micro` |
| `text-[10px]` | `text-micro` |
| `text-[11px]` | `text-micro` |
| `text-[12px]` | `text-caption` |

No exceptions. Count badges (Header, MobileBottomNav, ProductCard) move
to `text-micro` too; their fixed `w-4 h-4` circles become
`min-w-4 h-4 px-0.5` (or `w-5 h-5` where a 2-digit count must fit) so
11px bold digits don't clip.

The old `[dir="rtl"] .text-\[8px\]`-style overrides for 8/9/10/11/12px
become dead code once no class uses them — delete them in the same pass.

### 2. Contrast lift (WCAG AA on light surfaces)

Current failures: `stone-400` (#a8a29e) on bone (#EFEAE2) ≈ 2.3:1,
`stone-500` (#78716c) ≈ 3.9:1 — both below the 4.5:1 AA floor for
11px text.

Rules, applied per element with judgment (not blind find-replace):

- **Informative text** on light backgrounds (form labels, metadata,
  prices, descriptions, breadcrumbs, error hints): `stone-400`/`stone-500`
  → `stone-600` (#57534e, ≈ 6.3:1 on bone).
- **Decorative-only text** on light backgrounds (purely ornamental
  eyebrows that duplicate a heading): `stone-400` → `stone-500` minimum.
- **Text on dark surfaces** (onyx / stone-900 / stone-800 backgrounds,
  e.g. Footer body, dark hero overlays): leave unchanged — stone-400 on
  stone-900 already passes (≈ 6.7:1).
- `text-stone-300` used as text on light surfaces → `stone-500`.
- Gold (#A2492B) on bone ≈ 5:1 — already passes; untouched.
- `placeholder:text-stone-500` → `placeholder:text-stone-600` on light
  inputs (placeholders must be readable).

### 3. Dead-end removal (Journal + fake newsletter)

Delete, in this order:

1. `src/pages/BlogPage.tsx` (entire file).
2. App.tsx: `BlogPage` import (line 24) and `<Route path="blog">` (line 206).
3. Header.tsx: nav entry line 17 (`{ label: "Journal", path: "/blog" }`)
   and dropdown entry line 258 (`{ label: 'Blog', path: '/blog' }`).
4. Footer.tsx: `<FooterLink to="/blog">` (line 127) **and** the
   newsletter form block (~lines 85-98) — replace the newsletter area
   with nothing (keep layout spacing intact); contact/WhatsApp links stay.
5. seo.ts: the `'/blog'` entry (lines 53-56).
6. LanguageContext.tsx: remove from **both** en and ar dicts —
   `nav.blog`, all `journal.*` keys (10 each), all `blog.*` keys,
   `section.journal`. Verify zero remaining consumers first
   (grep `t('blog.` / `t('journal.` / `t('nav.blog')` / `t('section.journal')`
   must return only BlogPage + Footer + Header before deletion).
7. Any Playwright spec asserting Journal/Blog/nav-blog elements —
   update or delete those assertions (check tests/*.spec.js).

### 4. Brand documentation alignment

Rewrite `DESIGN.md` to document the **actual** shipped identity:

- Palette: terracotta `#A2492B` (primary "gold" token), light `#C45A3C`,
  dark `#7A3520`, onyx `#161513`, bone/ivory `#EFEAE2`, champagne `#F6F0E6`,
  pearl `#E8E3D9` — copied from index.css `@theme`.
- Typography: Fraunces (headings), Newsreader (editorial/body),
  Archivo (labels/UI), Cairo + IBM Plex Sans Arabic (AR body),
  Amiri (AR headings); the RTL +25-30% size scaling rule; the 11px
  micro floor introduced by this spec.
- Components: btn-luxury / btn-luxury-outline / heading-display /
  heading-editorial definitions as implemented.
- Delete every stale reference to `#D4AF37`, Plus Jakarta, Playfair, Inter.

### 5. Verification & ship

1. `npm run lint && npm run build` — clean.
2. Re-run the impeccable detector (`npx impeccable` or the same command
   used on 2026-08-22) — expect off-ramp font-size findings to drop from
   363 to ~0 and gray-on-color from 7 to ~0. Record before/after counts.
3. Full Playwright suite green (73 tests baseline; adjust for removed
   Journal elements per §3.7).
4. Deploy via `C:\Users\KAIS\AppData\Local\Temp\opencode\netlify-rest-deploy.ps1`,
   verify live bundle hash.
5. Commit chain on `salon-rebrand`; push `origin salon-rebrand:main`
   together with the still-pending booking-first push.

## Pending External Dependency

The booking-first DB migration (`appointments.interested_gowns`) is still
unapplied in production; the user is pasting the SQL manually. The final
push (§5.5) must not happen until that column is verified to exist
(REST check: `GET /rest/v1/appointments?select=interested_gowns&limit=1`
must not return 42703).

## Risks

- **Visual identity shift:** 8-10px → 11px is subtle but site-wide;
  uppercase+tracking aesthetic is preserved. Mitigation: detector re-run
  + visual spot-check of home/PDP/checkout/appointment pages.
- **Wide mechanical migration** (~25 files): per-file commits and
  per-task reviewer gates (SDD) keep regressions localized.
- **Badge clipping** at 11px in 16px circles: container rule in §1
  handles it; Playwright visual pass confirms.
- **Orphaned-key false positives:** §3.6 requires a consumer grep before
  deleting any translation key.
