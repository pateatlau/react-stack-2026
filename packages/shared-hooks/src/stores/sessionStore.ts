import { create } from 'zustand';

export interface Session {
  id: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  isCurrent: boolean;
  lastActivity: string;
  createdAt: string;
}

export interface SessionState {
  sessions: Session[];
  isLoading: boolean;
  error: string | null;

  setSessions: (sessions: Session[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessions: [],
  isLoading: false,
  error: null,

  setSessions: (sessions) => set({ sessions }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
