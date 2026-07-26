import { motion } from 'motion/react';
import { Scissors, Ruler, CheckCircle, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import AppointmentPage from './AppointmentPage';

export default function AlterationsPage() {
  const { t } = useLanguage();

  const steps = [
    { title: t('alt.step1_title'), desc: t('alt.step1_desc') },
    { title: t('alt.step2_title'), desc: t('alt.step2_desc') },
    { title: t('alt.step3_title'), desc: t('alt.step3_desc') },
    { title: t('alt.step4_title'), desc: t('alt.step4_desc') }
  ];

  return (
    <div className="pt-24 bg-ivory min-h-screen">
      {/* Hero */}
      <section className="bg-ivory py-32 border-b border-gold/10">
        <div className="container mx-auto px-6 text-center max-w-4xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-5xl md:text-7xl text-stone-800 tracking-tight mb-8"
          >
            {t('alt.hero_title')}
          </motion.h1>
          <p className="font-body text-stone-500 text-sm md:text-base tracking-widest uppercase mb-12 max-w-2xl mx-auto leading-relaxed">
            {t('alt.hero_desc')}
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/contact" className="btn-luxury px-12 italic">{t('alt.book_fitting')}</Link>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-padding container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <ServiceCard 
            icon={Scissors}
            title={t('alt.service_bridal_title')}
            desc={t('alt.service_bridal_desc')}
          />
          <ServiceCard 
            icon={Ruler}
            title={t('alt.service_evening_title')}
            desc={t('alt.service_evening_desc')}
          />
          <ServiceCard 
            icon={CheckCircle}
            title={t('alt.service_urgent_title')}
            desc={t('alt.service_urgent_desc')}
          />
        </div>
      </section>

      {/* Process Timeline */}
      <section className="bg-stone-900 py-32 text-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-20">
            <h2 className="font-heading text-4xl mb-4 uppercase tracking-widest">{t('alt.fitting_journey')}</h2>
            <div className="w-20 h-px bg-gold" />
          </div>

          <div className="relative ml-6 md:ml-0 md:grid md:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="mb-12 md:mb-0 relative pl-10 md:pl-0 md:text-center"
              >
                <div className="absolute left-0 top-0 md:relative md:left-0 md:mx-auto w-10 h-10 bg-gold text-stone-900 flex items-center justify-center font-heading text-xl mb-6">
                  {idx + 1}
                </div>
                <h4 className="font-heading text-lg mb-3 tracking-widest uppercase">{step.title}</h4>
                <p className="font-body text-xs text-stone-400 leading-relaxed uppercase tracking-wider">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Image & CTA Section */}
      <section className="section-padding container mx-auto">
        <div className="bg-ivory grid grid-cols-1 lg:grid-cols-2 overflow-hidden border border-stone-100">
<img 
             src="https://images.unsplash.com/photo-1594553323242-c1947d4c4ef4?auto=format&fit=crop&q=80" 
             alt="Tailoring details" 
             className="w-full h-full object-cover min-h-[400px]"
             loading="lazy"
           />
          <div className="p-12 md:p-20 flex flex-col justify-center">
            <h3 className="font-heading text-3xl md:text-4xl text-stone-800 mb-8 leading-tight">
              {t('alt.cta_heading')}
            </h3>
            <p className="font-body text-stone-500 mb-10 text-sm leading-loose">
              {t('alt.cta_desc')}
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-xs tracking-widest text-stone-800 uppercase font-bold">
                 <Calendar className="w-4 h-4 text-gold" /> {t('alt.available')}
              </div>
              <div className="flex items-center gap-4 text-xs tracking-widest text-stone-800 uppercase font-bold">
                 <Ruler className="w-4 h-4 text-gold" /> {t('alt.guarantee')}
              </div>
            </div>
            <Link to="/contact" className="mt-12 group flex items-center gap-4 text-[10px] uppercase tracking-[0.4em] text-gold font-black transition-all hover:gap-6">
              {t('alt.inquire')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Appointment Booking Section */}
      <section className="border-t border-stone-100">
        <AppointmentPage />
      </section>
    </div>
  );
}

function ServiceCard({ icon: Icon, title, desc }: any) {
  return (
    <div className="bg-ivory p-12 border border-stone-100 hover:border-gold/30 transition-all duration-500 group">
      <div className="w-12 h-12 bg-ivory text-gold flex items-center justify-center mb-8 rounded-sm group-hover:bg-gold group-hover:text-white transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-heading text-xl mb-4 tracking-widest uppercase text-stone-800">{title}</h3>
      <p className="font-body text-xs text-stone-400 leading-relaxed uppercase tracking-wider">{desc}</p>
    </div>
  );
}
