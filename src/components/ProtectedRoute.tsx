import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

interface Props {
  children?: ReactNode;
}

export const ProtectedRoute = ({ children }: Props) => {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children ? <>{children}</> : <Outlet />;
};

interface RoleGuardProps {
  allowed: string[];
  children: ReactNode;
}

export const RoleGuard = ({ allowed, children }: RoleGuardProps) => {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === 'super_admin') return <>{children}</>;
  if (!allowed.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};
