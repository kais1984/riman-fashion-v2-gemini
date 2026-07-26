import { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { Download, Upload, CheckCircle2, AlertTriangle, Eye, Smartphone, Mail, Globe, Camera, Search, Palette, Code, Shield, ShoppingBag, Gem, RefreshCw, PenTool, Layout as LayoutIcon, Home, BookOpen, Truck, FileText } from 'lucide-react';
import { isSupabaseConfigured } from '../../services/supabase';
import { useData } from '../../contexts/DataContext';
import { useSettings } from '../../contexts/SettingsContext';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

export default function AdminSettings() {
  const { content, updateContent } = useData();
  const { settings, updateSetting } = useSettings();
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<'brand' | 'homepage' | 'policies' | 'features' | 'advanced'>('brand');
  const [importData, setImportData] = useState('');
  const { addToast } = useToast();

  useEffect(() => { if (saved) { const t = setTimeout(() => setSaved(false), 2000); return () => clearTimeout(t); } }, [saved]);

  const update = async <K extends keyof typeof settings>(section: K, key: string, value: any) => {
    await updateSetting(section, key, value);
    setSaved(true);
  };

  const syncToDataContext = async () => {
    await updateContent({
      hero: { title: settings.homepage.heroTitle, subtitle: settings.homepage.heroSubtitle, cta: settings.homepage.heroCta, bgImage: settings.homepage.heroBgImage },
      about: { title: settings.homepage.aboutTitle, description: settings.homepage.aboutDescription },
      quote: settings.homepage.brandQuote,
    });
  };

  const handleExport = () => {
    const data = JSON.stringify({ settings }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'riman-settings-backup.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    try {
      const data = JSON.parse(importData);
      if (data.settings) {
        Object.entries(data.settings).forEach(([section, values]) => {
          if (typeof values === 'object' && values !== null) {
            Object.entries(values as Record<string, any>).forEach(([key, value]) => {
              updateSetting(section as any, key, value);
            });
          }
        });
      }
      setSaved(true); setImportData('');
      addToast({ type: 'success', title: 'Import Complete', message: 'Settings imported successfully.' });
    } catch { addToast({ type: 'error', title: 'Import Failed', message: 'Invalid JSON format.' }); }
  };

  const handleReset = async () => {
    const defaults = {
      branding: { siteName: 'Atelier Riman', tagline: "Sharjah's Most Majestic Couture", logoText: 'Riman' },
      contact: { email: 'hello@rimanfashion.com', phone: '+971 50 123 4567', address: 'Al Zahra St, Sharjah, UAE', hours: 'Sat–Thu, 10am – 8pm' },
      social: { instagram: '@rimanfashion', whatsapp: '+971501234567', facebook: 'rimanfashion', twitter: 'rimanfashion', youtube: 'rimanfashion', tiktok: '@rimanfashion', pinterest: 'rimanfashion' },
      homepage: { heroTitle: 'Reverie & Essence', heroSubtitle: "Sharjah's Most Majestic Couture", heroCta: 'Request A Private Viewing', heroBgImage: 'https://images.unsplash.com/photo-1594553423282-55ad0c034431?auto=format&fit=crop&w=2000&q=80', aboutTitle: 'The Riman Legacy', aboutDescription: 'Founded in the vibrant cultural landscape of Sharjah.', brandQuote: 'In the heart of Sharjah, we weave dreams into silk.', featuredTitle: 'Featured Designs' },
      features: { newsletter: true, whatsappBtn: true, preloader: true, instagramFeed: true, cookieBanner: true, scrollReveal: true, threeDViewer: true },
      policies: { rentalPeriodDays: 7, depositAmount: 5000, insuranceText: '7-day hire period includes eco-friendly dry cleaning.', lateReturnFee: 'AED 500 per day', shippingInfo: 'Complimentary delivery within UAE and GCC.', returnPolicy: 'All sales are final.' },
      advanced: { metaDescription: "Atelier Riman — Sharjah's premier bridal and evening couture.", ogImageUrl: '', keywords: 'bridal gowns, evening dresses, couture, Sharjah, UAE', gaId: '', plausibleDomain: '', fathomSiteId: '', maintenanceMode: false, maintenanceMessage: 'Our atelier is currently being curated.', customHeadCode: '' },
    };
    for (const [section, values] of Object.entries(defaults)) {
      for (const [key, value] of Object.entries(values as Record<string, any>)) {
        await updateSetting(section as any, key, value);
      }
    }
    setSaved(true);
    addToast({ type: 'info', title: 'Settings Reset', message: 'Restored to factory defaults.' });
  };

  const inputCls = "w-full bg-stone-50 border border-stone-200 px-4 py-3 text-xs tracking-widest outline-none focus:border-gold transition-colors";
  const labelCls = "text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1.5";
  const textareaCls = "w-full bg-stone-50 border border-stone-200 px-4 py-3 text-xs outline-none focus:border-gold transition-colors resize-none";

  const tabs = [
    { id: 'brand' as const, label: 'Branding', icon: <Palette className="w-4 h-4" /> },
    { id: 'homepage' as const, label: 'Homepage', icon: <Home className="w-4 h-4" /> },
    { id: 'policies' as const, label: 'Policies', icon: <Shield className="w-4 h-4" /> },
    { id: 'features' as const, label: 'Features', icon: <LayoutIcon className="w-4 h-4" /> },
    { id: 'advanced' as const, label: 'Advanced', icon: <Code className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-2xl text-stone-800 tracking-wider uppercase">Control Panel</h1>
          <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-1 italic">Manage every aspect of the Riman boutique experience</p>
        </div>
        <div className="flex items-center gap-4">
          {saved && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-emerald-600 text-[10px] tracking-widest uppercase font-bold"><CheckCircle2 className="w-4 h-4" /> Saved</motion.div>}
          <button onClick={syncToDataContext} className="btn-luxury text-[10px] !py-3 !px-6 flex items-center gap-2"><RefreshCw className="w-3 h-3" /> Publish to Site</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-stone-200 overflow-x-auto no-scrollbar">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={cn("flex items-center gap-2 px-5 py-3 text-[10px] tracking-[0.2em] uppercase font-bold transition-colors border-b-2 -mb-px shrink-0", tab === t.id ? "border-gold text-gold" : "border-transparent text-stone-400 hover:text-stone-600")}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Branding */}
      {tab === 'brand' && (
        <div className="space-y-8">
          <section>
            <h3 className="font-heading text-lg text-stone-800 tracking-wider uppercase mb-6 flex items-center gap-2"><PenTool className="w-4 h-4 text-gold" /> Brand Identity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className={labelCls}>Site Name</label><input className={inputCls} value={settings.branding.siteName} onChange={e => update('branding', 'siteName', e.target.value)} /></div>
              <div><label className={labelCls}>Navigation Logo Text</label><input className={inputCls} value={settings.branding.logoText} onChange={e => update('branding', 'logoText', e.target.value)} /></div>
              <div className="md:col-span-2"><label className={labelCls}>Tagline</label><input className={inputCls} value={settings.branding.tagline} onChange={e => update('branding', 'tagline', e.target.value)} /></div>
            </div>
          </section>
          <section>
            <h3 className="font-heading text-lg text-stone-800 tracking-wider uppercase mb-6 flex items-center gap-2"><Mail className="w-4 h-4 text-gold" /> Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className={labelCls}>Email</label><input className={inputCls} value={settings.contact.email} onChange={e => update('contact', 'email', e.target.value)} /></div>
              <div><label className={labelCls}>Phone</label><input className={inputCls} value={settings.contact.phone} onChange={e => update('contact', 'phone', e.target.value)} /></div>
              <div className="md:col-span-2"><label className={labelCls}>Address</label><input className={inputCls} value={settings.contact.address} onChange={e => update('contact', 'address', e.target.value)} /></div>
              <div><label className={labelCls}>Hours</label><input className={inputCls} value={settings.contact.hours} onChange={e => update('contact', 'hours', e.target.value)} /></div>
            </div>
          </section>
          <section>
            <h3 className="font-heading text-lg text-stone-800 tracking-wider uppercase mb-6 flex items-center gap-2"><Globe className="w-4 h-4 text-gold" /> Social Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {([
                { key: 'instagram', icon: '📷', placeholder: '@rimanfashion' },
                { key: 'facebook', icon: '👍', placeholder: 'rimanfashion' },
                { key: 'twitter', icon: '🐦', placeholder: 'rimanfashion' },
                { key: 'youtube', icon: '▶', placeholder: 'rimanfashion' },
                { key: 'tiktok', icon: '🎵', placeholder: '@rimanfashion' },
                { key: 'pinterest', icon: '📌', placeholder: 'rimanfashion' },
                { key: 'whatsapp', icon: '💬', placeholder: '+971501234567' },
              ] as const).map(s => (
                <div key={s.key}><label className={labelCls}>{s.key.charAt(0).toUpperCase() + s.key.slice(1)}</label><input className={inputCls} value={(settings.social as any)[s.key]} placeholder={s.placeholder} onChange={e => update('social', s.key, e.target.value)} /></div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Homepage */}
      {tab === 'homepage' && (
        <div className="space-y-8">
          <section>
            <h3 className="font-heading text-lg text-stone-800 tracking-wider uppercase mb-6 flex items-center gap-2"><Camera className="w-4 h-4 text-gold" /> Hero Section</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2"><label className={labelCls}>Hero Title</label><input className={inputCls} value={settings.homepage.heroTitle} onChange={e => update('homepage', 'heroTitle', e.target.value)} /></div>
              <div><label className={labelCls}>Subtitle</label><input className={inputCls} value={settings.homepage.heroSubtitle} onChange={e => update('homepage', 'heroSubtitle', e.target.value)} /></div>
              <div><label className={labelCls}>CTA Button Text</label><input className={inputCls} value={settings.homepage.heroCta} onChange={e => update('homepage', 'heroCta', e.target.value)} /></div>
              <div className="md:col-span-2"><label className={labelCls}>Background Image URL</label><input className={inputCls} value={settings.homepage.heroBgImage} onChange={e => update('homepage', 'heroBgImage', e.target.value)} /></div>
            </div>
          </section>
          <section>
            <h3 className="font-heading text-lg text-stone-800 tracking-wider uppercase mb-6 flex items-center gap-2"><BookOpen className="w-4 h-4 text-gold" /> About & Quote</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2"><label className={labelCls}>About Title</label><input className={inputCls} value={settings.homepage.aboutTitle} onChange={e => update('homepage', 'aboutTitle', e.target.value)} /></div>
              <div className="md:col-span-2"><label className={labelCls}>About Description</label><textarea className={textareaCls} rows={4} value={settings.homepage.aboutDescription} onChange={e => update('homepage', 'aboutDescription', e.target.value)} /></div>
              <div className="md:col-span-2"><label className={labelCls}>Brand Quote</label><textarea className={textareaCls} rows={3} value={settings.homepage.brandQuote} onChange={e => update('homepage', 'brandQuote', e.target.value)} /></div>
              <div><label className={labelCls}>Featured Section Title</label><input className={inputCls} value={settings.homepage.featuredTitle} onChange={e => update('homepage', 'featuredTitle', e.target.value)} /></div>
            </div>
            <div className="mt-6 p-4 bg-gold/5 border border-gold/20">
              <p className="text-[10px] text-stone-500 italic">Changes here take effect after clicking <strong>"Publish to Site"</strong>.</p>
            </div>
          </section>
        </div>
      )}

      {/* Policies */}
      {tab === 'policies' && (
        <div className="space-y-8">
          <section>
            <h3 className="font-heading text-lg text-stone-800 tracking-wider uppercase mb-6 flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-gold" /> Rental Policy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className={labelCls}>Rental Period (days)</label><input className={inputCls} type="number" value={settings.policies.rentalPeriodDays} onChange={e => update('policies', 'rentalPeriodDays', Number(e.target.value))} /></div>
              <div><label className={labelCls}>Security Deposit (AED)</label><input className={inputCls} type="number" value={settings.policies.depositAmount} onChange={e => update('policies', 'depositAmount', Number(e.target.value))} /></div>
              <div className="md:col-span-2"><label className={labelCls}>Insurance & Cleaning Text</label><textarea className={textareaCls} rows={3} value={settings.policies.insuranceText} onChange={e => update('policies', 'insuranceText', e.target.value)} /></div>
              <div className="md:col-span-2"><label className={labelCls}>Late Return Fee</label><input className={inputCls} value={settings.policies.lateReturnFee} onChange={e => update('policies', 'lateReturnFee', e.target.value)} /></div>
            </div>
          </section>
          <section>
            <h3 className="font-heading text-lg text-stone-800 tracking-wider uppercase mb-6 flex items-center gap-2"><Truck className="w-4 h-4 text-gold" /> Shipping & Returns</h3>
            <div className="grid grid-cols-1 gap-6">
              <div><label className={labelCls}>Shipping Information</label><textarea className={textareaCls} rows={3} value={settings.policies.shippingInfo} onChange={e => update('policies', 'shippingInfo', e.target.value)} /></div>
              <div><label className={labelCls}>Return Policy</label><textarea className={textareaCls} rows={3} value={settings.policies.returnPolicy} onChange={e => update('policies', 'returnPolicy', e.target.value)} /></div>
            </div>
          </section>
        </div>
      )}

      {/* Features */}
      {tab === 'features' && (
        <section>
          <h3 className="font-heading text-lg text-stone-800 tracking-wider uppercase mb-6">Site Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'newsletter' as const, label: 'Newsletter Popup', desc: 'Show the Atelier Circle signup popup', icon: <Mail className="w-4 h-4" /> },
              { key: 'whatsappBtn' as const, label: 'WhatsApp Button', desc: 'Floating WhatsApp for inquiries', icon: <Smartphone className="w-4 h-4" /> },
              { key: 'preloader' as const, label: 'Preloader', desc: 'Emblem animation on first homepage visit', icon: <Eye className="w-4 h-4" /> },
              { key: 'instagramFeed' as const, label: 'Instagram Feed', desc: 'Instagram section on homepage', icon: <Camera className="w-4 h-4" /> },
              { key: 'cookieBanner' as const, label: 'Cookie Consent', desc: 'GDPR cookie consent banner', icon: <FileText className="w-4 h-4" /> },
              { key: 'scrollReveal' as const, label: 'Scroll Animations', desc: 'Fade-in effects as user scrolls', icon: <RefreshCw className="w-4 h-4" /> },
              { key: 'threeDViewer' as const, label: '3D Product Viewer', desc: 'Interactive 3D model viewer on products', icon: <Gem className="w-4 h-4" /> },
            ].map(f => (
              <div key={f.key} className="flex items-center justify-between p-5 bg-ivory border border-stone-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gold/10 text-gold flex items-center justify-center">{f.icon}</div>
                  <div><p className="text-xs font-bold text-stone-800 uppercase tracking-widest">{f.label}</p><p className="text-[9px] text-stone-400 italic mt-0.5">{f.desc}</p></div>
                </div>
                <button onClick={() => update('features', f.key, !settings.features[f.key])} className={cn("relative w-11 h-5 transition-colors duration-300 shrink-0", settings.features[f.key] ? "bg-gold" : "bg-stone-200")} aria-label={`Toggle ${f.label}`}>
                  <div className={cn("absolute top-0.5 w-4 h-4 bg-white transition-transform duration-300", settings.features[f.key] ? "translate-x-6" : "translate-x-0.5")} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Advanced */}
      {tab === 'advanced' && (
        <div className="space-y-8">
          <section>
            <h3 className="font-heading text-lg text-stone-800 tracking-wider uppercase mb-6 flex items-center gap-2"><Search className="w-4 h-4 text-gold" /> SEO</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2"><label className={labelCls}>Default Meta Description</label><textarea className={textareaCls} rows={3} value={settings.advanced.metaDescription} onChange={e => update('advanced', 'metaDescription', e.target.value)} /></div>
              <div className="md:col-span-2"><label className={labelCls}>OG Image URL</label><input className={inputCls} value={settings.advanced.ogImageUrl} onChange={e => update('advanced', 'ogImageUrl', e.target.value)} /></div>
              <div className="md:col-span-2"><label className={labelCls}>Meta Keywords</label><input className={inputCls} value={settings.advanced.keywords} onChange={e => update('advanced', 'keywords', e.target.value)} /></div>
              <div><label className={labelCls}>Google Analytics ID</label><input className={inputCls} value={settings.advanced.gaId} placeholder="G-XXXXXXXXXX" onChange={e => update('advanced', 'gaId', e.target.value)} /></div>
              <div><label className={labelCls}>Plausible Domain</label><input className={inputCls} value={settings.advanced.plausibleDomain} placeholder="yourdomain.com" onChange={e => update('advanced', 'plausibleDomain', e.target.value)} /></div>
              <div><label className={labelCls}>Fathom Site ID</label><input className={inputCls} value={settings.advanced.fathomSiteId} placeholder="XXXXXXXXX" onChange={e => update('advanced', 'fathomSiteId', e.target.value)} /></div>
            </div>
          </section>
          <section>
            <h3 className="font-heading text-lg text-stone-800 tracking-wider uppercase mb-6 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-gold" /> Maintenance Mode</h3>
            <div className="p-6 bg-ivory border border-stone-100">
              <div className="flex items-center justify-between mb-6">
                <div><p className="text-xs font-bold text-stone-800 uppercase tracking-widest">Maintenance Mode</p><p className="text-[10px] text-stone-400 italic mt-1">Show a maintenance page to visitors while you make changes</p></div>
                <button onClick={() => update('advanced', 'maintenanceMode', !settings.advanced.maintenanceMode)} className={cn("relative w-11 h-5 transition-colors duration-300", settings.advanced.maintenanceMode ? "bg-rose-500" : "bg-stone-200")} aria-label="Toggle maintenance mode">
                  <div className={cn("absolute top-0.5 w-4 h-4 bg-white transition-transform duration-300", settings.advanced.maintenanceMode ? "translate-x-6" : "translate-x-0.5")} />
                </button>
              </div>
              <label className={labelCls}>Maintenance Message</label>
              <textarea className={textareaCls} rows={3} value={settings.advanced.maintenanceMessage} onChange={e => update('advanced', 'maintenanceMessage', e.target.value)} />
            </div>
          </section>
          <section>
            <h3 className="font-heading text-lg text-stone-800 tracking-wider uppercase mb-6 flex items-center gap-2"><Code className="w-4 h-4 text-gold" /> Custom Code</h3>
            <div><label className={labelCls}>Custom &lt;head&gt; Code</label><textarea className={textareaCls + " font-mono text-[10px]"} rows={6} value={settings.advanced.customHeadCode} placeholder="<!-- Google Tag Manager, custom fonts, meta tags -->&#10;" onChange={e => update('advanced', 'customHeadCode', e.target.value)} /></div>
          </section>
          <section>
            <h3 className="font-heading text-lg text-stone-800 tracking-wider uppercase mb-6 flex items-center gap-2"><Download className="w-4 h-4 text-gold" /> Backup & System</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button onClick={handleExport} className="flex items-center gap-3 px-6 py-5 border border-stone-200 bg-ivory hover:border-gold/30 transition-colors text-left">
                <Download className="w-5 h-5 text-gold" />
                <div><p className="text-xs font-bold text-stone-800 uppercase tracking-widest">Export Data</p><p className="text-[9px] text-stone-400">Download all settings as JSON</p></div>
              </button>
              <div className="border border-stone-200 bg-ivory p-5">
                <div className="flex items-center gap-3 mb-3"><Upload className="w-5 h-5 text-gold" /><p className="text-xs font-bold text-stone-800 uppercase tracking-widest">Import Data</p></div>
                <textarea className="w-full bg-stone-50 border border-stone-100 p-3 text-[10px] outline-none focus:border-gold font-mono resize-none h-20" placeholder="Paste exported JSON..." value={importData} onChange={e => setImportData(e.target.value)} />
                {importData && <button onClick={handleImport} className="mt-3 btn-luxury text-[10px] !py-3 w-full">Import</button>}
              </div>
              <div className="p-6 bg-ivory border border-stone-100"><p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Supabase</p>{isSupabaseConfigured ? <span className="inline-flex items-center gap-2 text-[10px] text-emerald-600 font-bold"><div className="w-2 h-2 bg-emerald-500" /> Connected</span> : <span className="inline-flex items-center gap-2 text-[10px] text-stone-400 font-bold"><AlertTriangle className="w-3 h-3" /> Offline</span>}</div>
              <button onClick={handleReset} className="flex items-center gap-3 px-6 py-5 border border-rose-200 bg-rose-50/50 hover:bg-rose-50 transition-colors text-left">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <div><p className="text-xs font-bold text-stone-800 uppercase tracking-widest">Factory Reset</p><p className="text-[9px] text-stone-400">Restore all settings to defaults</p></div>
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}