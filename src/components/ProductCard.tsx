import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Box, CheckCircle2, ArrowRight, Calendar, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import React from 'react';
import { Product } from '../types';
import { cn, formatPrice } from '../lib/utils';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { translateProductValue, localizedContent } from '../lib/productVocab';
import { useFeature } from '../hooks/useFeature';
import { Skeleton } from './Skeleton';
import { useProductAvailability } from '../hooks/useProductAvailability';

interface ProductCardProps {
  product: Product;
  key?: string | number;
  lookNumber?: string;
}

export default function ProductCard({ product, lookNumber }: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const [showSizes, setShowSizes] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const scrollRevealEnabled = useFeature('scrollReveal');
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addItem } = useCart();
  const { t, language } = useLanguage();
  const { name: productName } = localizedContent(product, language);

  const isSale = product.productType === 'sale' || product.productType === 'both';
  const isRent = product.productType === 'rent' || product.productType === 'both';
  const saved = isInWishlist(product.id);
  const hasSizes = product.sizes && product.sizes.length > 0;

  const { start, end, isAvailable } = useProductAvailability(isRent ? product.id : undefined);

  const availabilityLocale = language === 'ar' ? 'ar' : 'en';
  const availabilityDateFormatter = new Intl.DateTimeFormat(availabilityLocale, { day: 'numeric', month: 'short' });
  const availabilityDayFormatter = new Intl.DateTimeFormat(availabilityLocale, { day: 'numeric' });

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (saved) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasSizes) {
      setShowSizes(true);
      return;
    }
    addItem(product, 'sale');
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleSizeSelect = (size: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedSize(size);
    addItem(product, 'sale', size);
    setIsAdded(true);
    setShowSizes(false);
    setSelectedSize('');
    setTimeout(() => setIsAdded(false), 2000);
  };

  const cancelSizeSelection = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowSizes(false);
    setSelectedSize('');
  };

  return (
    <motion.div 
      {...(scrollRevealEnabled ? {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true }
      } : {})}
      className="group relative"
    >
      <div className="block overflow-hidden relative aspect-[3/4] bg-stone-100 mb-4 cursor-pointer">
        <Link to={`/product/${product.id}`} className="absolute inset-0 z-0">
          {!imageLoaded && <Skeleton className="absolute inset-0 w-full h-full rounded-none" />}
          <img 
            src={product.images[0]} 
            alt={productName}
            loading="lazy"
            referrerPolicy="no-referrer"
            onLoad={() => setImageLoaded(true)}
            className={cn(
              "w-full h-full object-cover transition-transform duration-[1600ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-[1.05]",
              !imageLoaded && "opacity-0"
            )}
          />
        </Link>
        
        {/* Badges — above link, pointer-events-none so clicks pass through */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none z-10">
          {product.isNew && (
            <span className="bg-gold text-white text-micro tracking-[0.3em] uppercase px-4 py-1.5 font-bold">
              {t('badge.new')}
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-onyx text-white text-micro tracking-[0.3em] uppercase px-4 py-1.5 font-bold">
              {t('badge.featured')}
            </span>
          )}
          {product.glbUrl && (
            <span className="bg-ivory/90 backdrop-blur-md text-onyx text-micro tracking-[0.3em] uppercase px-4 py-1.5 flex items-center gap-2 font-bold border border-onyx/10">
              <Box className="w-3 h-3 text-gold" />
              {t('badge.3d')}
            </span>
          )}
        </div>

        {/* Mobile Quick Actions Trigger */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowMobileActions(!showMobileActions);
          }}
          className={cn(
            "md:hidden absolute bottom-0 left-0 right-0 z-20 py-3 text-micro tracking-[0.2em] uppercase font-body flex items-center justify-center gap-2 transition-all duration-300",
            showMobileActions 
              ? "bg-onyx text-white" 
              : "bg-gold/90 text-white backdrop-blur-sm"
          )}
          aria-label={showMobileActions ? 'Close quick shop' : 'Open quick shop'}
        >
          <ShoppingBag className="w-3 h-3" />
          {showMobileActions ? 'Close' : t('product.quick_shop')}
        </button>

        {/* Quick Actions — slim slide-up bar on hover */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0 z-10 transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]",
          showMobileActions
            ? "translate-y-0 opacity-100"
            : "translate-y-full md:translate-y-full md:group-hover:translate-y-0 md:opacity-0 md:group-hover:opacity-100"
        )}>
          {/* Inline size selector */}
          {showSizes && hasSizes && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full bg-ivory/95 backdrop-blur-sm p-3 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-micro tracking-[0.2em] uppercase text-stone-600 font-bold">{t('product.select_size')}</span>
                <button onClick={cancelSizeSelection} className="text-stone-600 hover:text-stone-800 transition-colors">
                  <span className="text-micro tracking-widest uppercase">{t('product.cancel')}</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={(e) => handleSizeSelect(size, e)}
                    className={cn(
                      "min-w-[2.5rem] h-9 px-2 flex items-center justify-center border text-micro tracking-wider transition-all",
                      selectedSize === size
                        ? "border-gold bg-gold text-white"
                        : "border-stone-300 text-stone-600 hover:border-gold hover:text-gold"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Slim bar with two actions */}
          <div className={cn(
            "flex bg-onyx/95 backdrop-blur-sm border-t border-gold/20 transition-all duration-500",
            showMobileActions ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
            "md:group-hover:opacity-100 md:group-hover:translate-y-0"
          )}>
            <button
              onClick={handleQuickAdd}
              className={cn(
                "flex-1 py-3 text-micro tracking-[0.2em] uppercase font-body transition-all duration-300 flex items-center justify-center gap-1.5",
                isAdded
                  ? "text-emerald-400"
                  : "text-white hover:text-gold"
              )}
            >
              {isAdded ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t('product.added')}
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  {t('product.quick_add')}
                </>
              )}
            </button>
            <div className="w-px bg-white/10" />
            <button
              onClick={toggleWishlist}
              className={cn(
                "flex-1 py-3 text-micro tracking-[0.2em] uppercase font-body transition-colors duration-300 flex items-center justify-center gap-1.5",
                saved
                  ? "text-rose-400"
                  : "text-white/70 hover:text-rose-400"
              )}
            >
              <Heart className={cn("w-3.5 h-3.5", saved && "fill-current")} />
              {saved ? t('product.in_wishlist') : t('product.add_wishlist')}
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <p className="text-micro tracking-widest text-stone-600 uppercase mb-1">{product.category}</p>
        {lookNumber && (
          <span className="font-label text-micro tracking-[0.3em] uppercase text-gold">
            {t('silhouettes.look')} {lookNumber}
          </span>
        )}
          <Link to={`/product/${product.id}`} className="block font-heading text-xl text-stone-900 tracking-tight hover:text-gold transition-colors leading-[1.1]">
            {productName}
        </Link>
        {product.fabric && (
          <p className="font-editorial italic text-sm text-stone-600">{translateProductValue('fabric', product.fabric, language)}</p>
        )}

        {/* Expanding gold frame — couture hover detail */}
        <span className="absolute inset-3 border border-gold/0 transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:inset-4 group-hover:border-gold/40 pointer-events-none z-10" aria-hidden="true" />
        
          <div className="mt-2 flex flex-col gap-1">
            {isSale && (
              <p className="text-xs tracking-wider text-stone-600">
                {t('product.purchase')}: <span className="font-semibold text-stone-800"><span className="me-1 text-micro uppercase tracking-wider text-stone-600">{t('pricing.from')}</span>{' '}{formatPrice(product.salePrice || 0)}</span>
              </p>
            )}
            {isRent && (
              <>
                <p className="text-xs tracking-wider text-stone-600">
                  {t('product.rent')}: <span className="text-stone-700"><span className="me-1 text-micro uppercase tracking-wider text-stone-600">{t('pricing.from')}</span>{' '}{formatPrice(product.rentalPrice || 0)}</span>
                </p>
                {isAvailable && start && end && (
                  <p className="flex items-center gap-1 text-micro text-gold/80 tracking-wider">
                    <Calendar className="w-3 h-3" />
                    <span className="tracking-widest uppercase font-medium">
                      {availabilityDateFormatter.format(start)}–{availabilityDayFormatter.format(end)} {t('product.available')}
                    </span>
                  </p>
                )}
                {!isAvailable && (
                  <p className="flex items-center gap-1 text-micro text-rose-500/80 tracking-wider">
                    <X className="w-3 h-3" />
                    <span className="tracking-widest uppercase font-medium">{t('product.fully_booked')}</span>
                  </p>
                )}
              </>
            )}
          </div>

          <Link
            to={`/product/${product.id}`}
            className="inline-flex items-center gap-1.5 min-h-[44px] font-label text-micro tracking-[0.25em] uppercase text-stone-800 hover:text-gold transition-colors duration-500 mt-2"
          >
            {t('silhouettes.enquire')}
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
