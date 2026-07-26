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
