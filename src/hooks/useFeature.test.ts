import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFeature } from './useFeature';

const SETTINGS_KEY = 'riman_admin_settings';

beforeEach(() => {
  localStorage.clear();
});

describe('useFeature', () => {
  it('returns false for newsletter (disabled by default)', () => {
    const { result } = renderHook(() => useFeature('newsletter'));
    expect(result.current).toBe(false);
  });

  it('returns false for disabled features', () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({
      features: { newsletter: false },
    }));
    const { result } = renderHook(() => useFeature('newsletter'));
    expect(result.current).toBe(false);
  });

  it('returns true for unknown features', () => {
    const { result } = renderHook(() => useFeature('unknownFeature'));
    expect(result.current).toBe(true);
  });

  it('falls back to defaults when localStorage is corrupt', () => {
    localStorage.setItem(SETTINGS_KEY, 'not-json');
    const { result } = renderHook(() => useFeature('whatsappBtn'));
    expect(result.current).toBe(true);
  });

  it('merges stored features with defaults', () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({
      features: { whatasappBtn: false },
    }));
    const { result } = renderHook(() => useFeature('preloader'));
    expect(result.current).toBe(true);
  });

  it('responds to storage events', () => {
    const { result } = renderHook(() => useFeature('cookieBanner'));
    expect(result.current).toBe(true);

    act(() => {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({
        features: { cookieBanner: false },
      }));
      window.dispatchEvent(new StorageEvent('storage', { key: SETTINGS_KEY }));
    });

    expect(result.current).toBe(false);
  });
});
