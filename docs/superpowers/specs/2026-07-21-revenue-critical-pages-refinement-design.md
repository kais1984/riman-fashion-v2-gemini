# Design Spec: Revenue-Critical Pages Refinement

**Date:** 2026-07-21
**Status:** Approved
**Scope:** Homepage, Product Detail, Collection Page

## 1. Overview

Refine the three revenue-critical pages to better convey Atelier Riman's luxury positioning. The current pages are functional but contain generic sections that dilute the brand's regal, intimate personality. This refinement tightens the visual hierarchy, removes templated patterns, and reinforces the "Golden Atelier" design system.

## 2. Design Principles

- **Restraint over excess:** Every element must justify its presence
- **Editorial tone:** Typography carries personality, not decoration
- **Warm depth:** Tonal layering, not shadows
- **Gold as punctuation:** Rare, deliberate, never background

## 3. Homepage Refinement

### 3.1 "Style Guide" → "Atelier Journal"

**Current:** Generic blog layout with numbered steps (01, 02) and placeholder content.

**Refined:**
- Remove numbered steps (content isn't sequential)
- Replace with editorial spread: large italic quote + two content cards
- Use Playfair Display italic for the quote
- Cards use gold/5 background with subtle border
- Remove the "01." and "02." numbering entirely

### 3.2 "Brand Promise" Enhancement

**Current:** Plain text block with heading + paragraph + link.

**Refined:**
- Add split layout: text left, decorative element right
- Use a thin gold vertical line as divider
- Increase visual weight of the heading
- Add subtle scroll-reveal animation

### 3.3 Category Tiles

**Current:** 4 equal-width tiles with hover overlay.

**Refined:**
- Maintain 4-tile grid but vary overlay opacity per tile
- Add editorial labels (e.g., "Bridal Couture" not just "Bridal")
- Use different hover states: scale + gold border accent
- Ensure consistent text positioning across tiles

### 3.4 "As Featured In"

**Current:** Text-only publication names in a row.

**Refined:**
- Keep text-based (no logo images to avoid licensing issues)
- Use Playfair Display italic for publication names
- Add subtle gold underline on hover
- Reduce opacity to 40% at rest, 80% on hover
- Add "Trusted by" label above in uppercase

### 3.5 Testimonials

**Current:** Basic quote layout with stars.

**Refined:**
- Remove star ratings (feels transactional for luxury)
- Use large Playfair Display italic for the quote
- Add author name in uppercase with gold accent
- Add subtle gold decorative line above quote
- Single testimonial at a time (not grid)

### 3.6 Consultation Banner

**Current:** Dark section with CTA.

**Refined:**
- Keep dark (onyx) background
- Add subtle gold gradient accent at top edge
- Tighten copy: "Book Your Private Viewing" as primary CTA
- Add appointment type indicators (Bridal, Evening, Jewelry)

## 4. Product Detail Refinement

### 4.1 Above-the-Fold Hierarchy

**Current:** Gallery + info compete equally.

**Refined:**
- Gallery takes 55% width (currently 50%)
- Price block gets gold/5 background with border
- "Add to Collection" button gets full width
- Wishlist button stays secondary

### 4.2 Trust Badges

**Current:** 3-column grid with small icons.

**Refined:**
- Horizontal strip with gold dividers between items
- Larger icons (w-5 h-5 instead of w-4 h-4)
- Bold labels with lighter descriptions
- Add subtle gold/5 background

### 4.3 Specifications

**Current:** Plain 2-column grid.

**Refined:**
- Use a refined table layout with alternating row backgrounds
- Gold accent on label column
- Better spacing between rows
- Add subtle border-bottom to each row

### 4.4 Review Form

**Current:** Basic textarea with small labels.

**Refined:**
- Larger input fields with more padding
- Gold focus border
- Better typography hierarchy
- Star rating as larger interactive elements
- Submit button with gold accent

### 4.5 Related Products

**Current:** Standard grid with "You May Also Admire" heading.

**Refined:**
- Change heading to "Curated For You"
- Add editorial subtitle
- Keep 4-column grid
- Add hover effects matching product cards

## 5. Collection Page Refinement

### 5.1 Filter Bar

**Current:** Sticky bar with filters and sort.

**Refined:**
- Add gold accent line at top of filter bar
- Better spacing between filter groups
- Year buttons get gold border when active
- Silhouette buttons use underline style

### 5.2 Color Swatches

**Current:** Small circles (w-7 h-7).

**Refined:**
- Increase to w-8 h-8
- Add gold ring on selection (2px)
- Better hover scale effect
- Add color name tooltip on hover

### 5.3 Sort Dropdown

**Current:** Basic dropdown.

**Refined:**
- Elegant overlay with backdrop blur
- Gold highlight on selected option
- Better typography and spacing
- Smooth open/close animation

### 5.4 Empty State

**Current:** Basic message with two CTAs.

**Refined:**
- Larger heading with editorial styling
- More compelling copy
- Single primary CTA (remove secondary)
- Add decorative gold line

## 6. Technical Notes

- All changes stay within existing Tailwind classes
- No new dependencies required
- Maintain existing responsive breakpoints
- Preserve all current functionality (3D viewer, zoom, filters)
- Keep existing accessibility features (aria labels, keyboard nav)

## 7. Files to Modify

- `src/pages/Index.tsx` (homepage)
- `src/pages/ProductDetail.tsx` (product detail)
- `src/pages/CollectionPage.tsx` (collection)

## 8. Testing

- Visual inspection on desktop and mobile
- Verify all interactive elements still work
- Check responsive behavior at all breakpoints
- Ensure animations are smooth and not jarring
