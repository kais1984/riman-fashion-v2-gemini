import { useState, useEffect } from 'react';
import Logo from './Logo';

const SETTINGS_KEY = 'riman_admin_settings';

function getMaintenanceMode(): { enabled: boolean; message: string } {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const settings = JSON.parse(raw);
      return {
        enabled: settings.advanced?.maintenanceMode ?? false,
        message: settings.advanced?.maintenanceMessage || 'Our atelier is currently being curated. We will return with an even more exquisite experience.',
      };
    }
  } catch {}
  return { enabled: false, message: '' };
}

export default function MaintenanceMode() {
  const [mode, setMode] = useState(getMaintenanceMode);

  useEffect(() => {
    const handler = () => setMode(getMaintenanceMode());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  if (!mode.enabled) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-onyx flex flex-col items-center justify-center p-10 text-center">
      <Logo variant="gold" className="w-48 md:w-72 mb-12" />
      <div className="w-16 h-px bg-gold/40 mb-12" />
      <p className="font-body text-sm md:text-base text-ivory/70 max-w-xl leading-relaxed tracking-wide">
        {mode.message}
      </p>
      <div className="mt-16 flex items-center gap-4 text-[10px] tracking-[0.3em] text-stone-600 uppercase">
        <span className="w-8 h-px bg-stone-800" />
        <span>Atelier Riman — Sharjah</span>
        <span className="w-8 h-px bg-stone-800" />
      </div>
    </div>
  );
}
