import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useSpring, animate } from 'motion/react';
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
  const [cursorHovered, setCursorHovered] = useState(false);
  const [count, setCount] = useState(0);
  const mouseTrackingRef = useRef<number>(0);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    if (!loading) return;
    const controls = animate(0, 100, {
      duration: 1.7,
      ease: 'easeInOut',
      onUpdate: (v) => setCount(Math.round(v)),
    });
    const timer = setTimeout(() => {
      sessionStorage.setItem('riman_preloader_shown', '1');
      isFirstVisit.current = false;
      setLoading(false);
    }, 2100);
    return () => { controls.stop(); clearTimeout(timer); };
  }, [loading]);

  useEffect(() => {
    if (preloaderEnabled && !prefersReducedMotion && isFirstVisit.current && location.pathname === '/') {
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

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setCursorHovered(!!target.closest('a, button, [data-hover]'));
    };
    window.addEventListener('mouseover', handleMouseOver, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
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

      {/* Luxury Preloader — couture letter rise + counter + curtain exit */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="preloader"
            data-preloader
            initial={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-[2000] bg-onyx text-ivory flex items-center justify-center"
          >
            <div className="overflow-hidden px-4">
              <h1 className="font-heading font-medium text-[19vw] md:text-[11vw] leading-none flex" aria-label="RIMAN">
                {['R', 'I', 'M', 'A', 'N'].map((letter, i) => (
                  <motion.span
                    key={i}
                    initial={{ y: '110%' }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.9, delay: i * 0.07, ease: [0.19, 1, 0.22, 1] }}
                    className="inline-block"
                  >
                    {letter}
                  </motion.span>
                ))}
              </h1>
            </div>
            <div className="absolute bottom-8 left-8 text-[10px] uppercase tracking-[0.35em] text-gold/60">
              Maison de Couture
            </div>
            <div className="absolute bottom-8 right-8 text-sm tabular-nums text-ivory">
              {String(count).padStart(2, '0')}<span className="text-ivory/40"> / 100</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Global Cursor — only on desktop, when enabled, and not prefers-reduced-motion */}
      {customCursorEnabled && !prefersReducedMotion && (
        <>
          <motion.div
            className="hidden lg:block fixed top-0 left-0 w-8 h-8 border border-gold/60 rounded-full pointer-events-none z-[9999] mix-blend-difference"
            animate={{
              x: mousePos.x - 16,
              y: mousePos.y - 16,
              scale: cursorHovered ? 1.8 : 1,
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
