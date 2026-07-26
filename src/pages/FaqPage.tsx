import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Search, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';

const faqs = [
  {
    categoryKey: "faq.category_rental",
    questions: [
      { qKey: "faq.q_rental_1", aKey: "faq.a_rental_1" },
      { qKey: "faq.q_rental_2", aKey: "faq.a_rental_2" },
      { qKey: "faq.q_rental_3", aKey: "faq.a_rental_3" }
    ]
  },
  {
    categoryKey: "faq.category_bespoke",
    questions: [
      { qKey: "faq.q_bespoke_1", aKey: "faq.a_bespoke_1" },
      { qKey: "faq.q_bespoke_2", aKey: "faq.a_bespoke_2" }
    ]
  },
  {
    categoryKey: "faq.category_shipping",
    questions: [
      { qKey: "faq.q_shipping_1", aKey: "faq.a_shipping_1" },
      { qKey: "faq.q_shipping_2", aKey: "faq.a_shipping_2" }
    ]
  }
];

export default function FaqPage() {
  const [activeIdx, setActiveIdx] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useLanguage();

  return (
    <div className="pt-24 bg-ivory min-h-screen">
      {/* Header */}
      <section className="bg-ivory py-24 border-b border-stone-100">
        <div className="container mx-auto px-6 text-center max-w-4xl">
          <h1 className="font-heading text-5xl md:text-7xl text-stone-800 tracking-tight mb-8">{t('faq.title')}</h1>
          <div className="relative max-w-xl mx-auto">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
             <input 
              type="text" 
              placeholder={t('faq.search_placeholder')}
              className="w-full bg-ivory border border-stone-100 p-6 pl-14 text-xs tracking-widest outline-none focus:border-gold transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Accordion */}
      <section className="section-padding container mx-auto px-6 max-w-5xl">
        <div className="space-y-16">
          {faqs.map((group, gIdx) => (
            <div key={gIdx} className="space-y-8">
              <h2 className="font-heading text-xl text-gold uppercase tracking-[0.3em] border-b border-stone-100 pb-4">{t(group.categoryKey)}</h2>
              <div className="space-y-4">
                {group.questions.map((faq, qIdx) => {
                  const id = `${gIdx}-${qIdx}`;
                  const isOpen = activeIdx === id;
                  
                  if (searchTerm && !t(faq.qKey).toLowerCase().includes(searchTerm.toLowerCase())) return null;

                  return (
                    <div key={id} className="border border-stone-50 bg-ivory hover:border-gold/20 transition-all">
                      <button 
                        onClick={() => setActiveIdx(isOpen ? null : id)}
                        className="w-full p-6 flex justify-between items-center text-left"
                      >
                        <span className="font-heading text-sm md:text-lg text-stone-800 tracking-wide">{t(faq.qKey)}</span>
                        <ChevronDown className={cn("w-5 h-5 text-gold transition-transform duration-500", isOpen && "rotate-180")} />
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-6 pt-0 font-body text-xs md:text-sm text-stone-500 leading-loose border-t border-stone-50 mt-2 italic">
                              {t(faq.aKey)}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Direct Assist */}
      <section className="py-20 bg-ivory border-t border-stone-100">
        <div className="container mx-auto px-6 text-center">
           <MessageCircle className="w-10 h-10 text-gold mx-auto mb-6" />
            <h3 className="font-heading text-2xl text-stone-800 mb-4 tracking-widest uppercase">{t('faq.still_unsure')}</h3>
            <p className="font-body text-stone-500 text-xs uppercase tracking-widest mb-10 leading-relaxed italic">
              {t('faq.still_unsure_desc')}
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link to="/contact" className="btn-luxury px-12">{t('faq.submit_inquiry')}</Link>
              <a href="https://wa.me/971553730792" className="btn-luxury-outline px-12">{t('faq.whatsapp_expert')}</a>
           </div>
        </div>
      </section>
    </div>
  );
}
