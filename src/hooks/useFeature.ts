import { useSettings } from '../contexts/SettingsContext';

const DEFAULT_FEATURES: Record<string, boolean> = {
  newsletter: false,
  whatsappBtn: true,
  preloader: true,
  instagramFeed: true,
  cookieBanner: true,
  scrollReveal: true,
  threeDViewer: true,
  customCursor: true,
};

export function useFeature(key: string): boolean {
  const { settings } = useSettings();
  const features = { ...DEFAULT_FEATURES, ...settings.features };
  return features[key] ?? true;
}
