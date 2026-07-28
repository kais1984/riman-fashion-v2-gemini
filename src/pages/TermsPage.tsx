import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import ScrollReveal from '../components/ScrollReveal';

export default function TermsPage() {
  const { t, lang } = useLanguage();
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className={`pt-32 pb-20 px-6 bg-neutral-100 min-h-screen ${dir === 'rtl' ? 'text-right' : ''}`} dir={dir}>
      <div className="max-w-3xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-heading text-4xl md:text-5xl text-stone-800 tracking-wider uppercase mb-2"
        >
          {t('terms.title')}
        </motion.h1>
        <p className="font-body text-stone-500 text-sm tracking-[0.2em] uppercase mb-2">
          {t('terms.subtitle')}
        </p>
        <p className="font-body text-stone-400 text-xs mb-12">
          {t('terms.last_updated')}
        </p>
        <div className="w-12 h-px bg-zinc-300 mb-12" />

        <div className="space-y-10 font-body text-stone-700 leading-relaxed text-sm">
          <ScrollReveal>
            <section>
              <h2 className="font-heading text-lg text-stone-800 tracking-wider uppercase mb-4">{t('terms.section_1_title')}</h2>
              <p>{t('terms.section_1_body')}</p>
            </section>
          </ScrollReveal>

          <ScrollReveal>
            <section>
              <h2 className="font-heading text-lg text-stone-800 tracking-wider uppercase mb-4">{t('terms.section_2_title')}</h2>
              <p>{t('terms.section_2_body')}</p>
            </section>
          </ScrollReveal>

          <ScrollReveal>
            <section>
              <h2 className="font-heading text-lg text-stone-800 tracking-wider uppercase mb-4">{t('terms.section_3_title')}</h2>
              <p>{t('terms.section_3_body')}</p>
            </section>
          </ScrollReveal>

          <ScrollReveal>
            <section>
              <h2 className="font-heading text-lg text-stone-800 tracking-wider uppercase mb-4">{t('terms.section_4_title')}</h2>
              <p>{t('terms.section_4_body')}</p>
            </section>
          </ScrollReveal>

          <ScrollReveal>
            <section>
              <h2 className="font-heading text-lg text-stone-800 tracking-wider uppercase mb-4">{t('terms.section_5_title')}</h2>
              <p>{t('terms.section_5_body')}</p>
            </section>
          </ScrollReveal>

          <ScrollReveal>
            <section>
              <h2 className="font-heading text-lg text-stone-800 tracking-wider uppercase mb-4">{t('terms.section_6_title')}</h2>
              <p>{t('terms.section_6_body')}</p>
            </section>
          </ScrollReveal>

          <ScrollReveal>
            <section>
              <h2 className="font-heading text-lg text-stone-800 tracking-wider uppercase mb-4">{t('terms.section_7_title')}</h2>
              <p>{t('terms.section_7_body')}</p>
            </section>
          </ScrollReveal>

          <ScrollReveal>
            <section>
              <h2 className="font-heading text-lg text-stone-800 tracking-wider uppercase mb-4">{t('terms.section_8_title')}</h2>
              <p>{t('terms.section_8_body')}</p>
            </section>
          </ScrollReveal>

          <ScrollReveal>
            <section>
              <h2 className="font-heading text-lg text-stone-800 tracking-wider uppercase mb-4">{t('terms.section_9_title')}</h2>
              <p>{t('terms.section_9_body')}</p>
            </section>
          </ScrollReveal>

          <ScrollReveal>
            <section>
              <h2 className="font-heading text-lg text-stone-800 tracking-wider uppercase mb-4">{t('terms.contact_title')}</h2>
              <p>{t('terms.contact_body')}</p>
              <p className="mt-2">{t('terms.contact_info')}</p>
            </section>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
