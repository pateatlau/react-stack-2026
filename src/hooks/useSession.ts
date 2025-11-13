/**
 * useSession Hook
 * Monitors session status and provides timeout information
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import * as authApi from '../lib/api/auth.api';
import type { SessionInfo } from '../types/auth.types';

interface UseSessionOptions {
  /** Enable automatic session polling (default: false) */
  enabled?: boolean;
  /** Polling interval in milliseconds (default: 30000 = 30 seconds) */
  pollInterval?: number;
  /** Callback when session expires */
  onSessionExpired?: () => void;
  /** Callback when session warning (e.g., 1 minute remaining) */
  onSessionWarning?: (timeRemainingMs: number) => void;
  /** Warning threshold in milliseconds (default: 60000 = 1 minute) */
  warningThreshold?: number;
}

export function useSession(options: UseSessionOptions = {}) {
  const {
    enabled = false,
    pollInterval = 30000, // 30 seconds
    onSessionExpired,
    onSessionWarning,
    warningThreshold = 60000, // 1 minute
  } = options;

  const { isAuthenticated, logout } = useAuth();
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasWarned, setHasWarned] = useState(false);

  // Check session status
  const checkSession = useCallback(async () => {
    if (!isAuthenticated) {
      setSessionInfo(null);
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      const response = await authApi.getSessionStatus();

      if (response.success && response.data) {
        const session = response.data.session;
        setSessionInfo(session);

        // Check if session expired
        if (session.isExpired) {
          onSessionExpired?.();
          await logout();
          return;
        }

        // Check if warning threshold reached
        if (
          session.timeRemainingMs <= warningThreshold &&
          session.timeRemainingMs > 0 &&
          !hasWarned
        ) {
          setHasWarned(true);
          onSessionWarning?.(session.timeRemainingMs);
        }

        // Reset warning flag if time increases (user was active)
        if (session.timeRemainingMs > warningThreshold && hasWarned) {
          setHasWarned(false);
        }
      }
    } catch (err) {
      // Handle session expired error
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { code?: string } } };
        if (axiosError.response?.data?.code === 'SESSION_EXPIRED') {
          onSessionExpired?.();
          await logout();
          return;
        }
      }

      const errorMessage = err instanceof Error ? err.message : 'Failed to check session';
      setError(errorMessage);
    } finally {
      setIsChecking(false);
    }
  }, [isAuthenticated, onSessionExpired, onSessionWarning, warningThreshold, hasWarned, logout]);

  // Auto-poll session status
  useEffect(() => {
    if (!enabled || !isAuthenticated) {
      return;
    }

    // Check immediately
    checkSession();

    // Set up polling interval
    const intervalId = setInterval(checkSession, pollInterval);

    return () => clearInterval(intervalId);
  }, [enabled, isAuthenticated, pollInterval, checkSession]);

  // Format time remaining for display
  const formatTimeRemaining = (ms: number): string => {
    if (ms <= 0) return 'Expired';

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  };

  return {
    sessionInfo,
    isChecking,
    error,
    checkSession,
    formatTimeRemaining,
    // Convenience properties
    timeRemainingMs: sessionInfo?.timeRemainingMs ?? null,
    timeRemainingMinutes: sessionInfo?.timeRemainingMinutes ?? null,
    isExpired: sessionInfo?.isExpired ?? false,
    lastActivityAt: sessionInfo?.lastActivityAt ?? null,
  };
}
