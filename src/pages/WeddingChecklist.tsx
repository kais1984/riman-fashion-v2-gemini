import { useLanguage } from '../contexts/LanguageContext';

export default function WeddingChecklist() {
  const { t } = useLanguage();
  const steps = [
    { month: t('wedding.checklist.m12'), task: t('wedding.checklist.t12') },
    { month: t('wedding.checklist.m11'), task: t('wedding.checklist.t11') },
    { month: t('wedding.checklist.m9'), task: t('wedding.checklist.t9') },
    { month: t('wedding.checklist.m6'), task: t('wedding.checklist.t6') },
    { month: t('wedding.checklist.m3'), task: t('wedding.checklist.t3') },
    { month: t('wedding.checklist.m1'), task: t('wedding.checklist.t1') },
  ];

  return (
    <div className="pt-32 pb-20 container mx-auto px-6 max-w-4xl">
      <div className="text-center mb-20">
        <h2 className="heading-editorial text-gold text-micro mb-4">{t('wedding.checklist.eyebrow')}</h2>
        <h1 className="font-heading text-4xl md:text-5xl text-stone-800 tracking-wider mb-6">{t('wedding.checklist.title')}</h1>
        <div className="divider-gold" />
      </div>

      <div className="space-y-12">
        {steps.map((s, i) => (
          <div key={i} className="flex gap-8 group">
            <div className="text-right w-1/4 shrink-0">
              <span className="font-heading text-2xl text-gold/40 group-hover:text-gold transition-colors">{s.month}</span>
            </div>
            <div className="w-px bg-stone-100 relative">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gold" />
            </div>
            <div className="pb-12 border-b border-stone-50 w-full">
              <p className="font-body text-stone-700 tracking-wide leading-relaxed italic">{s.task}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
