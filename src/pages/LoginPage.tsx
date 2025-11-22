import { FormEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Location } from 'react-router-dom';
import { motion } from 'framer-motion';
import { isAxiosError } from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import type { Role } from '../types';

const redirectByRole: Record<Role, string> = {
  staff: '/staff/dashboard',
  approver_lvl1: '/approver/dashboard',
  approver_lvl2: '/approver/dashboard',
  finance: '/finance/dashboard',
  super_admin: '/staff/dashboard',
};

export const LoginPage = () => {
  const { login, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [touchedEmail, setTouchedEmail] = useState(false);

  useEffect(() => {
    if (!user) return;
    const destination = redirectByRole[user.role] ?? '/';
    navigate(destination, { replace: true });
  }, [user, navigate]);

  const emailInvalid = touchedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

  const handleSubmit = async (evt: FormEvent) => {
    evt.preventDefault();
    if (emailInvalid) return;
    setError(null);
    try {
      const authenticated = await login(form);
      const destination =
        (location.state as { from?: Location })?.from?.pathname ??
        redirectByRole[authenticated.role] ??
        '/';
      toast.success(`Welcome back, ${authenticated.fullName || authenticated.username}`);
      navigate(destination, { replace: true });
    } catch (err) {
      if (isAxiosError(err) && err.response?.data) {
        const data = err.response.data as Record<string, any>;
        const backendError =
          data?.non_field_errors?.[0] || data?.detail || data?.email || data?.password;
        setError(backendError || 'Invalid email or password.');
      } else {
        setError('Unable to sign in. Please try again.');
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 px-4 text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-md rounded-3xl bg-white/95 p-8 text-slate-900 shadow-2xl"
      >
        {loading && (
          <div className="pointer-events-none absolute inset-0 rounded-3xl bg-white/70 backdrop-blur-sm" />
        )}
        <div className="relative">
          <div className="mb-6 flex flex-col items-center text-center">
            <img src="/procure-to-pay.png" alt="Smart P2P" className="mb-3 h-14 w-14" />
            <h1 className="text-2xl font-semibold text-slate-900">Welcome to Smart P2P</h1>
            <p className="text-sm text-slate-500">
              Sign in with your enterprise credentials to continue.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                onBlur={() => setTouchedEmail(true)}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="you@company.com"
                required
              />
              {emailInvalid && (
                <p className="mt-1 text-xs text-rose-500">Enter a valid email address.</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="********"
                required
              />
            </div>
            {error && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
            )}
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading || emailInvalid}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {loading ? 'Signing in...' : 'Sign In'}
            </motion.button>
          </form>
        </div>
      </motion.div>
      <p className="mt-8 text-xs text-slate-200">Copyright 2025 IST Africa - Internal Demo</p>
    </div>
  );
};
