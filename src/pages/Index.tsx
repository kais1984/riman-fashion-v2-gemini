import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { testimonials } from '../data/products';
import ScrollReveal from '../components/ScrollReveal';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import ChapterLabel from '../components/salon/ChapterLabel';
import CalligraphicAccent from '../components/salon/CalligraphicAccent';
import InvitationRule from '../components/salon/InvitationRule';
import EditorialPlate from '../components/salon/EditorialPlate';

const DISCIPLINES = [
  { titleKey: 'cat.bridal', descKey: 'disciplines.bridal', media: '/assets/rimanfashion_3542687554351211237_227867687_1_2025-01-10.jpg', alt: 'Bridal', to: '/collection/bridal', isVideo: false },
  { titleKey: 'cat.evening', descKey: 'disciplines.evening', media: '/assets/rimanfashion_3638158883472325906_1739454936_2_2025-05-22.jpg', alt: 'Evening', to: '/collection/evening', isVideo: false },
  { titleKey: 'cat.rentals', descKey: 'disciplines.rentals', media: '/assets/rimanfashion_3306305106777368667_227867687_2024-02-19.mp4', alt: 'Rentals', to: '/collection/rental', isVideo: true },
];

export default function Index() {
  const { products } = useData();
  const { t, language } = useLanguage();
  const [showHeroVideo, setShowHeroVideo] = useState(true);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    const smallScreen = window.matchMedia('(max-width: 768px)').matches;
    if (reduced || saveData || smallScreen) setShowHeroVideo(false);
  }, []);

  const featured = products.filter((p) => p.isFeatured).slice(0, 4);
  const plates = featured.length >= 2 ? featured : products.slice(0, 4);
  const quote = testimonials[0];

  return (
    <main className="film-grain">
      {/* ARRIVAL — single message, dual conversion: booking (primary) + shop (secondary) */}
      <section id="hero" className="relative min-h-screen min-h-[100dvh] flex items-center justify-center bg-onyx overflow-hidden">
        {showHeroVideo ? (
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src="/assets/rimanfashion_3panel_split.mp4"
            poster="/assets/rimanfashion_3542687554351211237_227867687_1_2025-01-10.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            disablePictureInPicture
            ref={(el) => {
              if (!el) return;
              el.playbackRate = 0.7;
              if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                el.pause();
                el.removeAttribute('autoPlay');
              }
            }}
            aria-hidden="true"
            tabIndex={-1}
          />
        ) : (
          <img
            className="absolute inset-0 w-full h-full object-cover"
            src="/assets/rimanfashion_3542687554351211237_227867687_1_2025-01-10.jpg"
            alt=""
            aria-hidden="true"
            loading="eager"
          />
        )}
        <div className="absolute inset-0 bg-onyx/60" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80" aria-hidden="true" />
        <CalligraphicAccent
          word="أناقة"
          className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[clamp(6rem,16vw,14rem)] opacity-25 pointer-events-none"
        />
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto animate-fade-in">
          <p className="font-label text-xs md:text-sm tracking-[0.35em] uppercase text-white mb-4 [text-shadow:0_2px_12px_rgba(0,0,0,0.8)]">
            {t('hero.subtitle')}
          </p>
          <p className="font-label text-xs tracking-[0.25em] uppercase text-bone/90 mb-6 [text-shadow:0_2px_12px_rgba(0,0,0,0.8)]">
            {t('cat.bridal')} · {t('cat.evening')} · {t('cat.rentals')}
          </p>
          <h1 className="font-heading text-white font-light leading-[1.02] text-[clamp(2.5rem,8vw,7rem)] mb-6 [text-shadow:0_2px_24px_rgba(0,0,0,0.7)]">
            {t('hero.title').split('&').map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && <em className="font-editorial italic text-gold">&</em>}
              </span>
            ))}
          </h1>
          <p className="font-body text-base md:text-lg text-white leading-relaxed mb-4 [text-shadow:0_2px_12px_rgba(0,0,0,0.8)]">
            {language === 'ar' ? 'شراء · إيجار · تفصيل حسب الطلب — تجربة خاصة في الشارقة' : 'Buy · Rent · Bespoke — private fittings in Sharjah'}
          </p>
          <p className="font-label text-xs tracking-[0.2em] uppercase text-white/90 mb-10 [text-shadow:0_2px_12px_rgba(0,0,0,0.8)]">
            {t('invitation.contact_line')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/appointment"
              className="btn-luxury w-full sm:w-auto min-h-[56px] inline-flex items-center justify-center bg-bone text-onyx hover:text-gold-dark ring-1 ring-white/30 shadow-2xl text-sm"
              aria-label={t('cta.viewing')}
            >
              {t('cta.viewing')}
            </Link>
            <Link
              to="/search"
              className="w-full sm:w-auto min-h-[56px] inline-flex items-center justify-center px-10 font-label text-xs tracking-[0.25em] uppercase text-white bg-white/10 backdrop-blur-sm border border-white/70 hover:border-gold hover:text-gold hover:bg-black/40 transition-colors duration-300 [text-shadow:0_1px_8px_rgba(0,0,0,0.8)]"
              aria-label={t('cta.explore')}
            >
              {t('cta.explore')} →
            </Link>
          </div>
          <p className="mt-8 font-label text-xs tracking-[0.2em] uppercase text-white/90 [text-shadow:0_2px_12px_rgba(0,0,0,0.8)]">
            {language === 'ar' ? '★★★★★ أكثر من 200 عروس · fittings خاصة يومياً' : '★★★★★ 200+ brides · Private fittings daily'}
          </p>
        </div>
        <span aria-hidden="true" className="hidden sm:block absolute bottom-8 left-1/2 -translate-x-1/2 font-label text-xs tracking-[0.3em] uppercase text-white/80">
          {t('hero.discover')}
        </span>
      </section>

      {/* CHAPTER I — L'ATELIER */}
      <section id="atelier" className="bg-bone py-24 md:py-36 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-10 md:gap-16">
          <div className="md:col-span-4">
            <div className="md:sticky md:top-40">
              <ChapterLabel numeral="I" titleKey="chapter.atelier" />
            </div>
          </div>
          <div className="md:col-span-8 flex flex-col gap-10">
            <ScrollReveal>
              <h3 className="font-heading text-3xl md:text-5xl font-light text-stone-800 leading-tight">
                {t('atelier.heading')}
              </h3>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <p className="font-editorial italic text-xl md:text-2xl text-gold-dark leading-relaxed max-w-2xl">
                {t('atelier.quote')}
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <p className="font-body text-stone-600 leading-loose max-w-2xl">{t('atelier.body')}</p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <InvitationRule className="bg-bone border-t border-gold/15" />

      {/* CHAPTER II — LES SILHOUETTES */}
      <section className="bg-champagne py-24 md:py-36 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <ChapterLabel numeral="II" titleKey="chapter.silhouettes" />
          <div className="mt-16 md:mt-24 flex flex-col gap-24 md:gap-36">
            {plates.map((product, i) => (
              <div key={product.id}>
                <ScrollReveal>
                  <EditorialPlate product={product} index={i} reverse={i % 2 === 1} />
                </ScrollReveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      <InvitationRule className="bg-champagne border-t border-gold/15" />

      {/* CHAPTER III — LE SAVOIR-FAIRE */}
      <section className="bg-bone py-24 md:py-36 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <ChapterLabel numeral="III" titleKey="chapter.savoir_faire" />
          <div className="mt-12 grid md:grid-cols-2 gap-10 max-w-4xl">
            <p className="font-body text-stone-600 leading-loose">{t('savoir.p1')}</p>
            <p className="font-body text-stone-600 leading-loose">{t('savoir.p2')}</p>
          </div>
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            {DISCIPLINES.map((d) => (
              <div key={d.titleKey}>
                <ScrollReveal>
                <Link to={d.to} className="group block">
                  <div className="overflow-hidden">
                    {d.isVideo ? (
                      <video
                        src={d.media}
                        autoPlay muted loop playsInline preload="none"
                        aria-hidden="true"
                        tabIndex={-1}
                        ref={(el) => {
                          if (!el) return;
                          if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) el.pause();
                        }}
                        className="aspect-[3/4] w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.04]"
                      />
                    ) : (
                      <img
                        src={d.media}
                        alt={d.alt}
                        loading="lazy"
                        className="aspect-[3/4] w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.04]"
                      />
                    )}
                  </div>
                  <h3 className="font-heading text-2xl font-light text-stone-800 mt-5">{t(d.titleKey)}</h3>
                  <p className="font-editorial italic text-stone-600 mt-2">{t(d.descKey)}</p>
                  <span className="inline-block mt-3 font-label text-xs tracking-[0.25em] uppercase text-gold border-b border-gold/40 pb-1">
                    {t('disciplines.discover')}
                  </span>
                </Link>
                </ScrollReveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* L'INVITATION */}
      <section className="bg-champagne py-24 md:py-36 px-6 text-center relative overflow-hidden">
        <CalligraphicAccent
          word="دعوة"
          className="top-8 right-8 text-[clamp(6rem,18vw,16rem)]"
        />
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="font-heading text-4xl md:text-6xl font-light text-stone-800">{t('invitation.heading')}</h2>
          {quote && (
            <blockquote className="mt-12">
              <p className="font-editorial italic text-xl md:text-2xl text-stone-600 leading-relaxed">
                "{quote.content}"
              </p>
              <footer className="mt-6 font-label text-xs tracking-[0.25em] uppercase text-gold">
                {quote.authorName} — {quote.authorRole}
              </footer>
            </blockquote>
          )}
          <div className="mt-12 flex flex-col items-center gap-6">
            <Link to="/appointment" className="btn-luxury" aria-label={t('cta.viewing')}>
              {t('cta.viewing')}
            </Link>
            <p className="font-label text-micro tracking-[0.3em] uppercase text-stone-600">
              {t('invitation.contact_line')}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
