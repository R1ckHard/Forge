import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import { ApiError } from '../api/client';
import * as authApi from '../api/auth/authApi';
import type { User } from '../api/auth/types';
import { isPremiumActive } from '../api/auth/types';
import { delay, DEMO_DELAY_MS } from '../utils/delay';

const TOKEN_KEY = 'forge_auth_token';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  bootstrapping: boolean;
  isPremium: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Mock checkout → premium for 1 hour */
  markSubscribed: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeUser(raw: User): User {
  return {
    id: raw.id,
    email: raw.email,
    premium: !!raw.premium,
    premiumUntil: raw.premiumUntil ?? null,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(TOKEN_KEY);
        if (!stored) return;
        const me = await authApi.fetchMe(stored);
        if (!cancelled) {
          setToken(stored);
          setUser(normalizeUser(me));
        }
      } catch {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistSession = useCallback(
    async (nextToken: string, nextUser: User) => {
      await SecureStore.setItemAsync(TOKEN_KEY, nextToken);
      setToken(nextToken);
      setUser(normalizeUser(nextUser));
    },
    [],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await authApi.login({ email, password });
      await persistSession(data.token, data.user);
    },
    [persistSession],
  );

  const register = useCallback(
    async (email: string, password: string) => {
      const data = await authApi.register({ email, password });
      await persistSession(data.token, data.user);
    },
    [persistSession],
  );

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const markSubscribed = useCallback(async () => {
    if (!token) return;
    await delay(DEMO_DELAY_MS);
    const data = await authApi.subscribeDemo(token);
    setUser(normalizeUser(data));
  }, [token]);

  const isPremium = isPremiumActive(user);

  const value = useMemo(
    () => ({
      user,
      token,
      bootstrapping,
      isPremium,
      login,
      register,
      logout,
      markSubscribed,
    }),
    [
      user,
      token,
      bootstrapping,
      isPremium,
      login,
      register,
      logout,
      markSubscribed,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function getErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
}
