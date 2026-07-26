import { motion } from 'motion/react';
import { Instagram } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const instaPosts = [
  { id: 1, img: "https://qiccxnxtwbsreyfbqilw.supabase.co/storage/v1/object/public/gallery/photos/photo_001.jpg" },
  { id: 2, img: "https://qiccxnxtwbsreyfbqilw.supabase.co/storage/v1/object/public/gallery/photos/photo_010.jpg" },
  { id: 3, img: "https://qiccxnxtwbsreyfbqilw.supabase.co/storage/v1/object/public/gallery/photos/photo_026.jpg" },
  { id: 4, img: "https://qiccxnxtwbsreyfbqilw.supabase.co/storage/v1/object/public/gallery/photos/photo_040.jpg" },
  { id: 5, img: "https://qiccxnxtwbsreyfbqilw.supabase.co/storage/v1/object/public/gallery/photos/photo_051.jpg" },
  { id: 6, img: "https://qiccxnxtwbsreyfbqilw.supabase.co/storage/v1/object/public/gallery/photos/photo_076.jpg" }
];

export default function InstagramSection() {
  const { t } = useLanguage();

  return (
    <section className="py-32 bg-ivory overflow-hidden">
      <div className="container mx-auto px-6 mb-16 text-center">
        <div className="flex items-center justify-center gap-3 text-gold mb-4">
           <Instagram className="w-5 h-5" />
           <span className="text-[12px] tracking-[0.4em] uppercase font-bold">@rimanfashion</span>
        </div>
        <h2 className="heading-display text-4xl md:text-6xl text-stone-900 tracking-tight">{t('instagram.title')}</h2>
        <div className="flex justify-center mt-10">
          <a 
            href="https://www.instagram.com/rimanfashion/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex items-center gap-3 px-10 py-4 bg-onyx text-white hover:text-gold transition-all duration-500"
          >
            <Instagram className="w-4 h-4" />
            <span className="text-[10px] tracking-[0.3em] uppercase font-bold transition-colors">
              {t('instagram.follow')}
            </span>
          </a>
        </div>
        <div className="w-px h-16 bg-gradient-to-b from-gold to-transparent mx-auto mt-12" />
      </div>

      <div className="flex gap-4 md:gap-8 overflow-hidden">
        <motion.div 
          initial={{ x: 0 }}
          animate={{ x: "-50%" }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="flex gap-4 md:gap-8 flex-nowrap"
        >
          {[...instaPosts, ...instaPosts].map((post, idx) => (
            <a 
              key={idx} 
              href="https://www.instagram.com/rimanfashion/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="min-w-[280px] md:min-w-[350px] aspect-square relative group overflow-hidden block"
            >
               <img 
                src={post.img} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                alt={`Riman Fashion gallery ${idx + 1}`} 
                loading="lazy"
              />
              <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                 <Instagram className="text-white w-8 h-8" />
                 <span className="text-[10px] text-white uppercase tracking-[0.2em] font-bold">{t('instagram.view_aura')}</span>
              </div>
            </a>
          ))}
        </motion.div>
      </div>

      <div className="mt-16 text-center">
        <a 
          href="https://www.instagram.com/rimanfashion/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn-luxury-outline"
        >
          {t('instagram.explore')}
        </a>
      </div>
    </section>
  );
}
