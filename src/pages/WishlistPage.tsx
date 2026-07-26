import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ShoppingBag, X, Heart, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, isLoading } = useWishlist();
  const { addItem } = useCart();
  const { t } = useLanguage();
  const [addedId, setAddedId] = useState<string | null>(null);

  const handleMoveToBag = (product: any) => {
    const defaultSize = product.sizes?.[0] || undefined;
    addItem(product, 'sale', defaultSize);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 2000);
  };

  return (
    <div className="pt-32 pb-20 bg-ivory min-h-screen">
      <div className="container mx-auto px-6">
        <header className="text-center mb-20">
           <h1 className="font-heading text-4xl md:text-6xl text-stone-800 tracking-wider uppercase mb-4">{t('wishlist.title')}</h1>
           <p className="font-body text-stone-400 text-[10px] tracking-[0.2em] uppercase italic">{t('wishlist.subtitle')}</p>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 text-gold animate-spin" />
          </div>
        ) : wishlist.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <AnimatePresence mode="popLayout">
              {wishlist.map((product) => (
                <motion.div 
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-ivory border border-stone-100 group relative"
                >
                  <button 
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute top-4 right-4 z-10 w-8 h-8 bg-ivory/80 backdrop-blur-sm flex items-center justify-center text-stone-400 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <Link to={`/product/${product.id}`} className="block overflow-hidden aspect-[4/5]">
                    <img 
                      src={product.images[0]} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                      loading="lazy"
                    />
                  </Link>

                  <div className="p-8 text-center border-t border-stone-50">
                    <span className="text-[10px] text-stone-300 uppercase tracking-widest mb-2 block">{product.category}</span>
                    <h3 className="font-heading text-lg text-stone-800 mb-4 tracking-wide group-hover:text-gold transition-colors">{product.name}</h3>
<p className="font-body text-sm text-gold mb-8">{formatPrice(product.salePrice || product.rentalPrice || 0)}</p>

                     <div className="flex gap-2">
                        <Link to={`/product/${product.id}`} className="flex-1 btn-luxury !py-3 !px-4 text-[10px]">{t('wishlist.view')}</Link>
                        <button
                          onClick={() => handleMoveToBag(product)}
                          className="flex-1 btn-luxury-outline !py-3 !px-4 text-[10px] flex items-center justify-center gap-2"
                        >
                          {addedId === product.id ? (
                            <><CheckCircle2 className="w-3.5 h-3.5" /> {t('product.added')}</>
                          ) : (
                            <><ShoppingBag className="w-3.5 h-3.5" /> {t('wishlist.add_to_bag')}</>
                          )}
                        </button>
                     </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-32 bg-ivory border border-stone-100">
<Heart className="w-16 h-16 text-stone-100 mx-auto mb-8" />
              <h3 className="font-heading text-2xl text-stone-800 mb-4 tracking-widest uppercase">{t('wishlist.empty')}</h3>
              <p className="font-body text-stone-400 text-xs uppercase tracking-widest mb-10 italic">{t('wishlist.empty_desc')}</p>
              <Link to="/search" className="btn-luxury px-12 group flex items-center gap-3 mx-auto w-fit">
                {t('wishlist.explore')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
          </div>
        )}
      </div>
    </div>
  );
}
