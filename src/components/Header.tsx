import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, User, ShoppingBag, Menu, X, Globe, Sparkles, ChevronRight, Calendar, Scissors, HelpCircle, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useScrollLock } from '../hooks/useScrollLock';
import Logo from './Logo';

const navLinks = [
  { label: "Our Story", path: "/about", key: 'nav.about' },
  { label: "Bridal", path: "/collection/bridal", key: 'nav.bridal' },
  { label: "Evening", path: "/collection/evening", key: 'nav.evening' },
  { label: "Rentals", path: "/collection/rental", key: 'nav.rentals' },
  { label: "Contact", path: "/contact", key: 'nav.contact' },
  { label: "Private Viewing", path: "/appointment", key: 'nav.private_viewing' },
];

export default function Header() {
  const { language, setLanguage, t, isRtl } = useLanguage();
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();
  const wishlistCount = wishlist.length;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoPos, setLogoPos] = useState({ x: 0, y: 0 });

  const location = useLocation();
  const isHome = location.pathname === '/';

  const handleLogoMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setLogoPos({ x: x * 0.3, y: y * 0.3 });
  };

  const resetLogo = () => setLogoPos({ x: 0, y: 0 });

  useScrollLock(isMenuOpen);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);



  return (
    <header
      id="header"
      dir={isRtl ? 'rtl' : 'ltr'}
      className={cn(
        "top-0 left-0 w-full z-[100] transition-all duration-700 ease-[0.16,1,0.3,1]",
        isHome ? "fixed" : "absolute",
        !isHome
          ? "bg-ivory/98 backdrop-blur-md py-3 border-b border-stone-200"
          : "bg-transparent py-5 md:py-8"
      )}
    >
      {(!isHome) && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      )}
      <div className="container mx-auto px-6 relative flex items-center">
        {/* Left Layer: Menu / Primary Nav / Language / Search */}
        <div className="flex flex-1 items-center justify-start gap-4">
          <div className="xl:hidden">
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-2 -ml-2 hover:bg-stone-100 transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className={cn("w-6 h-6", (!isHome) ? "text-stone-800" : "text-white")} />
            </button>
          </div>
          
          {/* Desktop Nav On Left */}
          <nav className="hidden xl:flex items-center gap-4">
            {navLinks.slice(0, 4).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "font-label text-xs tracking-[0.25em] uppercase transition-all duration-300",
                  (!isHome) 
                    ? "text-stone-600 hover:text-gold-dark" 
                    : "text-white/80 hover:text-gold border-b border-transparent hover:border-gold/40"
                )}
              >
                {link.key ? t(link.key) : link.label}
              </Link>
            ))}
          </nav>

          {/* Language + Search on the left to balance the two sides */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className={cn("hidden xl:flex items-center gap-1.5 font-body text-xs tracking-widest uppercase transition-colors ml-2",
              (!isHome) ? "text-stone-800" : "text-white"
            )}
            aria-label={language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
          >
            <Globe className="w-5 h-5" />
            <span className="hidden lg:inline">{language === 'en' ? 'AR' : 'EN'}</span>
          </button>
          <Link to="/search" className="hidden xl:block hover:text-gold transition-colors" aria-label="Search">
            <Search className={cn("w-6 h-6", (!isHome) ? "text-stone-800" : "text-white")} />
          </Link>
        </div>

        {/* Center Layer: Logo with Magnetic Effect (pinned to true center) */}
        <div className="absolute left-1/2 top-0 h-full -translate-x-1/2 flex items-center">
          <motion.div
             onMouseMove={handleLogoMove}
             onMouseLeave={resetLogo}
             animate={{ x: logoPos.x, y: logoPos.y }}
             transition={{ type: 'spring', stiffness: 150, damping: 15 }}
             className="relative z-10 flex flex-col items-center"
          >
            <Link 
              to="/" 
              id="logo"
              className="flex flex-col items-center group py-2"
            >
              <Logo 
                variant="gold" 
                className={cn("transition-all duration-700", !isHome ? "w-10" : "w-14")}
                showText={false}
              />
              <span className={cn(
                "text-xs tracking-[0.5em] uppercase mt-2 transition-all duration-700 font-heading font-bold",
                (!isHome) ? "text-stone-500 opacity-100" : "text-white/60 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-1"
              )}>
                {isHome ? 'Atelier' : 'Riman'}
              </span>
            </Link>
          </motion.div>
        </div>

        {/* Right Layer: Secondary Nav + Actions */}
        <div className="flex flex-1 items-center justify-end gap-4 md:gap-6">
          <nav className="hidden xl:flex items-center gap-4 mr-4 border-r border-stone-200 pr-4">
            {navLinks.slice(4, 7).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "font-label text-xs tracking-[0.25em] uppercase transition-all duration-300",
                  (!isHome) 
                    ? "text-stone-600 hover:text-gold-dark" 
                    : "text-white/80 hover:text-gold border-b border-transparent hover:border-gold/40"
                )}
              >
                {link.key ? t(link.key) : link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 md:gap-4">
            <Link to="/style-quiz" className="hover:text-gold transition-colors" aria-label="Style Quiz">
              <Sparkles className={cn("w-6 h-6", (!isHome) ? "text-stone-800" : "text-white")} />
            </Link>
            <Link to="/wishlist" className="hidden lg:block relative group/wishlist hover:text-gold transition-colors" aria-label="Your Selection">
              <Heart className={cn("w-6 h-6 transition-transform group-hover/wishlist:scale-110", (!isHome) ? "text-stone-800" : "text-white")} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold text-white text-[9px] w-4 h-4 flex items-center justify-center font-bold shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link to="/profile" className="hidden md:block hover:text-gold transition-colors" aria-label="Account">
              <User className={cn("w-6 h-6", (!isHome) ? "text-stone-800" : "text-white")} />
            </Link>
            <Link to="/checkout" className="hidden md:block relative group/cart">
              <ShoppingBag className={cn("w-6 h-6 transition-transform group-hover/cart:scale-110", (!isHome) ? "text-stone-800" : "text-white")} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold text-white text-[9px] w-4 h-4 flex items-center justify-center font-bold shadow-sm">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-stone-900/60 z-50 backdrop-blur-md"
            />
            <motion.div
              initial={{ x: isRtl ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
              role="dialog"
              aria-modal="true"
              className={cn(
                "fixed top-0 h-full w-[75%] bg-stone-50 z-[60] flex flex-col border-r border-stone-200/50",
                isRtl ? "right-0" : "left-0"
              )}
            >
              {/* Close Button Header */}
              <div className="flex justify-between items-center p-4 border-b border-stone-200/50 bg-ivory">
                <Logo variant="gold" className="w-10" showText={false} />
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="w-9 h-9 flex items-center justify-center bg-stone-100 text-stone-800 hover:bg-gold hover:text-white transition-all duration-300"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

               <div className="flex-1 overflow-y-auto px-5 py-6">
                {/* Primary Navigation */}
                <div className="mb-5">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-gold font-bold mb-3">{t('header.collections')}</p>
                  <nav className="flex flex-col gap-1">
                    {[
                      { label: 'Bridal', path: '/collection/bridal', key: 'nav.bridal' },
                      { label: 'Evening', path: '/collection/evening', key: 'nav.evening' },
                      { label: 'Rentals', path: '/collection/rental', key: 'nav.rentals' },
                    ].map((link, idx) => (
                      <motion.div
                        key={link.path}
                        initial={{ opacity: 0, x: isRtl ? 10 : -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + idx * 0.03 }}
                      >
                        <Link
                          to={link.path}
                          onClick={() => setIsMenuOpen(false)}
                          className="group flex items-center justify-between font-heading text-xs tracking-wide text-stone-800 py-2.5 px-3 border border-stone-100 hover:border-gold hover:bg-gold/5 transition-all"
                        >
                          <span>{link.key ? t(link.key) : link.label}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-gold transition-colors" />
                        </Link>
                      </motion.div>
                    ))}
                  </nav>
                </div>

                {/* Atelier Links */}
                <div className="mb-5">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-gold font-bold mb-3">{t('header.atelier')}</p>
                  <nav className="flex flex-col gap-1">
                    {[
                      { label: 'Our Story', path: '/about', key: 'nav.about' },
                      { label: 'Gallery', path: '/gallery', key: 'nav.gallery' },
                      { label: 'Style Quiz', path: '/style-quiz', key: 'nav.style_quiz', icon: Sparkles },
                    ].map((link, idx) => (
                      <motion.div
                        key={link.path}
                        initial={{ opacity: 0, x: isRtl ? 10 : -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + idx * 0.03 }}
                      >
                        <Link
                          to={link.path}
                          onClick={() => setIsMenuOpen(false)}
                          className="group flex items-center justify-between font-heading text-xs tracking-wide text-stone-700 py-2.5 px-3 border border-stone-100 hover:border-gold hover:bg-gold/5 transition-all"
                        >
                          <span className="flex items-center gap-2">
                            {link.icon && <link.icon className="w-3.5 h-3.5 text-gold" />}
                            {link.key ? t(link.key) : link.label}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-gold transition-colors" />
                        </Link>
                      </motion.div>
                    ))}
                  </nav>
                </div>

                {/* Services */}
                <div className="mb-5">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-gold font-bold mb-3">{t('header.services')}</p>
                  <nav className="flex flex-col gap-1">
                    {[
                      { label: 'Book Appointment', path: '/appointment', key: 'nav.appointment', icon: Calendar },
                      { label: 'Alterations', path: '/alterations', key: 'nav.alterations', icon: Scissors },
                      { label: 'FAQ', path: '/faq', key: 'nav.faq', icon: HelpCircle },
                      { label: 'Contact', path: '/contact', key: 'nav.contact', icon: Phone },
                    ].map((link, idx) => (
                      <motion.div
                        key={link.path}
                        initial={{ opacity: 0, x: isRtl ? 10 : -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.03 }}
                      >
                        <Link
                          to={link.path}
                          onClick={() => setIsMenuOpen(false)}
                          className="group flex items-center justify-between font-heading text-xs tracking-wide text-stone-700 py-2.5 px-3 border border-stone-100 hover:border-gold hover:bg-gold/5 transition-all"
                        >
                          <span className="flex items-center gap-2">
                            {link.icon && <link.icon className="w-3.5 h-3.5 text-gold" />}
                            {link.key ? t(link.key) : link.label}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-gold transition-colors" />
                        </Link>
                      </motion.div>
                    ))}
                  </nav>
                </div>

                {/* CTA Button */}
                <Link 
                  to="/appointment" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full btn-luxury text-center py-3 text-xs"
                >
                  {t('cta.appointment')}
                </Link>
              </div>

              <div className="p-4 mt-auto bg-ivory border-t border-stone-100">
                <span className="text-[9px] tracking-widest uppercase text-stone-400 block text-center">{t('header.tagline')}</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
