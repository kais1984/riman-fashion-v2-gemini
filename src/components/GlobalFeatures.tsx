import { ReactNode, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useScrollLock } from '../hooks/useScrollLock';
import { useFeature } from '../hooks/useFeature';

export default function GlobalFeatures() {
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
    }, 5000);
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
      {/* WhatsApp Float */}
      {whatsappEnabled && (
        <a 
          href="https://wa.me/971553730792" 
          target="_blank" 
          rel="noreferrer"
          className="fixed bottom-20 right-4 md:bottom-10 md:right-10 z-[100] w-12 h-12 md:w-14 md:h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform animate-bounce"
          aria-label="Contact us on WhatsApp"
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
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-800 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-ivory rounded-full flex items-center justify-center mx-auto mb-6 text-gold">
                  <Mail className="w-8 h-8" />
                </div>
                <h3 className="font-heading text-3xl text-stone-800 mb-4 tracking-wider uppercase">The Atelier Circle</h3>
                <p className="text-stone-500 text-sm mb-8 leading-relaxed italic">Join for exclusive previews of our new bridal collections and private viewings in Sharjah.</p>
                
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleDismissNewsletter(); }}>
                  <input 
                    type="email" 
                    placeholder="E-mail Address" 
                    className="w-full px-6 py-4 bg-stone-50 border border-stone-200 text-xs tracking-widest uppercase outline-none focus:border-gold"
                    aria-label="Email address"
                  />
                  <button className="w-full btn-luxury">Join The Society</button>
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
            className="fixed bottom-0 left-0 w-full z-[150] bg-ivory border-t border-stone-200 p-6 md:p-8"
          >
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <p className="text-[10px] tracking-widest uppercase text-stone-500 mb-1">Privacy & Elegance</p>
                <p className="text-xs text-stone-800 tracking-wide">We use cookies to curate a personalized atelier experience. <Link to="/privacy" className="underline hover:text-gold">Learn details</Link>.</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={handleAcceptCookies}
                  className="px-8 py-3 bg-stone-900 text-white text-[10px] tracking-[0.2em] uppercase hover:bg-stone-800 transition-all font-bold"
                >
                  Accept & Explore
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
