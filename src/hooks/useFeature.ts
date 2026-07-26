import { useState, useEffect } from 'react';

const SETTINGS_KEY = 'riman_admin_settings';
const DEFAULT_FEATURES = {
  newsletter: false,
  whatsappBtn: true,
  preloader: true,
  instagramFeed: true,
  cookieBanner: true,
  scrollReveal: true,
  threeDViewer: true,
  customCursor: true,
};

function loadFeatures(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_FEATURES, ...parsed.features };
    }
  } catch {}
  return { ...DEFAULT_FEATURES };
}

export function useFeature(key: string): boolean {
  const [features, setFeatures] = useState(loadFeatures);

  useEffect(() => {
    const handler = () => setFeatures(loadFeatures());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return features[key] ?? true;
}
