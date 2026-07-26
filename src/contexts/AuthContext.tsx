import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { getProfile } from '../services/auth';
import { hashPassword, generateToken } from '../lib/crypto';

// Simple constant‑time hash comparison (fallback to plain equality if timingSafeEqual unavailable)
async function compareHash(storedHash: string, password: string): Promise<boolean> {
  const inputHash = await hashPassword(password);
  // Ensure same length to avoid timing attacks early exit
  if (storedHash.length !== inputHash.length) return false;
  // Perform a bitwise comparison
  let diff = 0;
  for (let i = 0; i < storedHash.length; i++) {
    diff |= storedHash.charCodeAt(i) ^ inputHash.charCodeAt(i);
  }
  return diff === 0;
}

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

// Local fallback storage keys
const LOCAL_SESSION_KEY = 'riman_session';
const LOCAL_USERS_KEY = 'riman_users';
const LOCAL_ADMIN_KEY = 'riman_admin_hash';
const LOCAL_ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || '';
const LOCAL_ADMIN_DEFAULT_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || '';

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

function getAdminHash(): string | null {
  return localStorage.getItem(LOCAL_ADMIN_KEY);
}

function setAdminHash(hash: string) {
  localStorage.setItem(LOCAL_ADMIN_KEY, hash);
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      initLocalAuth();
    }, 5000);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        await loadSupabaseProfile(session.user.id, session.user.email || '');
      } else {
        // No session — prepare local auth as fallback
        initLocalAuth();
      }

      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          await loadSupabaseProfile(session.user.id, session.user.email || '');
        } else {
          setUser(null);
        }
      });
    } catch (err) {
      console.error('[Riman] Auth initialization failed:', err);
      // Always fall back to local auth when Supabase is unreachable
      initLocalAuth();
      return;
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

  // --- Local Auth Fallback ---
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

    // Initialize admin account on first run if env vars are set
    if (LOCAL_ADMIN_EMAIL && LOCAL_ADMIN_DEFAULT_PASSWORD && !getAdminHash()) {
      const password = LOCAL_ADMIN_DEFAULT_PASSWORD;
      const hash = await hashPassword(password);
      setAdminHash(hash);
      if (import.meta.env.DEV) {
        console.info(
          '%c[Riman] Local admin initialized from environment variables.',
          'color: #b8860b; font-weight: bold; font-size: 12px;'
        );
      }
    }

    setIsLoading(false);
  };

  const signIn = async (email: string, password: string) => {
    setError(null);

    if (!isSupabaseConfigured) {
      return localSignIn(email, password);
    }

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        // Fall back to local auth for any Supabase auth error (project paused, user not found, etc.)
        // This ensures the app remains usable even when Supabase is misconfigured
        return localSignIn(email, password);
      }
    } catch (err: any) {
      // Fall back to local auth if Supabase is unreachable (e.g. paused project)
      return localSignIn(email, password);
    }
  };

  const signUp = async (email: string, name: string, password: string) => {
    setError(null);

    if (!isSupabaseConfigured) {
      return localSignUp(email, name, password);
    }

    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (authError) {
        // Fall back to local auth for any Supabase sign-up error
        return localSignUp(email, name, password);
      }
    } catch (err: any) {
      // Fall back to local auth if Supabase is unreachable (e.g. paused project)
      return localSignUp(email, name, password);
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setError(null);
    localStorage.removeItem(LOCAL_SESSION_KEY);
  };

  // --- Local Auth Implementations ---
  const localSignIn = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();

    checkRateLimit(normalizedEmail);

    // Check admin account (hashed) — only if env vars configured
    if (LOCAL_ADMIN_EMAIL && normalizedEmail === LOCAL_ADMIN_EMAIL) {
      let adminHash = getAdminHash();
      // Initialize admin account on the fly if not yet set (safety net)
      if (!adminHash && LOCAL_ADMIN_DEFAULT_PASSWORD) {
        const hash = await hashPassword(LOCAL_ADMIN_DEFAULT_PASSWORD);
        setAdminHash(hash);
        adminHash = hash;
      }
      if (adminHash) {
        const isMatch = await compareHash(adminHash, password);
        if (isMatch) {
          const adminUser: User = { id: 'admin-local', name: 'Riman Admin', email: normalizedEmail, role: 'admin' };
          setUser(adminUser);
          localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(adminUser));
          return;
        }
      }
    }

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
    if (LOCAL_ADMIN_EMAIL && normalizedEmail === LOCAL_ADMIN_EMAIL) {
      setError('This email is reserved for the administrator.');
      throw new Error('Email reserved');
    }

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