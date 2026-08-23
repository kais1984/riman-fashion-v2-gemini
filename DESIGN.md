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
