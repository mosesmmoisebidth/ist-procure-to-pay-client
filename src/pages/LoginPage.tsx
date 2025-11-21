import { FormEvent, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';

const roleOptions: { label: string; value: Role }[] = [
  { label: 'Staff', value: 'staff' },
  { label: 'Approver Level 1', value: 'approver_lvl1' },
  { label: 'Approver Level 2', value: 'approver_lvl2' },
  { label: 'Finance', value: 'finance' },
];

export const LoginPage = () => {
  const { login, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '', role: 'staff' as Role });
  const [error, setError] = useState<string | null>(null);
  const [touchedEmail, setTouchedEmail] = useState(false);

  useMemo(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const emailInvalid = touchedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

  const handleSubmit = async (evt: FormEvent) => {
    evt.preventDefault();
    if (emailInvalid) return;
    setError(null);
    try {
      await login(form);
      const redirect: Record<Role, string> = {
        staff: '/staff/dashboard',
        approver_lvl1: '/approver/dashboard',
        approver_lvl2: '/approver/dashboard',
        finance: '/finance/dashboard',
        super_admin: '/staff/dashboard',
      };
      const destination =
        (location.state as { from?: Location })?.from?.pathname ?? redirect[form.role];
      navigate(destination, { replace: true });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 px-4 text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md rounded-3xl bg-white/95 p-8 text-slate-900 shadow-2xl"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <img src="/procure-to-pay.png" alt="Smart P2P" className="mb-3 h-14 w-14" />
          <h1 className="text-2xl font-semibold text-slate-900">Welcome to Smart P2P</h1>
          <p className="text-sm text-slate-500">
            Modern procure-to-pay automation for enterprise teams.
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
            {emailInvalid && <p className="mt-1 text-xs text-rose-500">Enter a valid email.</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="••••••••"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Quick role selection</label>
            <select
              value={form.role}
              onChange={e => setForm(prev => ({ ...prev, role: e.target.value as Role }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 focus:border-blue-500 focus:outline-none"
            >
              {roleOptions.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">
              Sandbox helper. Actual role enforcement occurs on the backend.
            </p>
          </div>
          {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading || emailInvalid}
            className="mt-2 w-full rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </motion.button>
        </form>
      </motion.div>
      <p className="mt-8 text-xs text-slate-200">© 2025 IST Africa · Internal Demo</p>
    </div>
  );
};
