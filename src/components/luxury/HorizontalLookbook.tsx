import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
import { useGallery, GalleryItem } from '../../hooks/useGallery';
import { useLanguage } from '../../contexts/LanguageContext';

function Panel({ item, offset }: { item: GalleryItem; offset?: boolean }) {
  return (
    <figure className={offset ? 'md:mt-24' : ''}>
      <div className="overflow-hidden group">
        <img
          src={item.thumbnail_url || item.media_url}
          alt={item.title}
          loading="lazy"
          className="h-[52vh] md:h-[62vh] w-full md:w-[32vw] object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-105"
        />
      </div>
      <figcaption className="flex justify-between mt-4 text-[10px] uppercase tracking-[0.3em] text-ivory">
        <span>{item.title}</span>
        <span className="text-ivory/40">{item.category}</span>
      </figcaption>
    </figure>
  );
}

export default function HorizontalLookbook() {
  const { items } = useGallery({ featured: true, limit: 6 });

  if (items.length === 0) return null;

  return <LookbookContent items={items} />;
}

function LookbookContent({ items }: { items: GalleryItem[] }) {
  const { t } = useLanguage();
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: targetRef });
  const x = useTransform(scrollYProgress, [0, 1], ['2%', '-72%']);
  const progressScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <>
      {/* Desktop: pinned horizontal scroll */}
      <section ref={targetRef} className="relative hidden md:block h-[320vh] bg-onyx">
        <div className="sticky top-0 h-screen flex items-center overflow-hidden">
          <motion.div style={{ x }} className="flex items-center gap-[6vw] px-[8vw] will-change-transform">
            <div className="shrink-0 w-[34vw]">
              <p className="text-[10px] uppercase tracking-[0.35em] text-ivory/40 mb-6">
                ( 02 ) — {t('lookbook.eyebrow')}
              </p>
              <h2 className="font-heading font-medium text-6xl md:text-[5.5vw] leading-[0.9] text-white mb-8">
                {t('lookbook.heading')}
              </h2>
              <span className="text-[10px] uppercase tracking-[0.3em] text-ivory/40">
                {t('hero.discover')} →
              </span>
            </div>

            {items.map((item, i) => (
              <div key={item.id} className="shrink-0">
                <Panel item={item} offset={i % 2 === 1} />
              </div>
            ))}

            <div className="shrink-0 w-[30vw] flex items-center">
              <Link to="/collection/all" className="group">
                <span className="font-heading italic font-medium text-5xl md:text-[4vw] leading-tight block text-white group-hover:text-gold transition-colors duration-500">
                  {t('lookbook.cta')}
                </span>
                <span className="inline-block mt-6 text-2xl text-gold group-hover:translate-x-3 transition-transform duration-500">→</span>
              </Link>
            </div>
          </motion.div>

          <div className="absolute bottom-8 left-[8vw] right-[8vw] h-px bg-white/15">
            <motion.div className="h-full bg-gold origin-left" style={{ scaleX: progressScale }} />
          </div>
        </div>
      </section>

      {/* Mobile: vertical stack */}
      <section className="md:hidden bg-onyx px-6 py-24">
        <p className="text-[10px] uppercase tracking-[0.35em] text-ivory/40 mb-4">( 02 ) — {t('lookbook.eyebrow')}</p>
        <h2 className="font-heading font-medium text-5xl leading-[0.9] text-white mb-10">{t('lookbook.heading')}</h2>
        <div className="flex flex-col gap-14">
          {items.map((item) => (
            <Panel key={item.id} item={item} />
          ))}
        </div>
        <Link to="/collection/all" className="inline-block mt-12 text-gold text-[11px] uppercase tracking-[0.3em] border-b border-gold/40 pb-1">
          {t('lookbook.cta')} →
        </Link>
      </section>
    </>
  );
}
