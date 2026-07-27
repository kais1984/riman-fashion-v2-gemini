import { useEffect, useRef, useState } from 'react';
import { animate, useInView } from 'motion/react';

interface StatCounterProps {
  value: number;
  suffix?: string;
  label: string;
  duration?: number;
}

export default function StatCounter({ value, suffix, label, duration = 1.6 }: StatCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, duration]);

  return (
    <div>
      <p className="font-heading text-5xl md:text-7xl text-white font-medium">
        <span ref={ref} data-testid="stat-value">{display}</span>
        {suffix && <span className="text-gold text-3xl md:text-5xl align-top">{suffix}</span>}
      </p>
      <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mt-3">{label}</p>
    </div>
  );
}
