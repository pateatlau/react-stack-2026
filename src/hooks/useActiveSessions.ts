/**
 * useActiveSessions Hook
 *
 * Manages active sessions for the current user.
 * Provides functionality to fetch sessions and logout specific devices.
 *
 * Features:
 * - Fetch all active sessions for current user
 * - Logout a specific device/session
 * - Logout all other devices (keep current session)
 * - Auto-refresh sessions after logout operations
 * - Loading and error states
 */

import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { getSocket } from '../lib/websocket';
import { apiClient } from '../lib/api/client';

// Session interface matching backend response
export interface ActiveSession {
  id: string;
  userId: string;
  sessionToken: string;
  deviceInfo: {
    browser?: string;
    os?: string;
    device?: string;
    userAgent?: string;
  };
  ipAddress?: string;
  createdAt: string;
  lastActivity: string;
  expiresAt: string;
}

interface UseActiveSessionsReturn {
  sessions: ActiveSession[];
  loading: boolean;
  error: string | null;
  currentSessionId: string | null;
  logoutDevice: (sessionId: string) => Promise<void>;
  logoutAllOtherDevices: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useActiveSessions(): UseActiveSessionsReturn {
  const { accessToken, isAuthenticated, logout } = useAuthStore();
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Current session ID is the access token itself
  const currentSessionId = accessToken;

  // Fetch active sessions
  const fetchSessions = useCallback(async () => {
    if (!isAuthenticated || !accessToken) {
      setSessions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get('/api/auth/sessions');

      if (response.data.success && response.data.data) {
        // Backend returns data.data.sessions (nested structure)
        const sessionsArray = Array.isArray(response.data.data.sessions)
          ? response.data.data.sessions
          : Array.isArray(response.data.data)
            ? response.data.data
            : [];
        setSessions(sessionsArray);
      } else {
        throw new Error(response.data.message || 'Failed to fetch sessions');
      }
    } catch (err: unknown) {
      console.error('[useActiveSessions] Error fetching sessions:', err);

      // Check if it's a 401 error indicating session expiration
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as {
          response?: { status?: number; data?: { code?: string; message?: string } };
        };

        if (error.response?.status === 401) {
          const errorCode = error.response?.data?.code;

          // If session expired, logout the user
          if (errorCode === 'SESSION_EXPIRED') {
            await logout();
            // Don't set error state since we're logging out
            return;
          }

          // For other 401 errors, also logout as the token is invalid
          await logout();
          return;
        }
      }

      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sessions';
      setError(errorMessage);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken, isAuthenticated, logout]);

  // Logout a specific device
  const logoutDevice = useCallback(
    async (sessionId: string) => {
      if (!isAuthenticated || !accessToken) {
        throw new Error('Not authenticated');
      }

      setError(null);

      // OPTIMISTIC UPDATE: Remove session from list immediately
      const previousSessions = sessions;
      setSessions((prev) => prev.filter((session) => session.id !== sessionId));

      try {
        // First, emit WebSocket event for immediate logout
        const socket = getSocket();
        if (socket && socket.connected) {
          socket.emit('logout-device', { sessionId });
        }

        // Then call API to delete the session using apiClient
        const response = await apiClient.delete(`/api/auth/sessions/${sessionId}`);

        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to logout device');
        }

        // Refresh sessions list to ensure accuracy (will sync from server)
        await fetchSessions();
      } catch (err: unknown) {
        // ROLLBACK: Restore previous sessions on error
        setSessions(previousSessions);

        // Check if it's a 401 error
        if (err && typeof err === 'object' && 'response' in err) {
          const error = err as { response?: { status?: number; data?: { code?: string } } };

          if (error.response?.status === 401) {
            await logout();
          }
        }

        const errorMessage = err instanceof Error ? err.message : 'Failed to logout device';
        setError(errorMessage);
        throw err;
      }
    },
    [accessToken, isAuthenticated, sessions, fetchSessions, logout]
  );

