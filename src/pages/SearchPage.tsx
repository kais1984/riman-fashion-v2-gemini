import { useState, useMemo } from 'react';
import { Search as SearchIcon, X, SlidersHorizontal } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function SearchPage() {
  const { products } = useData();
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = ["Bridal Gown", "Evening Dress"];
  const categoryLabel = (c: string) => c === 'Bridal Gown' ? 'Bridal' : c === 'Evening Dress' ? 'Evening' : c;

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const q = query.toLowerCase();
      const matchesQuery = !q ||
        product.name.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        (product.style || []).some((s: string) => s.toLowerCase().includes(q));
      const matchesCategory = !activeCategory || product.category === activeCategory;
      return matchesQuery && matchesCategory;
    });
  }, [query, activeCategory, products]);

  return (
    <div className="pt-24 bg-ivory min-h-screen">
      {/* Search Header */}
      <section className="bg-ivory py-20 border-b border-stone-100 z-40">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
             <div className="relative group">
                <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300 group-focus-within:text-gold transition-colors" />
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('search.placeholder')}
                  className="w-full bg-stone-50 border-stone-100 p-8 pl-16 text-sm tracking-[0.2em] uppercase outline-none focus:bg-ivory focus:border-gold transition-all"
                  autoFocus
                />
                {query && (
                  <button 
                    onClick={() => setQuery('')}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-800"
                    aria-label="Clear search"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
             </div>

             {/* Categories */}
<div className="flex flex-wrap justify-center gap-4 mt-8">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                    className={cn(
                      "px-6 py-2 text-[10px] tracking-[0.2em] uppercase transition-all border",
                      activeCategory === cat ? "bg-onyx text-white border-onyx" : "bg-ivory text-stone-400 border-stone-100 hover:border-gold"
                    )}
                  >
                    {categoryLabel(cat)}
                  </button>
                ))}
              </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="section-padding container mx-auto px-6">
        <div className="flex justify-between items-center mb-12 border-b border-stone-200 pb-6">
           <h2 className="font-heading text-lg text-stone-800 tracking-widest uppercase">
             {t('search.results')} <span className="text-stone-300 font-normal ml-2">({filteredProducts.length})</span>
           </h2>
           <button className="flex items-center gap-2 text-[10px] text-stone-400 tracking-widest uppercase hover:text-gold transition-colors">
              <SlidersHorizontal className="w-3 h-3" /> {t('search.advanced_filters')}
           </button>
        </div>

        <AnimatePresence mode="popLayout">
           {filteredProducts.length > 0 ? (
             <motion.div 
               layout
               className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-16"
             >
               {filteredProducts.map((product) => (
                 <motion.div 
                   key={product.id}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                 >
                   <ProductCard product={product} />
                 </motion.div>
               ))}
             </motion.div>
           ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                 <div className="w-20 h-20 bg-stone-50 flex items-center justify-center mx-auto mb-8 border border-stone-100">
                   <SearchIcon className="w-8 h-8 text-stone-300" />
                 </div>
                  <h3 className="font-heading text-2xl text-stone-800 mb-4 tracking-widest uppercase">{t('search.empty_heading')}</h3>
                 <div className="w-12 h-px bg-gold mx-auto mb-4" />
                  <p className="font-body text-stone-400 text-xs uppercase tracking-widest mb-10 max-w-md mx-auto leading-relaxed italic">
                    {t('search.empty_desc')}
                  </p>
                 <button
                   onClick={() => {setQuery(''); setActiveCategory(null);}}
                   className="btn-luxury px-12"
                 >
                    {t('search.clear')}
                 </button>
              </motion.div>
           )}
        </AnimatePresence>
      </section>

      {/* Recommended Section for Empty Search */}
      {filteredProducts.length === 0 && (
         <section className="bg-ivory py-32 border-t border-stone-100">
           <div className="container mx-auto px-6 text-center mb-16">
               <h2 className="font-heading text-4xl text-stone-800 tracking-tight mb-4">{t('search.recommended')}</h2>
              <div className="w-16 h-px bg-gold mx-auto" />
           </div>
<div className="container mx-auto px-6 overflow-x-auto pb-8 no-scrollbar">
               <div className="flex gap-10">
                 {products.slice(0, 4).map((p) => (
                   <div key={p.id} className="min-w-[280px]">
                     <ProductCard product={p} />
                   </div>
                 ))}
               </div>
            </div>
         </section>
      )}
    </div>
  );
}
