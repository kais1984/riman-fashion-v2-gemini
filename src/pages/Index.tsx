import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useScroll, AnimatePresence } from 'motion/react';
import { ArrowRight, Star, Quote, ChevronLeft, ChevronRight, Sparkles, Scissors, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { testimonials } from '../data/products';
import ProductCard from '../components/ProductCard';
import InstagramSection from '../components/InstagramSection';
import ScrollReveal from '../components/ScrollReveal';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useFeature } from '../hooks/useFeature';
import { ProductCardSkeleton } from '../components/Skeleton';
import GalleryGrid from '../components/GalleryGrid';
import GalleryLightbox from '../components/GalleryLightbox';
import { useGallery } from '../hooks/useGallery';
import WordReveal from '../components/luxury/WordReveal';
import StatCounter from '../components/luxury/StatCounter';

export default function Home() {
  const { products, content, isLoading } = useData();
  const { t } = useLanguage();
  const instagramFeedEnabled = useFeature('instagramFeed');
  const featuredProducts = products.filter(p => p.isFeatured);
  const carouselRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Slow the hero video for a more cinematic, luxury pace
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const setRate = () => { v.playbackRate = 0.7; };
    setRate();
    v.addEventListener('loadedmetadata', setRate);
    v.addEventListener('ratechange', () => { if (v.playbackRate !== 0.7) v.playbackRate = 0.7; });
    return () => v.removeEventListener('loadedmetadata', setRate);
  }, []);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Auto-rotate testimonials
  useEffect(() => {
    if (testimonials.length <= 1) return;
    const timer = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      carouselRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const ref = carouselRef.current;
    if (ref) {
      ref.addEventListener('scroll', handleScroll);
      return () => ref.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Parallax Logic from Guide
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 20, stiffness: 300 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);
  const x = useTransform(smoothX, [-800, 800], [40, -40]);
  const y = useTransform(smoothY, [-800, 800], [25, -25]);

  const handleMouseMove = (e: React.MouseEvent) => {
    requestAnimationFrame(() => {
      const { clientX, clientY } = e;
      mouseX.set(clientX - window.innerWidth / 2);
      mouseY.set(clientY - window.innerHeight / 2);
    });
  };

  // Hero scroll parallax — giant typography drifts up, video drifts down
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const giantY = useTransform(heroScroll, [0, 1], ['0%', '-22%']);
  const videoY = useTransform(heroScroll, [0, 1], ['0%', '12%']);

  return (
    <div id="homepage" className="film-grain" onMouseMove={handleMouseMove}>
      {/* Hero Section */}
      <section id="hero" ref={heroRef} className="relative min-h-[55vh] md:min-h-[80vh] lg:h-screen flex items-center justify-center bg-onyx overflow-hidden">
        {/* Cinematic Backdrop Video */}
        <motion.div className="absolute inset-0 z-0 overflow-hidden" style={{ y: videoY }}>
          <motion.video
            ref={videoRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            src="/assets/rimanfashion_3panel_split.mp4"
            poster="/assets/rimanfashion_3638158883472325906_1739454936_1_2025-05-22.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="w-full h-full object-cover object-center filter contrast-[1.05] brightness-[0.75] scale-[1.2] md:scale-100"
          />
          {/* Sophisticated Atmospheric Overlays */}
          <div className="absolute inset-0 bg-stone-900/30 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-onyx via-transparent to-onyx/40" />
        </motion.div>

        {/* Giant RIMAN typography — couture backdrop (fill layer) */}
        <motion.div
          style={{ y: giantY }}
          className="absolute inset-0 z-[1] flex items-center justify-center pointer-events-none select-none"
          aria-hidden="true"
        >
          <div className="flex overflow-hidden">
            {['R', 'I', 'M', 'A', 'N'].map((letter, i) => (
              <motion.span
                key={i}
                initial={{ y: '120%' }}
                animate={{ y: 0 }}
                transition={{ duration: 1.15, delay: 0.2 + i * 0.055, ease: [0.19, 1, 0.22, 1] }}
                className="font-heading font-bold text-[clamp(4rem,17vw,15rem)] leading-[0.82] tracking-[-0.02em] text-white/[0.05] inline-block"
              >
                {letter}
              </motion.span>
            ))}
          </div>
        </motion.div>
        {/* Giant RIMAN typography — gold outline layer */}
        <motion.div
          style={{ y: giantY }}
          className="absolute inset-0 z-[2] flex items-center justify-center pointer-events-none select-none"
          aria-hidden="true"
        >
          <div className="flex overflow-hidden">
            {['R', 'I', 'M', 'A', 'N'].map((letter, i) => (
              <motion.span
                key={i}
                initial={{ y: '120%' }}
                animate={{ y: 0 }}
                transition={{ duration: 1.15, delay: 0.25 + i * 0.055, ease: [0.19, 1, 0.22, 1] }}
                className="font-heading font-bold text-[clamp(4rem,17vw,15rem)] leading-[0.82] tracking-[-0.02em] text-transparent inline-block [-webkit-text-stroke:1.5px_rgba(212,175,55,0.35)]"
              >
                {letter}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Corner meta — couture details */}
        <div className="absolute bottom-8 left-6 md:left-10 z-[4] hidden md:flex flex-col items-start gap-3 pointer-events-none">
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/70">{t('hero.discover')}</span>
          <span className="w-px h-11 bg-white/20 relative overflow-hidden">
            <motion.span
              className="absolute inset-0 bg-gold"
              animate={{ y: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: [0.76, 0, 0.24, 1] }}
            />
          </span>
        </div>
        <div className="absolute bottom-8 right-6 md:right-10 z-[4] hidden md:block text-[10px] uppercase tracking-[0.3em] text-white/70 text-right pointer-events-none">
          Silhouettes<br />in Motion
        </div>

        {/* Floating Creative Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div 
            style={{ x, y }}
            animate={{ opacity: [0.05, 0.15, 0.05] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-[10%] left-[-5%] w-[40rem] h-[40rem] border border-white/10 hidden lg:block rounded-full rotate-12"
          />
          <motion.div 
            style={{ x: useTransform(smoothX, [-500, 500], [-20, 20]), y: useTransform(smoothY, [-500, 500], [-15, 15]) }}
            animate={{ opacity: [0.02, 0.1, 0.02] }}
            transition={{ duration: 12, repeat: Infinity, delay: 2 }}
            className="absolute bottom-[5%] right-[-5%] w-[35rem] h-[35rem] border border-gold/20 hidden md:block rounded-full"
          />
        </div>
        
        <div className="container relative z-10 text-center px-6 py-20 md:py-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5 }}
            className="mb-6 md:mb-8"
          >
            <div className="flex items-center justify-center gap-4 mb-4 md:mb-6">
              <span className="w-12 h-px bg-gold/50" />
              <Star className="w-3 h-3 text-gold/80 fill-current" />
              <span className="w-12 h-px bg-gold/50" />
            </div>
            <p className="text-white/80 uppercase tracking-[0.6em] md:tracking-[0.8em] text-[9px] md:text-xs font-bold drop-shadow-md">
              {t('hero.subtitle')}
            </p>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.3 }}
            className="heading-display text-4xl sm:text-5xl md:text-7xl lg:text-[4.5rem] xl:text-[5.5rem] text-white font-bold mb-8 md:mb-12 drop-shadow-2xl"
          >
            {t('hero.title').split('&').map((part, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-gold italic mx-2 md:mx-4">&</span>}
                <span className="block lg:inline">{part.trim()}</span>
              </React.Fragment>
            ))}
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-stretch justify-center gap-3 sm:gap-4 max-w-md sm:max-w-lg mx-auto"
          >
            <Link to="/collection/bridal" className="btn-luxury animate-shimmer bg-[length:200%_100%] hover:scale-105 transition-transform duration-500 flex-1 text-[10px] sm:text-xs px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
              {t('cta.explore')}
            </Link>
            <Link to="/appointment" className="btn-luxury-outline !border-white/40 !text-white hover:!bg-gold hover:!text-onyx backdrop-blur-md flex-1 text-[10px] sm:text-xs px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
              {t('cta.viewing')}
            </Link>
          </motion.div>

        </div>
      </section>

      {/* Atelier Journal Section */}
      <section className="section-padding bg-bone border-y border-stone-200 mt-8">
        <ScrollReveal>
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div className="relative">
                <div className="aspect-[3/4] bg-stone-200 overflow-hidden">
                  <img 
                    src="/assets/rimanfashion_3638158883472325906_1739454936_1_2025-05-22.jpg" 
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
                    alt="Atelier Journal" 
                    loading="lazy"
                  />
                </div>
                <div className="absolute -bottom-12 -right-12 w-2/3 aspect-square bg-onyx p-12 hidden md:flex flex-col justify-center border border-gold/20 text-ivory">
                  <h4 className="heading-display text-4xl mb-6">{t('journal.finding')}</h4>
                  <p className="text-[10px] tracking-[0.3em] uppercase opacity-90 leading-relaxed font-bold">{t('journal.guide')}</p>
                </div>
              </div>
              <div className="space-y-12">
                <h2 className="heading-display text-gold text-sm">{t('journal.title')}</h2>
                <h3 className="heading-display text-5xl md:text-7xl text-stone-900">{t('journal.heading')}</h3>
                <div className="w-16 h-px bg-gold/40" />
                <p className="text-stone-500 font-body text-sm leading-relaxed tracking-wide italic">
                  "{t('journal.quote')}"
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-10">
                  <div className="space-y-4 bg-gold/5 p-8 border border-gold/10">
                    <h5 className="font-heading text-sm font-bold tracking-widest uppercase">{t('journal.fabric_title')}</h5>
                    <p className="text-xs text-stone-500 leading-relaxed uppercase tracking-tighter">{t('journal.fabric_desc')}</p>
                  </div>
                  <div className="space-y-4 bg-stone-100 p-8 border border-stone-200">
                    <h5 className="font-heading text-sm font-bold tracking-widest uppercase">{t('journal.artisan_title')}</h5>
                    <p className="text-xs text-stone-500 leading-relaxed uppercase tracking-tighter">{t('journal.artisan_desc')}</p>
                  </div>
                </div>
                <div className="pt-8">
                  <Link to="/blog" className="btn-luxury">{t('journal.btn')}</Link>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Brand Promise */}
      <section className="section-padding bg-ivory">
        <ScrollReveal direction="up" delay={0.2}>
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <h2 className="heading-editorial text-stone-400 text-sm">{t('heritage.title')}</h2>
                <h3 className="font-heading text-4xl md:text-5xl text-stone-800 tracking-wide leading-tight">{t('about.hero_title')}</h3>
                <div className="w-16 h-px bg-gold" />
                <p className="font-body text-stone-500 leading-relaxed text-sm">
                  {t('footer.about')}
                </p>
                <Link to="/about" className="inline-flex items-center gap-2 text-gold text-xs tracking-widest uppercase hover:gap-4 transition-all pb-1 border-b border-gold/30 font-medium">
                  {t('nav.about')} <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="relative hidden lg:block">
                <div className="aspect-[4/5] bg-stone-100 overflow-hidden">
                  <img 
                    src="/assets/rimanfashion_3542687554351211237_227867687_1_2025-01-10.jpg" 
                    className="w-full h-full object-cover" 
                    alt="Atelier Riman Heritage" 
                    loading="lazy"
                  />
                </div>
                <div className="absolute -top-6 -left-6 w-24 h-24 border border-gold/20" />
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Category Tiles */}
      <section className="px-6 md:px-12 grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <ScrollReveal direction="right" delay={0.1}>
          <Link to="/collection/bridal" className="relative group overflow-hidden aspect-[4/5] block hover:ring-1 hover:ring-gold transition-all">
            <img src="/assets/rimanfashion_3542687554351211237_227867687_1_2025-01-10.jpg" alt="Bridal" loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-stone-900/30 group-hover:bg-stone-900/50 transition-colors flex flex-col items-center justify-center text-white p-6 text-center">
              <span className="font-heading text-3xl tracking-widest mb-2">{t('cat.bridal')}</span>
              <span className="text-xs tracking-[0.3em] uppercase opacity-0 group-hover:opacity-100 transition-opacity">{t('cat.collection')}</span>
            </div>
          </Link>
        </ScrollReveal>
        <ScrollReveal direction="up" delay={0.2}>
          <Link to="/collection/evening" className="relative group overflow-hidden aspect-[4/5] block hover:ring-1 hover:ring-gold transition-all">
            <img src="/assets/rimanfashion_3638158883472325906_1739454936_2_2025-05-22.jpg" alt="Evening" loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-stone-900/30 group-hover:bg-stone-900/50 transition-colors flex flex-col items-center justify-center text-white">
              <span className="font-heading text-3xl tracking-widest mb-2">{t('cat.evening')}</span>
              <span className="text-[10px] tracking-[0.3em] uppercase opacity-0 group-hover:opacity-100 transition-opacity">{t('cat.gala')}</span>
            </div>
          </Link>
        </ScrollReveal>
        <ScrollReveal direction="up" delay={0.3}>
          <Link to="/collection/rental" className="relative group overflow-hidden aspect-[4/5] block hover:ring-1 hover:ring-gold transition-all">
            <video src="/assets/rimanfashion_3306305106777368667_227867687_2024-02-19.mp4" autoPlay muted loop playsInline className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 pointer-events-none" />
            <div className="absolute inset-0 bg-stone-900/30 group-hover:bg-stone-900/50 transition-colors flex flex-col items-center justify-center text-white">
              <span className="font-heading text-3xl tracking-widest mb-2">{t('cat.rentals')}</span>
              <span className="text-[10px] tracking-[0.3em] uppercase opacity-0 group-hover:opacity-100 transition-opacity">{t('cat.service')}</span>
            </div>
          </Link>
        </ScrollReveal>
      </section>

      {/* Featured Collection */}
      <section className="section-padding bg-ivory overflow-hidden">
        <ScrollReveal>
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div>
                <h2 className="heading-editorial text-stone-400 text-sm mb-4">{t('curated.eyebrow')}</h2>
                <h3 className="font-heading text-4xl text-stone-800 tracking-wide">{t('curated.heading')}</h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => scroll('left')}
                    disabled={!canScrollLeft}
                    className="p-3 border border-stone-200 text-stone-800 disabled:opacity-20 hover:border-gold hover:text-gold transition-all"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => scroll('right')}
                    disabled={!canScrollRight}
                    className="p-3 border border-stone-200 text-stone-800 disabled:opacity-20 hover:border-gold hover:text-gold transition-all"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <Link to="/collection/all" className="btn-luxury-outline">
                  {t('cta.view_all')}
                </Link>
              </div>
            </div>

            <div
              ref={carouselRef}
              className="flex gap-10 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-12 cursor-grab active:cursor-grabbing"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="min-w-[280px] md:min-w-[320px] lg:min-w-[350px] snap-start">
                    <ProductCardSkeleton />
                  </div>
                ))
              ) : (
              featuredProducts.map((product) => (
                <div key={product.id} className="min-w-[280px] md:min-w-[320px] lg:min-w-[350px] snap-start">
                  <ProductCard product={product} />
                </div>
              ))
              )}
            </div>
            {/* Swipe hint for touch devices */}
            {('ontouchstart' in window) && (
              <div className="mt-4 text-center text-xs text-white opacity-70 md:hidden">
                swipe ↔
              </div>
            )}
          </div>
        </ScrollReveal>
      </section>

      {/* Philosophy — word scrub + stats */}
      <section className="bg-onyx text-ivory px-6 md:px-12 lg:px-20 py-32 md:py-48 border-t border-white/10">
        <p className="text-[10px] uppercase tracking-[0.35em] text-gold mb-12">
          ( 03 ) — {t('philosophy.eyebrow')}
        </p>
        <WordReveal
          text={t('philosophy.statement')}
          className="font-editorial italic text-[7vw] md:text-[3.4vw] leading-[1.15] max-w-6xl text-white"
        />
        <div className="grid grid-cols-3 gap-6 mt-24 md:mt-36 border-t border-white/10 pt-10">
          <StatCounter value={15} label={t('philosophy.stat_years')} />
          <StatCounter value={100} suffix="%" label={t('philosophy.stat_fibres')} />
          <StatCounter value={500} suffix="+" label={t('philosophy.stat_brides')} />
        </div>
      </section>

      {/* The Riman Bespoke Journey */}
      <section className="py-24 md:py-32 bg-bone border-y border-stone-200">
        <ScrollReveal>
          <div className="container mx-auto px-6">
            <div className="text-center mb-20">
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="w-12 h-px bg-gold/40" />
                <Sparkles className="w-4 h-4 text-gold" />
                <span className="w-12 h-px bg-gold/40" />
              </div>
              <h2 className="heading-editorial text-stone-400 text-sm mb-4">The Riman Experience</h2>
              <h3 className="font-heading text-4xl md:text-5xl text-stone-800 tracking-wide">Your Bespoke Journey</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative">
              {/* Connecting line */}
              <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-px bg-gradient-to-r from-gold/20 via-gold/40 to-gold/20" />

              {/* Step 1 */}
              <div className="text-center relative">
                <div className="w-24 h-24 bg-ivory border border-stone-200 flex items-center justify-center mx-auto mb-8 relative z-10">
                  <Sparkles className="w-8 h-8 text-gold" />
                </div>
                <span className="text-[10px] text-gold tracking-[0.3em] uppercase font-bold">Step 01</span>
                <h4 className="font-heading text-xl text-stone-800 tracking-widest uppercase mt-3 mb-4">Share Your Vision</h4>
                <p className="text-stone-500 text-sm leading-relaxed italic max-w-xs mx-auto">
                  Begin with a private consultation at our Sharjah atelier. Bring your inspirations — photos, moodboards, or a simple idea. Together, we shape your vision into a silhouette that celebrates you.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center relative">
                <div className="w-24 h-24 bg-ivory border border-stone-200 flex items-center justify-center mx-auto mb-8 relative z-10">
                  <Scissors className="w-8 h-8 text-gold" />
                </div>
                <span className="text-[10px] text-gold tracking-[0.3em] uppercase font-bold">Step 02</span>
                <h4 className="font-heading text-xl text-stone-800 tracking-widest uppercase mt-3 mb-4">Select Your Fabrics</h4>
                <p className="text-stone-500 text-sm leading-relaxed italic max-w-xs mx-auto">
                  Choose from our curated collection of luxury silks, lace, tulle, and hand-embroidered fabrics sourced from the finest houses in France, Italy, and Switzerland.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center relative">
                <div className="w-24 h-24 bg-ivory border border-stone-200 flex items-center justify-center mx-auto mb-8 relative z-10">
                  <Heart className="w-8 h-8 text-gold" />
                </div>
                <span className="text-[10px] text-gold tracking-[0.3em] uppercase font-bold">Step 03</span>
                <h4 className="font-heading text-xl text-stone-800 tracking-widest uppercase mt-3 mb-4">The Perfect Fit</h4>
                <p className="text-stone-500 text-sm leading-relaxed italic max-w-xs mx-auto">
                  Every fitting refines your silhouette. Our master artisans ensure your gown feels like it was born for you — a one-of-a-kind masterpiece, ready for your most cherished moment.
                </p>
              </div>
            </div>

            <div className="text-center mt-16">
              <Link to="/appointment" className="btn-luxury">
                Begin Your Journey
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Visual Reverie — Gallery Teaser */}
      <section className="section-padding bg-onyx relative overflow-hidden">
        <ScrollReveal>
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div className="max-w-xl">
                <div className="flex items-center gap-3 text-gold mb-4">
                  <span className="text-[10px] tracking-[0.4em] uppercase font-bold">{t('gallery.title')}</span>
                </div>
                <h2 className="heading-display text-5xl md:text-7xl text-white">{t('gallery.subtitle')}</h2>
              </div>
              <Link to="/gallery" className="btn-luxury-outline !border-gold/30 !text-gold hover:!bg-gold hover:!text-onyx uppercase tracking-[0.3em] font-bold">
                {t('gallery.view_full')}
              </Link>
            </div>

            <GalleryTeaserGrid />
          </div>
        </ScrollReveal>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-ivory relative overflow-hidden">
        <Quote className="absolute -top-10 -left-10 w-64 h-64 text-ivory rotate-12 hidden md:block" />
        <div className="container relative z-10 max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <div className="w-16 h-px bg-gold mx-auto mb-12" />
            <div className="min-h-[200px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="font-heading text-2xl md:text-3xl text-stone-700 italic mb-8 leading-relaxed">
                    "{testimonials[activeTestimonial].content}"
                  </p>
                  <h4 className="font-body text-sm tracking-[0.2em] uppercase text-stone-800 mb-1 font-bold">{testimonials[activeTestimonial].authorName}</h4>
                  <p className="font-body text-[11px] tracking-widest text-gold uppercase">{testimonials[activeTestimonial].authorRole}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            {/* Navigation dots */}
            <div className="flex items-center justify-center gap-3 mt-10">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTestimonial(idx)}
                  className={cn(
                    "transition-all duration-300",
                    idx === activeTestimonial
                      ? "w-8 h-1 bg-gold"
                      : "w-2 h-1 bg-stone-300 hover:bg-stone-400"
                  )}
                  aria-label={`Testimonial ${idx + 1}`}
                />
              ))}
            </div>
            <div className="w-16 h-px bg-gold mx-auto mt-12" />
          </ScrollReveal>
        </div>
      </section>

      {/* Instagram Feed */}
      {instagramFeedEnabled && <InstagramSection />}

      {/* Consultation Banner */}
      <section className="relative py-40 overflow-hidden bg-onyx">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        <ScrollReveal>
          <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center">
            <span className="w-12 h-px bg-gold mb-10" />
            <h2 className="heading-display text-5xl md:text-7xl text-white mb-6">{t('experience.heading')}</h2>
            <p className="text-ivory/70 mb-8 max-w-2xl font-body text-sm leading-relaxed tracking-wide">
              {t('experience.desc')}
            </p>
            <div className="flex flex-wrap justify-center gap-6 mb-12 text-[10px] tracking-widest uppercase text-stone-400">
              <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-gold" /> {t('experience.bridal')}</span>
              <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-gold" /> {t('experience.evening')}</span>
            </div>
            <Link to="/appointment" className="btn-luxury animate-shimmer bg-[length:200%_100%] scale-110 shadow-gold/20">
              {t('experience.cta')}
            </Link>
          </div>
        </ScrollReveal>
        
        {/* Artistic Backdrop Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] border border-gold/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold/5 blur-[120px] translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-10 w-px h-64 bg-gradient-to-b from-transparent via-gold/40 to-transparent" />
      </section>
    </div>
  );
}

function GalleryTeaserGrid() {
  const { items } = useGallery({ featured: true, limit: 6 });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const handleItemClick = (_item: any, index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (items.length === 0) return null;

  return (
    <>
      <GalleryGrid items={items} onItemClick={handleItemClick} />
      <GalleryLightbox
        items={items}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
      />
    </>
  );
}
