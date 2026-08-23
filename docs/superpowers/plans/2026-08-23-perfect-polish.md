# Perfect-Polish Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clear the remaining audit findings capping the site below 9/10 — an 11px typography floor via semantic tokens, WCAG AA contrast on light surfaces, removal of the dead Journal/blog surface, and brand-doc alignment — without losing the luxury uppercase aesthetic.

**Architecture:** Tailwind v4 `@theme` tokens (`text-micro` 11px, `text-caption` 12px) replace all `text-[8..12px]` arbitrary values across 43 files, with matching RTL scale-up rules. Contrast fixes are applied per-element with light/dark-surface judgment rules. The `/blog` route, BlogPage, its nav/footer/seo links, and all orphaned `blog.*`/`journal.*` translation keys are deleted. DESIGN.md is rewritten to document the real shipped identity.

**Tech Stack:** React 18 + TypeScript + Vite, Tailwind CSS v4 (`@theme` in src/index.css), Playwright (tests/*.spec.js), Netlify REST deploy.

**Spec:** `docs/superpowers/specs/2026-08-23-perfect-polish-design.md`

**Deviation from spec (documented):** Spec §3.4 said to delete the Footer newsletter form. Code inspection shows it persists signups to `localStorage('riman_newsletter')` (Footer.tsx:60-61) — it is working lead capture, not a dead-end. **The footer newsletter stays.** Only the BlogPage newsletter (deleted with the page) was truly dead.

## Global Constraints

- Token values are exact: `--text-micro: 11px`, `--text-caption: 12px`; RTL: `.text-micro` → 14px, `.text-caption` → 15px.
- Migration table (no exceptions): `text-[8px]`→`text-micro`, `text-[9px]`→`text-micro`, `text-[10px]`→`text-micro`, `text-[11px]`→`text-micro`, `text-[12px]`→`text-caption`.
- Contrast rules: on LIGHT surfaces (bg-ivory/bone/champagne/pearl/white/transparent-over-light) `text-stone-400`→`text-stone-600`, `text-stone-500`→`text-stone-600`, `text-stone-300`→`text-stone-500`, `placeholder:text-stone-500`→`placeholder:text-stone-600`. On DARK surfaces (bg-onyx, bg-stone-900/800, dark image overlays) leave stone-* unchanged. Gold (`text-gold*`) and `text-white/*` unchanged everywhere.
- Uppercase + tracking aesthetic preserved — only sizes and gray levels change, never casing, tracking, or font family.
- `npm run lint` (tsc --noEmit) must pass after every task.
- Commit messages exactly as specified per task; stage only listed files; leave `.superpowers/*` scratch unstaged.
- The final push is BLOCKED until the production DB has `appointments.interested_gowns` (user is applying the SQL manually) — see Task 7.

---

### Task 1: Typography tokens

**Files:**
- Modify: `src/index.css` (`@theme` block lines 4-38; RTL overrides lines 99-104)

**Interfaces:**
- Produces: Tailwind utilities `text-micro` and `text-caption` consumed by Tasks 3-5.

- [ ] **Step 1: Add tokens to `@theme`**

In `src/index.css`, inside the `@theme { ... }` block, immediately after the `--font-jewelry` line (line 11), add:

```css
  --text-micro: 11px;
  --text-caption: 12px;
```

- [ ] **Step 2: Add RTL scale-up rules**

In the same file, immediately AFTER the existing pixel-override block (after line 104, `[dir="rtl"] .text-\[12px\] { font-size: 15px; }`), add:

```css
  [dir="rtl"] .text-micro { font-size: 14px; }
  [dir="rtl"] .text-caption { font-size: 15px; }
```

Do NOT delete the old `[dir="rtl"] .text-\[8px\]`-style overrides yet — classes still reference them until Tasks 3-5 complete. Task 5 removes them.

- [ ] **Step 3: Verify**

Run: `npm run lint`
Expected: clean.

Run: `npm run build`
Expected: build succeeds (tokens are valid Tailwind v4 theme entries).

- [ ] **Step 4: Commit**

```bash
git add src/index.css
git commit -m "feat(theme): add text-micro/text-caption type tokens with RTL scaling"
```

---

### Task 2: Remove Journal/blog dead-end

**Files:**
- Delete: `src/pages/BlogPage.tsx`
- Modify: `src/App.tsx` (import line 24, route line 206)
- Modify: `src/components/Header.tsx` (nav entry line 17, dropdown entry line 258)
- Modify: `src/components/Footer.tsx` (blog link line 127)
- Modify: `src/lib/seo.ts` (`'/blog'` entry lines 53-56)
- Modify: `src/contexts/LanguageContext.tsx` (orphaned keys, both dicts)
- Modify: `tests/click-verification.spec.js` (route entry line 398, comment line 181)

**Interfaces:**
- Consumes: nothing.
- Produces: BlogPage no longer exists, so Tasks 3-5 file lists exclude it.

- [ ] **Step 1: Verify key consumers before deleting anything**

Run (PowerShell):
```powershell
Get-ChildItem src -Recurse -Include *.tsx,*.ts | Select-String -Pattern "t\('blog\.|t\('journal\.|t\('nav\.blog'\)|t\('section\.journal'\)" | ForEach-Object { "$($_.Path):$($_.LineNumber)" }
```
Expected: matches ONLY in `src\pages\BlogPage.tsx` (blog.* keys), `src\components\Header.tsx` (nav.blog key refs), `src\components\Footer.tsx` (nav.blog). If any OTHER file consumes these keys, STOP and report — do not delete keys with live consumers.

- [ ] **Step 2: Delete the page and its route**

Delete `src/pages/BlogPage.tsx`.

In `src/App.tsx` remove line 24:
```tsx
import BlogPage from './pages/BlogPage';
```
and remove the route (line 206):
```tsx
          <Route path="blog" element={<PageWrapper><BlogPage /></PageWrapper>} />
```

- [ ] **Step 3: Remove nav entries**

In `src/components/Header.tsx` remove line 17 from `navLinks`:
```tsx
  { label: "Journal", path: "/blog", key: 'nav.blog' },
```
and remove the dropdown entry near line 258:
```tsx
                      { label: 'Blog', path: '/blog', key: 'nav.blog' },
```

In `src/components/Footer.tsx` remove line 127:
```tsx
                <FooterLink to="/blog">{t('nav.blog')}</FooterLink>
```

- [ ] **Step 4: Remove SEO entry**

In `src/lib/seo.ts` remove the `'/blog'` entry (lines 53-56):
```ts
  '/blog': {
    title: 'Journal | Atelier Riman',
    description: 'Explore the Atelier Riman journal — bridal style guides, fashion insights, and the stories behind our collections.',
  },
```

- [ ] **Step 5: Remove orphaned translation keys from BOTH dicts**

In `src/contexts/LanguageContext.tsx`, from the EN dict remove: `'nav.blog'` (line 28), the `// Journal / Atelier` comment + all ten `'journal.*'` keys (lines 51-61), all `'blog.*'` keys (search `'blog.` — includes `blog.title`, `blog.subtitle`, `blog.latest`, `blog.min_read`, `blog.read_editorial`, `blog.view_journal`, `blog.join_circle`, `blog.newsletter_desc`, `blog.email_placeholder`, `blog.subscribe`, `blog.article1_title`, `blog.article1_excerpt`, `blog.article1_category`, and the article2/article3 equivalents, ~lines 600-620), and `'section.journal'` (line 747).

From the AR dict remove the exact same key set (search each key name: `'nav.blog'`, `'journal.*'` ~lines 785-795, `'blog.*'` ~lines 1335-1350 and the article keys, `'section.journal'` line 1481).

Rule: delete a key from AR only if you deleted it from EN. Keep the two dicts' key sets identical.

- [ ] **Step 6: Update tests**

In `tests/click-verification.spec.js` remove line 398:
```js
    { path: '/blog', name: 'Blog' },
```
and update the comment at line 181 from:
```js
    // NOTE: Journal (/blog), Gallery (/gallery) and View All Products (/collection/all)
```
to (preserving whatever the rest of that comment sentence says, just dropping the Journal reference):
```js
    // NOTE: Gallery (/gallery) and View All Products (/collection/all)
```

- [ ] **Step 7: Verify**

Run: `npm run lint`
Expected: clean (no dangling imports/keys — tsc won't catch missing dict keys, so also re-run the Step 1 grep and expect ZERO matches).

- [ ] **Step 8: Commit**

```bash
git add -A src/App.tsx src/pages/BlogPage.tsx src/components/Header.tsx src/components/Footer.tsx src/lib/seo.ts src/contexts/LanguageContext.tsx tests/click-verification.spec.js
git commit -m "feat(nav): remove Journal/blog dead-end surface and orphaned keys"
```

---

### Task 3: Migrate components to tokens + contrast lift

**Files (17):**
- Modify: `src/components/AvailabilityCalendar.tsx`, `Footer.tsx`, `GalleryFilters.tsx`, `GalleryGrid.tsx`, `GalleryLightbox.tsx`, `GlobalFeatures.tsx`, `Header.tsx`, `ImmersiveUI.tsx`, `InstagramSection.tsx`, `MobileBottomNav.tsx`, `ProductCard.tsx`, `SizeGuide.tsx`, `ThreeDViewer.tsx`, `ToastContainer.tsx`, `luxury/HorizontalLookbook.tsx`, `luxury/Marquee.tsx`, `luxury/StatCounter.tsx`

**Interfaces:**
- Consumes: `text-micro` / `text-caption` utilities from Task 1.
- Produces: zero `text-[8..12px]` occurrences in src/components/**.

- [ ] **Step 1: Size migration**

In each of the 17 files, apply the Global Constraints migration table to every occurrence:
`text-[8px]`→`text-micro`, `text-[9px]`→`text-micro`, `text-[10px]`→`text-micro`, `text-[11px]`→`text-micro`, `text-[12px]`→`text-caption`.

Change ONLY the size class — leave tracking, casing, weight, and color classes untouched in this step.

- [ ] **Step 2: Badge container fixes**

Count badges must fit 11px digits. In `src/components/Header.tsx`, both badge spans (currently `absolute -top-1 -right-1 bg-gold text-white text-micro w-4 h-4 flex items-center justify-center font-bold shadow-sm` after Step 1) become:
```tsx
                <span className="absolute -top-1 -right-1 bg-gold text-white text-micro min-w-4 h-4 px-0.5 flex items-center justify-center font-bold shadow-sm rounded-full leading-none">
```
(only the `w-4` → `min-w-4 px-0.5 rounded-full leading-none` portion changes; apply to BOTH the Selection and Bag badges).

In `src/components/MobileBottomNav.tsx`, the badge span becomes:
```tsx
              <span className="absolute top-2 right-4 bg-gold text-white text-micro min-w-4 h-4 px-0.5 flex items-center justify-center rounded-full leading-none font-bold">
```

`ProductCard.tsx` badges are pills (`px-4 py-1.5`), not circles — no container change needed there.

- [ ] **Step 3: Contrast lift (components)**

Apply the Global Constraints contrast rules in the same 17 files. Surface guide:
- LIGHT-surface components (render on ivory/bone): AvailabilityCalendar, GalleryFilters, GlobalFeatures, Header (its dropdown panels are bg-white), ProductCard (info block), SizeGuide, ThreeDViewer, ToastContainer.
- DARK-surface components (leave stone-* unchanged): Footer (bg-onyx), GalleryGrid/GalleryLightbox/ImmersiveUI/HorizontalLookbook/StatCounter/Marquee (text sits on images or dark overlays — judge per element: `text-white`, `text-ivory`, `text-gold/60` on imagery stay; any `text-stone-400/500` that renders on a LIGHT background still lifts).
- InstagramSection: mixed — lift only stone-* text that sits on light surfaces.

Also lift `placeholder:text-stone-500` → `placeholder:text-stone-600` wherever the input sits on a light surface (Footer's newsletter input is on bg-onyx → leave it).

- [ ] **Step 4: Verify**

Run (expect ZERO output lines):
```powershell
Get-ChildItem src/components -Recurse -Include *.tsx | Select-String -Pattern 'text-\[(8|9|10|11|12)px\]' | ForEach-Object { "$($_.Path):$($_.LineNumber)" }
```
Run: `npm run lint`
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add src/components
git commit -m "a11y(components): 11px type floor + AA contrast on light surfaces"
```

---

### Task 4: Migrate customer pages to tokens + contrast lift

**Files (16):**
- Modify: `src/App.tsx`, `src/pages/AboutPage.tsx`, `AlterationsPage.tsx`, `AppointmentPage.tsx`, `Auth.tsx`, `Checkout.tsx`, `CollectionPage.tsx`, `ContactPage.tsx`, `GalleryPage.tsx`, `Index.tsx`, `ProductDetail.tsx`, `ProfilePage.tsx`, `SearchPage.tsx`, `StyleQuiz.tsx`, `WeddingChecklist.tsx`, `WishlistPage.tsx`

**Interfaces:**
- Consumes: `text-micro` / `text-caption` from Task 1.
- Produces: zero `text-[8..12px]` occurrences in src/pages/*.tsx (non-admin) and src/App.tsx.

- [ ] **Step 1: Size migration**

Apply the Global Constraints migration table to every occurrence in all 16 files. Size class only — no color changes in this step.

- [ ] **Step 2: Contrast lift (pages)**

Apply the Global Constraints contrast rules. All 15 page files render on light ivory/bone sections except:
- Dark sections to leave unchanged: any block inside `bg-onyx` / `bg-stone-900` / `bg-stone-800` wrappers, and text over dark hero imagery (e.g. Index.tsx hero overlays, WishlistPage empty-state if dark). Judge per element by its nearest background.
- `App.tsx` line ~129 (`text-ivory/30` on dark footer-adjacent surface) — leave.
- Lift `placeholder:text-stone-500` → `placeholder:text-stone-600` on all light-surface inputs (AppointmentPage, ContactPage, Auth, Checkout, StyleQuiz, WeddingChecklist).

- [ ] **Step 3: Verify**

Run (expect ZERO output lines):
```powershell
Get-ChildItem src/pages -File -Filter *.tsx | Select-String -Pattern 'text-\[(8|9|10|11|12)px\]' | ForEach-Object { "$($_.Path):$($_.LineNumber)" }
Select-String -Path src/App.tsx -Pattern 'text-\[(8|9|10|11|12)px\]' | ForEach-Object { "$($_.Path):$($_.LineNumber)" }
```
Run: `npm run lint`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/pages/AboutPage.tsx src/pages/AlterationsPage.tsx src/pages/AppointmentPage.tsx src/pages/Auth.tsx src/pages/Checkout.tsx src/pages/CollectionPage.tsx src/pages/ContactPage.tsx src/pages/GalleryPage.tsx src/pages/Index.tsx src/pages/ProductDetail.tsx src/pages/ProfilePage.tsx src/pages/SearchPage.tsx src/pages/StyleQuiz.tsx src/pages/WeddingChecklist.tsx src/pages/WishlistPage.tsx
git commit -m "a11y(pages): 11px type floor + AA contrast on light surfaces"
```

---

### Task 5: Migrate admin pages + remove dead RTL overrides

**Files (11):**
- Modify: `src/pages/admin/AdminAppointments.tsx`, `AdminCalendar.tsx`, `AdminContent.tsx`, `AdminDashboard.tsx`, `AdminGallery.tsx`, `AdminLayout.tsx`, `AdminOrders.tsx`, `AdminPlaceholder.tsx`, `AdminProducts.tsx`, `AdminSettings.tsx`
- Modify: `src/index.css` (dead RTL overrides, lines 99-104)

**Interfaces:**
- Consumes: `text-micro` / `text-caption` from Task 1; requires Tasks 3-4 complete (so no `text-[8..12px]` classes remain anywhere).
- Produces: zero `text-[8..12px]` occurrences in the entire src/ tree.

- [ ] **Step 1: Size migration (admin)**

Apply the Global Constraints migration table to every occurrence in the 10 admin files. Admin UI is light-surface throughout — apply the contrast rules in the same pass (`text-stone-400/500` → `text-stone-600` on informative text; leave any sidebar/dark-header stone-* that sits on dark backgrounds, e.g. AdminLayout sidebar if dark — judge per element).

- [ ] **Step 2: Confirm the old pixel classes are extinct**

Run (expect ZERO output lines):
```powershell
Get-ChildItem src -Recurse -Include *.tsx,*.ts | Select-String -Pattern 'text-\[(8|9|10|11|12)px\]' | ForEach-Object { "$($_.Path):$($_.LineNumber)" }
```
If ANY match remains, migrate it now before proceeding.

- [ ] **Step 3: Delete the dead RTL pixel overrides**

In `src/index.css` delete these five rules (lines 99-104, now unreachable):
```css
  /* Pixel-based sizes: enlarge by ~25% */
  [dir="rtl"] .text-\[8px\] { font-size: 11px; }
  [dir="rtl"] .text-\[9px\] { font-size: 12px; }
  [dir="rtl"] .text-\[10px\] { font-size: 13px; }
  [dir="rtl"] .text-\[11px\] { font-size: 14px; }
  [dir="rtl"] .text-\[12px\] { font-size: 15px; }
```
Keep the `[dir="rtl"] .text-micro` / `.text-caption` rules added in Task 1.

- [ ] **Step 4: Verify**

Run: `npm run lint && npm run build`
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add src/pages/admin src/index.css
git commit -m "a11y(admin): 11px type floor + AA contrast; drop dead RTL pixel overrides"
```

---

### Task 6: Rewrite DESIGN.md to the real brand

**Files:**
- Modify: `DESIGN.md` (full replacement)

**Interfaces:**
- Consumes: nothing. Independent of Tasks 1-5.

- [ ] **Step 1: Replace DESIGN.md entirely with this content**

````markdown
---
name: Atelier Riman
description: Sharjah's premier luxury bridal and evening couture design system
colors:
  gold: "#A2492B"
  gold-light: "#C45A3C"
  gold-dark: "#7A3520"
  onyx: "#161513"
  bone: "#EFEAE2"
  ivory: "#EFEAE2"
  champagne: "#F6F0E6"
  pearl: "#E8E3D9"
typography:
  display:
    fontFamily: "Fraunces, serif"
    fontWeight: 500
    letterSpacing: "0.1em"
    textTransform: "uppercase"
  editorial:
    fontFamily: "Newsreader, serif"
    fontWeight: 400
    fontStyle: "italic"
  body:
    fontFamily: "Newsreader, serif"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Archivo, sans-serif"
    fontSize: "11px"
    letterSpacing: "0.25em"
    textTransform: "uppercase"
  arabic:
    fontFamily: "Cairo, IBM Plex Sans Arabic, sans-serif"
    fontWeight: 500
  arabicHeading:
    fontFamily: "Amiri, serif"
    fontWeight: 700
rounded:
  sm: "0"
  md: "0"
  lg: "0"
spacing:
  xs: "6px"
  sm: "12px"
  md: "24px"
  lg: "48px"
  xl: "80px"
components:
  button-primary:
    backgroundColor: "{colors.onyx}"
    textColor: "{colors.bone}"
    padding: "20px 40px"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
  button-primary-hover:
    backgroundColor: "{colors.onyx}"
    textColor: "{colors.gold}"
    padding: "20px 40px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.gold}"
    borderColor: "{colors.gold}"
    padding: "20px 40px"
    rounded: "{rounded.sm}"
  button-secondary-hover:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.onyx}"
