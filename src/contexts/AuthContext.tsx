import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { getProfile } from '../services/auth';
import { hashPassword } from '../lib/crypto';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, name: string, password: string) => Promise<void>;
  error: string | null;
}

// Local fallback storage keys (client-only, never admin)
const LOCAL_SESSION_KEY = 'riman_session';
const LOCAL_USERS_KEY = 'riman_users';

// Rate limiting
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const loginAttempts = new Map<string, { count: number; firstAttempt: number }>();

function checkRateLimit(email: string): void {
  const now = Date.now();
  const record = loginAttempts.get(email);
  if (record) {
    if (now - record.firstAttempt > RATE_LIMIT_WINDOW) {
      loginAttempts.delete(email);
    } else if (record.count >= RATE_LIMIT_MAX_ATTEMPTS) {
      const retryAfter = Math.ceil((RATE_LIMIT_WINDOW - (now - record.firstAttempt)) / 1000 / 60);
      throw new Error(`Too many attempts. Try again in ${retryAfter} minute(s).`);
    }
  }
}

function recordAttempt(email: string): void {
  const now = Date.now();
  const record = loginAttempts.get(email);
  if (record && now - record.firstAttempt < RATE_LIMIT_WINDOW) {
    record.count++;
  } else {
    loginAttempts.set(email, { count: 1, firstAttempt: now });
  }
}

function getLocalUsers(): Record<string, { name: string; passwordHash: string }> {
  try {
    const data = localStorage.getItem(LOCAL_USERS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveLocalUsers(users: Record<string, { name: string; passwordHash: string }>) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const signingOutRef = useRef(false);

  useEffect(() => {
    if (isSupabaseConfigured) {
      initSupabaseAuth();
    } else {
      initLocalAuth();
    }
  }, []);

  // --- Supabase Auth ---
  const initSupabaseAuth = async () => {
    // Safety timeout to ensure app doesn't hang forever
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        await loadSupabaseProfile(session.user.id, session.user.email || '');
      }

      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (signingOutRef.current) return;
        if (session?.user) {
          await loadSupabaseProfile(session.user.id, session.user.email || '');
        } else {
          setUser(null);
        }
      });
    } catch (err) {
      console.error('[Riman] Auth initialization failed:', err);
    } finally {
      clearTimeout(timeout);
      setIsLoading(false);
    }
  };

  const loadSupabaseProfile = async (userId: string, email: string) => {
    try {
      let profile = await getProfile(userId);
      if (!profile) {
        // Retry once after a delay in case the profile trigger is still running
        await new Promise(r => setTimeout(r, 1500));
        profile = await getProfile(userId);
      }
      
      if (profile) {
        setUser({ id: profile.id, name: profile.name, email: profile.email, role: profile.role });
      } else {
        // Fallback for missing profile
        setUser({ id: userId, name: email.split('@')[0], email, role: 'client' });
      }
    } catch (err) {
      console.error('[Riman] Failed to load profile:', err);
      // Fallback user object if profile fetch fails but session exists
      setUser({ id: userId, name: email.split('@')[0], email, role: 'client' });
    }
  };

  // --- Local Auth Fallback (client-only, no admin) ---
  const initLocalAuth = async () => {
    try {
      const saved = localStorage.getItem(LOCAL_SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) setUser(parsed);
      }
    } catch {
      localStorage.removeItem(LOCAL_SESSION_KEY);
    }

    setIsLoading(false);
  };

  const signIn = async (email: string, password: string) => {
    setError(null);

    if (!isSupabaseConfigured) {
      return localSignIn(email, password);
    }

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      throw new Error(authError.message);
    }
  };

  const signUp = async (email: string, name: string, password: string) => {
    setError(null);

    if (!isSupabaseConfigured) {
      return localSignUp(email, name, password);
    }

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (authError) {
      setError(authError.message);
      throw new Error(authError.message);
    }
  };

  const signOut = async () => {
    signingOutRef.current = true;
    setUser(null);
    setError(null);
    localStorage.removeItem(LOCAL_SESSION_KEY);
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch {
      // Sign out locally even if Supabase call fails
    }
    signingOutRef.current = false;
  };

  // --- Local Auth Implementations (client-only, never admin) ---
  const localSignIn = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();

    checkRateLimit(normalizedEmail);

    // Check regular users (hashed)
    const users = getLocalUsers();
    const stored = users[normalizedEmail];
    if (!stored) {
      recordAttempt(normalizedEmail);
      setError('No account found with this email.');
      throw new Error('Account not found');
    }

    const pwHash = await hashPassword(password);
    if (stored.passwordHash !== pwHash) {
      recordAttempt(normalizedEmail);
      setError('Incorrect password.');
      throw new Error('Invalid password');
    }

    const localUser: User = { id: normalizedEmail, name: stored.name, email: normalizedEmail, role: 'client' };
    setUser(localUser);
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(localUser));
  };

  const localSignUp = async (email: string, name: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();

    const users = getLocalUsers();
    if (users[normalizedEmail]) {
      setError('An account with this email already exists.');
      throw new Error('Email already registered');
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      throw new Error('Password too short');
    }

    const passwordHash = await hashPassword(password);
    users[normalizedEmail] = { name: name.trim(), passwordHash };
    saveLocalUsers(users);
    const localUser: User = { id: normalizedEmail, name: name.trim(), email: normalizedEmail, role: 'client' };
    setUser(localUser);
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(localUser));
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut, signUp, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}