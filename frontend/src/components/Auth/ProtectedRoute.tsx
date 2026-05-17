import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import type { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
}) => {
  const { isAuthenticated, hasRole } = useAuthStore();

  // Not logged in → send to /login (resolved to /staff/login by basename)
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Logged in but wrong role → back to home
  if (requiredRoles && !hasRole(requiredRoles)) return <Navigate to="/" replace />;

  return <>{children}</>;
};