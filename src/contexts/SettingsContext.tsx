import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isSupabaseConfigured } from '../services/supabase';

interface SiteSettings {
  branding: { siteName: string; tagline: string; logoText: string };
  contact: { email: string; phone: string; address: string; hours: string };
  social: { instagram: string; whatsapp: string; facebook: string; twitter: string; youtube: string; tiktok: string; pinterest: string };
  homepage: { heroTitle: string; heroSubtitle: string; heroCta: string; heroBgImage: string; aboutTitle: string; aboutDescription: string; brandQuote: string; featuredTitle: string };
  features: { newsletter: boolean; whatsappBtn: boolean; preloader: boolean; instagramFeed: boolean; cookieBanner: boolean; scrollReveal: boolean; threeDViewer: boolean };
  policies: { rentalPeriodDays: number; depositAmount: number; insuranceText: string; lateReturnFee: string; shippingInfo: string; returnPolicy: string };
  advanced: { metaDescription: string; ogImageUrl: string; keywords: string; gaId: string; plausibleDomain: string; fathomSiteId: string; maintenanceMode: boolean; maintenanceMessage: string; customHeadCode: string };
}

interface SettingsContextType {
  settings: SiteSettings;
  updateSetting: <K extends keyof SiteSettings>(section: K, key: string, value: any) => Promise<void>;
  isLoading: boolean;
}

const defaultSettings: SiteSettings = {
  branding: { siteName: 'Atelier Riman', tagline: "Sharjah's Most Majestic Couture", logoText: 'Riman' },
  contact: { email: 'hello@rimanfashion.com', phone: '+971 50 123 4567', address: 'Al Zahra St, Sharjah, UAE', hours: 'Sat–Thu, 10am – 8pm' },
  social: { instagram: '@rimanfashion', whatsapp: '+971501234567', facebook: 'rimanfashion', twitter: 'rimanfashion', youtube: 'rimanfashion', tiktok: '@rimanfashion', pinterest: 'rimanfashion' },
  homepage: { heroTitle: 'Reverie & Essence', heroSubtitle: "Sharjah's Most Majestic Couture", heroCta: 'Request A Private Viewing', heroBgImage: 'https://images.unsplash.com/photo-1594553423282-55ad0c034431?auto=format&fit=crop&w=2000&q=80', aboutTitle: 'The Riman Legacy', aboutDescription: 'Founded in the vibrant cultural landscape of Sharjah.', brandQuote: 'In the heart of Sharjah, we weave dreams into silk.', featuredTitle: 'Featured Designs' },
  features: { newsletter: true, whatsappBtn: true, preloader: true, instagramFeed: true, cookieBanner: true, scrollReveal: true, threeDViewer: true },
  policies: { rentalPeriodDays: 7, depositAmount: 5000, insuranceText: '7-day hire period includes eco-friendly dry cleaning and couture insurance.', lateReturnFee: 'AED 500 per day', shippingInfo: 'Complimentary delivery within UAE and GCC.', returnPolicy: 'All sales are final.' },
  advanced: { metaDescription: "Atelier Riman — Sharjah's premier bridal and evening couture.", ogImageUrl: '', keywords: 'bridal gowns, evening dresses, couture, Sharjah, UAE', gaId: '', plausibleDomain: '', fathomSiteId: '', maintenanceMode: false, maintenanceMessage: 'Our atelier is currently being curated.', customHeadCode: '' },
};

const STORAGE_KEY = 'riman_admin_settings';

function loadCachedSettings(): SiteSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        return { ...defaultSettings, ...parsed };
      }
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
  return defaultSettings;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(loadCachedSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFromSupabase();
  }, []);

  const loadFromSupabase = async () => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    const timeout = setTimeout(() => setIsLoading(false), 8000);

    try {
      const { fetchSiteSettings } = await import('../services/siteContent');
      const remote = await fetchSiteSettings();
      if (Object.keys(remote).length > 0) {
        setSettings(prev => {
          const merged = { ...prev };
          for (const [key, value] of Object.entries(remote)) {
            if (key in merged) {
              (merged as any)[key] = { ...(merged as any)[key], ...value };
            }
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          return merged;
        });
      }
    } catch (err) {
      console.error('[Riman] Failed to load settings from Supabase:', err);
    } finally {
      clearTimeout(timeout);
      setIsLoading(false);
    }
  };

  const updateSetting = async <K extends keyof SiteSettings>(section: K, key: string, value: any) => {
    setSettings(prev => {
      const next = {
        ...prev,
        [section]: { ...(prev[section] as any), [key]: value },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });

    if (isSupabaseConfigured) {
      try {
        const { updateSiteSetting } = await import('../services/siteContent');
        const currentSection = settings[section];
        const updatedSection = { ...(currentSection as any), [key]: value };
        await updateSiteSetting(section, updatedSection);
      } catch (err) {
        console.error(`[Riman] Failed to save setting ${section}.${key}:`, err);
      }
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

export type { SiteSettings };
