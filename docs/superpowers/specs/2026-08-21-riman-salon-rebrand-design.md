# Riman Fashion — "The Salon" Rebrand Design

**Date:** 2026-08-21
**Status:** Approved by user (direction A, parts 1 & 2)
**Scope:** Design language overhaul + homepage restructure + key component restyling

---

## 1. Problem

The site reads as AI-generated despite a decent palette. Root causes identified in audit:

1. **Font trio** — Plus Jakarta Sans + Inter + Playfair Display is the default AI luxury-site combination.
2. **Template skeleton** — the homepage follows the standard AI landing-page formula: hero video → marquee → journal → heritage stats → category tiles → product carousel → philosophy stat counters → 3-step journey with icons → testimonial carousel → CTA banner.
3. **Centered-everything text** and stat counters ("15 Years / 100% / 500+ Brides") — template patterns, not atelier behavior.

## 2. Brand Direction (user-confirmed)

- **World:** Middle Eastern couture glamour (Elie Saab, Zuhair Murad) — opulent, warm, red-carpet.
- **Cultural voice:** French couture codes on the surface; Gulf/Emirati pride unmistakably present (calligraphy as art, warmth, light).
- **Site purpose:** Bespoke-first. The #1 conversion goal is booking private viewings/appointments. Commerce is demoted but functional.
- **Boldness:** Bold but elegant — distinctive typography and structure, still safe for bridal clients of all ages.

## 3. Goals

1. Replace the font system with distinctive, editorial typography (EN + AR).
2. Restructure the homepage into five "chapters" of a maison narrative.
3. Make "Request a Private Viewing" the single golden thread across the site.
4. Demote commerce visually without touching cart/Stripe functionality.
5. Eliminate template tells (marquee, stat counters, icon journey, carousel).

## 4. Non-Goals

- No changes to cart, checkout, Stripe, or any backend logic.
- No deep redesigns of Shop/ProductDetail/other pages in this phase — they inherit new tokens automatically via CSS variables; per-page redesigns are follow-ups.
- No new photography or video production (uses existing assets).
- No removal of any existing page or route.

## 5. Design Language

### 5.1 Typography

| Role | Font | Notes |
|---|---|---|
| Display / headlines (EN) | **Fraunces** (Google Fonts, variable; use high optical size, tight leading) | Replaces Plus Jakarta Sans for headings |
| Micro-labels & nav (EN) | **Archivo Light**, letter-spacing ≥ 0.25em, uppercase | Chapter labels, nav links, eyebrows |
| Body / editorial (EN) | **Newsreader** | Replaces Inter for body copy |
| Arabic display | **Amiri** | Replaces Reem Kufi for AR headings; true naskh calligraphy |
| Arabic body | IBM Plex Sans Arabic (unchanged) | Already excellent |

- Fonts load via the existing Google Fonts `@import` in `src/index.css` (CSP already whitelists fonts.googleapis.com). Remove Plus Jakarta Sans, Inter, Playfair Display, Reem Kufi imports after migration.
- Update CSS variables: `--font-heading`, `--font-editorial` (→ Newsreader italic), `--font-body`; add/replace Arabic heading var to Amiri.

### 5.2 Calligraphic Accents

Arabic words used as decorative art elements — large scale, low contrast (e.g., `أناقة` behind the hero headline), absolutely positioned, `aria-hidden`, never conveying required information. Used sparingly: Arrival and L'Invitation only.

### 5.3 Palette

Kept (already right for the brand):

| Token | Value | Use |
|---|---|---|
| `gold` | `#A2492B` | Hairlines, numerals, rules, small accents — ornament, not paint |
| `gold-light` / `gold-dark` | `#C45A3C` / `#7A3520` | Gradient hairlines only |
| `onyx` | `#161513` | Dark chapters, footer, primary buttons |
| `bone` | `#EFEAE2` | Light chapter ground |

Changes:

- **Add** `champagne: #F6F0E6` — warm ground for L'Invitation chapter and section transitions (glamour needs light).
- **Merge** duplicate tokens: `ivory` currently equals `bone` (`#EFEAE2`). Keep `bone` as canonical; redefine `--color-ivory: var(--color-bone)` so existing class usages keep working and future edits can't diverge.
- **Delete** dead token usage `text-sunset` in `src/components/Header.tsx` (lines ~99, ~148) — replace with defined gold hover color.
- Buttons: solid onyx with bone text (primary), hairline outline (secondary). Remove `.btn-luxury` shimmer animation.

### 5.4 Motion

- Fades and slow reveals only, 600–900ms ease-out. No bounce, no float, no shimmer.
- Film-grain overlay stays (3% opacity).
- All motion gated behind `prefers-reduced-motion: no-preference`.
- Product image hover zoom stays but slows to ~1600ms with subtle scale (≤1.05).

## 6. Homepage Structure — Five Chapters

Replaces all current sections in `src/pages/Index.tsx`. Each chapter ends with a quiet invitation rule (hairline + one line + link) except Arrival, which carries the primary CTA.

