/**
 * ActiveSessionsContext
 *
 * Provides shared state for active sessions across the application.
 * This ensures the Header badge and ActiveSessions page stay in sync.
 * Now powered by TanStack Query for optimistic updates and better cache management.
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useActiveSessionsQuery } from '../hooks/useActiveSessionsQuery';
import type { ActiveSession } from '../hooks/useActiveSessionsQuery';

interface ActiveSessionsContextType {
  sessions: ActiveSession[];
  loading: boolean;
  error: string | null;
  currentSessionId: string | null;
  logoutDevice: (sessionId: string) => Promise<void>;
  logoutAllOtherDevices: () => Promise<void>;
  refresh: () => Promise<unknown>;
  isLogoutDevicePending: boolean;
  isLogoutAllPending: boolean;
}

const ActiveSessionsContext = createContext<ActiveSessionsContextType | undefined>(undefined);

export function ActiveSessionsProvider({ children }: { children: ReactNode }) {
  const sessionsData = useActiveSessionsQuery();

  return (
    <ActiveSessionsContext.Provider value={sessionsData}>{children}</ActiveSessionsContext.Provider>
  );
}

export function useActiveSessions() {
  const context = useContext(ActiveSessionsContext);
  if (context === undefined) {
    throw new Error('useActiveSessions must be used within an ActiveSessionsProvider');
  }
  return context;
}

export type { ActiveSession };
