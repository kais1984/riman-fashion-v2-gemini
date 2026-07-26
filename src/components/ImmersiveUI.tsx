import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import Logo from './Logo';
import { useFeature } from '../hooks/useFeature';

function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
}

export default function ImmersiveUI() {
  const preloaderEnabled = useFeature('preloader');
  const customCursorEnabled = useFeature('customCursor');
  const prefersReducedMotion = usePrefersReducedMotion();
  const location = useLocation();
  const isFirstVisit = useRef(!sessionStorage.getItem('riman_preloader_shown'));
  const [loading, setLoading] = useState(() => {
    if (preloaderEnabled && !prefersReducedMotion && isFirstVisit.current && location.pathname === '/') return true;
    return false;
  });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const mouseTrackingRef = useRef<number>(0);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        sessionStorage.setItem('riman_preloader_shown', '1');
        isFirstVisit.current = false;
        setLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  useEffect(() => {
    if (preloaderEnabled && !prefersReducedMotion && !isFirstVisit.current && location.pathname === '/') {
      setLoading(true);
    }
  }, [location.pathname, preloaderEnabled, prefersReducedMotion]);

  // Throttled mouse tracking for custom cursor
  useEffect(() => {
    if (!customCursorEnabled || prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (mouseTrackingRef.current) {
        cancelAnimationFrame(mouseTrackingRef.current);
      }
      mouseTrackingRef.current = requestAnimationFrame(() => {
        setMousePos({ x: e.clientX, y: e.clientY });
      });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (mouseTrackingRef.current) cancelAnimationFrame(mouseTrackingRef.current);
    };
  }, [customCursorEnabled, prefersReducedMotion]);

  return (
    <>
      {/* Scroll Progress Bar — disabled with prefers-reduced-motion */}
      {!prefersReducedMotion && (
        <motion.div
          className="fixed top-0 left-0 right-0 h-[2px] bg-gold z-[1001] origin-left"
          style={{ scaleX }}
        />
      )}

      {/* Luxury Preloader */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="preloader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
            className="fixed inset-0 z-[2000] bg-stone-900 flex flex-col items-center justify-center p-10"
          >
            <motion.div
              initial={prefersReducedMotion ? {} : { scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <Logo variant="gold" className="w-40 md:w-64 mb-8" />
              <div className="overflow-hidden">
                <motion.p
                  initial={prefersReducedMotion ? {} : { y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
                  className="font-body text-[10px] tracking-[0.6em] uppercase text-gold/60"
                >
                  Establishing the Atelier
                </motion.p>
              </div>
            </motion.div>
            
            {/* Elegant Line Loader */}
            {!prefersReducedMotion && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 h-px bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.8, ease: "easeInOut" }}
                  className="h-full bg-gold"
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Global Cursor — only on desktop, when enabled, and not prefers-reduced-motion */}
      {customCursorEnabled && !prefersReducedMotion && (
        <>
          <motion.div
            className="hidden lg:block fixed top-0 left-0 w-8 h-8 border border-gold/30 rounded-full pointer-events-none z-[9999] mix-blend-difference"
            animate={{
              x: mousePos.x - 16,
              y: mousePos.y - 16,
              scale: 1,
            }}
            transition={{ type: 'spring', damping: 20, stiffness: 150, mass: 0.5 }}
          />
          <motion.div
            className="hidden lg:block fixed top-0 left-0 w-1.5 h-1.5 bg-gold rounded-full pointer-events-none z-[9999]"
            animate={{
              x: mousePos.x - 3,
              y: mousePos.y - 3,
            }}
            transition={{ type: 'spring', damping: 30, stiffness: 250, mass: 0.1 }}
          />
        </>
      )}
    </>
  );
}
