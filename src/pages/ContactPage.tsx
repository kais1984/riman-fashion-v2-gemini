import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ChevronRight, MapPin, Phone, Mail, Clock, Gem } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';
import { submitContactForm } from '../services/contact';
import { isSupabaseConfigured } from '../services/supabase';
import { useToast } from '../contexts/ToastContext';

export default function ContactPage() {
  const { t } = useLanguage();
  const bookingSchema = z.object({
    name: z.string().min(2, t('contact.val_name')),
    email: z.string().email(t('contact.val_email')),
    phone: z.string().min(10, t('contact.val_phone')),
    type: z.enum(['Bridal Consultation', 'Evening Wear Inquiry', 'Rental Booking', 'Bespoke Alterations']),
    message: z.string().min(10, t('contact.val_details'))
  });

  type BookingFormValues = z.infer<typeof bookingSchema>;
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { addToast } = useToast();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema)
  });

  const onSubmit = async (data: BookingFormValues) => {
    try {
      if (isSupabaseConfigured) {
        await submitContactForm({
          name: data.name,
          email: data.email,
          phone: data.phone,
          inquiry_type: data.type,
          message: data.message,
        });
      } else {
        await new Promise(resolve => setTimeout(resolve, 1500));
        addToast({ type: 'info', title: t('contact.toast_demo_title'), message: t('contact.toast_demo_msg') });
      }
    } catch {
      addToast({ type: 'info', title: t('contact.toast_demo_title'), message: t('contact.toast_demo_msg') });
    }
    addToast({ type: 'success', title: t('contact.toast_sent_title'), message: t('contact.toast_sent_msg') });
    setIsSubmitted(true);
  };

  const handleReset = () => {
    reset();
    setIsSubmitted(false);
  };

  return (
    <div className="pt-24 min-h-screen bg-ivory">
      <header className="section-padding !py-20 text-center bg-ivory border-b border-stone-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-heading text-5xl md:text-6xl text-stone-800 tracking-widest uppercase mb-4">{t('nav.contact')}</h1>
          <p className="font-body text-stone-500 text-sm tracking-[0.2em] uppercase">{t('footer.consultation')}</p>
        </motion.div>
      </header>

      <section className="section-padding container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div className="space-y-12">
            <div>
              <h2 className="font-heading text-3xl mb-8 tracking-wide">{t('footer.atelier_location')}</h2>
              <p className="font-body text-stone-600 mb-10 leading-relaxed text-lg italic">
                {t('contact.narrative')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <ContactInfoItem 
                icon={<MapPin className="w-5 h-5" />}
                title={t('contact.location')}
                content={t('contact.location_addr')}
              />
              <ContactInfoItem 
                icon={<Phone className="w-5 h-5" />}
                title={t('contact.contact_details')}
                content={t('contact.phone_email')}
              />
              <ContactInfoItem 
                icon={<Clock className="w-5 h-5" />}
                title={t('contact.hours')}
                content={t('contact.hours_detail')}
              />
              <div className="bg-stone-50 p-6 border border-stone-100 flex flex-col justify-center">
                <p className="font-body text-[10px] text-stone-400 uppercase tracking-widest mb-2 italic">{t('contact.special_note')}</p>
                <p className="font-body text-xs text-stone-600 leading-relaxed">{t('contact.special_note_desc')}</p>
              </div>
            </div>
          </div>

          <div className="bg-ivory p-8 md:p-12 relative overflow-hidden ring-1 ring-stone-100">
            <AnimatePresence mode="wait">
              <motion.div
                key="form-container"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="font-heading text-3xl mb-8 tracking-wide">{t('contact.request_consultation')}</h2>
                  <form className="space-y-6 relative z-10" onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{t('form.name')}</label>
                        <input 
                          {...register('name')}
                          disabled={isSubmitted}
                          className={cn(
                            "bg-stone-50 border border-stone-100 focus:bg-ivory focus:border-gold outline-none p-4 text-sm transition-all",
                            errors.name && "border-red-300",
                            isSubmitted && "opacity-50 cursor-not-allowed"
                          )} 
                          placeholder="Sarah Al-Maktoum" 
                        />
                        {errors.name && <span className="text-red-500 text-[10px] tracking-widest uppercase">{errors.name.message}</span>}
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{t('form.email')}</label>
                        <input 
                          {...register('email')}
                          type="email" 
                          disabled={isSubmitted}
                          className={cn(
                            "bg-stone-50 border border-stone-100 focus:bg-ivory focus:border-gold outline-none p-4 text-sm transition-all",
                            errors.email && "border-red-300",
                            isSubmitted && "opacity-50 cursor-not-allowed"
                          )}
                          placeholder="sarah@example.com" 
                        />
                        {errors.email && <span className="text-red-500 text-[10px] tracking-widest uppercase">{errors.email.message}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{t('nav.contact')}</label>
                      <input 
                        {...register('phone')}
                        type="tel" 
                        disabled={isSubmitted}
                        className={cn(
                          "bg-stone-50 border border-stone-100 focus:bg-ivory focus:border-gold outline-none p-4 text-sm transition-all",
                          errors.phone && "border-red-300",
                          isSubmitted && "opacity-50 cursor-not-allowed"
                        )}
                        placeholder="+971 -- --- ----" 
                      />
                      {errors.phone && <span className="text-red-500 text-[10px] tracking-widest uppercase">{errors.phone.message}</span>}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{t('contact.inquiry_type')}</label>
                      <div className="relative">
                        <select 
                          {...register('type')}
                          disabled={isSubmitted}
                          className={cn(
                            "w-full bg-stone-50 border border-stone-100 focus:bg-ivory focus:border-gold outline-none p-4 text-sm transition-all appearance-none cursor-pointer",
                            isSubmitted && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <option value="Bridal Consultation">{t('contact.bridal_consultation')}</option>
                          <option value="Evening Wear Inquiry">{t('contact.evening_inquiry')}</option>
                          <option value="Rental Booking">{t('contact.rental_booking')}</option>
                          <option value="Bespoke Alterations">{t('contact.bespoke_alterations')}</option>
                        </select>
                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 rotate-90 text-stone-400 pointer-events-none" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{t('contact.vision_prefs')}</label>
                      <textarea 
                        {...register('message')}
                        rows={4} 
                        disabled={isSubmitted}
                        className={cn(
                          "bg-stone-50 border border-stone-100 focus:bg-ivory focus:border-gold outline-none p-4 text-sm transition-all resize-none",
                          errors.message && "border-red-300",
                          isSubmitted && "opacity-50 cursor-not-allowed"
                        )}
                        placeholder={t('contact.vision_placeholder')}
                      ></textarea>
                      {errors.message && <span className="text-red-500 text-[10px] tracking-widest uppercase">{errors.message.message}</span>}
                    </div>

                    <div className="pt-4">
                      <AnimatePresence mode="wait">
                        {!isSubmitted ? (
                          <motion.button 
                            key="submit-btn"
                            type="submit" 
                            disabled={isSubmitting}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full btn-luxury !py-5 flex items-center justify-center gap-3 disabled:opacity-50"
                          >
                            {isSubmitting ? (
                              <motion.div 
                                animate={{ rotate: 360 }} 
                                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                              />
                            ) : t('form.submit')}
                          </motion.button>
                        ) : (
                          <motion.div 
                            key="success-message"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                          >
                            <div className="flex items-center justify-center gap-2 text-gold py-2">
                              <CheckCircle2 className="w-5 h-5" />
                              <span className="font-body text-[10px] font-bold tracking-[0.3em] uppercase">{t('contact.success_title')}</span>
                            </div>
                            <button 
                              type="button"
                              onClick={handleReset}
                              className="w-full btn-luxury !py-5 flex items-center justify-center gap-3 bg-stone-800"
                            >
                              {t('contact.write_another')}
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </form>
              </motion.div>
            </AnimatePresence>
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-stone-100/30 blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
          </div>
        </div>
      </section>
      
      {/* Interactive Map */}
      <section className="h-[600px] w-full bg-stone-100 overflow-hidden relative">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7214.288236104!2d55.38575003254167!3d25.35104278456108!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f5951d52dfd37%3A0xc3f98292812af29!2sAl%20Zahra%20St%20-%20Sharjah!5e0!3m2!1sen!2sae!4v1713904620000!5m2!1sen!2sae" 
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen={true}
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
          className="grayscale hover:grayscale-0 transition-all duration-1000 contrast-[1.1] brightness-[0.95]"
          title="Riman Fashion Boutique Location"
        />
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.15)] border-y border-stone-200/50" />
      </section>
    </div>
  );
}

function ContactInfoItem({ icon, title, content }: { icon: React.ReactNode, title: string, content: React.ReactNode }) {
  return (
    <div className="flex gap-6 group">
      <div className="w-12 h-12 bg-ivory border border-stone-100 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-all duration-500 rounded-sm shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="font-body text-[10px] tracking-[0.3em] uppercase text-stone-400 mb-2 font-bold">{title}</h4>
        <div className="font-body text-sm text-stone-800 leading-relaxed italic">
          {content}
        </div>
      </div>
    </div>
  );
}
