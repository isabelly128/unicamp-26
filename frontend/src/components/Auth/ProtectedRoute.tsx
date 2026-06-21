import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import type { UserRole } from '../../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
}) => {
  const { isAuthenticated, isSessionVerified, validateSession, hasRole } = useAuthStore();

  useEffect(() => {
    if (!isSessionVerified) {
      void validateSession();
    }
  }, [isSessionVerified, validateSession]);

  if (!isSessionVerified) return null;

  // Not logged in → send to /login (resolved to /staff/login by basename)
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Logged in but wrong role → back to home
  if (requiredRoles && !hasRole(requiredRoles)) return <Navigate to="/" replace />;

  return <>{children}</>;
};