---

# Design System: Atelier Riman

## 1. Overview

**Creative North Star: "The Terracotta Atelier"**

A warm, handcrafted sanctuary where heritage meets contemporary luxury. Atelier Riman's visual language is built on the interplay of deep warm dark, bone ivory, and a terracotta accent — like a private fitting room bathed in candlelight. Every surface feels deliberate, tactile, and intimate. The system rejects mass-produced, fast-fashion aesthetics in favor of architectural precision softened by editorial elegance.

The experience is consultative rather than transactional: booking-first, with private viewings, rentals, and WhatsApp handoff at its core. Arabic is the default language; English is fully supported. Typography carries the brand's regal voice through serif display headings with italic editorial accents. Motion is restrained but purposeful.

**Key Characteristics:**
- Warm layered depth through tonal surfaces, never harsh shadows
- Terracotta as a restrained accent that signals luxury without excess
- Serif typographic hierarchy with editorial italic flourishes
- Intimate, tactile component interactions
- Arabic-first (RTL default) with full English support

## 2. Colors: The Terracotta Atelier Palette

A warm, restrained palette centered on a single terracotta accent against deep and light tonal neutrals. The accent is never used casually — its rarity on the screen is its power. All values below are the shipped `@theme` tokens in `src/index.css`.

### Primary
- **Gold** (#A2492B, terracotta): The signature accent, exposed as the `gold` token. Used for CTAs, badges, dividers, hover states, and editorial highlights. Never applied to body text or large background fills. Appears on roughly 5–10% of any given screen.
- **Gold-light** (#C45A3C) and **Gold-dark** (#7A3520): hover/gradient companions.

### Neutral
- **Onyx** (#161513): Primary dark surface — hero overlays, dark sections, footer, primary button base. Warm-black, never pure #000.
- **Bone / Ivory** (#EFEAE2): Default page background and alternating light sections. `ivory` aliases `bone`.
- **Champagne** (#F6F0E6) and **Pearl** (#E8E3D9): Subtle secondary light surfaces.
- **Stone scale**: Tailwind stone for text. Accessibility floor: informative text on light surfaces uses stone-600 or darker (WCAG AA at 11px); stone-400/500 are reserved for dark surfaces or purely decorative roles.

### Named Rules

**The Terracotta Rarity Rule.** The accent occupies ≤10% of any given screen. Its scarcity is its weight. Never use it as a large background fill or as body text.

**The Warm-Black Rule.** Never use pure #000 or #fff. All dark surfaces are onyx (#161513); all light surfaces are bone (#EFEAE2) or warmer. The warmth is subtle but essential.

## 3. Typography

**Display Font:** Fraunces (serif) — `font-heading`
**Editorial Font:** Newsreader (serif, italic) — `font-editorial`
**Body Font:** Newsreader (serif) — `font-body`
**Label/UI Font:** Archivo (sans-serif) — `font-label`
**Arabic Body:** Cairo, IBM Plex Sans Arabic — `font-arabic`
**Arabic Headings:** Amiri — `font-arabic-heading`

**Character:** A dialogue between editorial warmth and architectural clarity. Fraunces provides the structure — uppercase with wide tracking. Newsreader italic adds the ornament — used sparingly for heritage, legacy, and poetic moments. Archivo handles labels and UI with quiet precision.

### Hierarchy
- **Display** (Fraunces 500, uppercase, wide tracking): Hero headlines and major section titles. Never italic.
- **Editorial** (Newsreader italic, gold-dark): Accent phrases within headings. Always italic, never uppercase.
- **Body** (Newsreader 400, 1.7): Paragraphs, descriptions. Max line length 70ch. Never uppercase.
- **Label / Micro** (Archivo, `text-micro` = 11px, uppercase, 0.2–0.3em tracking): Navigation, badges, metadata, form labels. 11px is the absolute size floor — nothing renders smaller. `text-caption` (12px) is the secondary caption size.
- **Arabic scaling:** RTL text renders ~25–30% larger than its LTR counterpart (`text-micro` → 14px, `text-caption` → 15px, and the rem-scale overrides in index.css). Letter-spacing is forced to 0 in RTL.

### Named Rules

**The Uppercase Rule.** Display, headline, and label text is always uppercase. Editorial accents and body text are never uppercase.

**The 11px Floor Rule.** No text renders below 11px (LTR) / 14px (RTL). Use the `text-micro` and `text-caption` tokens; never arbitrary pixel values.

**The Editorial Rule.** Newsreader italic is reserved for single words or short phrases within headings. Never for body text or multiple consecutive lines.

## 4. Elevation

Warm layered — depth is conveyed through tonal surface stacking rather than drop shadows. Dark sections sit against light sections with no shadow border; the contrast itself provides the separation. When overlays are needed (modals, quick view), a gentle backdrop blur is preferred over shadow.

### Named Rules

**The Flat-By-Default Rule.** Surfaces are flat at rest. Depth comes from tonal contrast and spacing, not from box-shadows. Shadows appear only as response to state (hover, focus) and are always accent-tinted.

## 5. Components

### Buttons
- **Shape:** Sharp-edged (no border-radius). The absence of rounding reinforces architectural precision.
- **Primary (btn-luxury):** Onyx background (#161513), bone text, Archivo 12px uppercase with 0.25em tracking, padding 20px 40px. On hover: text turns terracotta.
- **Secondary (btn-luxury-outline):** Transparent background, terracotta border at 40% opacity, terracotta text. On hover: terracotta background, onyx text.
- **Focus:** Visible 2px outline ring in terracotta with 2px offset.

### Navigation (Header)
- **Style:** Fixed top, full-width. Transparent at page top, transitions to bone with backdrop-blur and subtle bottom border on scroll.
- **Links:** `text-micro` uppercase, wide tracking. On hover: terracotta accent. Count badges (Selection, Bag) are terracotta circles, `text-micro` bold, `min-w-4 h-4`.
- **Mobile:** Bottom navigation bar (Home, Search, Selection, Bag, You) plus full-height sidebar overlay, spring-animated, with backdrop blur.

### Product Cards
- **Shape:** Sharp-edged image container, aspect ratio 3:4. No border-radius.
- **Hover:** Image scales up, action buttons slide up from bottom.
- **Badges:** Positioned top-left — terracotta, onyx, or ivory backgrounds depending on badge type.
- **Typography:** Category label (`text-micro`, uppercase, stone-600), product name (Fraunces, stone-900), price with "From" prefix (booking-first pricing honesty).

### Inputs / Fields
- **Style:** Borderless with a single bottom border (border-b) in stone-300. Transparent background.
- **Focus:** Border transitions to terracotta. No other focus ornament.
- **Labels:** `text-micro` uppercase, stone-600.
- **Error:** red-500, `text-micro` uppercase below the field.

### Footer
- **Style:** Full-width onyx section with a terracotta shimmer accent line at the top border.
- **Links:** stone-400/500 text (dark surface — AA compliant on onyx), uppercase. On hover: terracotta with expanding underline.
- **Newsletter:** Working lead capture persisting to localStorage.
- **Social Icons:** Circular borders, stone-800. On hover: terracotta background and border, white icon.

## 6. Do's and Don'ts

### Do:
- **Do** use terracotta as a restrained accent (≤10% of any screen).
- **Do** use onyx (#161513) for dark surfaces and bone (#EFEAE2) for light surfaces — never pure black or white.
- **Do** use Fraunces uppercase with wide tracking for display headings, Newsreader italic for editorial accents.
- **Do** respect the 11px floor: `text-micro` / `text-caption` tokens only.
- **Do** keep informative text on light surfaces at stone-600 or darker (WCAG AA).
- **Do** use sharp edges (no border-radius) on buttons, cards, and containers.
- **Do** support RTL-first layout with Cairo/Amiri at increased size and zero letter-spacing.

### Don't:
- **Don't** use the accent as a large background fill or as body text.
- **Don't** use gradient text (`background-clip: text`) — decorative, never meaningful.
- **Don't** use pure #000 or #fff anywhere — tint neutrals toward the brand warmth.
- **Don't** use border-radius on buttons, cards, or containers.
- **Don't** apply box-shadows as default surface treatment — use tonal layering.
- **Don't** render text below the 11px floor or use arbitrary `text-[Npx]` values.
- **Don't** place stone-400/500 informative text on light surfaces — it fails WCAG AA.
- **Don't** use glassmorphism as default decorative treatment.
- **Don't** create dead-end links — every navigable element must resolve to a real destination.
````

- [ ] **Step 2: Verify no stale references remain**

Run (expect ZERO output lines):
```powershell
Select-String -Path DESIGN.md -Pattern 'D4AF37|Plus Jakarta|Playfair|Inter,' | ForEach-Object { "$($_.LineNumber): $($_.Line)" }
```

- [ ] **Step 3: Commit**

```bash
git add DESIGN.md
git commit -m "docs: align DESIGN.md with shipped terracotta/Fraunces identity"
```

---

### Task 7: Verify + ship

**Files:** none created; verification + git + Netlify only.

**Interfaces:**
- Consumes: all of Tasks 1-6 complete.
- BLOCKER: the production DB migration `appointments.interested_gowns` must be applied (user pastes SQL manually) before Step 7's push.

- [ ] **Step 1: Lint + production build**

Run: `npm run lint && npm run build`
Expected: clean; note the emitted `index-*.js` hash.

- [ ] **Step 2: Extinction check**

Run (expect ZERO output lines):
```powershell
Get-ChildItem src -Recurse -Include *.tsx,*.ts | Select-String -Pattern 'text-\[(8|9|10|11|12)px\]' | ForEach-Object { "$($_.Path):$($_.LineNumber)" }
```

- [ ] **Step 3: Full Playwright suite**

Start dev server (`npm run dev`, port 3001), run the full suite, kill the server.
Expected: all tests pass (baseline 72 after the /blog route removal in Task 2 — was 73).
If failures appear, fix minimally and disclose; do not skip tests.

- [ ] **Step 4: Deploy**

Run: `& "C:\Users\KAIS\AppData\Local\Temp\opencode\netlify-rest-deploy.ps1"`
Expected: `DEPLOY READY: … -> https://riman-fashion-v2.netlify.app`

- [ ] **Step 5: Verify live bundle**

```powershell
$html = Invoke-WebRequest -Uri "https://riman-fashion-v2.netlify.app/?cb=$(Get-Random)" -UseBasicParsing
if ($html.Content -match 'index-<HASH>\.js') { 'LIVE OK' } else { 'STALE' }
```
(replace `<HASH>` with Step 1's hash). Expected: `LIVE OK`.

- [ ] **Step 6: Verify DB migration landed**

```powershell
$url = (Select-String -Path .env -Pattern '^VITE_SUPABASE_URL=(.+)$').Matches[0].Groups[1].Value.Trim()
$key = (Select-String -Path .env -Pattern '^VITE_SUPABASE_ANON_KEY=(.+)$').Matches[0].Groups[1].Value.Trim()
try { Invoke-WebRequest -Uri "$url/rest/v1/appointments?select=interested_gowns&limit=1" -Headers @{ apikey = $key; Authorization = "Bearer $key" } -UseBasicParsing | Out-Null; 'COLUMN OK' } catch { $_.ErrorDetails.Message }
```
Expected: `COLUMN OK`. If a 42703 error returns, the user has not applied the SQL yet — STOP and do not push; report and wait.

- [ ] **Step 7: Push (only after Step 6 passes)**

```bash
git push origin salon-rebrand:main
```
Expected: push accepted (this publishes the booking-first branch AND the polish pass together).

---

## Self-Review Notes

- Spec coverage: §1 tokens → Tasks 1,3,4,5; §2 contrast → Tasks 3,4,5; §3 dead-ends → Task 2 (with documented footer-newsletter deviation); §4 DESIGN.md → Task 6; §5 verification/ship → Task 7; pending-DB dependency → Task 7 Step 6 gate.
- Type consistency: `text-micro`/`text-caption` named identically in every task; RTL values (14px/15px) consistent between Task 1 and Task 6 docs.
- Task 2 runs before Tasks 3-5 so BlogPage is never migrated then deleted.
- Test baseline math: 73 tests − 1 (/blog route test) = 72 expected in Task 7 Step 3.
