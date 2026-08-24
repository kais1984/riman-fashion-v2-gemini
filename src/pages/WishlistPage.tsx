import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ShoppingBag, X, Heart, ArrowRight, Loader2, CheckCircle2, Share2 } from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { translateProductValue } from '../lib/productVocab';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useMemo, useState } from 'react';
import type { Product } from '../types';
import { useToast } from '../contexts/ToastContext';
import { analytics } from '../services/analytics';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, isLoading } = useWishlist();
  const { products } = useData();
  const { addItem } = useCart();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();
  const [addedId, setAddedId] = useState<string | null>(null);

  const sharedIds = useMemo(
    () => (searchParams.get('ids') || '').split(',').map(s => s.trim()).filter(Boolean),
    [searchParams]
  );
  const isSharedView = sharedIds.length > 0;

  const sharedProducts: Product[] = useMemo(() => {
    if (!isSharedView) return [];
    return sharedIds
      .map(id => products.find(p => p.id === id))
      .filter((p): p is Product => Boolean(p));
  }, [isSharedView, sharedIds, products]);

  const displayProducts = isSharedView ? sharedProducts : wishlist;

  const shareUrl = `${window.location.origin}/wishlist?ids=${wishlist.map(p => p.id).join(',')}`;

  const handleShare = async () => {
    const message = `${t('selection.shared_title')} — Atelier Riman`;
    if (navigator.share) {
      try {
        await navigator.share({ title: message, url: shareUrl });
        return;
      } catch {
        // User dismissed the share sheet; fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      addToast({ type: 'success', title: t('selection.link_copied'), message: shareUrl });
    } catch {
      addToast({ type: 'info', title: t('selection.share'), message: shareUrl });
    }
  };

  const handleMoveToBag = (product: any) => {
    const defaultSize = product.sizes?.[0] || undefined;
    addItem(product, 'sale', defaultSize);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 2000);
  };

  const requestViewing = (items: Product[]) => {
    analytics.requestViewing(items.map(p => ({ id: p.id, name: p.name, intent: p.productType === 'rent' ? 'rent' : 'sale' })));
    navigate('/appointment', {
      state: {
        gowns: items.map(p => ({ id: p.id, name: p.name, intent: (p.productType === 'rent' ? 'rent' : 'sale') as 'rent' | 'sale' })),
      },
    });
  };

  return (
    <div className="pt-32 pb-20 bg-ivory min-h-screen">
      <div className="container mx-auto px-6">
        <header className="text-center mb-20">
           <h1 className="font-heading text-4xl md:text-6xl text-stone-800 tracking-wider uppercase mb-4">
             {isSharedView ? t('selection.shared_title') : t('selection.title')}
           </h1>
           <p className="font-body text-stone-600 text-micro tracking-[0.2em] uppercase italic">
             {isSharedView ? t('selection.shared_subtitle') : t('selection.subtitle')}
           </p>
           <p className="font-body text-stone-600 text-micro tracking-[0.2em] uppercase italic">{displayProducts.length} {t('selection.count')}</p>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 text-gold animate-spin" />
          </div>
        ) : displayProducts.length > 0 ? (
          <>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <button
              onClick={() => requestViewing(displayProducts)}
              className="btn-luxury px-12 w-full sm:w-auto"
            >
              {t('selection.request_viewing')}
            </button>
            {!isSharedView && (
              <button
                onClick={handleShare}
                className="btn-luxury-outline px-8 w-full sm:w-auto flex items-center justify-center gap-3"
              >
                <Share2 className="w-4 h-4" />
                {t('selection.share')}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <AnimatePresence mode="popLayout">
              {displayProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-ivory border border-stone-100 group relative"
                >
                  {!isSharedView && (
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="absolute top-4 right-4 z-10 w-8 h-8 bg-ivory/80 backdrop-blur-sm flex items-center justify-center text-stone-600 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                      aria-label={t('wishlist.remove_aria')}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  <Link to={`/product/${product.id}`} className="block overflow-hidden aspect-[4/5]">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                      loading="lazy"
                    />
                  </Link>

                  <div className="p-8 text-center border-t border-stone-50">
                    <span className="text-micro text-stone-500 uppercase tracking-widest mb-2 block">{translateProductValue('category', product.category, language)}</span>
                    <h3 className="font-heading text-lg text-stone-800 mb-4 tracking-wide group-hover:text-gold transition-colors">{product.name}</h3>
                    <p className="font-body text-sm text-gold mb-8">{formatPrice(product.salePrice || product.rentalPrice || 0)}</p>

                     <div className="flex gap-2">
                        <Link to={`/product/${product.id}`} className="flex-1 btn-luxury !py-3 !px-4 text-micro">{t('selection.view')}</Link>
                        {!isSharedView && (
                          <button
                            onClick={() => handleMoveToBag(product)}
                            className="flex-1 btn-luxury-outline !py-3 !px-4 text-micro flex items-center justify-center gap-2"
                          >
                            {addedId === product.id ? (
                              <><CheckCircle2 className="w-3.5 h-3.5" /> {t('product.added')}</>
                            ) : (
                              <><ShoppingBag className="w-3.5 h-3.5" /> {t('selection.add_to_bag')}</>
                            )}
                          </button>
                        )}
                     </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="flex justify-center mt-12">
            <button
              onClick={() => requestViewing(displayProducts)}
              className="btn-luxury px-12 w-full sm:w-auto"
            >
              {t('selection.request_viewing')}
            </button>
          </div>
          </>
        ) : (
          <div className="text-center py-32 bg-ivory border border-stone-100">
            <Heart className="w-16 h-16 text-stone-100 mx-auto mb-8" />
              <h3 className="font-heading text-2xl text-stone-800 mb-4 tracking-widest uppercase">
                {isSharedView ? t('product.not_found') : t('selection.empty')}
              </h3>
              <p className="font-body text-stone-600 text-xs uppercase tracking-widest mb-10 italic">
                {t('selection.empty_desc')}
              </p>
              <Link to="/search" className="btn-luxury px-12 group flex items-center gap-3 mx-auto w-fit">
                {t('selection.explore')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
          </div>
        )}
      </div>
    </div>
  );
}
