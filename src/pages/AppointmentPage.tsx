import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User, Mail, Phone, MessageSquare, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createAppointment } from '../services/appointments';
import { useLanguage } from '../contexts/LanguageContext';

const SERVICE_TYPES = [
  { value: 'bridal', label: 'Bridal Consultation', icon: '👰' },
  { value: 'evening', label: 'Evening Wear Styling', icon: '👗' },
  { value: 'rental', label: 'Rental Fitting', icon: '✨' },
  { value: 'alterations', label: 'Bespoke Alterations', icon: '🪡' },
];

const TIME_SLOTS = [
  '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30',
  '2:00', '2:30', '3:00', '3:30',
  '4:00', '4:30', '5:00', '5:30',
  '6:00', '6:30', '7:00', '7:30',
  '8:00',
];

const SLOT_PERIOD: Record<string, 'AM' | 'PM'> = {
  '10:00': 'AM', '10:30': 'AM', '11:00': 'AM', '11:30': 'AM',
  '12:00': 'PM', '12:30': 'PM',
  '2:00': 'PM', '2:30': 'PM', '3:00': 'PM', '3:30': 'PM',
  '4:00': 'PM', '4:30': 'PM', '5:00': 'PM', '5:30': 'PM',
  '6:00': 'PM', '6:30': 'PM', '7:00': 'PM', '7:30': 'PM',
  '8:00': 'PM',
};

const formatSlot = (slot: string) => `${slot} ${SLOT_PERIOD[slot]}`;

