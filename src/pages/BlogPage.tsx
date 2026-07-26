import { motion } from 'motion/react';
import { ArrowRight, Clock, User, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export default function BlogPage() {
  const { t } = useLanguage();

  const articles = [
    {
      id: 1,
      title: t('blog.article1_title'),
      excerpt: t('blog.article1_excerpt'),
      image: "https://images.unsplash.com/photo-1594553323242-c1947d4c4ef4?auto=format&fit=crop&q=80",
      date: "April 15, 2026",
      author: "Fatma Al-Zahra",
      category: t('blog.article1_category')
    },
    {
      id: 2,
      title: t('blog.article2_title'),
      excerpt: t('blog.article2_excerpt'),
      image: "https://images.unsplash.com/photo-1518049360731-32823f28f70d?auto=format&fit=crop&q=80",
      date: "March 28, 2026",
      author: "Sarah Mansour",
      category: t('blog.article2_category')
    },
    {
      id: 3,
      title: t('blog.article3_title'),
      excerpt: t('blog.article3_excerpt'),
      image: "https://images.unsplash.com/photo-1594553323242-c1947d4c4ef4?auto=format&fit=crop&q=80",
      date: "March 10, 2026",
      author: "Atelier Team",
      category: t('blog.article3_category')
    }
  ];
  return (
    <div className="pt-24 bg-ivory min-h-screen">
      {/* Editorial Header */}
      <header className="py-24 border-b border-stone-200 bg-ivory">
        <div className="container mx-auto px-6 text-center">
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] text-gold uppercase tracking-[0.6em] mb-4 block"
          >
            {t('blog.title')}
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="font-heading text-5xl md:text-7xl text-stone-800 tracking-tight"
          >
            {t('blog.subtitle')}
          </motion.h1>
        </div>
      </header>

      {/* Featured Article */}
      <section className="py-20 lg:py-32 container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="relative group cursor-pointer"
          >
            <div className="overflow-hidden">
               <img src={articles[0].image} alt={articles[0].title} className="w-full aspect-[16/9] object-cover scale-105 group-hover:scale-100 transition-transform duration-1000" />
            </div>
            <div className="absolute top-6 left-6 bg-ivory px-4 py-2 text-[10px] uppercase font-bold tracking-widest">
              {t('blog.latest')}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
          >
            <span className="text-[10px] text-gold uppercase tracking-widest font-bold mb-4 block">{articles[0].category}</span>
            <h2 className="font-heading text-4xl text-stone-800 mb-6 leading-tight hover:text-gold transition-colors cursor-pointer">
              {articles[0].title}
            </h2>
            <p className="font-body text-stone-500 mb-8 leading-relaxed italic">
              "{articles[0].excerpt}"
            </p>
            <div className="flex items-center gap-6 mb-10 text-[10px] text-stone-400 uppercase tracking-widest border-y border-stone-100 py-4">
              <span className="flex items-center gap-2"><Clock className="w-3 h-3" /> 5 {t('blog.min_read')}</span>
              <span className="flex items-center gap-2"><User className="w-3 h-3" /> By {articles[0].author}</span>
            </div>
            <button className="btn-luxury italic !px-12">{t('blog.read_editorial')}</button>
          </motion.div>
        </div>
      </section>

      {/* Grid Articles */}
      <section className="pb-32 container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {articles.slice(1).map((article) => (
            <motion.article 
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="group"
            >
              <div className="relative aspect-[4/3] overflow-hidden mb-8">
                <img 
                  src={article.image} 
                  alt={article.title} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-stone-900/0 transition-colors" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                 <Tag className="w-3 h-3 text-gold" />
                 <span className="text-[10px] text-gold font-bold uppercase tracking-widest">{article.category}</span>
              </div>
              <h3 className="font-heading text-2xl text-stone-800 mb-4 group-hover:text-gold transition-colors leading-tight">
                {article.title}
              </h3>
              <p className="font-body text-xs text-stone-400 uppercase tracking-wider mb-8 italic">
                {article.date} — By {article.author}
              </p>
              <div className="w-full h-px bg-stone-200 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 mb-6" />
              <button className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-black group-hover:gap-6 transition-all">
                {t('blog.view_journal')} <ArrowRight className="w-4 h-4 text-gold" />
              </button>
            </motion.article>
          ))}
        </div>

        {/* Newsletter Teaser */}
        <div className="mt-32 bg-stone-900 p-12 md:p-24 text-center relative overflow-hidden">
           <div className="absolute inset-0 opacity-10 blur-3xl bg-gold/20" />
           <div className="relative z-10 max-w-xl mx-auto">
              <h3 className="font-heading text-3xl text-white mb-6 uppercase tracking-widest">{t('blog.join_circle')}</h3>
              <p className="font-body text-ivory text-sm mb-10 leading-relaxed uppercase tracking-widest">
                {t('blog.newsletter_desc')}
             </p>
             <div className="flex flex-col sm:flex-row gap-4">
               <input 
                type="email" 
                 placeholder={t('blog.email_placeholder')}
                className="flex-1 bg-white/5 border border-white/10 p-5 text-[10px] tracking-widest text-white outline-none focus:border-gold transition-colors" 
              />
              <button className="btn-luxury !whitespace-nowrap">{t('blog.subscribe')}</button>
             </div>
           </div>
        </div>
      </section>
    </div>
  );
}
