import { useState } from 'react';
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Mail, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import Logo from '../components/Logo';

export default function Auth() {
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const { signIn, signUp, error } = useAuth();
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || "/profile";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    
    if (!formData.email.trim()) {
      setLocalError('Please enter your email address.');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }
    if (!isLogin && !formData.name.trim()) {
      setLocalError('Please enter your name.');
      return;
    }

    try {
      if (isLogin) {
        await signIn(formData.email, formData.password);
      } else {
        await signUp(formData.email, formData.name, formData.password);
      }
      setSuccess(true);
      setTimeout(() => navigate(from, { replace: true }), 1500);
    } catch (err: any) {
      let message = err.message || 'An error occurred. Please try again.';
      if (message.includes('Failed to fetch') || message.includes('CONNECTION_ERROR')) {
        message = 'Connection Error: Unable to reach the security server. Using local authentication.';
      }
      setLocalError(message);
    }
  };

  const displayError = localError || error;

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen bg-ivory flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-ivory p-10 md:p-12 border border-stone-100 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="text-center mb-10 relative z-10 flex flex-col items-center">
          <Logo variant="gold" className="w-20 mb-6" />
          <h1 className="font-heading text-3xl text-stone-800 tracking-wider uppercase mb-3">
            {isLogin ? t('auth.signin') : t('auth.signup')}
          </h1>
          <div className="w-12 h-px bg-gold mb-3" />
          <p className="font-body text-stone-400 text-[10px] tracking-[0.2em] uppercase">
            {isLogin ? t('auth.welcome_back') : t('auth.join')}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10"
            >
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-heading text-xl text-stone-800 mb-2 uppercase tracking-widest">{t('auth.authenticated')}</h3>
              <div className="w-12 h-px bg-gold mx-auto mb-3" />
              <p className="text-stone-400 text-[10px] tracking-widest uppercase">{t('auth.redirecting')}</p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="space-y-6 relative z-10"
            >
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                    <User className="w-3 h-3 text-gold" /> {t('auth.full_name')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-stone-50 border-stone-100 p-4 text-xs tracking-widest outline-none focus:bg-ivory focus:border-gold transition-all"
                    placeholder={t('auth.name_placeholder')}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                  <Mail className="w-3 h-3 text-gold" /> {t('auth.email')}
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-stone-50 border-stone-100 p-4 text-xs tracking-widest outline-none focus:bg-ivory focus:border-gold transition-all"
                  placeholder={t('auth.email_placeholder')}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                  <Lock className="w-3 h-3 text-gold" /> {t('auth.password')}
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-stone-50 border-stone-100 p-4 text-xs tracking-widest outline-none focus:bg-ivory focus:border-gold transition-all"
                  placeholder={t('auth.password_placeholder')}
                />
              </div>

              {displayError && <p className="text-[10px] text-rose-500 uppercase tracking-widest text-center">{displayError}</p>}

              <button type="submit" className="w-full btn-luxury group flex items-center justify-center gap-3 !py-5">
                {isLogin ? t('auth.enter_atelier') : t('auth.create_profile')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="pt-6 border-t border-stone-100 text-center space-y-4">
                <button
                  type="button"
                  onClick={() => { setIsLogin(!isLogin); setLocalError(''); }}
                  className="text-[10px] text-stone-400 uppercase tracking-[0.2em] hover:text-gold transition-colors block w-full"
                >
                  {isLogin ? t('auth.no_account') : t('auth.has_account')}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    localStorage.clear();
                    sessionStorage.clear();
                    navigate('/auth', { replace: true });
                    window.location.reload();
                  }}
                  className="text-[8px] text-stone-300 uppercase tracking-[0.3em] hover:text-rose-400 transition-colors"
                >
                  {t('auth.clear_session')}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}