export default function AppointmentPage() {
  const [step, setStep] = useState(1);
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    service_type: '',
    notes: '',
  });

  const updateForm = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const today = new Date().toISOString().split('T')[0];

  const validate = (): boolean => {
    if (!form.name.trim()) { setError(t('appointment.error_name')); return false; }
    if (!form.email.trim() || !form.email.includes('@')) { setError(t('appointment.error_email')); return false; }
    if (!form.phone.trim()) { setError(t('appointment.error_phone')); return false; }
    if (!form.service_type) { setError(t('appointment.error_service')); return false; }
    if (!form.date) { setError(t('appointment.error_date')); return false; }
    if (!form.time) { setError(t('appointment.error_time')); return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    setError('');

    try {
      await createAppointment({
        name: form.name,
        email: form.email,
        phone: form.phone,
        date: form.date,
        time: form.time,
        service_type: form.service_type,
        notes: form.notes,
      });
      setIsSubmitted(true);
    } catch (err) {
      console.error('[Riman] Appointment booking failed:', err);
      setError(t('appointment.something_wrong'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="pt-32 pb-20 min-h-screen bg-ivory flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-lg mx-auto px-6"
        >
          <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-10 h-10 text-gold" />
          </div>
          <h1 className="font-heading text-4xl text-stone-800 tracking-wider uppercase mb-4">{t('appointment.booked')}</h1>
          <div className="w-12 h-px bg-gold mx-auto mb-6" />
          <p className="font-body text-stone-500 leading-relaxed mb-2">
            {t('appointment.thank_you')}, <span className="text-stone-800 font-semibold">{form.name}</span>.
          </p>
          <p className="font-body text-stone-500 leading-relaxed mb-8">
            {t('appointment.appointment_booked_for')} <span className="text-stone-800 font-semibold">{new Date(form.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span> {t('appointment.at')} <span className="text-stone-800 font-semibold">{form.time}</span>.
          </p>
          <div className="w-12 h-px bg-gold mx-auto mb-6" />
          <p className="font-body text-sm text-stone-400 mb-10">{t('appointment.confirmation_sent')} {form.email}. {t('appointment.our_team_reach')}</p>
          <Link to="/collection/all" className="btn-luxury">{t('appointment.explore_collection')}</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-ivory">
      <div className="container mx-auto px-6 py-16 max-w-4xl">
        <nav className="flex gap-2 text-xs tracking-[0.2em] uppercase text-stone-400 mb-8">
          <Link to="/" className="hover:text-gold transition-colors">{t('nav.home')}</Link>
          <span>/</span>
          <span className="text-stone-800 font-medium">{t('cta.appointment')}</span>
        </nav>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="w-8 h-px bg-gold" />
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="w-8 h-px bg-gold" />
            </div>
            <h1 className="font-heading text-4xl md:text-5xl text-stone-800 tracking-wider uppercase mb-4">{t('appointment.heading')}</h1>
            <p className="font-body text-stone-500 max-w-xl mx-auto leading-relaxed">
              {t('appointment.desc')}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-12">
            {[1, 2, 3].map(s => (
              <button key={s} onClick={() => { if (s < step) setStep(s); }} className="flex items-center gap-3">
                <div className={step >= s ? "w-10 h-10 bg-gold text-white flex items-center justify-center text-xs font-bold transition-all" : "w-10 h-10 border border-stone-200 text-stone-400 flex items-center justify-center text-xs font-bold"}>
                  {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                </div>
                <span className={step >= s ? "text-xs tracking-widest uppercase font-bold text-stone-800 hidden md:block" : "text-xs tracking-widest uppercase text-stone-400 hidden md:block"}>
                  {s === 1 ? t('appointment.step_details') : s === 2 ? t('appointment.step_schedule') : t('appointment.step_confirm')}
                </span>
                {s < 3 && <div className={step > s ? "w-12 h-px bg-gold hidden md:block" : "w-12 h-px bg-stone-200 hidden md:block"} />}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-ivory p-8 md:p-12 border border-stone-100">
                <div className="mb-8">
                  <h2 className="font-heading text-xl text-stone-800 tracking-widest uppercase">{t('appointment.your_details')}</h2>
                  <div className="w-8 h-px bg-gold mt-3" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] tracking-[0.3em] uppercase text-stone-400 font-bold mb-2">{t('appointment.full_name')}</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                      <input type="text" value={form.name} onChange={e => updateForm('name', e.target.value)} placeholder="Your full name" className="w-full pl-11 pr-4 py-4 border border-stone-200 bg-ivory/50 text-stone-800 placeholder:text-stone-300 focus:outline-none focus:border-gold transition-colors text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-[0.3em] uppercase text-stone-400 font-bold mb-2">{t('appointment.email')}</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                      <input type="email" value={form.email} onChange={e => updateForm('email', e.target.value)} placeholder="your@email.com" className="w-full pl-11 pr-4 py-4 border border-stone-200 bg-ivory/50 text-stone-800 placeholder:text-stone-300 focus:outline-none focus:border-gold transition-colors text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-[0.3em] uppercase text-stone-400 font-bold mb-2">{t('appointment.phone')}</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                      <input type="tel" value={form.phone} onChange={e => updateForm('phone', e.target.value)} placeholder="+971 50 000 0000" className="w-full pl-11 pr-4 py-4 border border-stone-200 bg-ivory/50 text-stone-800 placeholder:text-stone-300 focus:outline-none focus:border-gold transition-colors text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-[0.3em] uppercase text-stone-400 font-bold mb-2">{t('appointment.service_type')}</label>
                    <select value={form.service_type} onChange={e => updateForm('service_type', e.target.value)} className="w-full px-4 py-4 border border-stone-200 bg-ivory/50 text-stone-800 focus:outline-none focus:border-gold transition-colors text-sm appearance-none">
                      <option value="">{t('appointment.select_service')}</option>
                      {SERVICE_TYPES.map(s => (
                        <option key={s.value} value={s.value}>{s.icon} {s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                <button onClick={() => { if (form.name && form.email && form.phone && form.service_type) { setError(''); setStep(2); } else setError(t('appointment.fill_all')); }} className="btn-luxury mt-8 w-full md:w-auto">{t('appointment.continue_scheduling')}</button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-ivory p-8 md:p-12 border border-stone-100">
                <div className="mb-8">
                  <h2 className="font-heading text-xl text-stone-800 tracking-widest uppercase">{t('appointment.choose_datetime')}</h2>
                  <div className="w-8 h-px bg-gold mt-3" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] tracking-[0.3em] uppercase text-stone-400 font-bold mb-4">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      {t('appointment.select_date')}
                    </label>
                    <input type="date" value={form.date} onChange={e => updateForm('date', e.target.value)} min={today} className="w-full px-4 py-4 border border-stone-200 bg-ivory/50 text-stone-800 focus:outline-none focus:border-gold transition-colors text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-[0.3em] uppercase text-stone-400 font-bold mb-4">
                      <Clock className="w-4 h-4 inline mr-2" />
                      {t('appointment.select_time')}
                    </label>
                    <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                      {TIME_SLOTS.map(slot => (
                        <button
                          key={slot}
                          onClick={() => updateForm('time', formatSlot(slot))}
                          className={form.time === formatSlot(slot)
                            ? "py-3 text-xs tracking-widest font-bold bg-gold text-white border border-gold transition-all"
                            : "py-3 text-xs tracking-widest border border-stone-200 text-stone-600 hover:border-gold hover:text-gold transition-all"}
                        >
                          {formatSlot(slot)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <label className="block text-[10px] tracking-[0.3em] uppercase text-stone-400 font-bold mb-2">
                    <MessageSquare className="w-4 h-4 inline mr-2" />
                    {t('appointment.special_requests')}
                  </label>
                  <textarea value={form.notes} onChange={e => updateForm('notes', e.target.value)} rows={3} placeholder={t('appointment.notes_placeholder')} className="w-full px-4 py-4 border border-stone-200 bg-ivory/50 text-stone-800 placeholder:text-stone-300 focus:outline-none focus:border-gold transition-colors text-sm" />
                </div>
                {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                <div className="flex gap-4 mt-8">
                  <button onClick={() => setStep(1)} className="btn-luxury-outline">{t('appointment.back')}</button>
                  <button onClick={() => { if (form.date && form.time) { setError(''); setStep(3); } else setError(t('appointment.select_date_time')); }} className="btn-luxury">{t('appointment.review_booking')}</button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-ivory p-8 md:p-12 border border-stone-100">
                <div className="mb-8">
                  <h2 className="font-heading text-xl text-stone-800 tracking-widest uppercase">{t('appointment.review_confirm')}</h2>
                  <div className="w-8 h-px bg-gold mt-3" />
                </div>
                <div className="bg-ivory p-8 border border-stone-100 mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-[10px] tracking-[0.3em] uppercase text-stone-400 font-bold mb-1">{t('appointment.name')}</p>
                      <p className="font-heading text-stone-800">{form.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] tracking-[0.3em] uppercase text-stone-400 font-bold mb-1">{t('appointment.email_label')}</p>
                      <p className="font-heading text-stone-800">{form.email}</p>
                    </div>
                    <div>
                      <p className="text-[10px] tracking-[0.3em] uppercase text-stone-400 font-bold mb-1">{t('appointment.phone_label')}</p>
                      <p className="font-heading text-stone-800">{form.phone}</p>
                    </div>
                    <div>
                      <p className="text-[10px] tracking-[0.3em] uppercase text-stone-400 font-bold mb-1">{t('appointment.service_label')}</p>
                      <p className="font-heading text-stone-800">{SERVICE_TYPES.find(s => s.value === form.service_type)?.label}</p>
                    </div>
                    <div>
                      <p className="text-[10px] tracking-[0.3em] uppercase text-stone-400 font-bold mb-1">{t('appointment.date_label')}</p>
                      <p className="font-heading text-stone-800">{form.date ? new Date(form.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}</p>
                    </div>
                    <div>
                      <p className="text-[10px] tracking-[0.3em] uppercase text-stone-400 font-bold mb-1">{t('appointment.time_label')}</p>
                      <p className="font-heading text-stone-800">{form.time}</p>
                    </div>
                  </div>
                  {form.notes && (
                    <div className="mt-6 pt-6 border-t border-stone-200">
                      <p className="text-[10px] tracking-[0.3em] uppercase text-stone-400 font-bold mb-1">{t('appointment.special_requests')}</p>
                      <p className="font-body text-stone-600 text-sm">{form.notes}</p>
                    </div>
                  )}
                </div>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <div className="flex gap-4">
                  <button onClick={() => setStep(2)} className="btn-luxury-outline">{t('appointment.back')}</button>
                  <button onClick={handleSubmit} disabled={isSubmitting} className="btn-luxury flex items-center justify-center gap-2 flex-1">
                    {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('appointment.confirming')}</> : t('appointment.confirm_booking')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-12 bg-onyx p-8 text-center">
            <p className="font-heading text-lg text-white tracking-widest uppercase mb-2">Riman Atelier</p>
            <p className="font-body text-stone-400 text-sm mb-4">Sharjah, UAE</p>
            <p className="font-body text-stone-400 text-sm">{t('appointment.atelier_hours')}</p>
            <a href="https://wa.me/971553730792" target="_blank" rel="noopener noreferrer" className="inline-block mt-6 text-gold text-xs tracking-widest uppercase hover:text-gold-light transition-colors font-bold">
              {t('appointment.whatsapp_help')}
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}