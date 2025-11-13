/**
 * ActiveSessionsContext
 *
 * Provides shared state for active sessions across the application.
 * This ensures the Header badge and ActiveSessions page stay in sync.
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useActiveSessions as useActiveSessionsHook } from '../hooks/useActiveSessions';
import type { ActiveSession } from '../hooks/useActiveSessions';

interface ActiveSessionsContextType {
  sessions: ActiveSession[];
  loading: boolean;
  error: string | null;
  currentSessionId: string | null;
  logoutDevice: (sessionId: string) => Promise<void>;
  logoutAllOtherDevices: () => Promise<void>;
  refresh: () => Promise<void>;
}

const ActiveSessionsContext = createContext<ActiveSessionsContextType | undefined>(undefined);

export function ActiveSessionsProvider({ children }: { children: ReactNode }) {
  const sessionsData = useActiveSessionsHook();

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
