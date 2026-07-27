import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, Phone, MapPin, ChevronUp, ArrowRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';

function CollapsibleSection({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 md:py-0 md:cursor-default"
      >
        <h4 className="font-body text-xs tracking-[0.3em] uppercase text-gold font-bold text-center md:text-left flex-1">{title}</h4>
        <ChevronDown className={cn(
          "w-4 h-4 text-stone-500 transition-transform md:hidden",
          isOpen && "rotate-180"
        )} />
      </button>
      <AnimatePresence>
        {(isOpen || typeof window !== 'undefined') && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={cn("overflow-hidden md:!h-auto md:!opacity-100", !isOpen && "md:hidden")}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Footer() {
  const { t } = useLanguage();

  const newsletterSchema = z.object({
    email: z.string().email(t('footer.valid_email'))
  });

  type NewsletterForm = z.infer<typeof newsletterSchema>;

  const { register, handleSubmit, reset, formState: { errors, isSubmitSuccessful } } = useForm<NewsletterForm>({
    resolver: zodResolver(newsletterSchema)
  });

  const onNewsletterSubmit = async (data: NewsletterForm) => {
    try {
      const existing = JSON.parse(localStorage.getItem('riman_newsletter') || '[]');
      if (!existing.includes(data.email)) {
        existing.push(data.email);
        localStorage.setItem('riman_newsletter', JSON.stringify(existing));
      }
    } catch {
      // ignore storage failures
    }
    await new Promise(resolve => setTimeout(resolve, 600));
    reset();
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="footer" className="bg-onyx text-ivory pt-16 md:pt-24 pb-12 relative overflow-hidden">
      {/* Decorative Shimmer */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Newsletter - Full Width */}
        <div className="border-b border-white/5 pb-12 mb-8 text-center md:text-left">
          <div className="max-w-xl mx-auto md:mx-0">
            <h4 className="font-heading text-xl md:text-2xl tracking-widest uppercase mb-3 text-white">{t('footer.newsletter_title')}</h4>
            <div className="w-10 h-px bg-gold mb-4 mx-auto md:mx-0" />
            <p className="font-body text-stone-500 text-xs md:text-sm tracking-wider mb-6 leading-relaxed uppercase">
              {t('footer.newsletter_text')}
            </p>
            <form onSubmit={handleSubmit(onNewsletterSubmit)} className="relative group">
              <input 
                {...register('email')}
                type="email" 
                placeholder={t('footer.newsletter_placeholder')}
                className="w-full bg-transparent border-b border-stone-800 focus:border-gold py-3 md:py-4 pr-12 text-sm font-body tracking-[0.15em] outline-none transition-all placeholder:text-stone-700"
              />
              <button type="submit" className="absolute right-0 bottom-3 md:bottom-4 text-gold hover:translate-x-1 transition-transform">
                {isSubmitSuccessful ? <span className="text-[10px] tracking-widest">{t('footer.submitted')}</span> : <ArrowRight className="w-5 h-5" />}
              </button>
              {errors.email && <p className="absolute top-full mt-2 text-red-500 text-[10px] uppercase tracking-widest">{errors.email.message}</p>}
            </form>
          </div>
        </div>

        {/* Mobile: Collapsible Sections / Desktop: Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-12 mb-12 text-center md:text-left">
          {/* Brand - Always visible */}
          <div className="md:col-span-4 pb-8 md:pb-0 border-b border-white/5 md:border-0">
            <Link to="/" className="block mb-6 md:mb-10">
              <Logo variant="gold" className="w-24 md:w-36 mx-auto md:mx-0 md:ml-2" />
            </Link>
            <p className="font-body text-xs md:text-sm text-stone-400 max-w-sm mb-6 md:mb-10 leading-relaxed italic mx-auto md:mx-0">
              {t('footer.about')}
            </p>
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <SocialLink href="https://instagram.com/rimanfashion" icon={<Instagram />} label="Instagram" />
              <SocialLink href="https://facebook.com/rimanfashion" icon={<Facebook />} label="Facebook" />
              <SocialLink href="mailto:boutique@rimanfashion.com" icon={<Mail />} label="Email" />
            </div>
          </div>

          {/* Collections */}
          <div className="md:col-span-2">
            <CollapsibleSection title={t('footer.collections')} defaultOpen={false}>
              <ul className="space-y-3 pb-6 md:pb-0 md:mt-6 flex flex-col items-center md:items-start">
                <FooterLink to="/collection/bridal">{t('nav.bridal')}</FooterLink>
                <FooterLink to="/collection/evening">{t('nav.evening')}</FooterLink>
                <FooterLink to="/collection/rental">{t('nav.rentals')}</FooterLink>
              </ul>
            </CollapsibleSection>
          </div>

          {/* Services */}
          <div className="md:col-span-2">
            <CollapsibleSection title={t('footer.services')} defaultOpen={false}>
              <ul className="space-y-3 pb-6 md:pb-0 md:mt-6 flex flex-col items-center md:items-start">
                <FooterLink to="/alterations">{t('footer.bespoke_fitting')}</FooterLink>
                <FooterLink to="/style-quiz">{t('footer.aura_consultation')}</FooterLink>
                <FooterLink to="/timeline">{t('footer.bridal_concierge')}</FooterLink>
                <FooterLink to="/faq">{t('footer.assistance')}</FooterLink>
              </ul>
            </CollapsibleSection>
          </div>

          {/* Location */}
          <div className="md:col-span-4">
            <CollapsibleSection title={t('footer.atelier_location')} defaultOpen={false}>
              <div className="space-y-4 pb-6 md:pb-0 md:mt-6 flex flex-col items-center md:items-start">
                <div className="flex gap-3">
                  <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  <p className="font-body text-xs md:text-sm text-stone-400 leading-relaxed uppercase tracking-[0.05em]">
                    {t('footer.location')}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Phone className="w-4 h-4 text-gold shrink-0" />
                  <p className="font-body text-xs md:text-sm text-stone-400 uppercase tracking-[0.05em]">
                    +971 553 730 792
                  </p>
                </div>
              </div>
            </CollapsibleSection>
          </div>
        </div>

        {/* Scroll to Top */}
        <div className="flex justify-center mb-8">
          <button 
            onClick={scrollToTop}
            className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-white/40 hover:text-gold transition-colors font-bold"
          >
            <ChevronUp className="w-4 h-4" /> {t('footer.ascend')}
          </button>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body text-[10px] text-stone-600 uppercase tracking-[0.2em] text-center md:text-left">
            © {new Date().getFullYear()} ATELIER RIMAN. {t('footer.rights')}
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="font-body text-[10px] text-stone-600 hover:text-white uppercase tracking-[0.2em] transition-colors">{t('footer.privacy')}</Link>
            <Link to="/terms" className="font-body text-[10px] text-stone-600 hover:text-white uppercase tracking-[0.2em] transition-colors">{t('footer.legal')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ to, children }: { to: string, children: React.ReactNode }) {
  return (
    <li>
      <Link to={to} className="font-body text-xs md:text-sm text-stone-500 hover:text-gold tracking-[0.1em] uppercase transition-all duration-300 flex items-center group">
        <span className="w-0 group-hover:w-3 h-px bg-gold transition-all duration-300 mr-0 group-hover:mr-2" />
        {children}
      </Link>
    </li>
  );
}

function SocialLink({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noreferrer"
      className="w-10 h-10 md:w-11 md:h-11 rounded-full border border-stone-800 flex items-center justify-center text-stone-400 hover:bg-gold hover:border-gold hover:text-white transition-all duration-500"
      aria-label={label}
    >
      {React.cloneElement(icon as React.ReactElement, { className: "w-4 h-4" })}
    </a>
  );
}
