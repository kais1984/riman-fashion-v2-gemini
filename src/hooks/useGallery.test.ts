import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useGallery } from './useGallery';

const mockData = [
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
];

const mockRangeResult = { data: mockData, error: null, count: 1 };

function createMockChain() {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  const resolve = vi.fn(() => Promise.resolve(mockRangeResult));

  chain.select = vi.fn(() => chain);
  chain.order = vi.fn(() => chain);
  chain.eq = vi.fn(() => chain);
  chain.range = resolve;

  return chain;
}

let mockChain = createMockChain();

vi.mock('../services/supabase', () => ({
  get supabase() {
    return {
      from: vi.fn(() => mockChain),
    };
  },
}));

describe('useGallery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockChain = createMockChain();
  });

  it('returns items after loading', async () => {
    const { result } = renderHook(() => useGallery());
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].title).toBe('Test Photo');
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
