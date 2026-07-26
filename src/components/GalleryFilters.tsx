import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';

const CATEGORIES = [
  { key: 'all', i18nKey: 'gallery.filter_all' },
  { key: 'bridal', i18nKey: 'gallery.filter_bridal' },
  { key: 'evening', i18nKey: 'gallery.filter_evening' },
  { key: 'behind_scenes', i18nKey: 'gallery.filter_bts' },
  { key: 'client_stories', i18nKey: 'gallery.filter_clients' },
];

interface GalleryFiltersProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  className?: string;
}

export default function GalleryFilters({ activeCategory, onCategoryChange, className }: GalleryFiltersProps) {
  const { t } = useLanguage();

  return (
    <div className={cn('flex flex-wrap gap-3 justify-center', className)}>
      {CATEGORIES.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onCategoryChange(cat.key)}
          className={cn(
            'relative px-5 py-2 text-[10px] tracking-[0.3em] uppercase font-bold transition-all duration-300 border overflow-hidden',
            activeCategory === cat.key
              ? 'bg-gold text-onyx border-gold'
              : 'border-stone-200 text-stone-600 hover:border-gold hover:text-gold'
          )}
        >
          {activeCategory === cat.key && (
            <motion.span
              layoutId="activeFilter"
              className="absolute inset-0 bg-gold"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">{t(cat.i18nKey)}</span>
        </button>
      ))}
    </div>
  );
}
