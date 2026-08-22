import { describe, it, expect } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { useFeature } from './useFeature';
import { SettingsProvider, useSettings } from '../contexts/SettingsContext';
import { ToastProvider } from '../contexts/ToastContext';

function wrapper({ children }: { children: ReactNode }) {
  return createElement(ToastProvider, null, createElement(SettingsProvider, null, children));
}

describe('useFeature', () => {
  it('reflects admin-configured feature flags from the settings context', async () => {
    const { result } = renderHook(
      () => {
        const { updateSetting } = useSettings();
        const value = useFeature('newsletter');
        return { value, updateSetting };
      },
      { wrapper },
    );

    expect(result.current.value).toBe(true);

    act(() => {
      result.current.updateSetting('features', 'newsletter', false);
    });
    await waitFor(() => expect(result.current.value).toBe(false));
  });

  it('defaults unknown features to enabled', () => {
    const { result } = renderHook(() => useFeature('unknownFeature'), { wrapper });
    expect(result.current).toBe(true);
  });

  it('reflects admin-configured feature flags', async () => {
    const { result } = renderHook(
      () => {
        const { updateSetting } = useSettings();
        const value = useFeature('whatsappBtn');
        return { value, updateSetting };
      },
      { wrapper },
    );

    act(() => {
      result.current.updateSetting('features', 'whatsappBtn', false);
    });
    await waitFor(() => expect(result.current.value).toBe(false));
  });
});
