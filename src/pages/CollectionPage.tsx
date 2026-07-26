import { useParams, Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { Filter, ChevronDown, Grid, List as ListIcon, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ProductCard from '../components/ProductCard';
import { cn, categoryToSlug } from '../lib/utils';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ProductGridSkeleton } from '../components/Skeleton';

const YEARS = [2025, 2024];

export default function CollectionPage() {
  const { products, isLoading } = useData();
  const { category } = useParams();
  const { t } = useLanguage();

  const SILHOUETTES = useMemo(() => [
    { value: '', label: t('collection.all_silhouettes') },
    { value: 'A-Line', label: 'A-Line' },
    { value: 'Ballgown', label: 'Ball Gown' },
    { value: 'Mermaid', label: 'Mermaid' },
    { value: 'Column', label: 'Column / Sheath' },
    { value: 'Kaftan', label: 'Kaftan' },
    { value: 'One Size', label: 'Accessories' },
  ], [t]);
  const [sortBy, setSortBy] = useState('featured');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedSilhouette, setSelectedSilhouette] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const colorMap: Record<string, string> = {
    'Ivory': '#FFFFF0',
    'Emerald': '#046307',
    'Gold': '#D4AF37',
    'Champagne': '#F7E7CE',
    'Silver': '#C0C0C0',
    'Soft White': '#F5F5F5',
    'White': '#FFFFFF',
    'Blush': '#FE828C',
    'Black': '#000000',
    'Rose Gold': '#B76E79',
    'Amber': '#FFBF00',
    'Dual Tone': '#C0C0C0',
    'Pearl': '#F0EAD6',
  };

  const allAvailableColors = useMemo(() => {
    const colors = new Set<string>();
    products.forEach(p => p.color.forEach(c => colors.add(c)));
    return Array.from(colors);
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (category && category !== 'all') {
      if (category === 'bridal') result = result.filter(p => p.category === 'Bridal Gown');
      else if (category === 'evening') result = result.filter(p => p.category === 'Evening Dress');
      else if (category === 'rental') result = result.filter(p => p.productType === 'rent' || p.productType === 'both');
    }

    if (selectedYear) {
      result = result.filter(p => p.collectionYear === selectedYear);
    }

    if (selectedSilhouette) {
      result = result.filter(p => p.silhouette === selectedSilhouette);
    }

    if (selectedColors.length > 0) {
      result = result.filter(p => p.color.some(c => selectedColors.includes(c)));
    }

    if (sortBy === 'price-low') result.sort((a, b) => (a.salePrice || 0) - (b.salePrice || 0));
    if (sortBy === 'price-high') result.sort((a, b) => (b.salePrice || 0) - (a.salePrice || 0));
    if (sortBy === 'newest') result.sort((a, b) => (b.collectionYear || 0) - (a.collectionYear || 0));

    return result;
  }, [category, sortBy, selectedColors, selectedYear, selectedSilhouette, products]);

  const toggleColor = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const clearFilters = () => {
    setSelectedColors([]);
    setSelectedYear(null);
    setSelectedSilhouette('');
    setSortBy('featured');
  };

  const hasActiveFilters = selectedColors.length > 0 || selectedYear !== null || selectedSilhouette !== '' || sortBy !== 'featured';

  const categoryTitle = category === 'bridal' ? t('cat.bridal_title')
    : category === 'evening' ? t('cat.evening_title')
    : category === 'rental' ? t('cat.rental_title')
    : t('cat.all');

  return (
    <div id="collection-page" className="pt-24 min-h-screen bg-ivory">
      <header className="section-padding !py-12 bg-ivory border-b border-stone-100">
        <div className="container mx-auto">
          <nav className="flex gap-2 text-xs tracking-widest uppercase text-stone-400 mb-4">
            <Link to="/" className="hover:text-gold transition-colors">{t('nav.home')}</Link>
            <span>/</span>
            <span className="text-stone-800 font-medium">{t('cat.collection')}</span>
          </nav>
          <h1 className="font-heading text-4xl md:text-5xl text-stone-800 tracking-wider uppercase mb-4 leading-tight">{categoryTitle}</h1>
          <p className="text-stone-500 font-body text-base tracking-wide max-w-2xl italic leading-relaxed">
            {t('cat.subtitle')}
          </p>
        </div>
      </header>

      <div className="z-40 bg-ivory/80 backdrop-blur-md border-b border-stone-100">
        <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2">
                {YEARS.map(year => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(selectedYear === year ? null : year)}
                    className={cn(
                      "px-4 py-2 text-[10px] tracking-widest uppercase font-bold transition-all border",
                      selectedYear === year ? "border-gold text-gold" : "border-stone-200 text-stone-500 hover:border-gold hover:text-gold"
                    )}
                  >
                    {year}
                  </button>
                ))}
              </div>

              <div className="hidden md:flex items-center gap-2 border-l border-stone-200 pl-6">
                {SILHOUETTES.map(sil => (
                  <button
                    key={sil.value}
                    onClick={() => setSelectedSilhouette(sil.value === selectedSilhouette ? '' : sil.value)}
                    className={cn(
                      "px-3 py-2 text-[10px] tracking-widest uppercase font-bold transition-all whitespace-nowrap",
                      selectedSilhouette === sil.value ? "text-gold border-b-2 border-gold" : "text-stone-400 hover:text-gold"
                    )}
                  >
                    {sil.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 flex-shrink-0">
              <button onClick={() => setShowFilters(!showFilters)} className={cn("p-2 transition-colors", showFilters ? "text-gold" : "text-stone-400 hover:text-gold")}>
                <SlidersHorizontal className="w-5 h-5" />
              </button>

              <div className="relative">
                <button 
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  onBlur={() => setTimeout(() => setShowSortMenu(false), 200)}
                  className="flex items-center gap-2 font-body text-xs tracking-[0.2em] uppercase text-stone-800 font-bold cursor-pointer"
                >
                  {t('collection.sort')} <ChevronDown className={cn("w-4 h-4 transition-transform", showSortMenu && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {showSortMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full pt-2 z-50"
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <div className="bg-ivory border border-stone-100 p-2 w-56 flex flex-col gap-1 backdrop-blur-md shadow-lg shadow-stone-200/50">
                        {[['featured', t('collection.sort_featured')], ['newest', t('collection.sort_newest')], ['price-low', t('collection.sort_price_low')], ['price-high', t('collection.sort_price_high')]].map(([option, label]) => (
                          <button 
                            key={option}
                            onClick={() => { setSortBy(option); setShowSortMenu(false); }}
                            className={cn(
                              "text-left px-5 py-3 text-xs tracking-widest uppercase transition-colors font-medium cursor-pointer",
                              sortBy === option ? "bg-gold/10 text-gold" : "text-stone-600 hover:bg-stone-50 hover:text-stone-800"
                            )}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 pb-2 border-t border-stone-100 mt-4">
                  <div className="flex items-center gap-4">
                    <span className="text-xs tracking-widest uppercase text-stone-400 font-bold">{t('collection.colors')}</span>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {allAvailableColors.map(color => (
                        <button
                          key={color}
                          onClick={() => toggleColor(color)}
                          title={color}
                          className={cn(
                            "w-8 h-8 rounded-full border border-stone-200 transition-all duration-300 relative",
                            selectedColors.includes(color) ? "ring-2 ring-gold ring-offset-2 scale-110" : "hover:scale-110"
                          )}
                          style={{ backgroundColor: colorMap[color] || '#ccc' }}
                        >
                          {selectedColors.includes(color) && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className={cn("w-2 h-2 rounded-full", color === 'White' || color === 'Ivory' || color === 'Soft White' ? "bg-stone-800" : "bg-white")} />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="md:hidden mt-4">
                    <span className="text-xs tracking-widest uppercase text-stone-400 font-bold block mb-2">{t('collection.silhouette')}</span>
                    <div className="flex flex-wrap gap-2">
                      {SILHOUETTES.map(sil => (
                        <button
                          key={sil.value}
                          onClick={() => setSelectedSilhouette(sil.value === selectedSilhouette ? '' : sil.value)}
                          className={cn(
                            "px-3 py-2 text-[10px] tracking-widest uppercase font-bold transition-all border",
                            selectedSilhouette === sil.value ? "bg-onyx text-white border-onyx" : "border-stone-200 text-stone-500 hover:border-gold"
                          )}
                        >
                          {sil.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {hasActiveFilters && (
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-stone-100">
              <span className="text-[10px] tracking-widest uppercase text-stone-500">{filteredProducts.length} {t('collection.results')}</span>
              <button onClick={clearFilters} className="text-[10px] tracking-[0.2em] uppercase text-gold hover:text-stone-800 transition-colors font-bold">{t('collection.clear_all')}</button>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {isLoading ? (
          <ProductGridSkeleton />
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full py-24 text-center">
              <div className="max-w-md mx-auto mb-10">
                <div className="w-16 h-px bg-gold mx-auto mb-8" />
                <p className="heading-editorial text-stone-400 text-2xl italic mb-4">{t('collection.empty_heading')}</p>
                <p className="font-body text-xs text-stone-400 tracking-[0.2em] uppercase leading-relaxed">
                  {t('collection.empty_desc')}
                </p>
                <div className="w-16 h-px bg-gold mx-auto mt-8" />
              </div>
              <Link to="/collection/all" className="btn-luxury">{t('collection.view_all')}</Link>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}