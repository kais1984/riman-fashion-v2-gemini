import React, { useState, useEffect, useRef } from 'react';
import { Layout, Type, Save, CheckCircle2, RefreshCw, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { useData } from '../../contexts/DataContext';

export default function AdminContent() {
  const { content, updateContent } = useData();
  const [activeView, setActiveView] = useState('homepage');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSave = () => {
    if (!formRef.current) return;
    
    setIsSaving(true);
    const formData = new FormData(formRef.current);
    
    const updates: any = {};
    if (activeView === 'homepage') {
      updates.hero = {
        title: formData.get('heroTitle'),
        subtitle: formData.get('heroSubtitle'),
        cta: formData.get('heroCta'),
        bgImage: formData.get('heroBg'),
      };
      updates.quote = formData.get('quote');
    } else if (activeView === 'about') {
      updates.about = {
        title: formData.get('aboutTitle'),
        description: formData.get('aboutDesc'),
      };
    }

    updateContent(updates);
    
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-fade-in h-[calc(100vh-9rem)] flex flex-col">
      <div className="flex justify-between items-center bg-ivory p-8 border border-stone-200 shrink-0">
        <div>
          <h2 className="font-heading text-2xl text-stone-800 tracking-wide uppercase">Artisan CMS</h2>
          <p className="text-[10px] tracking-[0.3em] text-stone-400 uppercase mt-1">Curation & Creative Control</p>
        </div>
        <div className="flex items-center gap-4">
          <AnimatePresence>
            {showSuccess && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 border border-green-100"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-[10px] uppercase tracking-widest font-bold">Changes Published</span>
              </motion.div>
            )}
          </AnimatePresence>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="btn-luxury flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Publishing...' : 'Save & Publish'}
          </button>
        </div>
      </div>

      <div className="flex-grow flex gap-8 min-h-0">
        {/* Navigation */}
        <aside className="w-64 bg-ivory border border-stone-200 shrink-0 overflow-y-auto">
          <nav className="p-4 space-y-1">
             <CMSNavLink 
               label="L'Aube (Homepage)" 
               active={activeView === 'homepage'} 
               onClick={() => setActiveView('homepage')}
               icon={Layout} 
             />
             <CMSNavLink 
               label="Heritage (About)" 
               active={activeView === 'about'} 
               onClick={() => setActiveView('about')}
               icon={Type} 
             />
          </nav>
        </aside>

        {/* Editor Area */}
        <form ref={formRef} className="flex-grow bg-ivory border border-stone-200 overflow-y-auto p-12">
          {activeView === 'homepage' && (
            <div className="max-w-3xl space-y-12">
              <section className="space-y-6">
                <EditorHeader title="Hero Experience" subtitle="First impressions of the Riman Aura" />
                <CMSInput label="Main Headline" name="heroTitle" defaultValue={content.hero.title} />
                <CMSInput label="Sub-headline" name="heroSubtitle" defaultValue={content.hero.subtitle} />
                <CMSInput label="CTA Button Text" name="heroCta" defaultValue={content.hero.cta} />
                <CMSInput label="Hero Backdrop URL" name="heroBg" defaultValue={content.hero.bgImage} />
              </section>

              <section className="space-y-6">
                <EditorHeader title="Brand Narrative" subtitle="The artisanal story told on home" />
                <CMSTextarea 
                   label="Atelier Quote" 
                   name="quote"
                   defaultValue={content.quote} 
                />
              </section>
            </div>
          )}

          {activeView === 'about' && (
             <div className="max-w-3xl space-y-12">
                <section className="space-y-6">
                  <EditorHeader title="The Heritage Page" subtitle="Defining the Riman legacy" />
                  <CMSInput label="Header Title" name="aboutTitle" defaultValue={content.about.title} />
                  <CMSTextarea 
                     label="Founding Story" 
                     name="aboutDesc"
                     defaultValue={content.about.description} 
                   />
                </section>
             </div>
          )}
        </form>
      </div>
    </div>
  );
}

interface CMSNavLinkProps {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
}

function CMSNavLink({ label, active, onClick, icon: Icon }: CMSNavLinkProps) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-4 py-3 text-[10px] tracking-widest uppercase transition-all group",
        active ? "bg-stone-900 text-white font-bold" : "text-stone-400 hover:text-stone-800 hover:bg-stone-50"
      )}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-3 h-3" />
        {label}
      </div>
      <ChevronRight className={cn("w-3 h-3 transition-transform", active ? "translate-x-0" : "-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0")} />
    </button>
  );
}

interface EditorHeaderProps {
  title: string;
  subtitle: string;
}

function EditorHeader({ title, subtitle }: EditorHeaderProps) {
  return (
    <div className="border-b border-stone-100 pb-4">
      <h4 className="font-heading text-lg text-stone-800 tracking-wide uppercase">{title}</h4>
      <p className="text-[10px] text-stone-400 uppercase tracking-[0.2em] italic mt-1">{subtitle}</p>
    </div>
  );
}

interface CMSInputProps {
  label: string;
  name: string;
  defaultValue: string;
}

function CMSInput({ label, name, defaultValue }: CMSInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest">{label}</label>
      <input 
        type="text" 
        name={name}
        defaultValue={defaultValue}
        className="w-full bg-stone-50 border border-stone-100 p-4 text-xs tracking-widest outline-none focus:border-gold transition-colors font-medium text-stone-800"
      />
    </div>
  );
}

interface CMSTextareaProps {
  label: string;
  name: string;
  defaultValue: string;
}

function CMSTextarea({ label, name, defaultValue }: CMSTextareaProps) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest">{label}</label>
      <textarea 
        name={name}
        defaultValue={defaultValue}
        rows={6}
        className="w-full bg-stone-50 border border-stone-100 p-4 text-xs tracking-widest leading-relaxed outline-none focus:border-gold transition-colors font-medium text-stone-800 resize-none shadow-inner"
      />
    </div>
  );
}
