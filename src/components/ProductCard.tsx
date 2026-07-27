import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Box, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import React from 'react';
import { Product } from '../types';
import { cn, formatPrice } from '../lib/utils';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useFeature } from '../hooks/useFeature';
import { Skeleton } from './Skeleton';

interface ProductCardProps {
  product: Product;
  key?: string | number;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const [showSizes, setShowSizes] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const scrollRevealEnabled = useFeature('scrollReveal');
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addItem } = useCart();
  const { t } = useLanguage();

  const isSale = product.productType === 'sale' || product.productType === 'both';
  const isRent = product.productType === 'rent' || product.productType === 'both';
  const saved = isInWishlist(product.id);
  const hasSizes = product.sizes && product.sizes.length > 0;

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
            alt={product.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            onLoad={() => setImageLoaded(true)}
            className={cn(
              "w-full h-full object-cover transition-transform duration-[1300ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-[1.07]",
              !imageLoaded && "opacity-0"
            )}
          />
        </Link>
        
        {/* Badges — above link, pointer-events-none so clicks pass through */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none z-10">
          {product.isNew && (
            <span className="bg-gold text-white text-[9px] tracking-[0.3em] uppercase px-4 py-1.5 font-bold">
              {t('badge.new')}
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-onyx text-white text-[9px] tracking-[0.3em] uppercase px-4 py-1.5 font-bold">
              {t('badge.featured')}
            </span>
          )}
          {product.glbUrl && (
            <span className="bg-ivory/90 backdrop-blur-md text-onyx text-[9px] tracking-[0.3em] uppercase px-4 py-1.5 flex items-center gap-2 font-bold border border-onyx/10">
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
            "md:hidden absolute bottom-0 left-0 right-0 z-20 py-3 text-[10px] tracking-[0.2em] uppercase font-body flex items-center justify-center gap-2 transition-all duration-300",
            showMobileActions 
              ? "bg-onyx text-white" 
              : "bg-gold/90 text-white backdrop-blur-sm"
          )}
          aria-label={showMobileActions ? 'Close quick shop' : 'Open quick shop'}
        >
          <ShoppingBag className="w-3 h-3" />
          {showMobileActions ? 'Close' : 'Quick Shop'}
        </button>

        {/* Quick Actions Overlay — pointer-events-none, only buttons get pointer-events-auto */}
        <div className={cn(
          "absolute inset-0 z-10 flex flex-col items-center justify-end pb-16 px-4 gap-2 border pointer-events-none transition-all duration-300",
          showMobileActions 
            ? "bg-onyx/5 opacity-100 border-gold/20" 
            : "bg-transparent md:opacity-0 md:group-hover:opacity-100 md:bg-onyx/5 md:border-gold/20"
        )}>
          {/* Inline size selector */}
          {showSizes && hasSizes && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full bg-ivory/95 backdrop-blur-sm p-3 flex flex-col gap-2 pointer-events-auto"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] tracking-[0.2em] uppercase text-stone-500 font-bold">Select Size</span>
                <button onClick={cancelSizeSelection} className="text-stone-400 hover:text-stone-800 transition-colors">
                  <span className="text-[9px] tracking-widest uppercase">Cancel</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={(e) => handleSizeSelect(size, e)}
                    className={cn(
                      "min-w-[2.5rem] h-9 px-2 flex items-center justify-center border text-[10px] tracking-wider transition-all",
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

          <button 
            onClick={handleQuickAdd}
            className={cn(
              "w-full py-3.5 text-xs tracking-[0.2em] uppercase font-body transition-all duration-300 flex items-center justify-center gap-2 rounded-none pointer-events-auto",
              isAdded 
                ? "bg-emerald-500 text-white" 
                : "bg-gold text-white hover:bg-stone-800"
            )}
          >
            {isAdded ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                {t('product.added')}
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                {t('product.quick_add')}
              </>
            )}
          </button>
          <button 
            onClick={toggleWishlist}
            className={cn(
              "w-full py-3 text-[10px] tracking-[0.2em] uppercase font-body transition-colors duration-300 flex items-center justify-center gap-2 rounded-none pointer-events-auto",
              saved 
                ? "bg-rose-500 text-white" 
                : "bg-stone-800 text-white hover:bg-rose-500"
            )}
          >
            <Heart className={cn("w-3 h-3", saved && "fill-current")} />
            {saved ? t('product.in_wishlist') : t('product.add_wishlist')}
          </button>
        </div>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <p className="text-[10px] tracking-widest text-stone-500 uppercase mb-1">{product.category}</p>
          <Link to={`/product/${product.id}`} className="block font-heading text-xl text-stone-900 tracking-tight hover:text-gold transition-colors leading-[1.1]">
            {product.name}
        </Link>

        {/* Expanding gold frame — couture hover detail */}
        <span className="absolute inset-3 border border-gold/0 transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:inset-4 group-hover:border-gold/40 pointer-events-none z-10" aria-hidden="true" />
        
          <div className="mt-2 flex flex-col gap-1">
            {isSale && (
              <p className="text-xs tracking-wider text-stone-600">
                {t('product.purchase')}: <span className="font-semibold text-stone-800">{formatPrice(product.salePrice || 0)}</span>
              </p>
            )}
            {isRent && (
              <p className="text-xs tracking-wider text-stone-500">
                {t('product.rent')}: <span className="text-stone-700">{formatPrice(product.rentalPrice || 0)}</span>
              </p>
            )}
          </div>
        </div>
        
        <button 
          onClick={toggleWishlist}
          className={cn(
            "p-2 transition-colors",
            saved ? "text-rose-400" : "text-stone-300 hover:text-rose-400"
          )}
          aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={cn("w-5 h-5", saved && "fill-current")} />
        </button>
      </div>
    </motion.div>
  );
}
