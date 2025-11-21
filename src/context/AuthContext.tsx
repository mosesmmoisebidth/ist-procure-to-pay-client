import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import type { Role } from '../types';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface LoginPayload {
  email: string;
  password: string;
  role: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'smart-p2p-auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { user: AuthUser; token: string };
      setUser(parsed.user);
      setToken(parsed.token);
    }
  }, []);

  const login = async ({ email, password, role }: LoginPayload) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    if (!email || !password) {
      setLoading(false);
      throw new Error('Email and password are required.');
    }
    const mockUser: AuthUser = {
      id: crypto.randomUUID(),
      name: email.split('@')[0] || 'User',
      email,
      role,
    };
    const mockToken = crypto.randomUUID();
    setUser(mockUser);
    setToken(mockToken);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: mockUser, token: mockToken }));
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, loading, login, logout }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
