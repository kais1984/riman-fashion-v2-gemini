import { useParams, Link } from 'react-router-dom';
import { useState, useMemo, useRef, MouseEvent, Suspense, lazy, useEffect } from 'react';
import { ShoppingBag, Heart, ChevronRight, ChevronLeft, ChevronDown, Share2, Ruler, ShieldCheck, Truck, Search, Star, CheckCircle2, X, Calendar, Info, Loader2, RotateCcw, Box, Sparkles, MessageCircle, Gem, Wind } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { products } from '../data/products';
import { formatPrice, cn, categoryToSlug } from '../lib/utils';
import { Product } from '../types';
import { useData } from '../contexts/DataContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useScrollLock } from '../hooks/useScrollLock';
import { useFeature } from '../hooks/useFeature';
import { useToast } from '../contexts/ToastContext';
import ProductCard from '../components/ProductCard';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import SizeGuide from '../components/SizeGuide';
import { ProductDetailSkeleton } from '../components/Skeleton';

const ThreeDViewer = lazy(() => import('../components/ThreeDViewer'));

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

export default function ProductDetail() {
  const { products: dynamicProducts, isLoading } = useData();
  const { id } = useParams();
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { t } = useLanguage();
  const threeDViewerEnabled = useFeature('threeDViewer');
  const { addToast } = useToast();
  const [selectedSize, setSelectedSize] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);
  const [bookingDate, setBookingDate] = useState<Date | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [is3DMode, setIs3DMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showCare, setShowCare] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem(`reviews_${id}`);
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', name: 'Sara Al-Meiri', rating: 5, comment: 'Absolutely stunning gown. The fabric quality is exceptional.', date: '2 days ago' },
      { id: '2', name: 'Hind Obaid', rating: 4, comment: 'Beautiful design, though the fitting required a slight adjustment.', date: '1 week ago' },
    ];
  });

  useEffect(() => {
    localStorage.setItem(`reviews_${id}`, JSON.stringify(reviews));
  }, [reviews, id]);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' });
  const containerRef = useRef<HTMLDivElement>(null);

  const product = useMemo(() =>
    dynamicProducts.find(p => p.id === id) || products.find(p => p.id === id),
  [id, dynamicProducts, products]);

  const saved = isInWishlist(product?.id || '');
  const relatedProducts = useMemo(() =>
    dynamicProducts.filter(p => p.category === product?.category && p.id !== id).slice(0, 4),
    [product, id, dynamicProducts]
  );

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const handleAddToCart = () => {
    setErrorMsg('');
    if (isRent && !bookingDate) {
      setErrorMsg(t('product.error_no_date'));
      return;
    }
    if (!selectedSize) {
      setErrorMsg(t('product.error_no_size'));
      return;
    }
    setIsAddingToCart(true);
    setTimeout(() => {
      const intent = isRent && bookingDate ? 'rent' : 'sale';
      addItem(product, intent, selectedSize, bookingDate || undefined);
      setIsAddingToCart(false);
      addToast({
        type: 'success',
        title: intent === 'rent' ? t('product.toast_rental') : t('product.toast_added'),
        message: `${product.name} — ${intent === 'rent' ? 'rental booked' : 'added to your collection'}`
      });
      if (intent === 'rent') setShowConfirmation(true);
    }, 600);
  };

  if (!product) {
    if (isLoading) return <ProductDetailSkeleton />;
    return (
      <div className="pt-40 pb-20 text-center">
        <h1 className="font-heading text-4xl mb-4">{t('product.not_found')}</h1>
        <Link to="/collection/all" className="btn-luxury">{t('product.back_to_collection')}</Link>
      </div>
    );
  }

  const totalAssets = (product.videoUrl ? 1 : 0) + product.images.length;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % totalAssets);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + totalAssets) % totalAssets);
  };

  const isRent = product.productType === 'rent' || product.productType === 'both';
  const isSale = product.productType === 'sale' || product.productType === 'both';

  return (
    <>
      <div id="product-detail-page" className="pt-24 bg-ivory min-h-screen pb-24 lg:pb-12">
        <div className="container mx-auto px-5 py-10">
          {/* Breadcrumbs */}
          <nav className="flex gap-2 text-xs tracking-[0.2em] uppercase text-stone-400 mb-10">
            <Link to="/" className="hover:text-gold transition-colors">{t('nav.home')}</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to={`/collection/${categoryToSlug(product.category)}`} className="hover:text-gold transition-colors">{product.category}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-stone-800 font-medium">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-[48fr_52fr] gap-10 lg:gap-14 mb-20">
            {/* Gallery */}
            <div className="space-y-3">
              <div className="relative aspect-[4/5] overflow-hidden bg-ivory">
                <AnimatePresence mode="wait">
                  {is3DMode && product.glbUrl ? (
                    <motion.div key="3d-viewer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
                      <div className="w-full h-full">
                        <Suspense fallback={<div className="w-full h-full flex items-center justify-center bg-stone-50"><Loader2 className="w-8 h-8 text-gold animate-spin" /></div>}>
                          <ThreeDViewer src={product.glbUrl} poster={product.images[0]} className="w-full h-full border border-gold/20" />
                        </Suspense>
                      </div>
                    </motion.div>
                  ) : product.videoUrl && currentImageIndex === 0 ? (
                    <motion.div key="video-player" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-stone-900">
                      <video src={product.videoUrl} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-onyx/10 pointer-events-none" />
                      <div className="absolute bottom-5 left-5 p-2 bg-ivory/20 backdrop-blur-md rounded-full">
                        <RotateCcw className="w-3 h-3 text-white animate-spin-slow" />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="image-gallery"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      ref={containerRef}
                      onMouseEnter={() => setIsZoomed(true)}
                      onMouseLeave={() => setIsZoomed(false)}
                      onMouseMove={handleMouseMove}
                      className="absolute inset-0 group cursor-zoom-in overflow-hidden"
                    >
                      <motion.img
                        src={product.images[product.videoUrl ? currentImageIndex - 1 : currentImageIndex]}
                        alt={product.name}
                        fetchpriority="high"
                        animate={{
                          scale: isZoomed ? 1.8 : 1,
                          x: isZoomed ? (zoomPos.x - 50) * -0.8 : 0,
                          y: isZoomed ? (zoomPos.y - 50) * -0.8 : 0,
                        }}
                        transition={{ type: "spring", stiffness: 100, damping: 25, mass: 0.5 }}
                        className="w-full h-full object-cover pointer-events-none"
                      />
                      <div className={cn("absolute top-5 left-5 p-2 bg-ivory/80 text-stone-800 rounded-full transition-opacity duration-300 pointer-events-none z-10", isZoomed ? "opacity-100" : "opacity-0")}>
                        <Search className="w-4 h-4" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Image Counter Badge */}
                <div className="absolute bottom-5 left-5 z-20 bg-ivory/90 backdrop-blur-sm px-3 py-1.5 text-[10px] tracking-widest uppercase text-stone-700 font-bold">
                  {currentImageIndex + 1} / {totalAssets}
                </div>

                {/* Nav Arrows */}
                {totalAssets > 1 && (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-ivory/80 text-stone-800 hover:bg-gold hover:text-white transition-all z-20" aria-label="Previous image">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-ivory/80 text-stone-800 hover:bg-gold hover:text-white transition-all z-20" aria-label="Next image">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Perspective Toggle */}
                {product.glbUrl && (
                  <div className="absolute top-5 right-5 z-30 flex gap-2">
                    <button onClick={() => setIs3DMode(false)} className={cn("p-2.5 transition-all backdrop-blur border", !is3DMode ? "bg-gold text-white border-gold" : "bg-ivory/80 text-stone-500 border-stone-100 hover:border-stone-300")} title={t('product.classic_view')}>
                      <Search className="w-3.5 h-3.5" />
                    </button>
                    {threeDViewerEnabled && (
                      <button onClick={() => setIs3DMode(true)} className={cn("p-2.5 transition-all backdrop-blur border", is3DMode ? "bg-gold text-white border-gold scale-105" : "bg-ivory/80 text-stone-500 border-stone-100 hover:border-stone-300")} title={t('product.view_3d')}>
                        <Box className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}

                {/* Share Menu */}
                <div className="absolute bottom-5 right-5 z-20 flex gap-2">
                  <button onClick={() => setShowShareMenu(!showShareMenu)} className="p-2.5 bg-ivory/90 text-stone-800 hover:bg-gold hover:text-white transition-all" aria-label="Share this product">
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                  {showShareMenu && (
                    <div className="absolute bottom-12 right-0 bg-ivory border border-stone-100 p-2 w-44">
                      <a href={`https://wa.me/?text=${encodeURIComponent(`Check out ${product.name} at Riman Fashion: ${window.location.origin}/product/${product.id}`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 text-[10px] tracking-wider uppercase text-stone-700 hover:bg-pearl transition-colors">
                        WhatsApp
                      </a>
                      <button onClick={() => { navigator.clipboard.writeText(window.location.href); setShowShareMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] tracking-wider uppercase text-stone-700 hover:bg-pearl transition-colors">
                        {t('product.copy_link')}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {product.videoUrl && (
                  <button onClick={() => setCurrentImageIndex(0)} className={cn("w-16 h-16 flex-shrink-0 bg-stone-900 overflow-hidden border-2 transition-all flex items-center justify-center relative", currentImageIndex === 0 ? "border-gold" : "border-transparent")}>
                    <video src={product.videoUrl} className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <RotateCcw className="w-4 h-4 text-white/80" />
                    </div>
                  </button>
                )}
                {product.images.map((img, i) => {
                  const index = product.videoUrl ? i + 1 : i;
                  return (
                    <button key={i} onClick={() => setCurrentImageIndex(index)} className={cn("w-16 h-16 flex-shrink-0 bg-stone-100 overflow-hidden border-2 transition-all", currentImageIndex === index ? "border-gold" : "border-transparent")}>
                      <img src={img} className="w-full h-full object-cover" alt="" />
                    </button>
                  );
                })}
              </div>

              {/* Quick Specs Bar */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-stone-100">
                <div className="flex flex-col items-center gap-1.5 py-3">
                  <Gem className="w-4 h-4 text-gold" />
                  <span className="text-[9px] text-stone-400 uppercase tracking-widest font-bold">{t('product.fabric')}</span>
                  <span className="text-[10px] text-stone-700 font-medium tracking-wide">{product.fabric || 'Luxury Blend'}</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 py-3 border-x border-stone-100">
                  <Sparkles className="w-4 h-4 text-gold" />
                  <span className="text-[9px] text-stone-400 uppercase tracking-widest font-bold">{t('product.silhouette')}</span>
                  <span className="text-[10px] text-stone-700 font-medium tracking-wide">{product.category}</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 py-3">
                  <Wind className="w-4 h-4 text-gold" />
                  <span className="text-[9px] text-stone-400 uppercase tracking-widest font-bold">{t('product.color')}</span>
                  <span className="text-[10px] text-stone-700 font-medium tracking-wide">{product.style[0] || 'Signature'}</span>
                </div>
              </div>
            </div>

            {/* Info — Sticky on Desktop */}
            <div className="flex flex-col lg:sticky lg:top-28 lg:self-start">
              <header className="mb-8">
                <span className="text-[10px] tracking-[0.3em] uppercase text-gold block mb-2 font-bold">{product.designer || 'Riman Atelier'}</span>
                <h1 className="font-heading text-3xl md:text-4xl text-stone-800 tracking-wider mb-3 leading-tight">{product.name}</h1>
                <div className="flex gap-3">
                  {product.isNew && <span className="text-gold text-[10px] uppercase tracking-widest border border-gold/30 px-3 py-1 font-bold">{t('product.limited_edition')}</span>}
                  <span className="text-stone-400 text-[10px] uppercase tracking-widest border border-stone-200 px-3 py-1 font-medium">SKU: RF-{product.id.padStart(4, '0')}</span>
                </div>
              </header>

              {/* Editorial Quote */}
              <div className="mb-8 pl-5 border-l-2 border-gold/40">
                <p className="font-editorial italic text-sm text-stone-500 leading-relaxed">
                  "A study in refined elegance — where artisanal precision meets contemporary silhouette, crafted for the woman who commands quiet luxury."
                </p>
              </div>

              {/* Pricing */}
              <div className="mb-8 p-5 bg-gold/5 border border-gold/20 flex flex-col gap-4">
                {isSale && (
                  <div className="flex justify-between items-baseline">
                    <span className="font-body text-[10px] tracking-widest uppercase text-stone-500 font-medium">{t('product.purchase_value')}</span>
                    <span className="font-heading text-3xl text-stone-800">{formatPrice(product.salePrice || 0)}</span>
                  </div>
                )}
                {isRent && (
                  <div className="flex justify-between items-baseline pt-4 border-t border-stone-200/60">
                    <div>
                      <span className="font-body text-[10px] tracking-widest uppercase text-stone-500 block font-medium">{t('product.rental_7day')}</span>
                      <span className="text-[10px] text-stone-400 uppercase tracking-wider italic">({t('product.rental_includes')})</span>
                    </div>
                    <div className="text-right">
                      <span className="font-heading text-3xl text-gold">{formatPrice(product.rentalPrice || 0)}</span>
                      <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-1">{t('product.refundable_deposit')}</p>
                    </div>
                  </div>
                )}
              </div>

              <p className="font-body text-sm text-stone-600 leading-relaxed tracking-wide mb-8">
                {product.description}
                <br /><br />
                {t('product.description_intro')} {product.fabric || 'silk blend'}, the {product.name} {t('product.description_mid')} {product.style.join(' and ')} {t('product.description_outro')}
              </p>

              {/* Selection */}
              <div className="space-y-6 mb-10">
                {isRent && (
                  <div className="p-5 bg-stone-50 border border-stone-200">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-body text-[10px] tracking-[0.2em] uppercase text-stone-800">{t('product.rental_availability')}</span>
                      <span className="text-[9px] text-gold uppercase tracking-widest font-bold">{t('product.fast_booking')}</span>
                    </div>
                    <AvailabilityCalendar productId={product.id} selectedDate={bookingDate} onDateSelect={setBookingDate} />
                    <p className="text-[9px] text-stone-400 leading-relaxed italic text-center mt-3">
                      {bookingDate ? `${t('product.selected_date')}: ${bookingDate.toLocaleDateString()}` : t('product.select_date_hint')}
                    </p>
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-body text-[10px] tracking-[0.2em] uppercase text-stone-800">{t('product.select_size_label')}</span>
                    <button onClick={() => setShowSizeGuide(true)} className="flex items-center gap-2 text-[10px] tracking-widest text-gold uppercase hover:underline">
                      <Ruler className="w-3 h-3" /> {t('product.size_guide')}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {['XS', 'S', 'M', 'L', 'XL'].map((size) => {
                      const isAvailable = product.sizes.includes(size);
                      return (
                        <button key={size} disabled={!isAvailable} onClick={() => setSelectedSize(size)} className={cn("w-11 h-11 flex items-center justify-center border text-[10px] tracking-widest transition-all", !isAvailable ? "border-stone-100 text-stone-200 cursor-not-allowed" : selectedSize === size ? "border-gold bg-gold text-white" : "border-stone-200 text-stone-600 hover:border-gold")}>
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 flex flex-col gap-2">
                    <button onClick={handleAddToCart} disabled={isAddingToCart} className="w-full btn-luxury flex items-center justify-center gap-3 relative overflow-hidden">
                      {isAddingToCart ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          {isRent ? t('product.book_rental') : t('product.add_to_collection')}
                        </>
                      )}
                    </button>
                    {errorMsg && (
                      <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] text-rose-500 uppercase tracking-widest text-center font-bold">
                        {errorMsg}
                      </motion.p>
                    )}
                  </div>
                  <button onClick={(e) => { e.preventDefault(); if (saved) { removeFromWishlist(product.id); } else { addToWishlist(product); } }} className={cn("w-12 h-12 flex items-center justify-center border transition-all", saved ? "border-rose-200 text-rose-500 bg-rose-50" : "border-stone-200 text-stone-500 hover:text-rose-500 hover:border-rose-200")} aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}>
                    <Heart className={cn("w-4 h-4", saved && "fill-current")} />
                  </button>
                </div>
              </div>

              {/* Trust Badges — 3-column grid */}
              <div className="grid grid-cols-3 gap-4 py-8 border-t border-b border-stone-100 mb-10 bg-gold/[0.03]">
                <div className="flex flex-col items-center text-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-gold" />
                  <span className="text-[9px] font-bold text-stone-800 tracking-wider leading-tight">{t('product.couture_care')}</span>
                  <span className="text-[8px] text-stone-400 uppercase tracking-widest font-bold">{t('product.cleaning_included')}</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2 border-x border-stone-100">
                  <Truck className="w-5 h-5 text-gold" />
                  <span className="text-[9px] font-bold text-stone-800 tracking-wider leading-tight">{t('product.secure_delivery')}</span>
                  <span className="text-[8px] text-stone-400 uppercase tracking-widest font-bold">{t('product.uae_gcc')}</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <Ruler className="w-5 h-5 text-gold" />
                  <span className="text-[9px] font-bold text-stone-800 tracking-wider leading-tight">{t('product.bespoke_fit')}</span>
                  <span className="text-[8px] text-stone-400 uppercase tracking-widest font-bold">{t('product.custom_tailoring')}</span>
                </div>
              </div>

              {/* Specifications Accordion */}
              <div className="border border-stone-100 mb-4">
                <button onClick={() => setShowDetails(!showDetails)} className="w-full flex items-center justify-between p-5 bg-ivory hover:bg-ivory transition-colors">
                  <span className="font-body text-[10px] font-bold tracking-widest uppercase text-stone-800">{t('product.specifications')}</span>
                  <ChevronDown className={cn("w-4 h-4 text-stone-400 transition-transform duration-300", showDetails && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {showDetails && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="border-t border-stone-100">
                        <div className="flex justify-between py-3.5 px-5 bg-ivory">
                          <span className="text-[10px] text-gold uppercase tracking-widest font-bold">{t('product.fabric')}</span>
                          <span className="text-xs text-stone-800 font-medium tracking-wide">{product.fabric || 'Luxury Blend'}</span>
                        </div>
                        <div className="flex justify-between py-3.5 px-5 bg-stone-50/50">
                          <span className="text-[10px] text-gold uppercase tracking-widest font-bold">{t('product.designer')}</span>
                          <span className="text-xs text-stone-800 font-medium tracking-wide">{product.designer || 'Riman Atelier'}</span>
                        </div>
                        <div className="py-3.5 px-5 bg-ivory">
                          <span className="text-[10px] text-gold uppercase tracking-widest font-bold block mb-2">{t('product.style_elements')}</span>
                          <div className="flex flex-wrap gap-2">
                            {product.style.map((tag, i) => (
                              <span key={i} className="text-[10px] px-3 py-1 bg-stone-50 border border-stone-100 text-stone-500 uppercase tracking-[0.15em] font-medium">{tag}</span>
                            ))}
                            {product.category && (
                              <span className="text-[10px] px-3 py-1 bg-gold/5 border border-gold/10 text-gold uppercase tracking-[0.15em] font-bold">{product.category}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Care Instructions Accordion */}
              <div className="border border-stone-100 mb-4">
                <button onClick={() => setShowCare(!showCare)} className="w-full flex items-center justify-between p-5 bg-ivory hover:bg-ivory transition-colors">
                  <span className="font-body text-[10px] font-bold tracking-widest uppercase text-stone-800">{t('product.care_instructions')}</span>
                  <ChevronDown className={cn("w-4 h-4 text-stone-400 transition-transform duration-300", showCare && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {showCare && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="p-5 pt-0 space-y-3">
                        <div className="flex gap-4">
                          <div className="w-px h-auto bg-gold/30 shrink-0" />
                          <div>
                            <h5 className="font-body text-[10px] font-bold tracking-widest uppercase mb-1">{t('product.care_dry_clean')}</h5>
                            <p className="text-[11px] text-stone-500 leading-relaxed italic">{t('product.care_dry_clean_desc')}</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="w-px h-auto bg-gold/30 shrink-0" />
                          <div>
                            <h5 className="font-body text-[10px] font-bold tracking-widest uppercase mb-1">{t('product.care_store')}</h5>
                            <p className="text-[11px] text-stone-500 leading-relaxed italic">{t('product.care_store_desc')}</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="w-px h-auto bg-gold/30 shrink-0" />
                          <div>
                            <h5 className="font-body text-[10px] font-bold tracking-widest uppercase mb-1">{t('product.care_handle')}</h5>
                            <p className="text-[11px] text-stone-500 leading-relaxed italic">{t('product.care_handle_desc')}</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="w-px h-auto bg-gold/30 shrink-0" />
                          <div>
                            <h5 className="font-body text-[10px] font-bold tracking-widest uppercase mb-1">{t('product.care_steam')}</h5>
                            <p className="text-[11px] text-stone-500 leading-relaxed italic">{t('product.care_steam_desc')}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Ask a Stylist CTA */}
              <Link to="/appointment" className="block p-5 bg-gold/5 border border-gold/20 hover:border-gold/40 transition-all mb-4 group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gold/10 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <h4 className="font-heading text-xs tracking-[0.15em] uppercase text-stone-800 mb-1 group-hover:text-gold transition-colors">{t('product.ask_stylist')}</h4>
                    <p className="text-[10px] text-stone-500 tracking-wide">{t('product.ask_stylist_desc')}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gold ml-auto group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Artistry & Essence — collapsible */}
              <div className="border border-stone-100">
                <button onClick={() => setShowDetails(!showDetails)} className="w-full flex items-center justify-between p-5 bg-ivory hover:bg-ivory transition-colors">
                  <span className="font-body text-[10px] font-bold tracking-widest uppercase text-stone-800">{t('product.artistry_essence')}</span>
                  <ChevronDown className={cn("w-4 h-4 text-stone-400 transition-transform duration-300", showDetails && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {showDetails && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="p-5 pt-0 space-y-5">
                        <div className="flex gap-4">
                          <div className="w-px h-auto bg-gold/30 shrink-0" />
                          <div>
                            <h5 className="font-body text-[10px] font-bold tracking-widest uppercase mb-1">{t('product.fitting_title')}</h5>
                            <p className="text-[11px] text-stone-500 leading-relaxed italic">{t('product.fitting_desc')}</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="w-px h-auto bg-gold/30 shrink-0" />
                          <div>
                            <h5 className="font-body text-[10px] font-bold tracking-widest uppercase mb-1">{t('product.texture_title')}</h5>
                            <p className="text-[11px] text-stone-500 leading-relaxed italic">{t('product.texture_desc')}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <section className="pt-16 border-t border-stone-100 mb-20">
            <button onClick={() => setShowReviews(!showReviews)} className="w-full flex items-center justify-between mb-10 group">
              <h3 className="font-heading text-2xl md:text-3xl text-stone-800 tracking-wide uppercase">{t('product.client_reflections')}</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={cn("w-4 h-4", star <= 4.5 ? "text-gold fill-gold" : "text-stone-200")} />
                    ))}
                  </div>
                  <span className="text-xs text-stone-500 font-bold tracking-widest">(4.8)</span>
                </div>
                <ChevronDown className={cn("w-5 h-5 text-stone-400 transition-transform duration-300", showReviews && "rotate-180")} />
              </div>
            </button>
            <AnimatePresence>
              {showReviews && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-4">
                    <div className="lg:col-span-2">
                      <div className="space-y-8">
                        {reviews.map((review) => (
                          <div key={review.id} className="pb-8 border-b border-stone-50 last:border-0">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <p className="text-[10px] font-bold text-stone-800 uppercase tracking-widest mb-1">{review.name}</p>
                                <div className="flex gap-1 mb-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} className={cn("w-3 h-3", star <= review.rating ? "text-gold fill-gold" : "text-stone-200")} />
                                  ))}
                                </div>
                              </div>
                              <span className="text-[9px] text-stone-400 uppercase tracking-widest">{review.date}</span>
                            </div>
                            <p className="text-sm text-stone-600 leading-relaxed italic">"{review.comment}"</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Review Submission Form */}
                    <div className="bg-pearl p-8 border border-stone-100 min-h-[400px] flex flex-col">
                      <h4 className="font-heading text-lg text-stone-800 tracking-widest uppercase mb-6">{t('product.leave_reflection')}</h4>
                      <AnimatePresence mode="wait">
                        {reviewSuccess ? (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                            <CheckCircle2 className="w-12 h-12 text-green-500" />
                            <p className="text-[10px] tracking-widest text-stone-600 uppercase font-bold">{t('product.reflection_curated')}</p>
                            <button onClick={() => setReviewSuccess(false)} className="text-[9px] text-gold uppercase tracking-widest border-b border-gold/30 pb-1">{t('product.write_another')}</button>
                          </motion.div>
                        ) : (
                          <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6" onSubmit={(e) => {
                            e.preventDefault();
                            if (!newReview.name || !newReview.comment) return;
                            const review: Review = { id: Date.now().toString(), ...newReview, date: 'Just now' };
                            setReviews([review, ...reviews]);
                            setNewReview({ name: '', rating: 5, comment: '' });
                            setReviewSuccess(true);
                          }}>
                            <div>
                              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">{t('product.rating')}</label>
                              <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button key={star} type="button" onClick={() => setNewReview({ ...newReview, rating: star })} className="transition-transform hover:scale-110">
                                    <Star className={cn("w-7 h-7", star <= newReview.rating ? "text-gold fill-gold" : "text-stone-200")} />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">{t('product.your_name')}</label>
                              <input type="text" value={newReview.name} onChange={(e) => setNewReview({ ...newReview, name: e.target.value })} className="w-full px-5 py-4 bg-ivory border border-stone-100 text-xs tracking-widest outline-none focus:border-gold transition-colors" placeholder={t('product.enter_name')} />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">{t('product.your_reflection')}</label>
                              <textarea rows={4} value={newReview.comment} onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })} className="w-full px-5 py-4 bg-ivory border border-stone-100 text-xs tracking-widest outline-none focus:border-gold transition-colors resize-none" placeholder={t('product.share_experience')}></textarea>
                            </div>
                            <button type="submit" className="w-full btn-luxury">{t('product.submit_review')}</button>
                          </motion.form>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="pt-16 border-t border-stone-100">
              <div className="flex flex-col items-center text-center mb-12">
                <h2 className="heading-editorial text-stone-400 text-sm mb-3">{t('product.complementary_picks')}</h2>
                <h3 className="font-heading text-3xl text-stone-800 tracking-wide">{t('product.curated_for_you')}</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </section>
          )}
        </div>

        {/* Mobile Sticky Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-ivory border-t border-stone-200 p-4 flex items-center gap-4 lg:hidden">
          <div className="flex-1 min-w-0">
            <p className="font-heading text-[11px] tracking-wider uppercase text-stone-800 truncate">{product.name}</p>
            <p className="font-heading text-sm text-gold">{formatPrice(isSale ? (product.salePrice || 0) : (isRent ? (product.rentalPrice || 0) : 0))}</p>
          </div>
          <button onClick={handleAddToCart} disabled={isAddingToCart} className="btn-luxury !py-3 !px-5 text-[10px] flex items-center gap-2 whitespace-nowrap">
            {isAddingToCart ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : <ShoppingBag className="w-3.5 h-3.5" />}
            {isRent ? t('product.book_rental') : t('product.add_to_collection')}
          </button>
          <button onClick={(e) => { e.preventDefault(); if (saved) { removeFromWishlist(product.id); } else { addToWishlist(product); } }} className={cn("w-10 h-10 flex items-center justify-center border transition-all shrink-0", saved ? "border-rose-200 text-rose-500 bg-rose-50" : "border-stone-200 text-stone-500")} aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}>
            <Heart className={cn("w-4 h-4", saved && "fill-current")} />
          </button>
        </div>

        {/* Reservation Confirmation Modal */}
        <AnimatePresence>
          {showConfirmation && bookingDate && (
            <BookingConfirmationModal product={product} date={bookingDate} onClose={() => setShowConfirmation(false)} />
          )}
        </AnimatePresence>
      </div>

      <SizeGuide isOpen={showSizeGuide} onClose={() => setShowSizeGuide(false)} />
    </>
  );
}

function BookingConfirmationModal({ product, date, onClose }: { product: Product, date: Date, onClose: () => void }) {
  useScrollLock(true);
  const { t } = useLanguage();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-stone-900/40 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-ivory max-w-lg w-full p-8 md:p-12 relative border border-stone-200 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <button onClick={onClose} className="sticky top-0 float-right p-2 text-stone-400 hover:text-stone-800 transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h3 className="font-heading text-3xl text-stone-800 mb-2 uppercase tracking-widest">{t('product.reservation_secured')}</h3>
          <div className="w-12 h-px bg-gold mx-auto my-4" />
          <p className="text-stone-400 text-[10px] tracking-widest uppercase mb-10">{t('product.atelier_moment_booked')}</p>

          <div className="bg-stone-50 p-6 mb-10 text-left space-y-4">
            <div className="flex justify-between items-center text-xs pb-4 border-b border-stone-100">
              <span className="text-stone-400 uppercase tracking-widest">{t('product.selection')}</span>
              <span className="font-bold text-stone-800">{product.name}</span>
            </div>
            <div className="flex justify-between items-center text-xs pb-4 border-b border-stone-100">
              <span className="text-stone-400 uppercase tracking-widest">{t('product.period_starts')}</span>
              <div className="flex items-center gap-2 font-bold text-stone-800">
                <Calendar className="w-3 h-3 text-gold" />
                {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>

          <div className="text-left space-y-6 mb-10">
            <div className="flex gap-3">
              <Info className="w-4 h-4 text-gold shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-stone-800 uppercase tracking-widest mb-1">{t('product.rental_policy')}</p>
                <p className="text-xs text-stone-500 leading-relaxed italic">{t('product.rental_policy_desc')}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <ShieldCheck className="w-4 h-4 text-gold shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-stone-800 uppercase tracking-widest mb-1">{t('product.security_deposit')}</p>
                <p className="text-xs text-stone-500 leading-relaxed italic">{t('product.security_deposit_desc')} {formatPrice(product.securityDeposit || 5000)} {t('product.will_be_held')}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={onClose} className="btn-luxury-outline w-full !py-4 text-[10px]">{t('product.continue_exploring')}</button>
            <Link to="/checkout" className="btn-luxury w-full !py-4 text-[10px] flex items-center justify-center gap-2">
              <ShoppingBag className="w-4 h-4" /> {t('product.go_to_checkout')}
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}