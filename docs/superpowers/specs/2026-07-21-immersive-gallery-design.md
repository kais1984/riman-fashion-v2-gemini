# Immersive Gallery — Design Spec

**Date:** 2026-07-21
**Status:** Approved
**Author:** AI Studio

## Overview

Replace the current Unsplash stock gallery with a Supabase-backed, immersive masonry gallery featuring real Riman Fashion content (photos + videos from Instagram reels). Brides can filter by category, autoplay videos on scroll, and navigate a full-screen lightbox. Admins can upload/manage content from the dashboard.

## Goals

- Replace generic Unsplash images with authentic Riman Fashion content
- Create a visually stunning, immersive browsing experience
- Enable self-service content management via admin panel
- Drive appointment bookings through gallery engagement
- Support both photo and video content with autoplay

## Architecture

**Approach:** Supabase-backed gallery with admin upload panel

**New Supabase table:** `gallery_items`
**New Supabase storage bucket:** `gallery` (public read, authenticated write)

## Database Schema

### Table: `gallery_items`

```sql
CREATE TABLE gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'bridal',
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'photo',  -- 'photo' or 'video'
  thumbnail_url TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for filtered queries
CREATE INDEX idx_gallery_category ON gallery_items(category);
CREATE INDEX idx_gallery_featured ON gallery_items(is_featured) WHERE is_featured = true;
CREATE INDEX idx_gallery_sort ON gallery_items(sort_order);
```

### RLS Policies

```sql
-- Public read access
CREATE POLICY "Public read access" ON gallery_items
  FOR SELECT USING (true);

-- Authenticated write access (admin only)
CREATE POLICY "Admin insert" ON gallery_items
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin update" ON gallery_items
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin delete" ON gallery_items
  FOR DELETE USING (auth.role() = 'authenticated');
```

### Storage Bucket: `gallery`

- Public read access
- Authenticated write (admin upload)
- File size limit: 50MB per file
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `video/mp4`, `video/webm`

## Frontend Components

### New Files

| File | Purpose |
|------|---------|
| `src/pages/GalleryPage.tsx` | Full rewrite — immersive masonry gallery |
| `src/components/GalleryLightbox.tsx` | Full-screen lightbox with navigation |
| `src/components/GalleryGrid.tsx` | Masonry grid with video autoplay |
| `src/components/GalleryFilters.tsx` | Category filter pills |
| `src/hooks/useGallery.ts` | Supabase data fetching hook |

### Modified Files

| File | Change |
|------|--------|
| `src/pages/Index.tsx` | Add "Gallery Teaser" section (6 featured items) |
| `src/pages/admin/AdminLayout.tsx` | Add "Gallery" nav item |
| `src/contexts/LanguageContext.tsx` | Add gallery i18n keys |
| `src/index.css` | Add gallery-specific styles (masonry, lightbox) |

### Admin Files

| File | Purpose |
|------|---------|
| `src/pages/admin/AdminGallery.tsx` | Upload, edit, reorder, delete gallery items |

## Component Design

### GalleryPage.tsx

Full-page gallery with:
- Header: "Visual Reverie" / "Atelier Gallery" (existing editorial style)
- Filter bar: horizontal scrollable pills (All, Bridal, Evening, Jewelry, Behind the Scenes, Client Stories)
- Masonry grid: 3 columns desktop, 2 tablet, 1 mobile
- Pagination: "Load More" button (20 items per page)
- Loading state: skeleton grid matching masonry layout

**Layout:**
```
┌─────────────────────────────────────┐
│  VISUAL REVERIE                     │
│  Atelier Gallery                    │
│  ─────────────                      │
│                                     │
│  [All] [Bridal] [Evening] [Jewelry] │
│  [Behind the Scenes] [Clients]      │
│                                     │
│  ┌────┐ ┌──────┐ ┌────┐            │
│  │    │ │      │ │    │            │
│  │    │ │      │ │    │            │
│  └────┘ │      │ └────┘            │
│  ┌──────┐└──────┐ ┌──────┐         │
│  │      │ ┌────┐  │      │         │
│  │      │ │ 🎬 │  │      │         │
│  └──────┘ └────┘  └────┘          │
│                                     │
│  [Load More]                        │
└─────────────────────────────────────┘
```

