import { motion } from 'motion/react';
import { Quote, Sparkles, Heart, Anchor, ShieldCheck, Map } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import ScrollReveal from '../components/ScrollReveal';

export default function AboutPage() {
  const { t } = useLanguage();
  
  return (
    <div className="pt-24 bg-ivory min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/rimanfashion_3542687554351211237_227867687_1_2025-01-10.jpg"
            alt="Atelier Craftsman"
            className="w-full h-full object-cover brightness-[0.7]"
          />
          <div className="absolute inset-0 bg-stone-900/40" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-[10px] text-white/70 uppercase tracking-[0.5em] mb-6 block"
          >
            {t('about.hero_subtitle')}
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-heading text-6xl md:text-8xl text-white tracking-tighter mb-8"
          >
            {t('about.hero_title').split(' ').map((word, i) => i === 2 ? <span key={i} className="italic font-serif">{word}</span> : word + ' ')}
          </motion.h1>
          <div className="w-px h-24 bg-gold/50 mx-auto" />
        </div>
      </section>

      {/* Narrative Section */}
      <section className="section-padding container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="space-y-10"
          >
            <h2 className="font-heading text-4xl text-stone-800 leading-tight">
              {t('about.title')}
            </h2>
            <div className="space-y-6 font-body text-stone-600 leading-relaxed text-sm lg:text-base">
              <p>
                {t('footer.about')}
              </p>
              <p>
                {t('about.narrative_1')}
              </p>
              <p>
                {t('about.narrative_2')}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <img
              src="/assets/rimanfashion_3638158883472325906_1739454936_2_2025-05-22.jpg"
              alt="Couture Details"
              className="w-full aspect-[4/5] object-cover"
              loading="lazy"
            />
            <div className="absolute -bottom-10 -left-10 bg-ivory p-10 hidden md:block border border-stone-100 max-w-xs">
              <Quote className="text-gold w-8 h-8 mb-4" />
              <p className="font-body text-stone-800 italic text-sm mb-4">
                "{t('about.quote')}"
              </p>
              <span className="text-[10px] uppercase tracking-widest text-stone-400">{t('about.quote_author')}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pillars of Excellence */}
      <section className="bg-stone-900 py-32 text-ivory overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 border border-ivory/20 rounded-full" />
          <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] border border-ivory/20 rounded-full" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-24">
            <h2 className="font-heading text-4xl tracking-widest uppercase mb-4 text-white">{t('about.pillars')}</h2>
            <div className="w-20 h-px bg-gold mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <Pillar 
              icon={Sparkles} 
              title={t('about.pillar_1_title')}
              desc={t('about.pillar_1_desc')}
            />
            <Pillar 
              icon={Anchor} 
              title={t('about.pillar_2_title')}
              desc={t('about.pillar_2_desc')}
            />
            <Pillar 
              icon={Heart} 
              title={t('about.pillar_3_title')}
              desc={t('about.pillar_3_desc')}
            />
          </div>
        </div>
      </section>

      {/* The Design Team Section */}
      <section className="section-padding bg-ivory">
        <ScrollReveal>
          <div className="container mx-auto">
            <div className="flex flex-col items-center text-center mb-16">
              <h2 className="heading-editorial text-stone-400 text-sm mb-4">{t('about.visionaries')}</h2>
              <h3 className="font-heading text-4xl text-stone-800 tracking-wide">{t('about.collective')}</h3>
              <div className="divider-gold mt-6" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              <TeamMember
                name="Sarah Mansour"
                role={t('about.role_founder')}
                image="/assets/rimanfashion_3542687554351211237_227867687_1_2025-01-10.jpg"
              />
              <TeamMember
                name="Layla Al-Farsi"
                role={t('about.role_embroidery')}
                image="/assets/rimanfashion_3638158883472325906_1739454936_1_2025-05-22.jpg"
              />
              <TeamMember
                name="Mona Qureshi"
                role={t('about.role_jewelry')}
                image="/assets/rimanfashion_3717964372695289282_4048704816_2_2025-09-09.jpg"
              />
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Aesthetic Mosaic */}
      <section className="py-32 bg-ivory">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            <img src="/assets/rimanfashion_3542687554351211237_227867687_2_2025-01-10.jpg" className="w-full aspect-square object-cover" alt="Riman atelier beadwork detail" loading="lazy" />
            <div className="bg-ivory flex flex-col justify-center p-8 text-center border border-stone-50">
               <h4 className="font-heading text-3xl text-gold mb-2">10k+</h4>
                <p className="text-[10px] text-stone-400 uppercase tracking-widest">{t('about.stat_beads')}</p>
            </div>
            <img src="/assets/rimanfashion_3638158883472325906_1739454936_2_2025-05-22.jpg" className="w-full aspect-square object-cover" alt="Riman couture runway collection" loading="lazy" />
            <div className="bg-stone-900 text-ivory flex flex-col justify-center p-8 text-center">
               <h4 className="font-heading text-3xl text-gold mb-2">120</h4>
                <p className="text-[10px] text-ivory/40 uppercase tracking-widest">{t('about.stat_runways')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function TeamMember({ name, role, image }: { name: string, role: string, image: string }) {
  return (
    <div className="group text-center">
      <div className="relative overflow-hidden mb-8 aspect-[3/4] bg-stone-100">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 filter grayscale group-hover:grayscale-0" 
          loading="lazy"
        />
        <div className="absolute inset-0 bg-onyx/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="w-12 h-px bg-gold" />
        </div>
      </div>
      <h4 className="font-heading text-lg text-stone-800 mb-1">{name}</h4>
      <p className="text-[10px] tracking-widest text-gold uppercase">{role}</p>
    </div>
  );
}

function Pillar({ icon: Icon, title, desc }: any) {
  return (
    <div className="text-center group">
      <div className="w-16 h-16 rounded-full border border-stone-700 flex items-center justify-center mx-auto mb-8 group-hover:border-gold group-hover:bg-gold/5 transition-all duration-500">
        <Icon className="w-6 h-6 text-gold" />
      </div>
      <h3 className="font-heading text-xl mb-4 tracking-widest uppercase">{title}</h3>
      <p className="font-body text-xs text-ivory leading-relaxed uppercase tracking-wider">{desc}</p>
    </div>
  );
}
