import { ReactNode, useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

// Set VITE_REQUIRE_ADMIN_MFA=true AFTER enrolling your authenticator app.
// Default (unset/false): shows a reminder banner but never blocks — zero lockout risk.
const ENFORCE = import.meta.env.VITE_REQUIRE_ADMIN_MFA === 'true';

type Stage = 'checking' | 'ok' | 'needed' | 'enrolling' | 'verifying' | 'error';

/**
 * Extra lock for /admin routes: requires a TOTP authenticator-app factor.
 * Non-blocking by default (reminder banner). Set VITE_REQUIRE_ADMIN_MFA=true
 * to enforce once the owner has enrolled.
 */
export default function AdminMfaGate({ children }: { children: ReactNode }) {
  const [stage, setStage] = useState<Stage>('checking');
  const [factorId, setFactorId] = useState<string | null>(null);
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setStage('ok');
      return;
    }
    (async () => {
      try {
        const { data, error } = await supabase.auth.mfa.listFactors();
        if (error) throw error;
        const verified = data?.totp?.find((f) => f.status === 'verified') ?? null;
        const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (verified && aal?.currentLevel === 'aal2') {
          setStage('ok');
        } else if (verified) {
          // Enrolled but this session isn't MFA-verified yet → verify below.
          setFactorId(verified.id);
          setStage('verifying');
        } else {
          setStage('needed');
        }
      } catch {
        // If MFA APIs are unavailable, fail open (never lock the owner out).
        setStage('ok');
      }
    })();
  }, []);

  const startEnroll = async () => {
    setError('');
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'Atelier owner' });
      if (error) throw error;
      setFactorId(data.id);
      setSecret(data.totp.secret);
      setStage('enrolling');
    } catch (e: any) {
      setError(e.message || 'Enrollment failed.');
      setStage('error');
    }
  };

  const confirmEnroll = async () => {
    if (!factorId || code.trim().length < 6) {
      setError('Enter the 6-digit code from your authenticator app.');
      return;
    }
    setError('');
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) throw challenge.error;
      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: code.trim(),
      });
      if (error) throw error;
      setStage('ok');
      setCode('');
      setSecret('');
    } catch (e: any) {
      setError(e.message || 'Verification failed. Try again.');
    }
  };

  const verifySession = async () => {
    if (!factorId || code.trim().length < 6) {
      setError('Enter the 6-digit code from your authenticator app.');
      return;
    }
    setError('');
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) throw challenge.error;
      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: code.trim(),
      });
      if (error) throw error;
      setStage('ok');
      setCode('');
    } catch (e: any) {
      setError(e.message || 'Verification failed. Try again.');
    }
  };

  if (stage === 'checking') {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  if (stage === 'ok') return <>{children}</>;

  // Soft mode: reminder banner, never blocks.
  if (stage === 'needed' && !ENFORCE) {
    return (
      <>
        <div className="bg-onyx text-bone px-6 py-3 flex items-center justify-center gap-3 text-center">
          <ShieldAlert className="w-4 h-4 text-gold shrink-0" />
          <p className="font-label text-xs tracking-[0.2em] uppercase">
            Owner tip: protect the atelier — enroll an authenticator app below, then set VITE_REQUIRE_ADMIN_MFA=true
          </p>
          <button
            onClick={startEnroll}
            className="font-label text-xs tracking-[0.2em] uppercase text-gold hover:text-gold-light underline underline-offset-4 shrink-0"
          >
            Enroll now
          </button>
        </div>
        {children}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-6 py-20">
      <div className="max-w-md w-full bg-ivory border border-stone-200 p-10 text-center">
        <ShieldCheck className="w-10 h-10 text-gold mx-auto mb-6" />
        <h1 className="font-heading text-2xl text-stone-800 uppercase tracking-widest mb-2">
          {stage === 'enrolling' ? 'Link authenticator' : 'Owner verification'}
        </h1>
        <div className="w-12 h-px bg-gold mx-auto mb-6" />
        {stage === 'needed' && (
          <>
            <p className="font-body text-stone-600 text-sm leading-relaxed mb-8">
              This area requires a second factor. Link Google Authenticator (or any TOTP app) once — it takes a minute.
            </p>
            <button onClick={startEnroll} className="btn-luxury w-full">Start enrollment</button>
          </>
        )}
        {stage === 'enrolling' && (
          <>
            <p className="font-body text-stone-600 text-sm leading-relaxed mb-4">
              In your authenticator app choose <strong>Enter a setup key</strong> and type:
            </p>
            <p className="font-mono text-sm bg-stone-100 border border-stone-200 px-4 py-3 mb-4 break-all select-all">{secret}</p>
            <p className="font-body text-stone-500 text-xs mb-6">Account: Atelier Riman (owner)</p>
            <CodeInput code={code} setCode={setCode} />
            {error && <p className="text-micro text-rose-500 uppercase tracking-widest mt-4">{error}</p>}
            <button onClick={confirmEnroll} className="btn-luxury w-full mt-6">Verify &amp; finish</button>
          </>
        )}
        {(stage === 'verifying' || stage === 'error') && (
          <>
            <p className="font-body text-stone-600 text-sm leading-relaxed mb-6">
              Enter the current 6-digit code from your authenticator app.
            </p>
            <CodeInput code={code} setCode={setCode} />
            {error && <p className="text-micro text-rose-500 uppercase tracking-widest mt-4">{error}</p>}
            <button onClick={verifySession} className="btn-luxury w-full mt-6">Verify</button>
          </>
        )}
      </div>
    </div>
  );
}

function CodeInput({ code, setCode }: { code: string; setCode: (v: string) => void }) {
  return (
    <input
      value={code}
      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
      inputMode="numeric"
      autoComplete="one-time-code"
      placeholder="000000"
      className="w-full text-center font-mono text-2xl tracking-[0.5em] bg-stone-50 border border-stone-200 px-4 py-4 outline-none focus:border-gold transition-colors"
    />
  );
}
