import { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';

interface WordRevealProps {
  text: string;
  className?: string;
}

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  return (
    <motion.span data-word style={{ opacity }} className="inline-block">
      {children}
    </motion.span>
  );
}

export default function WordReveal({ text, className }: WordRevealProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { isRtl } = useLanguage();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'end 0.45'],
  });

  // Arabic must never be split (breaks letter joining) — simple fade instead
  if (isRtl) {
    return (
      <motion.p
        ref={ref}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9 }}
        className={className}
      >
        {text}
      </motion.p>
    );
  }

  const words = text.split(/\s+/).filter(Boolean);

  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => (
        <span key={i}>
          <Word
            progress={scrollYProgress}
            range={[i / words.length, Math.min(1, (i + 1) / words.length + 0.05)]}
          >
            {word}
          </Word>
          {i < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </p>
  );
}
