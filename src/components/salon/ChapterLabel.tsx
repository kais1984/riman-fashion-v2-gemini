import { useLanguage } from '../../contexts/LanguageContext';

interface ChapterLabelProps {
  numeral: string;
  titleKey: string;
}

export default function ChapterLabel({ numeral, titleKey }: ChapterLabelProps) {
  const { t } = useLanguage();
  return (
    <div className="flex items-center gap-4 md:gap-6">
      <span className="font-label text-xs tracking-[0.3em] uppercase text-gold">{numeral}</span>
      <span className="h-px w-12 bg-gold/40" aria-hidden="true" />
      <h2 className="font-heading text-3xl md:text-5xl font-light tracking-normal normal-case text-stone-800">
        {t(titleKey)}
      </h2>
    </div>
  );
}
