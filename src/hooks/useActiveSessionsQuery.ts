/**
 * useActiveSessionsQuery Hook
 *
 * TanStack Query implementation for active sessions management.
 * Provides optimistic updates for local actions and real-time sync for cross-device changes.
 *
 * Handles 5 scenarios:
 * 1. New login from another browser → WebSocket 'session-update' → immediate refetch
 * 2. Logout from another browser → WebSocket 'session-update' → immediate refetch
 * 3. Session timeout from another browser → WebSocket 'force-logout' + 'session-update' → immediate refetch
 * 4. Logout specific session → Optimistic removal → API call → server confirmation
 * 5. Logout all other sessions → Optimistic filter → API call → server confirmation
 *
 * Optimistic Update Flow (scenarios 4-5):
 * - onMutate: Remove session(s) immediately from cache (user sees instant feedback)
 * - API call: Execute in background
 * - onSuccess: Refetch from server to confirm and sync (server is source of truth)
 * - onError: Rollback to previous state if API fails
 *
 * Cross-Device Sync Flow (scenarios 1-3):
 * - WebSocket 'session-update' event: New login, remote logout → refetch sessions
 * - WebSocket 'force-logout' event: Session timeout, forced logout → refetch sessions
 * - Smart refetch: If local mutations pending, delay refetch by 1s to preserve optimistic updates
 * - Otherwise: Immediate refetch using refetchQueries() (not just invalidate)
 * - User sees changes from other devices within <1 second
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/useAuthStore';
import { apiClient } from '../lib/api/client';
import { getSocket } from '../lib/websocket';
import { useEffect } from 'react';

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

// Query key factory
const sessionKeys = {
  all: ['sessions'] as const,
  list: () => [...sessionKeys.all, 'list'] as const,
};

// Fetch sessions from API
async function fetchSessions(): Promise<ActiveSession[]> {
  const response = await apiClient.get('/api/auth/sessions');

  if (response.data.success && response.data.data) {
    const sessionsArray = Array.isArray(response.data.data.sessions)
      ? response.data.data.sessions
      : Array.isArray(response.data.data)
        ? response.data.data
        : [];
    return sessionsArray;
  }

  throw new Error(response.data.message || 'Failed to fetch sessions');
}

// Delete single session
async function deleteSession(sessionId: string): Promise<void> {
  // Emit WebSocket event for immediate logout on other tabs
  const socket = getSocket();
  if (socket?.connected) {
    socket.emit('logout-device', { sessionId });
  }

  const response = await apiClient.delete(`/api/auth/sessions/${sessionId}`);

  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to logout device');
  }
}

// Delete all other sessions
async function deleteAllOtherSessions(): Promise<void> {
  const response = await apiClient.delete('/api/auth/sessions/all');

  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to logout all devices');
  }
}

export function useActiveSessionsQuery() {
  const { accessToken, isAuthenticated, logout } = useAuthStore();
  const queryClient = useQueryClient();

  // Current session ID
  const currentSessionId = accessToken;

  // Query for fetching sessions
  const {
    data: sessions = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: sessionKeys.list(),
    queryFn: fetchSessions,
    enabled: isAuthenticated,
    staleTime: 10000, // Consider data fresh for 10 seconds
    refetchInterval: 10000, // Refetch every 10 seconds as fallback
    retry: (failureCount, error: Error) => {
      // Don't retry on 401 errors
      const apiError = error as { response?: { status?: number } };
      if (apiError?.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Handle 401 errors from query
  useEffect(() => {
    if (error) {
      const apiError = error as { response?: { status?: number } };
      if (apiError?.response?.status === 401) {
        logout();
      }
    }
  }, [error, logout]);

  // Mutation for logging out a device
  const logoutDeviceMutation = useMutation({
    mutationKey: ['logout-device'],
    mutationFn: deleteSession,
    onMutate: async (sessionId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: sessionKeys.list() });

      // Snapshot previous value
      const previousSessions = queryClient.getQueryData<ActiveSession[]>(sessionKeys.list());

      // Optimistically update to the new value
      queryClient.setQueryData<ActiveSession[]>(
        sessionKeys.list(),
        (old) => old?.filter((session) => session.id !== sessionId) ?? []
      );

      // Return context with previous value for rollback
      return { previousSessions };
    },
    onSuccess: () => {
      // Refetch after successful logout to sync with server
      // This confirms the optimistic update matches reality
      queryClient.invalidateQueries({ queryKey: sessionKeys.list() });
    },
    onError: async (err: Error, sessionId, context) => {
      // Rollback on error
      if (context?.previousSessions) {
        queryClient.setQueryData(sessionKeys.list(), context.previousSessions);
      }

      // Handle 401 errors
      const apiError = err as { response?: { status?: number } };
      if (apiError?.response?.status === 401) {
        await logout();
      }
    },
  });

  // Mutation for logging out all other devices
  const logoutAllOtherDevicesMutation = useMutation({
    mutationKey: ['logout-all-devices'],
    mutationFn: deleteAllOtherSessions,
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: sessionKeys.list() });

      // Snapshot previous value
      const previousSessions = queryClient.getQueryData<ActiveSession[]>(sessionKeys.list());

      // Optimistically update - keep only current session
      queryClient.setQueryData<ActiveSession[]>(
        sessionKeys.list(),
        (old) => old?.filter((session) => session.sessionToken === currentSessionId) ?? []
      );

      // Return context with previous value for rollback
      return { previousSessions };
    },
    onSuccess: () => {
      // Refetch after successful logout to sync with server
      // This confirms the optimistic update matches reality
      queryClient.invalidateQueries({ queryKey: sessionKeys.list() });
    },
    onError: async (err: Error, _, context) => {
      // Rollback on error
      if (context?.previousSessions) {
        queryClient.setQueryData(sessionKeys.list(), context.previousSessions);
      }

      // Handle 401 errors
      const apiError = err as { response?: { status?: number } };
      if (apiError?.response?.status === 401) {
        await logout();
      }
    },
  });

  // Listen for WebSocket session updates
  useEffect(() => {
    if (!isAuthenticated) return;

    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let cleanupFn: (() => void) | null = null;
    let pendingRefetchTimeout: ReturnType<typeof setTimeout> | null = null;

    const setupListeners = () => {
      const socket = getSocket();
      if (!socket) {
        retryTimer = setTimeout(setupListeners, 500);
        return;
      }

      const handleSessionUpdate = () => {
        // Force immediate refetch for cross-device changes (scenarios 1-3)
        // Check if local mutations are in progress to avoid overriding optimistic updates
        const hasLogoutPending =
          queryClient.isMutating({ mutationKey: ['logout-device'] }) > 0 ||
          queryClient.isMutating({ mutationKey: ['logout-all-devices'] }) > 0;

        if (hasLogoutPending) {
          // Delay refetch until mutations complete to preserve optimistic updates
          // Clear any existing pending timeout to avoid multiple queued refetches
          if (pendingRefetchTimeout) {
            clearTimeout(pendingRefetchTimeout);
            pendingRefetchTimeout = null;
          }

          pendingRefetchTimeout = setTimeout(() => {
            // Double-check mutations are complete before refetching
            const stillPending =
              queryClient.isMutating({ mutationKey: ['logout-device'] }) > 0 ||
              queryClient.isMutating({ mutationKey: ['logout-all-devices'] }) > 0;

            if (!stillPending) {
              queryClient.refetchQueries({ queryKey: sessionKeys.list() });
            }
            pendingRefetchTimeout = null;
          }, 1500); // Wait 1.5 seconds for mutation to complete
        } else {
          // No pending mutations, safe to refetch immediately
          queryClient.refetchQueries({ queryKey: sessionKeys.list() });
        }
      };

      const handleForceLogout = (data: {
        targetSessionId?: string;
        excludeSessionToken?: string;
        reason?: string;
      }) => {
        // When any force-logout event is received, refresh the sessions list
        // This handles scenario 3 (session timeout) and other cross-device logouts
        const currentSessionToken = accessToken;

        // Check if this force-logout is meant to exclude our current session
        // This happens during "logout all other devices" - we see others being logged out
        if (data.excludeSessionToken && data.excludeSessionToken === currentSessionToken) {
          // This is explicitly excluding our session, so we should refresh the list
          // to see the other sessions that were logged out
          queryClient.refetchQueries({ queryKey: sessionKeys.list() });
          return;
        }

        // Check if this force-logout is targeting our specific session
        if (data.targetSessionId && data.targetSessionId === currentSessionToken) {
          // This is for our session, we'll be logged out by CrossDeviceAuthSync
          // No need to refresh list as we're being logged out
          return;
        }

        // For all other cases (timeout of other sessions, remote logout, etc.)
        // This includes: session timeout (no targetSessionId, no excludeSessionToken)
        // Force immediate refetch to show the updated state
        queryClient.refetchQueries({ queryKey: sessionKeys.list() });
      };

      const handleConnect = () => {
        // Refetch on reconnect to sync with server
        queryClient.refetchQueries({ queryKey: sessionKeys.list() });
      };

      socket.on('session-update', handleSessionUpdate);
      socket.on('force-logout', handleForceLogout);
      socket.on('connect', handleConnect);

      // If already connected, fetch immediately
      if (socket.connected) {
        queryClient.refetchQueries({ queryKey: sessionKeys.list() });
      }

      cleanupFn = () => {
        socket.off('session-update', handleSessionUpdate);
        socket.off('force-logout', handleForceLogout);
        socket.off('connect', handleConnect);
      };
    };

    setupListeners();

    return () => {
      if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }
      if (pendingRefetchTimeout) {
        clearTimeout(pendingRefetchTimeout);
        pendingRefetchTimeout = null;
      }
      if (cleanupFn) {
        cleanupFn();
        cleanupFn = null;
      }
    };
  }, [isAuthenticated, queryClient, accessToken]);

  return {
    sessions,
    loading,
    error: error instanceof Error ? error.message : error ? String(error) : null,
    currentSessionId,
    logoutDevice: (sessionId: string) => logoutDeviceMutation.mutateAsync(sessionId),
    logoutAllOtherDevices: () => logoutAllOtherDevicesMutation.mutateAsync(),
    refresh: refetch,
    isLogoutDevicePending: logoutDeviceMutation.isPending,
    isLogoutAllPending: logoutAllOtherDevicesMutation.isPending,
  };
}
