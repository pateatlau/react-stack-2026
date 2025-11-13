/**
 * Session Context Provider
 * Provides shared session state throughout the app
 * Prevents duplicate session polling from multiple components
 */

import React, { createContext, useContext } from 'react';
import { useSession as useSessionHook } from '../hooks/useSession';
import { useAuth } from '../hooks/useAuth';

interface SessionContextType {
  timeRemainingMs: number | null;
  timeRemainingMinutes: number | null;
  isExpired: boolean;
  lastActivityAt: Date | null;
  isChecking: boolean;
  error: string | null;
  checkSession: () => Promise<void>;
  formatTimeRemaining: (ms: number) => string;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: React.ReactNode;
  pollInterval?: number;
  warningThreshold?: number;
  onSessionExpired?: () => void;
  onSessionWarning?: (timeRemainingMs: number) => void;
}

export function SessionProvider({
  children,
  pollInterval = 30000,
  warningThreshold = 60000,
  onSessionExpired,
  onSessionWarning,
}: SessionProviderProps) {
  const { isAuthenticated } = useAuth();

  const sessionData = useSessionHook({
    enabled: isAuthenticated, // Only poll when authenticated
    pollInterval,
    warningThreshold,
    onSessionExpired,
    onSessionWarning,
  });

  return <SessionContext.Provider value={sessionData}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
}
