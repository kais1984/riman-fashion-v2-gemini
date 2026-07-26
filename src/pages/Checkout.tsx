import { useState, useCallback, type ReactNode } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { formatPrice } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, ArrowLeft, ArrowRight, Check, ChevronDown, ChevronUp, X, Truck, Calendar, MessageSquare, CreditCard, Building2, Lock, RotateCcw, MessageCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { createOrder } from '../services/orders';
import { isSupabaseConfigured } from '../services/supabase';
import { createCheckoutSession, isStripeConfigured } from '../services/payment';
import { z } from 'zod';

const checkoutSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.string().trim().email(),
  phone: z.string().trim().min(7),
  address: z.string().trim().min(1),
  city: z.string().trim().min(1),
  country: z.string(),
});

const WHATSAPP_NUMBER = '971553730792';

export default function Checkout() {
  const { items, subtotal, clearCart, removeItem } = useCart();
  const { user } = useAuth();
  const { t, isRtl } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'atelier' | 'card'>('atelier');
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    address: '',
    city: '',
    country: 'United Arab Emirates',
    phone: '',
  });

  const validateField = useCallback((name: string, value: string) => {
    const data = { ...formData, [name]: value };
    const result = checkoutSchema.safeParse(data);
    if (!result.success) {
      const fieldError = result.error.issues.find(i => i.path[0] === name);
      if (fieldError) {
        const key = `checkout.val_${name === 'firstName' ? 'name' : name}`;
        const msg = t(key);
        return msg !== key ? msg : t('checkout.required');
      }
    }
    return '';
  }, [formData, t]);

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    if (currentStep === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = t('checkout.val_name');
      if (!formData.lastName.trim()) newErrors.lastName = t('checkout.val_name');
      if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t('checkout.val_email');
      if (!formData.phone.trim() || formData.phone.trim().length < 7) newErrors.phone = t('checkout.val_phone');
    } else if (currentStep === 2) {
      if (!formData.address.trim()) newErrors.address = t('checkout.val_address');
      if (!formData.city.trim()) newErrors.city = t('checkout.val_city');
    }
    setErrors(newErrors);
    setTouched(Object.keys(newErrors).reduce((acc, k) => ({ ...acc, [k]: true }), {}));
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name as keyof typeof formData]);
    setErrors(prev => {
      const next = { ...prev };
      if (error) next[name] = error;
      else delete next[name];
      return next;
    });
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
      setMobileSummaryOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const prevStep = () => {
    setStep(prev => prev - 1);
    setMobileSummaryOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [submitError, setSubmitError] = useState<string | null>(null);

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    setSubmitError(null);
    try {
      const orderItems = items.map(item => ({
        product_id: item.id,
        product_name: item.name,
        product_type: item.productType,
        size: item.selectedSize,
        quantity: item.quantity,
        unit_price: item.rentalPrice || item.salePrice || 0,
        rental_start_date: item.selectedDate ? new Date(item.selectedDate).toISOString().split('T')[0] : undefined,
        rental_end_date: item.selectedDate
          ? new Date(new Date(item.selectedDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : undefined,
        security_deposit: item.securityDeposit,
      }));

      const orderType = items.some(i => i.productType === 'rent' || i.productType === 'both')
        ? (items.some(i => i.productType === 'sale') ? 'mixed' : 'rental')
        : 'sale';

      if (paymentMethod === 'card' && isStripeConfigured()) {
        const url = await createCheckoutSession({
          items: items.map(i => ({
            name: i.name,
            price: i.intent === 'rent' ? (i.rentalPrice || 0) : (i.salePrice || 0),
            quantity: i.quantity,
            productType: i.productType,
          })),
          subtotal,
          orderType,
          successUrl: `${window.location.origin}/payment/success`,
          cancelUrl: `${window.location.origin}/payment/cancel`,
          customerName: `${formData.firstName} ${formData.lastName}`,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          customerAddress: formData.address,
          customerCity: formData.city,
          customerCountry: formData.country,
          notes: orderNotes,
        });

        if (url) {
          clearCart();
          window.location.href = url;
          return;
        }
      }

      if (isSupabaseConfigured) {
        await createOrder({
          status: 'pending',
          type: orderType,
          subtotal,
          notes: orderNotes,
          customer_name: `${formData.firstName} ${formData.lastName}`,
          customer_email: formData.email,
          customer_phone: formData.phone,
          customer_address: formData.address,
          customer_city: formData.city,
          customer_country: formData.country,
        }, orderItems);
      } else {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      setOrderComplete(true);
      clearCart();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="pt-8 pb-20 px-6 min-h-[60vh] flex flex-col items-center justify-center text-center bg-ivory">
        <h1 className="font-heading text-4xl text-stone-800 uppercase mb-4">{t('checkout.empty')}</h1>
        <div className="w-12 h-px bg-gold mx-auto mb-6" />
        <p className="font-body text-stone-500 text-sm tracking-widest uppercase mb-12 italic">{t('checkout.empty_desc')}</p>
        <Link to="/search" className="btn-luxury px-12">{t('checkout.explore')}</Link>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="pt-8 pb-20 px-6 min-h-screen flex flex-col items-center justify-center text-center bg-ivory">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center text-gold mb-8"
        >
          <Check className="w-12 h-12" />
        </motion.div>
        <h1 className="font-heading text-4xl md:text-6xl text-stone-800 uppercase mb-4">{t('checkout.order_received')}</h1>
        <div className="w-12 h-px bg-gold mx-auto mb-6" />
        <p className="font-body text-stone-500 text-sm tracking-widest uppercase mb-4">{t('checkout.order_preparing')}</p>
        <p className="font-body text-stone-400 text-xs mb-4 uppercase italic">{t('checkout.confirmation_email')} {formData.email}</p>
        <p className="font-body text-stone-400 text-xs mb-12 uppercase tracking-widest max-w-md">{t('checkout.contact_24h')}</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/profile" className="btn-luxury px-12 italic">{t('checkout.view_dashboard')}</Link>
          <Link to="/search" className="btn-luxury-outline px-12">{t('checkout.back_to_shop')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ivory min-h-screen">
      {/* Minimal top bar (replaces header on checkout) */}
      <div className="sticky top-0 z-40 bg-ivory/95 backdrop-blur-sm border-b border-stone-100">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <Link to="/search" className="flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors">
            <ArrowLeft className={cn("w-4 h-4", isRtl && "rotate-180")} />
            <span className="text-[10px] tracking-[0.2em] uppercase font-bold hidden sm:inline">{t('checkout.back_to_shop')}</span>
          </Link>
          <Link to="/" className="font-heading text-sm tracking-[0.3em] uppercase text-stone-800">Atelier Riman</Link>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Trust signals */}
        <div className="flex items-center justify-center gap-6 md:gap-10 mb-8 md:mb-12 flex-wrap">
          <TrustBadge icon={<Lock className="w-3.5 h-3.5" />} label={t('checkout.secure_payment')} />
          <TrustBadge icon={<RotateCcw className="w-3.5 h-3.5" />} label={t('checkout.returns_policy')} />
          <TrustBadge icon={<MessageCircle className="w-3.5 h-3.5" />} label={t('checkout.whatsapp_support')} />
        </div>

        {/* Progress Stepper */}
        <div className="mb-10 md:mb-14">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            {[1, 2, 3].map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <StepStep
                  num={s}
                  label={s === 1 ? t('checkout.step_identity') : s === 2 ? t('checkout.step_logistics') : t('checkout.step_confirm')}
                  active={step >= s}
                  completed={step > s}
                  isRtl={isRtl}
                />
                {i < 2 && (
                  <div className="flex-1 mx-3 h-px bg-stone-200 relative">
                    <div
                      className={cn("absolute inset-y-0 left-0 bg-gold transition-all duration-500", step > s && "right-0")}
                      style={{ width: step > s ? '100%' : step === s + 1 ? '50%' : '0%' }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main form area */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="bg-ivory p-6 md:p-10 border border-stone-100">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isRtl ? -20 : 20 }}
                    className="space-y-8"
                  >
                    <SectionHeading title={t('checkout.personal_details')} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                      <Input
                        label={t('checkout.first_name')}
                        value={formData.firstName}
                        onChange={(v: string) => setFormData({...formData, firstName: v})}
                        onBlur={() => handleBlur('firstName')}
                        error={touched.firstName ? errors.firstName : undefined}
                        autoComplete="given-name"
                      />
                      <Input
                        label={t('checkout.last_name')}
                        value={formData.lastName}
                        onChange={(v: string) => setFormData({...formData, lastName: v})}
                        onBlur={() => handleBlur('lastName')}
                        error={touched.lastName ? errors.lastName : undefined}
                        autoComplete="family-name"
                      />
                      <Input
                        label={t('checkout.email')}
                        value={formData.email}
                        onChange={(v: string) => setFormData({...formData, email: v})}
                        onBlur={() => handleBlur('email')}
                        error={touched.email ? errors.email : undefined}
                        type="email"
                        className="md:col-span-2"
                        autoComplete="email"
                      />
                      <Input
                        label={t('checkout.phone')}
                        value={formData.phone}
                        onChange={(v: string) => setFormData({...formData, phone: v})}
                        onBlur={() => handleBlur('phone')}
                        error={touched.phone ? errors.phone : undefined}
                        type="tel"
                        className="md:col-span-2"
                        autoComplete="tel"
                      />
                    </div>
                    <button onClick={nextStep} className="w-full btn-luxury !py-5 mt-4 flex items-center justify-center gap-3 group">
                      {t('checkout.continue_logistics')}
                      <ArrowRight className={cn("w-4 h-4 group-hover:translate-x-1 transition-transform", isRtl && "rotate-180 group-hover:-translate-x-1")} />
                    </button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isRtl ? -20 : 20 }}
                    className="space-y-8"
                  >
                    <SectionHeading title={t('checkout.delivery_info')} />
                    <div className="grid grid-cols-1 gap-5">
                      <Input
                        label={t('checkout.address')}
                        value={formData.address}
                        onChange={(v: string) => setFormData({...formData, address: v})}
                        onBlur={() => handleBlur('address')}
                        error={touched.address ? errors.address : undefined}
                        autoComplete="address-line1"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Input
                          label={t('checkout.city')}
                          value={formData.city}
                          onChange={(v: string) => setFormData({...formData, city: v})}
                          onBlur={() => handleBlur('city')}
                          error={touched.city ? errors.city : undefined}
                          autoComplete="address-level2"
                        />
                        <Input
                          label={t('checkout.country')}
                          value={formData.country}
                          onChange={(v: string) => setFormData({...formData, country: v})}
                          disabled
                          autoComplete="country-name"
                        />
                      </div>
                    </div>
                    <div className="flex gap-4 mt-4">
                      <button onClick={prevStep} className="flex-1 btn-luxury-outline py-5 flex items-center justify-center gap-3">
                        <ArrowLeft className={cn("w-4 h-4", isRtl && "rotate-180")} /> {t('checkout.previous')}
                      </button>
                      <button onClick={nextStep} className="flex-[2] btn-luxury py-5 flex items-center justify-center gap-3 group">
                        {t('checkout.review_order')} <ArrowRight className={cn("w-4 h-4 group-hover:translate-x-1 transition-transform", isRtl && "rotate-180 group-hover:-translate-x-1")} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isRtl ? -20 : 20 }}
                    className="space-y-8"
                  >
                    <SectionHeading title={t('checkout.review')} />

                    {/* Details summary */}
                    <div className="bg-ivory/50 p-5 border border-gold/10 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-heading text-xs tracking-[0.2em] uppercase text-stone-600">{t('checkout.your_details')}</h3>
                        <button onClick={() => setStep(1)} className="text-[10px] tracking-widest uppercase text-gold font-bold hover:text-gold-dark transition-colors">
                          {t('checkout.previous')}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-[11px] tracking-wider uppercase">
                        <div>
                          <span className="text-stone-400 block mb-0.5">Name</span>
                          <span className="text-stone-800 font-medium">{formData.firstName} {formData.lastName}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 block mb-0.5">{t('checkout.email')}</span>
                          <span className="text-stone-800 font-medium">{formData.email}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 block mb-0.5">{t('checkout.address')}</span>
                          <span className="text-stone-800 font-medium">{formData.address}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 block mb-0.5">{t('checkout.city')}</span>
                          <span className="text-stone-800 font-medium">{formData.city}, {formData.country}</span>
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-3">
                      <h3 className="font-heading text-xs tracking-[0.2em] uppercase text-stone-600">{t('checkout.your_selections')}</h3>
                      {items.map((item) => (
                        <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4 items-center p-3 border border-stone-100">
                          <div className="w-14 h-18 bg-stone-100 flex-shrink-0 overflow-hidden">
                            <img src={item.images?.[0]} className="w-full h-full object-cover" alt={item.name} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-stone-400 uppercase tracking-widest">{item.category}</p>
                            <p className="text-xs uppercase tracking-wider font-bold truncate">{item.name}</p>
                            {item.selectedSize && <p className="text-[9px] text-stone-400 uppercase">{t('checkout.size')}: {item.selectedSize}</p>}
                            {item.selectedDate && <p className="text-[9px] text-gold uppercase">{t('checkout.date')}: {new Date(item.selectedDate).toLocaleDateString()}</p>}
                          </div>
                          <p className="text-xs text-gold font-medium">{formatPrice((item.rentalPrice || item.salePrice || 0) * item.quantity)}</p>
                        </div>
                      ))}
                    </div>

                    {/* Pricing (visible on mobile, hidden on desktop where sidebar shows it) */}
                    <div className="lg:hidden space-y-2 pt-4 border-t border-stone-100">
                      <div className="flex justify-between text-[10px] tracking-widest uppercase text-stone-400">
                        <span>{t('checkout.subtotal')}</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-[10px] tracking-widest uppercase text-stone-400">
                        <span>{t('checkout.delivery')}</span>
                        <span>{t('checkout.complimentary')}</span>
                      </div>
                      <div className="flex justify-between font-heading text-xl pt-4 border-t border-stone-100 mt-4">
                        <span className="uppercase text-sm tracking-widest pt-1">{t('checkout.total')}</span>
                        <span className="text-gold">{formatPrice(subtotal)}</span>
                      </div>
                    </div>

                    {/* Order notes */}
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold flex items-center gap-2">
                        <MessageSquare className="w-3 h-3 text-gold" /> {t('checkout.order_notes')}
                      </label>
                      <textarea
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        rows={3}
                        className="w-full bg-stone-50 border border-stone-100 p-4 text-xs tracking-widest outline-none focus:border-gold transition-all resize-none"
                        placeholder={t('checkout.notes_placeholder')}
                      />
                    </div>

                    {/* Payment method */}
                    <div className="space-y-4">
                      <h3 className="font-heading text-xs tracking-[0.2em] uppercase text-stone-600">{t('checkout.payment_method')}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('atelier')}
                          className={cn(
                            "flex items-center gap-4 p-4 border text-left transition-all",
                            paymentMethod === 'atelier'
                              ? "bg-gold/5 border-gold/30 text-stone-800"
                              : "bg-ivory border-stone-100 text-stone-400 hover:border-stone-300"
                          )}
                        >
                          <Building2 className={cn("w-5 h-5 shrink-0", paymentMethod === 'atelier' ? 'text-gold' : 'text-stone-300')} />
                          <div>
                            <p className="text-[10px] tracking-widest uppercase font-bold">{t('checkout.pay_atelier')}</p>
                            <p className="text-[9px] text-stone-400 mt-0.5 tracking-wide">{t('checkout.pay_atelier_desc')}</p>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('card')}
                          className={cn(
                            "flex items-center gap-4 p-4 border text-left transition-all",
                            paymentMethod === 'card'
                              ? "bg-gold/5 border-gold/30 text-stone-800"
                              : "bg-ivory border-stone-100 text-stone-400 hover:border-stone-300"
                          )}
                        >
                          <CreditCard className={cn("w-5 h-5 shrink-0", paymentMethod === 'card' ? 'text-gold' : 'text-stone-300')} />
                          <div>
                            <p className="text-[10px] tracking-widest uppercase font-bold">{t('checkout.pay_online')}</p>
                            <p className="text-[9px] text-stone-400 mt-0.5 tracking-wide">{t('checkout.pay_online_desc')}</p>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Payment info box */}
                    <div className={cn("p-4 border flex items-start gap-3", paymentMethod === 'card' ? 'bg-emerald-50/50 border-emerald-200/50' : 'bg-gold/5 border-gold/10')}>
                      {paymentMethod === 'card' ? <CreditCard className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" /> : <Truck className="w-5 h-5 text-gold shrink-0 mt-0.5" />}
                      <div>
                        <p className="text-[10px] tracking-widest text-stone-600 uppercase font-bold">
                          {paymentMethod === 'card' ? t('checkout.secure_online') : t('checkout.instore_payment')}
                        </p>
                        <p className="text-[10px] text-stone-400 mt-1">
                          {paymentMethod === 'card'
                            ? t('checkout.secure_online_desc')
                            : t('checkout.instore_desc')}
                        </p>
                      </div>
                    </div>

                    {/* WhatsApp help */}
                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 py-3 border border-stone-200 text-[10px] tracking-[0.2em] uppercase text-stone-500 font-bold hover:border-gold/30 hover:text-gold transition-all"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      {t('checkout.whatsapp_support')}
                    </a>

                    {/* Actions */}
                    <div className="flex gap-4">
                      <button onClick={prevStep} className="flex-1 btn-luxury-outline py-5 flex items-center justify-center gap-3">
                        <ArrowLeft className={cn("w-4 h-4", isRtl && "rotate-180")} /> {t('checkout.previous')}
                      </button>
                      <button
                        onClick={handlePlaceOrder}
                        disabled={isProcessing}
                        className="flex-[2] btn-luxury py-5 flex items-center justify-center gap-3 group relative"
                      >
                        {isProcessing ? (
                          <div className="w-5 h-5 border-2 border-ivory border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>{t('checkout.confirm_order')} <ShieldCheck className="w-4 h-4" /></>
                        )}
                      </button>
                    </div>
                    {submitError && (
                      <div className="p-4 border border-rose-200 bg-rose-50/50 text-center">
                        <p className="text-rose-600 text-[10px] tracking-widest uppercase font-bold mb-2">{submitError}</p>
                        <a
                          href={`https://wa.me/${WHATSAPP_NUMBER}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] tracking-widest uppercase text-gold font-bold hover:text-gold-dark transition-colors"
                        >
                          {t('checkout.whatsapp_support')} &rarr;
                        </a>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar (desktop) / Mobile summary bar */}
          <div className="lg:col-span-5 order-1 lg:order-2">
            {/* Mobile: collapsible summary */}
            <div className="lg:hidden mb-6">
              <button
                onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}
                className="w-full bg-onyx text-white p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-1 h-5 bg-gold" />
                  <span className="text-[10px] tracking-[0.2em] uppercase font-bold">
                    {t('checkout.order_summary')}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    ({t('checkout.items_count').replace('{count}', String(items.length))})
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gold text-sm font-heading">{formatPrice(subtotal)}</span>
                  {mobileSummaryOpen ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                </div>
              </button>
              <AnimatePresence>
                {mobileSummaryOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-onyx"
                  >
                    <div className="p-4 space-y-4 border-t border-stone-800">
                      {items.map((item) => (
                        <div key={`${item.id}-${item.selectedSize}`} className="flex gap-3 items-center">
                          <div className="w-12 h-16 bg-stone-800 flex-shrink-0 overflow-hidden">
                            <img src={item.images?.[0]} className="w-full h-full object-cover grayscale-[0.3]" alt={item.name} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[9px] text-stone-500 uppercase tracking-widest">{item.category}</p>
                            <p className="text-[11px] uppercase tracking-wider font-bold truncate text-white">{item.name}</p>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {item.selectedSize && <span className="text-[9px] border border-stone-700 px-1.5 py-0.5 text-stone-400">{item.selectedSize}</span>}
                              {item.selectedDate && <span className="text-[9px] border border-gold/30 px-1.5 py-0.5 text-gold">{new Date(item.selectedDate).toLocaleDateString()}</span>}
                            </div>
                          </div>
                          <p className="text-[11px] text-gold font-medium">{formatPrice((item.rentalPrice || item.salePrice || 0) * item.quantity)}</p>
                        </div>
                      ))}
                      <div className="space-y-2 pt-3 border-t border-stone-800">
                        <div className="flex justify-between text-[9px] tracking-widest uppercase text-stone-400">
                          <span>{t('checkout.subtotal')}</span>
                          <span>{formatPrice(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-[9px] tracking-widest uppercase text-stone-400">
                          <span>{t('checkout.delivery')}</span>
                          <span>{t('checkout.complimentary')}</span>
                        </div>
                        <div className="flex justify-between font-heading text-lg pt-3 border-t border-stone-800">
                          <span className="uppercase text-xs tracking-widest">{t('checkout.total')}</span>
                          <span className="text-gold">{formatPrice(subtotal)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop: sticky sidebar */}
            <div className="hidden lg:block lg:sticky lg:top-20 h-fit">
              <OrderSidebar
                items={items}
                subtotal={subtotal}
                paymentMethod={paymentMethod}
                removeItem={removeItem}
                t={t}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function StepStep({ num, label, active, completed, isRtl }: { num: number; label: string; active: boolean; completed: boolean; isRtl: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={cn(
        "w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs transition-all duration-300 font-bold shrink-0",
        completed ? "bg-gold border-gold text-white" : active ? "bg-gold/10 border-gold text-gold" : "border-stone-200 text-stone-300"
      )}>
        {completed ? <Check className="w-4 h-4" /> : num}
      </div>
      <span className={cn(
        "text-[10px] tracking-[0.15em] uppercase font-bold transition-colors hidden sm:inline",
        active ? "text-stone-800" : "text-stone-300"
      )}>{label}</span>
    </div>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="border-b border-stone-50 pb-4">
      <h2 className="font-heading text-xl md:text-2xl tracking-widest uppercase text-stone-800">{title}</h2>
      <div className="w-8 h-px bg-gold mt-3" />
    </div>
  );
}

function TrustBadge({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-stone-400">
      <div className="text-gold">{icon}</div>
      <span className="text-[9px] tracking-[0.2em] uppercase font-bold">{label}</span>
    </div>
  );
}

function OrderSidebar({ items, subtotal, paymentMethod, removeItem, t }: {
  items: any[];
  subtotal: number;
  paymentMethod: string;
  removeItem: (id: string, size?: string, intent?: string) => void;
  t: (key: string) => string;
}) {
  return (
    <div className="bg-onyx text-white p-6 border border-stone-800">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-800">
        <div className="w-1 h-6 bg-gold" />
        <h3 className="font-heading text-base tracking-[0.2em] uppercase">{t('checkout.bag_summary')}</h3>
      </div>
      <div className="space-y-6 mb-8 max-h-[35vh] overflow-y-auto pr-2 no-scrollbar">
        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <motion.div
              key={`${item.id}-${item.selectedSize}`}
              layout
              exit={{ opacity: 0, x: 20 }}
              className="flex gap-3 group relative items-center"
            >
              <div className="w-14 h-18 bg-stone-800 flex-shrink-0 overflow-hidden">
                <img src={item.images?.[0]} className="w-full h-full object-cover grayscale-[0.3]" alt={item.name} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] text-stone-500 uppercase tracking-widest mb-0.5">{item.category}</p>
                <h4 className="text-[11px] uppercase tracking-wider font-bold mb-1 truncate">{item.name}</h4>
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {item.selectedSize && <span className="text-[9px] border border-stone-700 px-1.5 py-0.5 text-stone-400">{t('checkout.size')}: {item.selectedSize}</span>}
                  {item.selectedDate && <span className="text-[9px] border border-gold/30 px-1.5 py-0.5 text-gold"><Calendar className="w-2 h-2 inline mr-0.5" />{new Date(item.selectedDate).toLocaleDateString()}</span>}
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[11px] text-gold font-medium">{formatPrice((item.rentalPrice || item.salePrice || 0) * item.quantity)}</p>
                  {item.quantity > 1 && <span className="text-[9px] text-stone-500">{t('checkout.qty')}: {item.quantity}</span>}
                </div>
              </div>
              <button
                onClick={() => removeItem(item.id, item.selectedSize, item.intent)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-stone-800 text-stone-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-all"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="space-y-3 border-t border-stone-800 pt-6">
        <div className="flex justify-between text-[10px] tracking-widest uppercase text-stone-400">
          <span>{t('checkout.subtotal')}</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-[10px] tracking-widest uppercase text-stone-400">
          <span>{t('checkout.delivery')}</span>
          <span>{t('checkout.complimentary')}</span>
        </div>
        <div className="flex justify-between text-[10px] tracking-widest uppercase text-stone-400">
          <span>{t('checkout.vat')}</span>
          <span>{t('checkout.included')}</span>
        </div>
        <div className="flex justify-between font-heading text-lg pt-4 border-t border-stone-800 mt-3">
          <span className="uppercase text-xs tracking-widest">{t('checkout.total')}</span>
          <span className="text-gold">{formatPrice(subtotal)}</span>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-3 p-3 border border-white/5 bg-white/5">
        <ShieldCheck className="w-4 h-4 text-gold shrink-0" />
        <p className="text-[9px] tracking-widest leading-relaxed text-stone-400 uppercase">
          {paymentMethod === 'card' ? 'Secured by Stripe' : 'Secure Order — Payment at Atelier'}
        </p>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, onBlur, placeholder, className, disabled, type = "text", error, autoComplete }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  type?: string;
  error?: string;
  autoComplete?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex justify-between items-center">
        <label className="text-[11px] tracking-widest uppercase font-bold text-stone-400 block">{label}</label>
        {error && <span className="text-[9px] text-rose-500 uppercase tracking-widest font-bold">{error}</span>}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        className={cn(
          "w-full bg-ivory border p-4 text-sm tracking-wide outline-none focus:border-gold transition-all disabled:opacity-50 font-medium min-h-[48px]",
          error ? "border-rose-300" : "border-stone-200"
        )}
      />
    </div>
  );
}