### GalleryGrid.tsx

Masonry layout using CSS columns (`columns-1 md:columns-2 lg:columns-3`):
- Each item has `break-inside-avoid` to prevent splitting
- Photos: full-width, natural aspect ratio
- Videos: show thumbnail with play icon overlay, autoplay muted on scroll
- Hover: subtle scale + overlay with title/category
- Click: opens lightbox

### GalleryFilters.tsx

Horizontal scrollable pill buttons:
- "All" (default, shows all items)
- Category-specific pills (populated from distinct categories in data)
- Active state: `bg-gold text-onyx`
- Inactive: `border border-stone-200 text-stone-600 hover:border-gold`
- Smooth transition on filter change

### GalleryLightbox.tsx

Full-screen overlay (`fixed inset-0 z-[1000] bg-onyx/95`):
- **Photo mode:** Centered image, max-width 90vw, max-height 85vh, subtle border
- **Video mode:** Auto-plays (muted), with controls bar (play/pause, volume, fullscreen)
- **Navigation:** Left/right arrows (desktop), swipe (mobile), ESC to close
- **Caption:** Title + category below media, gold accent
- **Close button:** Top-right, `×` icon, gold on hover
- **Keyboard:** ESC = close, Left/Right = navigate, Space = play/pause (video)

### useGallery.ts Hook

```typescript
function useGallery(options?: {
  category?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}) {
  // Returns: { items, isLoading, error, hasMore, loadMore }
  // Fetches from Supabase with filters
  // Handles pagination
  // Returns loading/error states
}
```

## Homepage Integration

### Gallery Teaser Section

Placed between "Your Bespoke Journey" and "Testimonials" sections on homepage:

- Section title: "Visual Reverie" (editorial style)
- Shows 6 featured gallery items in 2x3 masonry grid
- Videos autoplay muted on scroll (same IntersectionObserver pattern)
- Gold "View Full Gallery →" button at bottom
- Responsive: 3 columns desktop, 2 tablet, 1 mobile

## Video Autoplay Behavior

```
IntersectionObserver callback:
  entry.isIntersecting && entry.intersectionRatio > 0.3
    → video.play() + set muted = true
  !entry.isIntersecting
    → video.pause() + currentTime = 0

document.visibilitychange:
  hidden → pause all gallery videos
  visible → resume playing ones in viewport

prefers-reduced-motion: reduce
    → videos show thumbnail only, no autoplay
    → hover effects disabled
    → masonry becomes simple grid
```

## Performance Considerations

- **Lazy loading:** Images use `loading="lazy"`, videos use `data-src` swap when near viewport (200px threshold)
- **Pagination:** 20 items per page, "Load More" button (not infinite scroll — more reliable)
- **Thumbnail generation:** Client-side via `<canvas>` + `<video>` for uploaded videos, stored in Supabase Storage
- **Reduced motion:** Respects `prefers-reduced-motion: reduce` — no autoplay, no hover effects
- **Bundle size:** Gallery components lazy-loaded via `React.lazy()` (already in admin pattern)

## i18n Keys

