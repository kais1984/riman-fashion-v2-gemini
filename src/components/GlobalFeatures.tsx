import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useScrollLock } from '../hooks/useScrollLock';
import { useFeature } from '../hooks/useFeature';
import { useLanguage } from '../contexts/LanguageContext';

export default function GlobalFeatures() {
  const { t } = useLanguage();
  const whatsappEnabled = useFeature('whatsappBtn');
  const newsletterEnabled = useFeature('newsletter');
  const cookieEnabled = useFeature('cookieBanner');

  const [showNewsletter, setShowNewsletter] = useState(false);
  const [showCookies, setShowCookies] = useState(false);
  useScrollLock(showNewsletter);

  useEffect(() => {
    if (!newsletterEnabled) return;
    const newsletterTimer = setTimeout(() => {
      const dismissed = localStorage.getItem('riman_newsletter_dismissed');
      if (!dismissed) setShowNewsletter(true);
    }, 30000);
    return () => clearTimeout(newsletterTimer);
  }, [newsletterEnabled]);

  useEffect(() => {
    if (!cookieEnabled) return;
    const cookieConsent = localStorage.getItem('riman_cookie_consent');
    if (!cookieConsent) setShowCookies(true);
  }, [cookieEnabled]);

  const handleDismissNewsletter = () => {
    localStorage.setItem('riman_newsletter_dismissed', 'true');
    setShowNewsletter(false);
  };

  const handleAcceptCookies = () => {
    localStorage.setItem('riman_cookie_consent', 'true');
    setShowCookies(false);
  };

  return (
    <>
      {/* WhatsApp Float — lifts above cookie banner + bottom nav to avoid collision */}
      {whatsappEnabled && (
        <a
          href="https://wa.me/971553730792"
          target="_blank"
          rel="noreferrer"
          className={`fixed right-4 md:right-10 z-[100] w-12 h-12 md:w-14 md:h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all ${
            showCookies ? 'bottom-36 md:bottom-32' : 'bottom-20 md:bottom-10'
          }`}
          aria-label={t('common.whatsapp_label')}
        >
          <MessageCircle className="w-8 h-8 fill-current" />
        </a>
      )}

      {/* Newsletter Popup */}
      <AnimatePresence>
        {showNewsletter && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-stone-900/40 backdrop-blur-sm"
          >
            <div className="bg-ivory max-w-lg w-full p-10 relative overflow-hidden border border-stone-200"
                 role="dialog"
                 aria-modal="true">
              <button 
                onClick={handleDismissNewsletter}
                className="absolute top-4 right-4 text-stone-600 hover:text-stone-800 transition-colors"
                aria-label={t('common.close')}
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-ivory rounded-full flex items-center justify-center mx-auto mb-6 text-gold">
                  <Mail className="w-8 h-8" />
                </div>
                <h3 className="font-heading text-3xl text-stone-800 mb-4 tracking-wider uppercase">{t('newsletter.title')}</h3>
                <p className="text-stone-600 text-sm mb-8 leading-relaxed italic">{t('newsletter.body')}</p>
                
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleDismissNewsletter(); }}>
                  <input 
                    type="email" 
                    placeholder={t('newsletter.email_placeholder')} 
                    className="w-full px-6 py-4 bg-stone-50 border border-stone-200 text-xs tracking-widest uppercase outline-none focus:border-gold"
                    aria-label={t('newsletter.email_aria')}
                  />
                  <button className="w-full btn-luxury">{t('newsletter.cta')}</button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cookie Banner */}
      <AnimatePresence>
        {showCookies && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-16 md:bottom-0 left-0 w-full z-[150] bg-onyx border-t border-gold/30 px-6 py-4 md:py-5 pb-[max(1rem,env(safe-area-inset-bottom))]"
          >
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 max-w-5xl">
              <div className="text-center md:text-left">
                <p className="font-label text-xs tracking-[0.2em] uppercase text-bone/80 mb-1">{t('cookies.heading')}</p>
                <p className="text-sm text-bone/90">{t('cookies.body')} <Link to="/privacy" className="underline hover:text-gold-light">{t('cookies.learn')}</Link>.</p>
              </div>
              <div className="flex gap-3 shrink-0">
                <button
                  onClick={handleAcceptCookies}
                  className="px-6 py-3 bg-bone text-onyx font-label text-xs tracking-[0.2em] uppercase hover:bg-gold hover:text-onyx transition-all font-bold min-h-[44px]"
                >
                  {t('cookies.accept')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
