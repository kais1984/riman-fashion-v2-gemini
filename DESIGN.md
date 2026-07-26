---
name: Atelier Riman
description: Sharjah's premier luxury bridal and evening couture design system
colors:
  gold: "#D4AF37"
  gold-light: "#F9E27E"
  gold-dark: "#A67C00"
  onyx: "#0A0A0A"
  bone: "#FDFBF7"
  ivory: "#FFFDF9"
  pearl: "#F3F1ED"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "clamp(3rem, 8vw, 10rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.05em"
  editorial:
    fontFamily: "Playfair Display, Georgia, serif"
    fontWeight: 400
    fontStyle: italic
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.7
  arabic:
    fontFamily: "IBM Plex Sans Arabic, sans-serif"
    fontWeight: 600
    fontSize: "1.25rem"
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
    textColor: "#FFFFFF"
    padding: "20px 40px"
    typography: "{typography.display}"
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

**Creative North Star: "The Golden Atelier"**

A warm, handcrafted sanctuary where heritage meets contemporary luxury. Atelier Riman's visual language is built on the interplay of deep tonal dark, warm ivory, and accent gold — like a private fitting room bathed in candlelight. Every surface feels deliberate, tactile, and intimate. The system rejects mass-produced, fast-fashion aesthetics in favor of architectural precision softened by editorial elegance.

The experience is designed to feel consultative rather than transactional. Typography carries the brand's regal voice through a pairing of sharp sans-serif headings with italic serif editorial accents. Motion is restrained but purposeful — entrances feel choreographed, interactions feel responsive, nothing is gratuitous.

**Key Characteristics:**
- Warm layered depth through tonal surfaces, never harsh shadows
- Gold as a restrained accent that signals luxury without excess
- Sharp typographic hierarchy with editorial serif flourishes
- Intimate, tactile component interactions
- Arabic-first support alongside English

## 2. Colors: The Golden Atelier Palette

A warm, restrained palette centered on a single precious-metal accent against deep and light tonal neutrals. Gold is never used casually — its rarity on the screen is its power.

