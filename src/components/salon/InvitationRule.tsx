import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface InvitationRuleProps {
  className?: string;
}

export default function InvitationRule({ className }: InvitationRuleProps) {
  const { t } = useLanguage();
  return (
    <div className={`flex flex-col items-center gap-4 py-16 text-center ${className ?? ''}`}>
      <span className="h-px w-24 bg-gold/40" aria-hidden="true" />
      <p className="font-editorial italic text-lg text-stone-600">{t('invitation.line')}</p>
      <Link
        to="/appointment"
        className="group inline-flex items-center gap-2 font-label text-xs tracking-[0.25em] uppercase text-stone-800 transition-colors duration-700 hover:text-gold"
      >
        {t('invitation.cta')}
        <ArrowRight className="w-4 h-4 transition-transform duration-700 group-hover:translate-x-1 rtl:rotate-180" />
      </Link>
    </div>
  );
}
