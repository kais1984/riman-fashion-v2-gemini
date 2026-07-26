# Immersive Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Unsplash stock gallery with a Supabase-backed immersive masonry gallery featuring real Riman Fashion photos + videos, with category filters, video autoplay, lightbox, and admin management.

**Architecture:** Supabase `gallery_items` table + `gallery` Storage bucket. Frontend: masonry grid via CSS columns, IntersectionObserver for video autoplay, full-screen lightbox. Admin panel for upload/edit/delete/reorder.

**Tech Stack:** React 19, TypeScript, Supabase JS, motion/react, Vitest + @testing-library/react

## Global Constraints

- React 19 + Vite + TypeScript + Tailwind CSS v4
- Design system: onyx (#0A0A0A), gold (#D4AF37), bone (#FDFBF7), ivory (#FFFDF9), pearl (#F3F1ED), sharp edges, no border-radius, no shadows
- Fonts: Plus Jakarta Sans (headings), Playfair Display (editorial), Inter (body)
- Supabase client at `src/services/supabase.ts`
- Existing test pattern: Vitest + @testing-library/react, tests in `*.test.ts` / `*.test.tsx` co-located
- i18n via `useLanguage()` hook from `src/contexts/LanguageContext.tsx`
- No new npm dependencies

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/hooks/useGallery.ts` | Supabase data fetching hook |
| Create | `src/components/GalleryFilters.tsx` | Category filter pills |
| Create | `src/components/GalleryGrid.tsx` | Masonry grid with video autoplay |
| Create | `src/components/GalleryLightbox.tsx` | Full-screen lightbox |
| Create | `src/pages/GalleryPage.tsx` | Full rewrite (replaces existing) |
| Create | `src/pages/admin/AdminGallery.tsx` | Admin upload/edit/delete panel |
| Create | `src/hooks/useGallery.test.ts` | Hook unit tests |
| Create | `src/components/GalleryFilters.test.tsx` | Filter component tests |
| Create | `src/components/GalleryLightbox.test.tsx` | Lightbox component tests |
| Modify | `src/pages/Index.tsx` | Add Gallery Teaser section |
| Modify | `src/pages/admin/AdminLayout.tsx` | Add Gallery nav item |
| Modify | `src/App.tsx` | Add admin gallery route |
| Modify | `src/contexts/LanguageContext.tsx` | Add gallery i18n keys |
| Modify | `src/index.css` | Add gallery-specific styles |

---

### Task 1: Database Setup (Supabase SQL)

**Files:**
- Create: `supabase/migrations/20260721000000_create_gallery_items.sql`

**Interfaces:**
- Produces: `gallery_items` table, RLS policies, `gallery` storage bucket

- [ ] **Step 1: Create migration file**

```sql
-- supabase/migrations/20260721000000_create_gallery_items.sql

-- Gallery items table
CREATE TABLE gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'bridal',
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'photo',
  thumbnail_url TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_gallery_category ON gallery_items(category);
CREATE INDEX idx_gallery_featured ON gallery_items(is_featured) WHERE is_featured = true;
CREATE INDEX idx_gallery_sort ON gallery_items(sort_order);

-- RLS policies
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON gallery_items
  FOR SELECT USING (true);

CREATE POLICY "Authenticated insert" ON gallery_items
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated update" ON gallery_items
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated delete" ON gallery_items
  FOR DELETE USING (auth.role() = 'authenticated');
```

- [ ] **Step 2: Create storage bucket policy**

```sql
-- Run in Supabase SQL Editor after the migration

-- Create the gallery storage bucket (do via Supabase Dashboard > Storage > New Bucket)
-- Bucket name: gallery
-- Public: yes
-- File size limit: 50MB
-- Allowed MIME types: image/jpeg, image/png, image/webp, video/mp4, video/webm

-- Storage RLS policies
CREATE POLICY "Public read access for gallery storage" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery');

CREATE POLICY "Authenticated upload to gallery" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'gallery' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated delete from gallery" ON storage.objects
  FOR DELETE USING (bucket_id = 'gallery' AND auth.role() = 'authenticated');
```

- [ ] **Step 3: Run migration in Supabase Dashboard**

Go to Supabase Dashboard → SQL Editor → paste the migration SQL → Run.
Then go to Storage → New Bucket → name `gallery`, public = true, 50MB limit.

- [ ] **Step 4: Commit**

```bash
git add supabase/
git commit -m "feat(gallery): add gallery_items table and storage bucket"
```

---

### Task 2: useGallery Hook

**Files:**
- Create: `src/hooks/useGallery.ts`
- Create: `src/hooks/useGallery.test.ts`

**Interfaces:**
- Consumes: `supabase` client from `src/services/supabase.ts`
- Produces: `useGallery(options?)` → `{ items, isLoading, error, hasMore, loadMore, totalCount }`

- [ ] **Step 1: Create useGallery.ts**

```typescript
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  category: string;
  media_url: string;
  media_type: 'photo' | 'video';
  thumbnail_url: string;
  sort_order: number;
  is_featured: boolean;
  created_at: string;
}

