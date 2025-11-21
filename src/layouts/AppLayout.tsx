import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMemo } from 'react';

const navByRole = {
  staff: [
    { label: 'Dashboard', to: '/staff/dashboard' },
    { label: 'New Request', to: '/requests/new' },
  ],
  approver_lvl1: [
    { label: 'Approvals', to: '/approver/dashboard' },
  ],
  approver_lvl2: [
    { label: 'Approvals', to: '/approver/dashboard' },
  ],
  finance: [
    { label: 'Finance', to: '/finance/dashboard' },
  ],
  super_admin: [
    { label: 'Staff', to: '/staff/dashboard' },
    { label: 'Approvals', to: '/approver/dashboard' },
    { label: 'Finance', to: '/finance/dashboard' },
  ],
} as const;

const getNavItems = (role?: string) => {
  if (!role) return [];
  return navByRole[role as keyof typeof navByRole] ?? [];
};

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = useMemo(() => getNavItems(user?.role), [user?.role]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white px-6 py-8 lg:flex">
        <div className="flex items-center gap-3">
          <img src="/procure-to-pay.png" alt="Smart P2P" className="h-10 w-10 rounded-lg" />
          <div>
            <p className="text-lg font-semibold text-slate-900">Smart P2P</p>
            <p className="text-xs text-slate-500">Procure-to-Pay Platform</p>
          </div>
        </div>
        <nav className="mt-10 space-y-2">
          {items.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `block rounded-xl px-4 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm lg:px-8">
          <div className="flex items-center gap-3 lg:hidden">
            <img src="/procure-to-pay.png" alt="Smart P2P" className="h-8 w-8 rounded-lg" />
            <p className="text-base font-semibold text-slate-900">Smart P2P</p>
          </div>
          <div className="hidden text-sm font-semibold text-slate-700 lg:block">
            {items[0]?.label || 'Dashboard'}
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="text-right">
                <p className="text-sm font-medium text-slate-800">{user.name}</p>
                <p className="text-xs uppercase tracking-wide text-slate-400">{user.role.replace('_', ' ')}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
