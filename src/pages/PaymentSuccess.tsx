import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { verifyCheckoutSession } from '../services/payment';
import { sendOrderConfirmationEmail } from '../lib/email';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [email, setEmail] = useState('');
  const { clearCart } = useCart();
  const { t } = useLanguage();

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return;
    }
    verifyCheckoutSession(sessionId).then(result => {
      if (result?.paid) {
        setStatus('success');
        setEmail(result.customerEmail || '');
        // Send confirmation email with available info
        if (result.orderId && result.customerEmail) {
          sendOrderConfirmationEmail({
            orderId: result.orderId,
            customerName: 'Customer',
            customerEmail: result.customerEmail,
            items: [],
            subtotal: 0,
            shipping: 0,
            tax: 0,
            total: 0,
            shippingAddress: { name: '', line1: '', city: '', state: '', postalCode: '', country: '' },
            paymentMethod: 'Card (Stripe)',
            createdAt: new Date().toISOString(),
          }).catch(err => console.error('Order confirmation email failed:', err));
        }
      } else {
        setStatus('error');
      }
    });
  }, [sessionId]);

  // Clear cart after successful verification (once)
  useEffect(() => {
    if (status === 'success') {
      clearCart();
    }
  }, [status, clearCart]);

  return (
    <div className="pt-40 pb-20 px-6 min-h-screen flex flex-col items-center justify-center text-center bg-ivory">
      {status === 'verifying' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Loader2 className="w-12 h-12 text-gold animate-spin mx-auto mb-8" />
          <h1 className="font-heading text-3xl text-stone-800 uppercase mb-4">{t('payment.verifying')}</h1>
          <p className="font-body text-stone-400 text-xs tracking-widest uppercase">{t('payment.please_wait')}</p>
        </motion.div>
      )}

      {status === 'success' && (
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-8 mx-auto">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="font-heading text-4xl md:text-6xl text-stone-800 uppercase mb-4">{t('payment.success_title')}</h1>
          <p className="font-body text-stone-500 text-sm tracking-widest uppercase mb-4">{t('payment.success_sub')}</p>
          {email && <p className="font-body text-stone-400 text-xs mb-4 uppercase italic">{t('payment.sent_to')} {email}</p>}
          <p className="font-body text-stone-400 text-xs mb-12 uppercase tracking-widest max-w-md mx-auto">{t('payment.success_body')}</p>
          <Link to="/profile" className="btn-luxury px-12 italic">{t('payment.dashboard')}</Link>
        </motion.div>
      )}

      {status === 'error' && (
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-8 mx-auto">
            <XCircle className="w-12 h-12" />
          </div>
          <h1 className="font-heading text-3xl text-stone-800 uppercase mb-4">{t('payment.error_title')}</h1>
          <p className="font-body text-stone-500 text-sm tracking-widest uppercase mb-8">{t('payment.error_body')}</p>
          <div className="flex gap-4 justify-center">
            <Link to="/contact" className="btn-luxury-outline px-8">{t('payment.contact')}</Link>
            <Link to="/" className="btn-luxury px-8">{t('payment.home')}</Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}