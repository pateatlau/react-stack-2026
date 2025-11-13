/**
 * useAuth Hook
 * Convenient hook for accessing auth functionality
 */

import { useAuthStore } from '../stores/useAuthStore';
import type { Role } from '../types/auth.types';

export function useAuth() {
  const {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    refreshToken,
    fetchUser,
    clearError,
  } = useAuthStore();

  // Helper: Check if user has specific role
  const hasRole = (role: Role): boolean => {
    return user?.role === role;
  };

  // Helper: Check if user is PRO
  const isPro = (): boolean => {
    return user?.role === 'PRO';
  };

  // Helper: Check if user is STARTER
  const isStarter = (): boolean => {
    return user?.role === 'STARTER';
  };

  // Helper: Check if user has any of the specified roles
  const hasAnyRole = (roles: Role[]): boolean => {
    return !!user && roles.includes(user.role);
  };

  return {
    // State
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    login,
    signup,
    logout,
    refreshToken,
    fetchUser,
    clearError,

    // Helpers
    hasRole,
    isPro,
    isStarter,
    hasAnyRole,
  };
}
