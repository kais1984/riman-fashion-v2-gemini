import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useScrollLock } from '../hooks/useScrollLock';
import { useLanguage } from '../contexts/LanguageContext';

interface SizeGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SizeGuide({ isOpen, onClose }: SizeGuideProps) {
  useScrollLock(isOpen);
  const { t } = useLanguage();
  const sizes = [
    { label: 'XS', bust: '78-82', waist: '60-64', hips: '86-90' },
    { label: 'S', bust: '82-86', waist: '64-68', hips: '90-94' },
    { label: 'M', bust: '86-90', waist: '68-72', hips: '94-98' },
    { label: 'L', bust: '90-94', waist: '72-76', hips: '98-102' },
    { label: 'XL', bust: '94-100', waist: '76-82', hips: '102-108' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-ivory border border-stone-100 max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            <div className="sticky top-0 bg-ivory border-b border-stone-100 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="font-heading text-lg text-stone-800 tracking-widest uppercase">{t('size_guide.title')}</h3>
              <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-800 transition-colors" aria-label="Close size guide">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <p className="font-body text-stone-500 text-sm leading-relaxed mb-6">
                {t('size_guide.desc')}
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-200">
                      <th className="text-left py-3 px-2 font-heading text-[10px] tracking-[0.2em] uppercase text-stone-500 font-bold">{t('size_guide.size')}</th>
                      <th className="text-left py-3 px-2 font-heading text-[10px] tracking-[0.2em] uppercase text-stone-500 font-bold">{t('size_guide.bust')}</th>
                      <th className="text-left py-3 px-2 font-heading text-[10px] tracking-[0.2em] uppercase text-stone-500 font-bold">{t('size_guide.waist')}</th>
                      <th className="text-left py-3 px-2 font-heading text-[10px] tracking-[0.2em] uppercase text-stone-500 font-bold">{t('size_guide.hips')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizes.map(s => (
                      <tr key={s.label} className="border-b border-stone-100 hover:bg-ivory/50 transition-colors">
                        <td className="py-3 px-2 font-heading font-bold text-stone-800 text-xs tracking-wider">{s.label}</td>
                        <td className="py-3 px-2 font-body text-stone-600">{s.bust} {t('size_guide.cm')}</td>
                        <td className="py-3 px-2 font-body text-stone-600">{s.waist} {t('size_guide.cm')}</td>
                        <td className="py-3 px-2 font-body text-stone-600">{s.hips} {t('size_guide.cm')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 pt-6 border-t border-stone-100">
                <h4 className="font-heading text-xs tracking-widest uppercase text-stone-800 font-bold mb-3">{t('size_guide.how_to_measure')}</h4>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-gold/10 text-gold flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                    <p className="font-body text-stone-500 text-sm"><span className="text-stone-800 font-semibold">{t('size_guide.measure_bust')}</span> {t('size_guide.measure_bust_desc')}</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-gold/10 text-gold flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                    <p className="font-body text-stone-500 text-sm"><span className="text-stone-800 font-semibold">{t('size_guide.measure_waist')}</span> {t('size_guide.measure_waist_desc')}</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-gold/10 text-gold flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                    <p className="font-body text-stone-500 text-sm"><span className="text-stone-800 font-semibold">{t('size_guide.measure_hips')}</span> {t('size_guide.measure_hips_desc')}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gold/5 border border-gold/20">
                <p className="font-body text-stone-600 text-sm leading-relaxed">
                  <span className="font-bold text-gold">{t('size_guide.alterations_title')}</span> {t('size_guide.alterations_desc')}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}