/**
 * PublicRoute Component
 * Redirects to home if user is already authenticated
 * Used for login/signup pages
 */

import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function PublicRoute({ children, redirectTo = '/' }: PublicRouteProps) {
  const { isAuthenticated } = useAuth();

  // Already authenticated - redirect to home or specified path
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Not authenticated - render children (login/signup page)
  return <>{children}</>;
}
