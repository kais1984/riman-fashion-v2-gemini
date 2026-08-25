import { supabase } from './supabase';
import { isSupabaseConfigured } from './supabase';
import { reviewsData } from '../data/reviews';

export interface Review {
  id: string;
  productId: string;
  name: string;
  rating: number;
  comment: string;
  photoUrl?: string;
  status: 'pending' | 'approved';
  createdAt: string;
}

const LOCAL_KEY = 'riman_reviews';

function readLocal(): Review[] {
  try {
    const saved = localStorage.getItem(LOCAL_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    localStorage.removeItem(LOCAL_KEY);
  }
  return [];
}

function writeLocal(reviews: Review[]): void {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(reviews));
}

function mapDbReview(row: any): Review {
  return {
    id: row.id,
    productId: row.product_id,
    name: row.name,
    rating: row.rating,
    comment: row.comment,
    photoUrl: row.photo_url || undefined,
    status: row.status || 'approved',
    createdAt: row.created_at,
  };
}

export async function fetchApprovedReviews(productId: string): Promise<Review[]> {
  if (isSupabaseConfigured) {
    try {
      // No .eq('status') filter: the deployed table may predate the status
      // column (see migration 20260824100000). Filter client-side instead.
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || [])
        .filter(r => !r.status || r.status === 'approved')
        .map(mapDbReview);
    } catch {
      // Fall through to local storage
    }
  }
  const local = readLocal().filter(r => r.productId === productId && r.status === 'approved');
  if (local.length > 0) return local;

  return reviewsData
    .filter(r => r.productId === productId)
    .map((r, i) => ({
      id: `seed-${r.productId}-${i}`,
      productId: r.productId,
      name: r.name,
      rating: r.rating,
      comment: r.comment,
      photoUrl: r.photoUrl,
      status: 'approved' as const,
      createdAt: new Date().toISOString(),
    }));
}

export async function submitReview(review: Omit<Review, 'id' | 'status' | 'createdAt'>): Promise<Review> {
  const local: Review = {
    ...review,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      const base = {
        product_id: review.productId,
        name: review.name,
        rating: review.rating,
        comment: review.comment,
      };
      let result = await supabase
        .from('reviews')
        .insert({ ...base, photo_url: review.photoUrl || null, status: 'pending' })
        .select()
        .single();
      if (result.error) {
        // Legacy schema without status/photo_url columns
        result = await supabase.from('reviews').insert(base).select().single();
      }
      if (result.error) throw result.error;
      return mapDbReview(result.data);
    } catch {
      // Fall through to local storage
    }
  }

  writeLocal([local, ...readLocal()]);
  return local;
}

export async function fetchAllReviews(): Promise<Review[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) return (data || []).map(mapDbReview);
    } catch {
      // Fall through to local storage
    }
  }
  return readLocal();
}

export async function approveReview(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ status: 'approved' })
        .eq('id', id);
      if (!error) return;
    } catch {
      // Fall through to local storage
    }
  }
  writeLocal(readLocal().map(r => (r.id === id ? { ...r, status: 'approved' } : r)));
}

export async function deleteReview(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);
      if (!error) return;
    } catch {
      // Fall through to local storage
    }
  }
  writeLocal(readLocal().filter(r => r.id !== id));
}
