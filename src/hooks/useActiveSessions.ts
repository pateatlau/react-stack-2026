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
    console.log('[useActiveSessions] fetchSessions called', {
      isAuthenticated,
      hasToken: !!accessToken,
    });

    if (!isAuthenticated || !accessToken) {
      console.log('[useActiveSessions] Not authenticated, clearing sessions');
      setSessions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[useActiveSessions] Fetching sessions via apiClient');
      const response = await apiClient.get('/api/auth/sessions');
      console.log('[useActiveSessions] Response data:', response.data);

      if (response.data.success && response.data.data) {
        // Backend returns data.data.sessions (nested structure)
        const sessionsArray = Array.isArray(response.data.data.sessions)
          ? response.data.data.sessions
          : Array.isArray(response.data.data)
            ? response.data.data
            : [];
        console.log('[useActiveSessions] Sessions array:', sessionsArray.length, 'sessions');
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

          console.log('[useActiveSessions] 401 error detected, code:', errorCode);

          // If session expired, logout the user
          if (errorCode === 'SESSION_EXPIRED') {
            console.log('[useActiveSessions] Session expired, logging out user');
            await logout();
            // Don't set error state since we're logging out
            return;
          }

          // For other 401 errors, also logout as the token is invalid
          console.log('[useActiveSessions] Invalid token, logging out user');
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

        // Refresh sessions list
        await fetchSessions();
      } catch (err: unknown) {
        // Check if it's a 401 error
        if (err && typeof err === 'object' && 'response' in err) {
          const error = err as { response?: { status?: number; data?: { code?: string } } };

          if (error.response?.status === 401) {
            console.log('[useActiveSessions] 401 during logout device, logging out user');
            await logout();
            return;
          }
        }

        const errorMessage = err instanceof Error ? err.message : 'Failed to logout device';
        setError(errorMessage);
        throw err;
      }
    },
    [accessToken, isAuthenticated, fetchSessions, logout]
  );

  // Logout all other devices (keep current session)
  const logoutAllOtherDevices = useCallback(async () => {
    if (!isAuthenticated || !accessToken) {
      throw new Error('Not authenticated');
    }

    setError(null);

    try {
      // Call API to delete all other sessions using apiClient
      // The backend will handle WebSocket broadcast with excludeSessionToken
      const response = await apiClient.delete('/api/auth/sessions/all');

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to logout all devices');
      }

      // Refresh sessions list
      await fetchSessions();
    } catch (err: unknown) {
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
  }, [accessToken, isAuthenticated, fetchSessions, logout]);

  // Auto-fetch on mount and when authentication status changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchSessions();
    }
  }, [fetchSessions, isAuthenticated]);

  // Listen for session updates via WebSocket
  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = getSocket();
    if (!socket) {
      console.log('[useActiveSessions] Socket not available');
      return;
    }

    const handleSessionUpdate = (data: { timestamp: number }) => {
      console.log('[useActiveSessions] Session update received:', data);
      // Refetch sessions when broadcast received (only if still authenticated)
      if (isAuthenticated && accessToken) {
        fetchSessions();
      }
    };

    const handleConnect = () => {
      console.log('[useActiveSessions] Socket connected, fetching sessions');
      // Only fetch if still authenticated
      if (isAuthenticated && accessToken) {
        fetchSessions();
      }
    };

    const handleDisconnect = (reason: string) => {
      console.log('[useActiveSessions] Socket disconnected:', reason);
    };

    // Listen to session updates
    socket.on('session-update', handleSessionUpdate);
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    console.log('[useActiveSessions] WebSocket listeners registered');

    return () => {
      socket.off('session-update', handleSessionUpdate);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      console.log('[useActiveSessions] WebSocket listeners removed');
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
