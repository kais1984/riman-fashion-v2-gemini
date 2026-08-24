import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { XCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function PaymentCancel() {
  const { t } = useLanguage();
  return (
    <div className="pt-40 pb-20 px-6 min-h-screen flex flex-col items-center justify-center text-center bg-ivory">
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center text-stone-400 mb-8 mx-auto">
          <XCircle className="w-12 h-12" />
        </div>
        <h1 className="font-heading text-4xl md:text-5xl text-stone-800 uppercase mb-4">{t('payment.cancel.title')}</h1>
        <p className="font-body text-stone-500 text-sm tracking-widest uppercase mb-8">{t('payment.cancel.body')}</p>
        <div className="flex gap-4 justify-center">
          <Link to="/checkout" className="btn-luxury px-8">{t('payment.cancel.return_checkout')}</Link>
          <Link to="/" className="btn-luxury-outline px-8">{t('payment.cancel.continue_browsing')}</Link>
        </div>
      </motion.div>
    </div>
  );
}