### Arrival
- Full-screen existing video (`rimanfashion_3panel_split.mp4`, 0.7× playback, darkened).
- Eyebrow (Archivo): "SHARJAH'S PREMIER COUTURE ATELIER" (existing i18n key).
- H1 in Fraunces, very large (clamp up to ~9rem desktop): existing "Reverie & Essence" headline; ampersand in gold italic.
- Calligraphic accent behind H1 (see 5.2).
- One primary CTA: "Request a Private Viewing" (onyx button). Secondary quiet text link: "Discover the Maison" → scrolls to Chapter I.
- Corner microcopy kept minimal ("Discover" scroll cue only).

### Chapter I — L'Atelier
- Craft narrative. Asymmetric two-column composition (image offset from text, overlapping frames allowed).
- Surviving copy: existing journal content ("Mastering The Legacy Icon", Mikado silk vs French Tulle quote) moves here.
- Label format: "CHAPTER I — L'ATELIER" (Archivo tracked caps).

### Chapter II — Les Silhouettes
- Gowns presented as numbered editorial plates, alternating asymmetric layout (not a grid, not a carousel).
- Plate format: large image (aspect 3:4), caption block: "Look 01 — Ivory Mikado" (Fraunces) + fabric line (Newsreader italic) + "Enquire" text link.
- Data source: existing featured products (max 4–6 plates).

### Chapter III — Le Savoir-Faire
- Fabric/material close-up imagery + short craft paragraphs.
- The disciplines — Bridal / Evening / Rentals — as three editorial tiles (existing imagery), sharp corners, hover reveals one-line description + "Discover" link to respective pages.

### L'Invitation
- Champagne ground. Centered but restrained.
- Single pull-quote testimonial (static, hand-picked — carousel deleted).
- Closing calligraphic accent + primary CTA "Request a Private Viewing".
- Contact essentials (address, hours, phone) as small Archivo lines.

### Cut entirely
Marquee strip · stat counters ("15 Years / 100% / 500+") · 3-step journey with icons · HorizontalLookbook pinned-scroll section · Visual Reverie teaser · testimonial auto-carousel · Instagram feed placeholder · consultation parallax banner (merged into L'Invitation).

## 7. The Booking Thread

- Header: quiet "Private Viewing" text link (Archivo caps), always visible, both languages.
- After each chapter: hairline rule + one-line invitation ("Continue the conversation — request a private viewing") + arrow link to `/appointments`.
- `AppointmentPage`: restyle to match design language (Fraunces headings, champagne/onyx rhythm, hairline form fields) — layout/functionality unchanged.

## 8. Commerce Demotion

- Nav order: Maison sections first; "Collection" remains but after editorial links.
- `ProductCard` restyled to plate aesthetic: look number (gold numeral), fabric line under name, "Enquire" link promoted; quick-add bar de-emphasized (smaller, appears on hover only). Cart/buy functionality untouched.
- Badges: keep rectangular couture-style labels (NEW/FEATURED/3D) as-is.

## 9. Bilingual & RTL

- All new copy gets keys in `LanguageContext.tsx` for both `en` and `ar` (only locales that exist).
- Existing RTL override system preserved; verify Amiri renders correctly under RTL heading rules.
- Calligraphic accents are language-neutral decorations (always Arabic script, both locales).

## 10. Cleanup (included)

1. Delete dead `text-sunset` usages (Header.tsx).
2. Merge `ivory`/`bone` duplicate tokens.
3. Remove unused font imports after migration.
4. Note: legacy `tailwind.config.js` defines conflicting palette values; under Tailwind v4 the CSS `@theme` wins. Leave file but add a top comment marking it vestigial (no value changes in this phase).

## 11. Files Affected

| File | Change |
|---|---|
| `src/index.css` | Font imports, theme tokens (champagne, ivory merge), animation cleanup, RTL font vars |
| `src/pages/Index.tsx` | Full restructure into five chapters |
| `src/components/Header.tsx` | Font classes, Private Viewing link, dead token fix |
| `src/components/Footer.tsx` | Font classes only (structure stays) |
| `src/components/ProductCard.tsx` | Plate aesthetic restyle |
| `src/pages/AppointmentPage.tsx` | Restyle to design language |
| `src/contexts/LanguageContext.tsx` | New i18n keys (en/ar), AR display font mapping |
| `index.html` | Only if preconnect/font hints needed |

New components (proposed): `ChapterLabel.tsx` (tracked-caps label + numeral), `InvitationRule.tsx` (recurring hairline invitation), `EditorialPlate.tsx` (Look plate for Chapter II).

## 12. Verification Plan

1. `npm run build` passes; typecheck clean.
2. Visual pass: desktop (1440px) and mobile (390px) for all five chapters.
3. RTL spot-check: switch locale to `ar`, verify hero, chapters, header, appointment page.
4. Reduced-motion check: animations disabled under OS setting.
5. Booking thread: every chapter's invitation links correctly to `/appointments`.
6. Commerce regression: add-to-cart still functions from a product card.