interface UseGalleryOptions {
  category?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}

interface UseGalleryReturn {
  items: GalleryItem[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number;
  loadMore: () => void;
  refresh: () => void;
}

const PAGE_SIZE = 20;

export function useGallery(options: UseGalleryOptions = {}): UseGalleryReturn {
  const { category, featured, limit = PAGE_SIZE, offset = 0 } = options;
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchItems = useCallback(async (currentOffset: number, append: boolean = false) => {
    if (!supabase) {
      setError('Supabase not configured');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('gallery_items')
        .select('*', { count: 'exact' })
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      if (featured !== undefined) {
        query = query.eq('is_featured', featured);
      }

      query = query.range(currentOffset, currentOffset + limit - 1);

      const { data, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;

      const newItems = (data || []) as GalleryItem[];

      if (append) {
        setItems(prev => [...prev, ...newItems]);
      } else {
        setItems(newItems);
      }

      setTotalCount(count || 0);
      setHasMore(newItems.length === limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch gallery');
    } finally {
      setIsLoading(false);
    }
  }, [category, featured, limit]);

  useEffect(() => {
    fetchItems(offset);
  }, [fetchItems, offset]);

  const loadMore = useCallback(() => {
    fetchItems(items.length, true);
  }, [fetchItems, items.length]);

  const refresh = useCallback(() => {
    fetchItems(0);
  }, [fetchItems]);

  return { items, isLoading, error, hasMore, totalCount, loadMore, refresh };
}
```

- [ ] **Step 2: Create useGallery.test.ts**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useGallery } from './useGallery';

const mockSelect = vi.fn();
const mockFrom = vi.fn();
const mockOrder = vi.fn();
const mockEq = vi.fn();
const mockRange = vi.fn();

vi.mock('../../services/supabase', () => ({
  supabase: {
    from: (...args: any[]) => {
      mockFrom(...args);
      return {
        select: (...args: any[]) => {
          mockSelect(...args);
          return {
            order: (...args: any[]) => {
              mockOrder(...args);
              return {
                eq: (...args: any[]) => {
                  mockEq(...args);
                  return {
                    eq: (...args: any[]) => {
                      mockEq(...args);
                      return {
                        range: (...args: any[]) => {
                          mockRange(...args);
                          return Promise.resolve({
                            data: [
                              {
                                id: '1',
                                title: 'Test Photo',
                                description: '',
                                category: 'bridal',
                                media_url: '/assets/test.jpg',
                                media_type: 'photo',
                                thumbnail_url: '',
                                sort_order: 0,
                                is_featured: false,
                                created_at: '2026-01-01',
                              },
                            ],
                            error: null,
                            count: 1,
                          });
                        },
                      };
                    },
                  };
                },
              };
            },
          };
        },
      };
    },
  },
}));

describe('useGallery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns items after loading', async () => {
    const { result } = renderHook(() => useGallery());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].title).toBe('Test Photo');
  });

  it('returns error when supabase is null', async () => {
    // This tests the guard clause
    const { result } = renderHook(() => useGallery());
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('exposes loadMore function', async () => {
    const { result } = renderHook(() => useGallery());
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(typeof result.current.loadMore).toBe('function');
  });

  it('exposes refresh function', async () => {
    const { result } = renderHook(() => useGallery());
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(typeof result.current.refresh).toBe('function');
  });
});
```

- [ ] **Step 3: Run tests**

Run: `npx vitest run src/hooks/useGallery.test.ts`
Expected: PASS (or adjust mock to match actual Supabase client shape)

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useGallery.ts src/hooks/useGallery.test.ts
git commit -m "feat(gallery): add useGallery hook with Supabase fetching"
```

---

### Task 3: GalleryFilters Component

**Files:**
- Create: `src/components/GalleryFilters.tsx`
- Create: `src/components/GalleryFilters.test.tsx`

**Interfaces:**
- Consumes: `useLanguage()` for i18n
- Produces: `<GalleryFilters activeCategory, onCategoryChange />`

- [ ] **Step 1: Create GalleryFilters.tsx**

```typescript
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';

const CATEGORIES = [
  { key: 'all', i18nKey: 'gallery.filter_all' },
  { key: 'bridal', i18nKey: 'gallery.filter_bridal' },
  { key: 'evening', i18nKey: 'gallery.filter_evening' },
  { key: 'jewelry', i18nKey: 'gallery.filter_jewelry' },
  { key: 'behind_scenes', i18nKey: 'gallery.filter_bts' },
  { key: 'client_stories', i18nKey: 'gallery.filter_clients' },
];

interface GalleryFiltersProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  className?: string;
}

export default function GalleryFilters({ activeCategory, onCategoryChange, className }: GalleryFiltersProps) {
  const { t } = useLanguage();

  return (
    <div className={cn('flex flex-wrap gap-3 justify-center', className)}>
      {CATEGORIES.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onCategoryChange(cat.key)}
          className={cn(
            'relative px-5 py-2 text-[10px] tracking-[0.3em] uppercase font-bold transition-all duration-300 border overflow-hidden',
            activeCategory === cat.key
              ? 'bg-gold text-onyx border-gold'
              : 'border-stone-200 text-stone-600 hover:border-gold hover:text-gold'
          )}
        >
          {activeCategory === cat.key && (
            <motion.span
              layoutId="activeFilter"
              className="absolute inset-0 bg-gold"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">{t(cat.i18nKey)}</span>
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create GalleryFilters.test.tsx**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GalleryFilters from './GalleryFilters';
import { BrowserRouter } from 'react-router-dom';

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
}

describe('GalleryFilters', () => {
  it('renders all category buttons', () => {
    renderWithProviders(
      <GalleryFilters activeCategory="all" onCategoryChange={vi.fn()} />
    );
    expect(screen.getByText('All')).toBeDefined();
    expect(screen.getByText('Bridal')).toBeDefined();
    expect(screen.getByText('Evening')).toBeDefined();
    expect(screen.getByText('Jewelry')).toBeDefined();
  });

  it('calls onCategoryChange when a filter is clicked', () => {
    const onChange = vi.fn();
    renderWithProviders(
      <GalleryFilters activeCategory="all" onCategoryChange={onChange} />
    );
    fireEvent.click(screen.getByText('Bridal'));
    expect(onChange).toHaveBeenCalledWith('bridal');
  });

  it('highlights the active category', () => {
    renderWithProviders(
      <GalleryFilters activeCategory="bridal" onCategoryChange={vi.fn()} />
    );
    const bridalBtn = screen.getByText('Bridal');
    expect(bridalBtn.closest('button')).toHaveClass('bg-gold');
  });
});
```

- [ ] **Step 3: Run tests**

Run: `npx vitest run src/components/GalleryFilters.test.tsx`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/GalleryFilters.tsx src/components/GalleryFilters.test.tsx
git commit -m "feat(gallery): add GalleryFilters component with category pills"
```

---

### Task 4: GalleryGrid Component

**Files:**
- Create: `src/components/GalleryGrid.tsx`

**Interfaces:**
- Consumes: `GalleryItem` type from `useGallery`, `usePrefersReducedMotion` (inline)
- Produces: `<GalleryGrid items, onItemClick />`

- [ ] **Step 1: Create GalleryGrid.tsx**

```typescript
import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Play, Image as ImageIcon } from 'lucide-react';
import type { GalleryItem } from '../hooks/useGallery';

interface GalleryGridProps {
  items: GalleryItem[];
  onItemClick: (item: GalleryItem, index: number) => void;
}

function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
}

function GalleryVideoItem({ item, onClick, index }: { item: GalleryItem; onClick: () => void; index: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const video = videoRef.current;
    if (!video || prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
          video.play().catch(() => {});
        } else {
          video.pause();
          video.currentTime = 0;
        }
      },
      { threshold: [0.3] }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="break-inside-avoid mb-4 relative group cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      <video
        ref={videoRef}
        src={item.media_url}
        poster={item.thumbnail_url || undefined}
        muted
        loop
        playsInline
        preload="metadata"
        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/30 transition-colors duration-300" />
      <div className="absolute bottom-3 left-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Play className="w-4 h-4 text-white fill-white" />
        <span className="text-white text-[10px] tracking-widest uppercase font-bold">{item.title}</span>
      </div>
    </motion.div>
  );
}

function GalleryPhotoItem({ item, onClick, index }: { item: GalleryItem; onClick: () => void; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="break-inside-avoid mb-4 relative group cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      <img
        src={item.media_url}
        alt={item.title}
        loading="lazy"
        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/30 transition-colors duration-300" />
      <div className="absolute bottom-3 left-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <ImageIcon className="w-4 h-4 text-white" />
        <span className="text-white text-[10px] tracking-widest uppercase font-bold">{item.title}</span>
      </div>
    </motion.div>
  );
}

export default function GalleryGrid({ items, onItemClick }: GalleryGridProps) {
  return (
    <div className="columns-1 md:columns-2 lg:columns-3 gap-4">
      {items.map((item, index) =>
        item.media_type === 'video' ? (
          <GalleryVideoItem
            key={item.id}
            item={item}
            onClick={() => onItemClick(item, index)}
            index={index}
          />
        ) : (
          <GalleryPhotoItem
            key={item.id}
            item={item}
            onClick={() => onItemClick(item, index)}
            index={index}
          />
        )
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/GalleryGrid.tsx
git commit -m "feat(gallery): add GalleryGrid with masonry layout and video autoplay"
```

---

### Task 5: GalleryLightbox Component

**Files:**
- Create: `src/components/GalleryLightbox.tsx`
- Create: `src/components/GalleryLightbox.test.tsx`

**Interfaces:**
- Consumes: `GalleryItem` type from `useGallery`
- Produces: `<GalleryLightbox items, currentIndex, isOpen, onClose, onNavigate />`

- [ ] **Step 1: Create GalleryLightbox.tsx**

```typescript
import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { GalleryItem } from '../hooks/useGallery';

interface GalleryLightboxProps {
  items: GalleryItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function GalleryLightbox({ items, currentIndex, isOpen, onClose, onNavigate }: GalleryLightboxProps) {
  const currentItem = items[currentIndex];

  const goNext = useCallback(() => {
    if (currentIndex < items.length - 1) {
      onNavigate(currentIndex + 1);
    }
  }, [currentIndex, items.length, onNavigate]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  }, [currentIndex, onNavigate]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowRight':
          goNext();
          break;
        case 'ArrowLeft':
          goPrev();
          break;
        case ' ':
          e.preventDefault();
          const video = document.querySelector('.lightbox-video') as HTMLVideoElement;
          if (video) {
            video.paused ? video.play() : video.pause();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, goNext, goPrev]);

  if (!currentItem) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[1000] bg-onyx/95 flex flex-col items-center justify-center"
          onClick={onClose}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-[1001] text-white/60 hover:text-gold transition-colors"
            aria-label="Close lightbox"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Counter */}
          <div className="absolute top-6 left-6 z-[1001] text-white/40 text-xs tracking-[0.3em] uppercase">
            {currentIndex + 1} / {items.length}
          </div>

          {/* Previous button */}
          {currentIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-4 md:left-8 z-[1001] text-white/40 hover:text-gold transition-colors"
              aria-label="Previous item"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>
          )}

          {/* Next button */}
          {currentIndex < items.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-4 md:right-8 z-[1001] text-white/40 hover:text-gold transition-colors"
              aria-label="Next item"
            >
              <ChevronRight className="w-10 h-10" />
            </button>
          )}

          {/* Media */}
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="max-w-[90vw] max-h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {currentItem.media_type === 'video' ? (
              <video
                src={currentItem.media_url}
                controls
                autoPlay
                muted
                className="lightbox-video max-w-full max-h-[85vh] object-contain"
              />
            ) : (
              <img
                src={currentItem.media_url}
                alt={currentItem.title}
                className="max-w-full max-h-[85vh] object-contain"
              />
            )}
          </motion.div>

          {/* Caption */}
          <div className="absolute bottom-6 left-0 right-0 text-center z-[1001]">
            <h3 className="text-white font-heading text-lg tracking-widest uppercase mb-1">
              {currentItem.title}
            </h3>
            <p className="text-gold text-[10px] tracking-[0.3em] uppercase">
              {currentItem.category.replace('_', ' ')}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Create GalleryLightbox.test.tsx**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GalleryLightbox from './GalleryLightbox';
import type { GalleryItem } from '../hooks/useGallery';

const mockItems: GalleryItem[] = [
  {
    id: '1',
    title: 'Test Photo',
    description: '',
    category: 'bridal',
    media_url: '/assets/test.jpg',
    media_type: 'photo',
    thumbnail_url: '',
    sort_order: 0,
    is_featured: false,
    created_at: '2026-01-01',
  },
  {
    id: '2',
    title: 'Test Video',
    description: '',
    category: 'evening',
    media_url: '/assets/test.mp4',
    media_type: 'video',
    thumbnail_url: '',
    sort_order: 1,
    is_featured: false,
    created_at: '2026-01-02',
  },
];

describe('GalleryLightbox', () => {
  it('renders nothing when closed', () => {
    render(
      <GalleryLightbox
        items={mockItems}
        currentIndex={0}
        isOpen={false}
        onClose={vi.fn()}
        onNavigate={vi.fn()}
      />
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders when open', () => {
    render(
      <GalleryLightbox
        items={mockItems}
        currentIndex={0}
        isOpen={true}
        onClose={vi.fn()}
        onNavigate={vi.fn()}
      />
    );
    expect(screen.getByText('Test Photo')).toBeDefined();
    expect(screen.getByText('1 / 2')).toBeDefined();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <GalleryLightbox
        items={mockItems}
        currentIndex={0}
        isOpen={true}
        onClose={onClose}
        onNavigate={vi.fn()}
      />
    );
    fireEvent.click(screen.getByLabelText('Close lightbox'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onNavigate when next button is clicked', () => {
    const onNavigate = vi.fn();
    render(
      <GalleryLightbox
        items={mockItems}
        currentIndex={0}
        isOpen={true}
        onClose={vi.fn()}
        onNavigate={onNavigate}
      />
    );
    fireEvent.click(screen.getByLabelText('Next item'));
    expect(onNavigate).toHaveBeenCalledWith(1);
  });

  it('does not render prev button on first item', () => {
    render(
      <GalleryLightbox
        items={mockItems}
        currentIndex={0}
        isOpen={true}
        onClose={vi.fn()}
        onNavigate={vi.fn()}
      />
    );
    expect(screen.queryByLabelText('Previous item')).toBeNull();
  });

  it('does not render next button on last item', () => {
    render(
      <GalleryLightbox
        items={mockItems}
        currentIndex={1}
        isOpen={true}
        onClose={vi.fn()}
        onNavigate={vi.fn()}
      />
    );
    expect(screen.queryByLabelText('Next item')).toBeNull();
  });
});
```

- [ ] **Step 3: Run tests**

Run: `npx vitest run src/components/GalleryLightbox.test.tsx`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/GalleryLightbox.tsx src/components/GalleryLightbox.test.tsx
git commit -m "feat(gallery): add GalleryLightbox with keyboard nav and swipe"
```

---

### Task 6: GalleryPage Rewrite

**Files:**
- Create: `src/pages/GalleryPage.tsx` (replaces existing)

**Interfaces:**
- Consumes: `useGallery` hook, `GalleryFilters`, `GalleryGrid`, `GalleryLightbox`, `useLanguage`
- Produces: Full gallery page at `/gallery`

- [ ] **Step 1: Create GalleryPage.tsx**

```typescript
import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useGallery, GalleryItem } from '../hooks/useGallery';
import GalleryFilters from '../components/GalleryFilters';
import GalleryGrid from '../components/GalleryGrid';
import GalleryLightbox from '../components/GalleryLightbox';

export default function GalleryPage() {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const { items, isLoading, error, hasMore, loadMore } = useGallery({
    category: activeCategory === 'all' ? undefined : activeCategory,
  });

  const handleItemClick = useCallback((item: GalleryItem, index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category);
  }, []);

  return (
    <div className="pt-32 pb-20 bg-ivory min-h-screen">
      {/* Header */}
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="heading-editorial text-gold text-[10px] mb-4 uppercase tracking-[0.4em]"
          >
            {t('gallery.title')}
          </motion.h2>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-heading text-4xl md:text-6xl text-stone-800 tracking-wider mb-6"
          >
            {t('gallery.subtitle')}
          </motion.h1>
          <div className="w-16 h-px bg-gold mx-auto mb-8" />
          <p className="text-stone-500 text-sm tracking-wide max-w-xl mx-auto">
            {t('gallery.description')}
          </p>
        </div>

        {/* Filters */}
        <GalleryFilters
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          className="mb-16"
        />

        {/* Grid */}
        {isLoading && items.length === 0 ? (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="break-inside-avoid mb-4 bg-stone-100 animate-pulse" style={{ height: `${200 + (i % 3) * 100}px` }} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-stone-500 text-sm">{error}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-stone-500 text-sm">{t('gallery.no_items')}</p>
          </div>
        ) : (
          <>
            <GalleryGrid items={items} onItemClick={handleItemClick} />

            {/* Load More */}
            {hasMore && (
              <div className="text-center mt-16">
                <button
                  onClick={loadMore}
                  className="btn-luxury-outline"
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : t('gallery.load_more')}
                </button>
              </div>
            )}
          </>
        )}

        {/* Back to home */}
        <div className="text-center mt-16">
          <Link to="/" className="inline-flex items-center gap-2 text-gold text-xs tracking-widest uppercase hover:gap-4 transition-all pb-1 border-b border-gold/30 font-medium">
            {t('gallery.back')} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Lightbox */}
      <GalleryLightbox
        items={items}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
}
```

- [ ] **Step 2: Delete old GalleryPage.tsx content**

The new file completely replaces the old one. Just overwrite.

- [ ] **Step 3: Commit**

```bash
git add src/pages/GalleryPage.tsx
git commit -m "feat(gallery): rewrite GalleryPage with masonry grid and filters"
```

---

### Task 7: i18n Keys

**Files:**
- Modify: `src/contexts/LanguageContext.tsx`

**Interfaces:**
- Consumes: existing translation map structure
- Produces: gallery i18n keys in both EN and AR

- [ ] **Step 1: Add gallery keys to LanguageContext.tsx**

Open `src/contexts/Languages.tsx` and add the following keys to the `en` object (after the existing keys):

```typescript
    // Gallery
    'gallery.title': 'Visual Reverie',
    'gallery.subtitle': 'Atelier Gallery',
    'gallery.description': 'A curated collection of our finest moments',
    'gallery.filter_all': 'All',
    'gallery.filter_bridal': 'Bridal',
    'gallery.filter_evening': 'Evening',
    'gallery.filter_jewelry': 'Jewelry',
    'gallery.filter_bts': 'Behind the Scenes',
    'gallery.filter_clients': 'Client Stories',
    'gallery.load_more': 'Load More',
    'gallery.view_full': 'View Full Gallery',
    'gallery.back': 'Back to Gallery',
    'gallery.no_items': 'No items found in this category',
    'gallery.admin_title': 'Gallery Management',
    'gallery.admin_upload': 'Upload Media',
    'gallery.admin_edit': 'Edit Item',
    'gallery.admin_delete': 'Delete Item',
    'gallery.admin_featured': 'Featured',
    'gallery.admin_sort': 'Sort Order',
```

Add the following keys to the `ar` object:

```typescript
    // Gallery
    'gallery.title': 'تأملات بصرية',
    'gallery.subtitle': 'معرض المشغل',
    'gallery.description': 'مجموعة مختارة من أجمل لحظاتنا',
    'gallery.filter_all': 'الكل',
    'gallery.filter_bridal': 'عرايس',
    'gallery.filter_evening': 'سهر',
    'gallery.filter_jewelry': 'مجوهرات',
    'gallery.filter_bts': 'خلف الكواليس',
    'gallery.filter_clients': 'قصص العملاء',
    'gallery.load_more': 'المزيد',
    'gallery.view_full': 'عرض المعرض كاملاً',
    'gallery.back': 'العودة للمعرض',
    'gallery.no_items': 'لا توجد عناصر في هذه الفئة',
    'gallery.admin_title': 'إدارة المعرض',
    'gallery.admin_upload': 'رفع وسائط',
    'gallery.admin_edit': 'تعديل العنصر',
    'gallery.admin_delete': 'حذف العنصر',
    'gallery.admin_featured': 'مميز',
    'gallery.admin_sort': 'ترتيب العرض',
```

- [ ] **Step 2: Commit**

```bash
git add src/contexts/LanguageContext.tsx
git commit -m "feat(gallery): add i18n keys for gallery (EN + AR)"
```

---

### Task 8: Admin Gallery Panel

**Files:**
- Create: `src/pages/admin/AdminGallery.tsx`
- Modify: `src/pages/admin/AdminLayout.tsx` (add nav item)
- Modify: `src/App.tsx` (add route)

**Interfaces:**
- Consumes: `supabase` client, `GalleryItem` type, `useLanguage`
- Produces: Admin gallery management page at `/admin/gallery`

- [ ] **Step 1: Create AdminGallery.tsx**

```typescript
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Trash2, Edit2, GripVertical, Star, StarOff, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../services/supabase';
import type { GalleryItem } from '../../hooks/useGallery';
import { cn } from '../../lib/utils';

const CATEGORIES = [
  { value: 'bridal', label: 'Bridal' },
  { value: 'evening', label: 'Evening' },
  { value: 'jewelry', label: 'Jewelry' },
  { value: 'behind_scenes', label: 'Behind the Scenes' },
  { value: 'client_stories', label: 'Client Stories' },
];

export default function AdminGallery() {
  const { t } = useLanguage();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', category: 'bridal', sort_order: 0, is_featured: false });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = async () => {
    if (!supabase) return;
    setIsLoading(true);
    const { data } = await supabase
      .from('gallery_items')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    setItems((data || []) as GalleryItem[]);
    setIsLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const generateThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('video/')) {
        resolve('');
        return;
      }
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      video.preload = 'metadata';
      video.src = URL.createObjectURL(file);
      video.onloadeddata = () => {
        video.currentTime = 1;
      };
      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx?.drawImage(video, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
        URL.revokeObjectURL(video.src);
      };
    });
  };

  const uploadBase64ToStorage = async (base64: string, path: string): Promise<string> => {
    const res = await fetch(base64);
    const blob = await res.blob();
    const { data } = await supabase!.storage.from('gallery').upload(path, blob, {
      contentType: 'image/jpeg',
      upsert: true,
    });
    return supabase!.storage.from('gallery').getPublicUrl(data!.path).publicUrl;
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabase) return;

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `gallery/${Date.now()}.${ext}`;
      const { data: uploadData } = await supabase.storage.from('gallery').upload(path, file);

      if (uploadData) {
        const mediaUrl = supabase.storage.from('gallery').getPublicUrl(uploadData.path).publicUrl;
        const mediaType = file.type.startsWith('video/') ? 'video' : 'photo';
        let thumbnailUrl = '';

        if (mediaType === 'video') {
          const base64Thumb = await generateThumbnail(file);
          if (base64Thumb) {
            const thumbPath = `gallery/thumb_${Date.now()}.jpg`;
            thumbnailUrl = await uploadBase64ToStorage(base64Thumb, thumbPath);
          }
        }

        await supabase.from('gallery_items').insert({
          title: '',
          description: '',
          category: 'bridal',
          media_url: mediaUrl,
          media_type: mediaType,
          thumbnail_url: thumbnailUrl,
          sort_order: items.length,
          is_featured: false,
        });

        await fetchItems();
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingId(item.id);
    setEditForm({
      title: item.title,
      description: item.description,
      category: item.category,
      sort_order: item.sort_order,
      is_featured: item.is_featured,
    });
  };

  const handleSave = async () => {
    if (!editingId || !supabase) return;
    await supabase.from('gallery_items').update(editForm).eq('id', editingId);
    setEditingId(null);
    await fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    await supabase.from('gallery_items').delete().eq('id', id);
    setDeleteConfirm(null);
    await fetchItems();
  };

  const handleToggleFeatured = async (item: GalleryItem) => {
    if (!supabase) return;
    await supabase.from('gallery_items').update({ is_featured: !item.is_featured }).eq('id', item.id);
    await fetchItems();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-2xl tracking-widest uppercase">{t('gallery.admin_title')}</h1>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 bg-gold text-onyx text-xs tracking-widest uppercase font-bold hover:bg-gold/90 transition-colors disabled:opacity-50"
        >
          <Upload className="w-4 h-4" />
          {uploading ? 'Uploading...' : t('gallery.admin_upload')}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-stone-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-200 text-[10px] tracking-widest uppercase text-stone-500">
              <th className="text-left p-4 w-16"></th>
              <th className="text-left p-4">Media</th>
              <th className="text-left p-4">Title</th>
              <th className="text-left p-4">Category</th>
              <th className="text-left p-4">Type</th>
              <th className="text-left p-4">Order</th>
              <th className="text-left p-4">Featured</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                <td className="p-4">
                  <GripVertical className="w-4 h-4 text-stone-300" />
                </td>
                <td className="p-4">
                  {item.media_type === 'video' ? (
                    <video src={item.thumbnail_url || item.media_url} className="w-16 h-16 object-cover" />
                  ) : (
                    <img src={item.media_url} alt="" className="w-16 h-16 object-cover" />
                  )}
                </td>
                <td className="p-4">
                  {editingId === item.id ? (
                    <input
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="border border-stone-200 px-2 py-1 text-xs w-full"
                    />
                  ) : (
                    <span className="text-xs">{item.title || '(untitled)'}</span>
                  )}
                </td>
                <td className="p-4">
                  {editingId === item.id ? (
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      className="border border-stone-200 px-2 py-1 text-xs"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="inline-block px-2 py-1 bg-stone-100 text-[10px] tracking-widest uppercase">
                      {item.category.replace('_', ' ')}
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <span className="text-[10px] tracking-widest uppercase">{item.media_type}</span>
                </td>
                <td className="p-4">
                  {editingId === item.id ? (
                    <input
                      type="number"
                      value={editForm.sort_order}
                      onChange={(e) => setEditForm({ ...editForm, sort_order: parseInt(e.target.value) || 0 })}
                      className="border border-stone-200 px-2 py-1 text-xs w-16"
                    />
                  ) : (
                    <span className="text-xs">{item.sort_order}</span>
                  )}
                </td>
                <td className="p-4">
                  <button onClick={() => handleToggleFeatured(item)} className="text-gold hover:text-gold/70 transition-colors">
                    {item.is_featured ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                  </button>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {editingId === item.id ? (
                      <>
                        <button onClick={handleSave} className="text-xs text-gold hover:text-gold/70 font-bold">Save</button>
                        <button onClick={() => setEditingId(null)} className="text-xs text-stone-400 hover:text-stone-600">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(item)} className="text-stone-400 hover:text-gold transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteConfirm(item.id)} className="text-stone-400 hover:text-rose-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-6"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white p-8 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-heading text-lg tracking-widest uppercase mb-4">Delete Item?</h3>
              <p className="text-stone-500 text-sm mb-6">This action cannot be undone.</p>
              <div className="flex gap-4">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 border border-stone-200 text-xs tracking-widest uppercase hover:border-gold">
                  Cancel
                </button>
                <button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="flex-1 px-4 py-2 bg-rose-500 text-white text-xs tracking-widest uppercase hover:bg-rose-600">
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: Add Gallery nav item to AdminLayout.tsx**

In `src/pages/admin/AdminLayout.tsx`, add to the `adminNav` array (after the Content entry):

```typescript
import { LayoutDashboard, Package, ShoppingCart, Calendar, FileText, Settings, LogOut, ChevronRight, CalendarCheck, X, Images } from 'lucide-react';

// In adminNav array:
{ label: "Gallery", path: "/admin/gallery", icon: Images },
```

- [ ] **Step 3: Add route to App.tsx**

In `src/App.tsx`, add after the existing admin routes (inside the `/admin` Route):

```typescript
import { lazy } from 'react';

// Add alongside other lazy admin imports:
const AdminGallery = lazy(() => import('./pages/admin/AdminGallery'));

// Add inside the admin Route children:
<Route path="gallery" element={<AdminGallery />} />
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/admin/AdminGallery.tsx src/pages/admin/AdminLayout.tsx src/App.tsx
git commit -m "feat(gallery): add admin gallery management panel with upload"
```

---

### Task 9: Homepage Gallery Teaser

**Files:**
- Modify: `src/pages/Index.tsx`

**Interfaces:**
- Consumes: `useGallery` (featured items), `GalleryGrid`, `useLanguage`
- Produces: Teaser section between Bespoke Journey and Testimonials

- [ ] **Step 1: Add Gallery Teaser to Index.tsx**

Import at the top of `src/pages/Index.tsx`:

```typescript
import GalleryGrid from '../components/GalleryGrid';
import { useGallery } from '../hooks/useGallery';
```

Add the following section between the Bespoke Journey section (`{/* The Riman Bespoke Journey */}`) and the Testimonials section (`{/* Testimonials */}`):

```tsx
      {/* Visual Reverie — Gallery Teaser */}
      <section className="section-padding bg-onyx relative overflow-hidden">
        <ScrollReveal>
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div className="max-w-xl">
                <div className="flex items-center gap-3 text-gold mb-4">
                  <span className="text-[10px] tracking-[0.4em] uppercase font-bold">{t('gallery.title')}</span>
                </div>
                <h2 className="heading-display text-5xl md:text-7xl text-white">{t('gallery.subtitle')}</h2>
              </div>
              <Link to="/gallery" className="btn-luxury-outline !border-gold/30 !text-gold hover:!bg-gold hover:!text-onyx uppercase tracking-[0.3em] font-bold">
                {t('gallery.view_full')}
              </Link>
            </div>

            <GalleryTeaserGrid />
          </div>
        </ScrollReveal>
      </section>
```

Add a helper component inside `Index.tsx` (after the `Home` function, or as a separate component):

```tsx
function GalleryTeaserGrid() {
  const { items } = useGallery({ featured: true, limit: 6 });
  const [, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const handleItemClick = (_item: any, index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (items.length === 0) return null;

  return (
    <>
      <GalleryGrid items={items} onItemClick={handleItemClick} />
      <GalleryLightbox
        items={items}
        currentIndex={lightboxIndex}
        isOpen={false}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
      />
    </>
  );
}
```

Also import `GalleryLightbox` at the top:

```typescript
import GalleryLightbox from '../components/GalleryLightbox';
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/Index.tsx
git commit -m "feat(gallery): add gallery teaser section to homepage"
```

---

### Task 10: Gallery CSS Styles

**Files:**
- Modify: `src/index.css`

**Interfaces:**
- Consumes: existing CSS variable patterns
- Produces: gallery-specific styles

- [ ] **Step 1: Add gallery styles to index.css**

Append the following to `src/index.css`:

```css
/* Gallery masonry responsive */
@media (max-width: 768px) {
  .columns-1 {
    columns: 1 !important;
  }
}

/* Lightbox video controls styling */
.lightbox-video::-webkit-media-controls-panel {
  background: rgba(10, 10, 10, 0.8);
}

.lightbox-video::-webkit-media-controls-button {
  filter: invert(1);
}

/* Gallery filter transition */
.gallery-filter-enter {
  opacity: 0;
  transform: translateY(10px);
}

.gallery-filter-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 300ms, transform 300ms;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/index.css
git commit -m "feat(gallery): add gallery-specific CSS styles"
```

---

### Task 11: Final Integration Test

**Files:**
- Run: `npm run build`
- Run: `npm test`

- [ ] **Step 1: Run build**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 2: Run all tests**

Run: `npm test`
Expected: All tests pass (existing + new gallery tests)

- [ ] **Step 3: Fix any issues**

If build or tests fail, fix the issues and re-run.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat(gallery): complete immersive gallery implementation"
```

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-21-immersive-gallery.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