```typescript
// English
gallery.title: "Visual Reverie"
gallery.subtitle: "Atelier Gallery"
gallery.description: "A curated collection of our finest moments"
gallery.filter_all: "All"
gallery.filter_bridal: "Bridal"
gallery.filter_evening: "Evening"
gallery.filter_jewelry: "Jewelry"
gallery.filter_bts: "Behind the Scenes"
gallery.filter_clients: "Client Stories"
gallery.load_more: "Load More"
gallery.view_full: "View Full Gallery"
gallery.back: "Back to Gallery"
gallery.no_items: "No items found in this category"
gallery.admin_title: "Gallery Management"
gallery.admin_upload: "Upload Media"
gallery.admin_edit: "Edit Item"
gallery.admin_delete: "Delete Item"
gallery.admin_featured: "Featured"
gallery.admin_sort: "Sort Order"

// Arabic
gallery.title: "تأملات بصرية"
gallery.subtitle: "معرض المشغل"
gallery.description: "مجموعة مختارة من أجمل لحظاتنا"
gallery.filter_all: "الكل"
gallery.filter_bridal: "عرايس"
gallery.filter_evening: "سهر"
gallery.filter_jewelry: "مجوهرات"
gallery.filter_bts: "خلف الكواليس"
gallery.filter_clients: "قصص العملاء"
gallery.load_more: "المزيد"
gallery.view_full: "عرض المعرض كاملاً"
gallery.back: "العودة للمعرض"
gallery.no_items: "لا توجد عناصر في هذه الفئة"
gallery.admin_title: "إدارة المعرض"
gallery.admin_upload: "رفع وسائط"
gallery.admin_edit: "تعديل العنصر"
gallery.admin_delete: "حذف العنصر"
gallery.admin_featured: "مميز"
gallery.admin_sort: "ترتيب العرض"
```

## Admin Panel: AdminGallery.tsx

### Table View

Columns: Thumbnail (40x40), Title, Category (badge), Type (icon), Sort Order, Featured (toggle), Actions (edit/delete)

### Upload Flow

1. User clicks "Upload Media" button
2. File picker opens (accepts images + videos)
3. Selected file uploads to Supabase Storage `gallery/` bucket
4. If video: generate thumbnail from first frame via `<canvas>` + `<video>`
5. DB row created with media_url, thumbnail_url, media_type
6. Item appears in gallery table + public gallery

### Edit Flow

Click edit → inline form with:
- Title (text input)
- Description (textarea)
- Category (select dropdown)
- Sort Order (number input)
- Featured (toggle switch)
- Save/Cancel buttons

### Delete Flow

Click delete → confirmation modal ("Are you sure?") → deletes from Storage + DB

### Drag-to-Reorder

Drag handle on each row → updates `sort_order` in DB on drop

## Content Curation

From the reel folder at `C:\Users\KAIS\Desktop\rimanfashion_reel`:
- **photos/**: 131 photos (34 MB total, ~0.3-0.7 MB each)
- **videos/**: 160 videos (493 MB total, ~1-12 MB each)

**Recommended curated set for initial upload:**
- 30-40 best photos (mix of bridal, evening, jewelry, behind-the-scenes)
- 10-15 best videos (short reels, 1-5 seconds ideal for autoplay)
- Focus on: dress details, fabric closeups, fitting moments, happy clients

**Category assignment:** Manual during upload (admin selects category)

## Testing

- Unit tests for `useGallery` hook (mock Supabase client)
- Component tests for `GalleryFilters` (filter selection, active state)
- Component tests for `GalleryLightbox` (open, close, navigate, keyboard)
- Integration test: upload flow (mock Supabase Storage)
- E2E: gallery page loads, filter works, lightbox opens, video autoplays

## Dependencies

- `@supabase/supabase-js` (already installed)
- `motion/react` (already installed — for lightbox animations)
- No new dependencies required

## Scope Boundaries

**In scope:**
- Gallery page with masonry grid, filters, lightbox
- Video autoplay with IntersectionObserver
- Admin panel for upload/edit/delete/reorder
- Homepage teaser section
- i18n (EN + AR)
- Performance optimizations

**Out of scope (future work):**
- Image optimization/CDN (accept current sizes)
- AI-powered content tagging
- Social sharing from gallery
- Analytics on gallery engagement
- Batch upload from admin
