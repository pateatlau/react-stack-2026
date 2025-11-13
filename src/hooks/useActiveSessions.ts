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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export function useActiveSessions(): UseActiveSessionsReturn {
  const { accessToken, isAuthenticated } = useAuthStore();
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
      console.log('[useActiveSessions] Fetching from:', `${API_BASE_URL}/api/auth/sessions`);
      const response = await fetch(`${API_BASE_URL}/api/auth/sessions`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('[useActiveSessions] Response status:', response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch sessions: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[useActiveSessions] Response data:', data);

      if (data.success && data.data) {
        // Backend returns data.data.sessions (nested structure)
        const sessionsArray = Array.isArray(data.data.sessions)
          ? data.data.sessions
          : Array.isArray(data.data)
            ? data.data
            : [];
        console.log('[useActiveSessions] Sessions array:', sessionsArray.length, 'sessions');
        setSessions(sessionsArray);
      } else {
        throw new Error(data.message || 'Failed to fetch sessions');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sessions';
      setError(errorMessage);
      setSessions([]);
      console.error('[useActiveSessions] Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  }, [accessToken, isAuthenticated]);

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

        // Then call API to delete the session
        const response = await fetch(`${API_BASE_URL}/api/auth/sessions/${sessionId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to logout device: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || 'Failed to logout device');
        }

        // Refresh sessions list
        await fetchSessions();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to logout device';
        setError(errorMessage);
        throw err;
      }
    },
    [accessToken, isAuthenticated, fetchSessions]
  );

  // Logout all other devices (keep current session)
  const logoutAllOtherDevices = useCallback(async () => {
    if (!isAuthenticated || !accessToken) {
      throw new Error('Not authenticated');
    }

    setError(null);

    try {
      // Call API to delete all other sessions
      // The backend will handle WebSocket broadcast with excludeSessionToken
      const response = await fetch(`${API_BASE_URL}/api/auth/sessions/all`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to logout all devices: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to logout all devices');
      }

      // Refresh sessions list
      await fetchSessions();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to logout all devices';
      setError(errorMessage);
      throw err;
    }
  }, [accessToken, isAuthenticated, fetchSessions]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Listen for session updates via WebSocket
  // Use a ref to avoid dependency on fetchSessions
  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = getSocket();
    if (!socket) {
      console.log('[useActiveSessions] Socket not available');
      return;
    }

    const handleSessionUpdate = (data: { timestamp: number }) => {
      console.log('[useActiveSessions] Session update received:', data);
      // Refetch sessions when broadcast received
      fetchSessions();
    };

    const handleConnect = () => {
      console.log('[useActiveSessions] Socket connected, fetching sessions');
      fetchSessions();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]); // Only depend on isAuthenticated, fetchSessions is in the closure

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