### Primary
- **Gold** (#D4AF37): The signature accent. Used for CTAs, badges, dividers, hover states, and editorial highlights. Never applied to body text or backgrounds. Appears on roughly 5–10% of any given screen.

### Neutral
- **Onyx** (#0A0A0A): Primary dark surface. Used for hero overlays, dark section backgrounds, footer, and primary button base. Warm-black, never pure #000.
- **Bone** (#FDFBF7): Warm off-white section background. Used for alternating content sections.
- **Ivory** (#FFFDF9): Lightest surface — the default page background. Slightly warm, never pure white.
- **Pearl** (#F3F1ED): Subtle neutral used for image placeholders and secondary surface differentiation.
- **Stone-800/500/400**: Tailwind stone scale used for body text (800: headings, 500: body, 400: labels).

### Named Rules

**The Gold Rarity Rule.** Gold occupies ≤10% of any given screen. Its scarcity is its weight. Never use gold as a background fill for large areas, as body text, or in gradients for text.

**The Warm-Black Rule.** Never use pure #000 or #fff. All dark surfaces are onyx (#0A0A0A); all light surfaces are ivory (#FFFDF9) or bone (#FDFBF7). The warmth is subtle but essential.

## 3. Typography

**Display Font:** Plus Jakarta Sans (sans-serif)
**Editorial Font:** Playfair Display (serif, italic)
**Body Font:** Inter (sans-serif)
**Arabic Font:** IBM Plex Sans Arabic (sans-serif)

**Character:** A dialogue between architectural clarity and editorial warmth. Plus Jakarta Sans provides the structure — tall, precise, uppercase with wide tracking. Playfair Display italic adds the ornament — used sparingly for heritage, legacy, and poetic moments. Inter handles all body copy with quiet reliability.

### Hierarchy
- **Display** (700, clamp(3rem, 8vw, 10rem), 1.2): Hero headlines and major section titles. Always uppercase with wide tracking. Never italic.
- **Editorial** (400 italic, clamp(1.5rem, 4vw, 3rem), 1.3): Accent phrases within headings. Always italic, never uppercase. Gold-dark by default.
- **Headline** (700, clamp(1.5rem, 3vw, 2.5rem), 1.2): Section subheadings. Uppercase, wide tracking.
- **Title** (500, 1.25rem, 1.1): Product names, card titles. Sentence case.
- **Body** (400, 0.875rem, 1.7): Paragraphs, descriptions. Max line length 70ch. Never uppercase.
- **Label** (700, 0.625rem, 1, 0.3em letter-spacing, uppercase): Navigation, badges, metadata. Always uppercase.
- **Arabic Body** (600, 1.25rem, 1.6): RTL content uses IBM Plex Sans Arabic with increased size and weight for readability.

### Named Rules

**The Uppercase Rule.** Display, headline, and label text is always uppercase. Editorial accents and body text are never uppercase. This distinction creates the typographic hierarchy.

**The Editorial Rule.** Playfair Display italic is reserved for single words or short phrases within headings. Never use it for body text, full paragraphs, or multiple consecutive lines.

## 4. Elevation

Warm layered — depth is conveyed through tonal surface stacking rather than drop shadows. Dark sections sit against light sections with no shadow border; the contrast itself provides the separation. When overlays are needed (modals, quick view), a gentle backdrop blur is preferred over shadow.

### Shadow Vocabulary
- No ambient shadows on surfaces. Cards and sections are flat by default.
- Modal overlays use `bg-stone-900/40 backdrop-blur-sm` — a tonal veil, not a shadow.
- Button hover uses `box-shadow: 0 4px 20px rgba(212, 175, 55, 0.1)` — a warm gold glow, not a gray shadow.

### Named Rules

**The Flat-By-Default Rule.** Surfaces are flat at rest. Depth comes from tonal contrast and spacing, not from box-shadows. Shadows appear only as response to state (hover, focus) and are always gold-tinted.

## 5. Components

### Buttons
- **Shape:** Sharp-edged (no border-radius). The absence of rounding reinforces architectural precision.
- **Primary (btn-luxury):** Onyx background (#0A0A0A) with a subtle gradient. White text, 10px uppercase with 0.3em tracking. Padding 20px 40px. On hover: text turns gold, subtle scale transform (105%).
- **Secondary (btn-luxury-outline):** Transparent background, gold border at 40% opacity, gold text. On hover: gold background, onyx text.
- **Focus:** Visible outline ring matching gold.

### Navigation (Header)
- **Style:** Fixed top, full-width. Transparent at page top, transitions to white with backdrop-blur and subtle bottom border on scroll.
- **Links:** 10px uppercase, 0.3em tracking. On hover: gold accent. RTL support with IBM Plex Sans Arabic.
- **Mobile:** Full-height sidebar overlay from left (or right in RTL), spring-animated, with backdrop blur behind.

### Product Cards
- **Shape:** Sharp-edged image container, aspect ratio 3:4. No border-radius.
- **Background:** Stone-100 for image placeholder while loading.
- **Hover:** Image scales up (105%), subtle gold border overlay appears, action buttons slide up from bottom.
- **Badges:** Positioned top-left. Gold, onyx, or white backgrounds depending on badge type (new, featured, jewelry, 3D).
- **Typography:** Category label (10px, uppercase, stone-400), product name (heading-xl, stone-900), price (body-sm, stone-600).

### Inputs / Fields
- **Style:** Borderless with a single bottom border (border-b) in stone-800. Transparent background.
- **Focus:** Border transitions to gold. No other focus ornament.
- **Error:** Red text (red-500) in 10px uppercase below the field.
- **Disabled:** Reduced opacity without specification.

### Footer
- **Style:** Full-width dark section (#0e0e0e) with a gold shimmer accent line at the top border. Gold accents on headings and interactive elements.
- **Links:** Stone-500 text, uppercase, 0.15em tracking. On hover: gold color with expanding underline line animation.
- **Social Icons:** Circular borders with stone-800. On hover: gold background and border.

### Social Links
- **Shape:** Circular (full border-radius, 44px diameter).
- **Rest:** Border stone-800, icon stone-400.
- **Hover:** Background and border gold, icon white.
- **Transition:** 500ms ease.

## 6. Do's and Don'ts

### Do:
- **Do** use gold as a restrained accent (≤10% of any screen). Its rarity is its power.
- **Do** use onyx (#0A0A0A) for dark surfaces and ivory (#FFFDF9) for light surfaces — never pure black or white.
- **Do** use Plus Jakarta Sans uppercase with wide tracking for all headings and navigation.
- **Do** use Playfair Display italic sparingly for editorial accent words within headings.
- **Do** use sharp edges (no border-radius) on buttons, cards, and containers.
- **Do** use warm tonal layering for depth rather than box-shadows.
- **Do** support RTL layout with IBM Plex Sans Arabic at increased size and weight.
- **Do** use the `heading-editorial` class for italic serif accents and `heading-display` for structural headings.

### Don't:
- **Don't** use gold as a background fill for large areas or as body text.
- **Don't** use gradient text (`background-clip: text` with gradients) — decorative, never meaningful.
- **Don't** use pure #000 or #fff anywhere — tint neutrals toward the brand warmth.
- **Don't** use border-radius on buttons, cards, or containers — sharp edges are architectural.
- **Don't** apply box-shadows as default surface treatment — use tonal layering instead.
- **Don't** use Playfair Display for body text, full paragraphs, or multiple consecutive lines.
- **Don't** use glassmorphism or frosted-glass effects as default decorative treatment.
- **Don't** create identical card grids with icon + heading + text repeated endlessly.
- **Don't** use modal as first thought — exhaust inline and progressive disclosure alternatives first.
- **Don't** use side-stripe borders (border-left/right >1px colored accents on cards or callouts).
- **Don't** do fast fashion aesthetics — avoid anything mass-produced, trendy, or disposable-feeling.