  // Logout all other devices (keep current session)
  const logoutAllOtherDevices = useCallback(async () => {
    if (!isAuthenticated || !accessToken) {
      throw new Error('Not authenticated');
    }

    setError(null);

    // OPTIMISTIC UPDATE: Keep only current session in list
    const previousSessions = sessions;
    setSessions((prev) => prev.filter((session) => session.sessionToken === accessToken));

    try {
      // Call API to delete all other sessions using apiClient
      // The backend will handle WebSocket broadcast with excludeSessionToken
      const response = await apiClient.delete('/api/auth/sessions/all');

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to logout all devices');
      }

      // Refresh sessions list to ensure accuracy (will sync from server)
      await fetchSessions();
    } catch (err: unknown) {
      // ROLLBACK: Restore previous sessions on error
      setSessions(previousSessions);

      // Check if it's a 401 error
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as { response?: { status?: number; data?: { code?: string } } };

        if (error.response?.status === 401) {
          console.log('[useActiveSessions] 401 during logout all, logging out user');
          await logout();
          return;
        }
      }

      const errorMessage = err instanceof Error ? err.message : 'Failed to logout all devices';
      setError(errorMessage);
      throw err;
    }
  }, [accessToken, isAuthenticated, sessions, fetchSessions, logout]);

  // Auto-fetch on mount and when authentication status changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchSessions();
    }
  }, [fetchSessions, isAuthenticated]);

  // Polling fallback - refresh sessions every 30 seconds as safety net
  // This ensures sessions list stays accurate even if WebSocket broadcasts are missed
  useEffect(() => {
    if (!isAuthenticated) return;

    console.log('[useActiveSessions] Starting polling fallback (30s interval)');
    const pollingInterval = setInterval(() => {
      console.log('[useActiveSessions] Polling fallback triggered');
      if (isAuthenticated && accessToken) {
        fetchSessions();
      }
    }, 30000); // Poll every 30 seconds

    return () => {
      console.log('[useActiveSessions] Stopping polling fallback');
      clearInterval(pollingInterval);
    };
  }, [isAuthenticated, accessToken, fetchSessions]);

  // Listen for session updates via WebSocket
  useEffect(() => {
    if (!isAuthenticated) return;

    // Setup retry interval to wait for socket
    let retryTimer: ReturnType<typeof setTimeout>;
    let cleanupFn: (() => void) | null = null;

    const setupListeners = () => {
      const socket = getSocket();
      if (!socket) {
        console.warn('[useActiveSessions] Socket not ready yet, will retry...');
        // Retry after 500ms
        retryTimer = setTimeout(setupListeners, 500);
        return;
      }

      console.log('[useActiveSessions] Setting up session-update listener');

      const handleSessionUpdate = (_data: { timestamp: number }) => {
        console.log('[useActiveSessions] session-update event received, refreshing sessions');
        // Refetch sessions when broadcast received (only if still authenticated)
        if (isAuthenticated && accessToken) {
          fetchSessions();
        }
      };

      const handleConnect = () => {
        console.log('[useActiveSessions] WebSocket connected, refreshing sessions');
        // CRITICAL: Fetch sessions on connect to catch any missed broadcasts during connection
        if (isAuthenticated && accessToken) {
          fetchSessions();
        }
      };

      const handleDisconnect = (_reason: string) => {
        console.log('[useActiveSessions] WebSocket disconnected');
      };

      // Listen to session updates
      socket.on('session-update', handleSessionUpdate);
      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);

      // If socket is already connected, fetch immediately
      // This handles the case where socket connected BEFORE this effect ran
      if (socket.connected && isAuthenticated && accessToken) {
        console.log('[useActiveSessions] Socket already connected, fetching sessions immediately');
        fetchSessions();
      }

      // Cleanup function
      cleanupFn = () => {
        console.log('[useActiveSessions] Cleaning up session-update listener');
        socket.off('session-update', handleSessionUpdate);
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
      };
    };

    // Start setup (will retry if socket not ready)
    setupListeners();

    // Cleanup on unmount
    return () => {
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
      if (cleanupFn) {
        cleanupFn();
      }
    };
  }, [isAuthenticated, accessToken, fetchSessions]);

  return {
    sessions,
    loading,
    error,
    currentSessionId,
    logoutDevice,
    logoutAllOtherDevices,
    refresh: fetchSessions,
  };
}
