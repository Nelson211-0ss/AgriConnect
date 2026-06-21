import { Navigate } from 'react-router-dom';
import { useAuth, Role } from '@/context/AuthContext';
import { homeRoute } from '@/lib/constants';

/** Redirects users without the required role to their home page */
export function RoleGuard({ allow, children }: { allow: Role[]; children: JSX.Element }) {
  const { user } = useAuth();
  if (!user || !allow.includes(user.role)) {
    return <Navigate to={homeRoute(user?.role)} replace />;
  }
  return children;
}

/** Sends /app to the correct home page for the logged-in role */
export function AppHome() {
  const { user } = useAuth();
  return <Navigate to={homeRoute(user?.role)} replace />;
}
