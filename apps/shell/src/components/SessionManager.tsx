/**
 * SessionManager Component
 * Manages session timeout, warnings, and auto-logout
 * Uses SessionProvider for shared session state
 */

import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@react-stack/shared-hooks';
import { useSession } from '../contexts/SessionContext';
import { useToast } from '../contexts/ToastContext';

interface SessionManagerProps {
  /** Enable session monitoring (default: true) */
  enabled?: boolean;
  /** Warning threshold in milliseconds (default: 60000 = 1 minute) */
  warningThreshold?: number;
  /** Show toast on session expiry (default: true) */
  showExpiryToast?: boolean;
  /** Debug mode - log session events (default: false) */
  debug?: boolean;
}

export function SessionManager({
  enabled = true,
  warningThreshold = 60000, // 1 minute
  showExpiryToast = true,
  debug = false,
}: SessionManagerProps) {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { warning, updateToast, removeToast } = useToast();
  const { timeRemainingMs, isExpired, formatTimeRemaining } = useSession();
  const warningToastIdRef = useRef<string | null>(null);
  const hasExpiredRef = useRef<boolean>(false);

  // Handle session expiration
  useEffect(() => {
    if (!enabled || !isAuthenticated || !isExpired || hasExpiredRef.current) {
      return;
    }

    hasExpiredRef.current = true;

    const performLogout = async () => {
      await logout();

      if (showExpiryToast) {
        warning('Your session has expired. Please login again.', 8000);
      }

      navigate('/login?reason=session_expired', { replace: true });
    };

    performLogout();
  }, [enabled, isAuthenticated, isExpired, logout, navigate, warning, showExpiryToast, debug]);

  // Format countdown message
  const formatWarningMessage = useCallback(
    (ms: number) => {
      const timeStr = formatTimeRemaining(ms);
      return `Your session will expire in ${timeStr} due to inactivity. Move your mouse or press a key to stay logged in.`;
    },
    [formatTimeRemaining]
  );

  // Handle session warning with live countdown
  useEffect(() => {
    // Clear warning toast if user is not authenticated
    if (!isAuthenticated && warningToastIdRef.current) {
      if (import.meta.env.DEV) {
        console.log('[SessionManager] User logged out, clearing warning toast');
      }
      removeToast(warningToastIdRef.current);
      warningToastIdRef.current = null;
      return;
    }

    if (!enabled || !isAuthenticated || timeRemainingMs === null) {
      return;
    }

    if (import.meta.env.DEV) {
      console.log(
        `[SessionManager] timeRemaining: ${Math.floor(timeRemainingMs / 1000)}s, threshold: ${Math.floor(warningThreshold / 1000)}s, hasToast: ${!!warningToastIdRef.current}`
      );
    }

    // Show warning when below threshold
    if (timeRemainingMs <= warningThreshold && timeRemainingMs > 0) {
      // Create warning toast if it doesn't exist
      if (!warningToastIdRef.current) {
        const message = formatWarningMessage(timeRemainingMs);
        const toastId = warning(message, 999999999); // Very long duration (persistent)
        warningToastIdRef.current = toastId || null;

        if (import.meta.env.DEV) {
          console.log('[SessionManager] Created warning toast:', toastId);
        }
      } else {
        // Update existing toast with countdown
        const message = formatWarningMessage(timeRemainingMs);
        updateToast(warningToastIdRef.current, message);
      }
    } else if (timeRemainingMs > warningThreshold && warningToastIdRef.current) {
      // User became active - dismiss warning
      if (import.meta.env.DEV) {
        console.log(
          '[SessionManager] Dismissing warning toast, time increased to:',
          Math.floor(timeRemainingMs / 1000) + 's'
        );
      }

      removeToast(warningToastIdRef.current);
      warningToastIdRef.current = null;
    }
  }, [
    enabled,
    isAuthenticated,
    timeRemainingMs,
    warningThreshold,
    warning,
    updateToast,
    removeToast,
    formatWarningMessage,
  ]);

  // Reset expired flag when user logs in
  useEffect(() => {
    if (isAuthenticated && !isExpired) {
      hasExpiredRef.current = false;
    }
  }, [isAuthenticated, isExpired]);

  // Cleanup warning toast on unmount
  useEffect(() => {
    return () => {
      if (warningToastIdRef.current) {
        removeToast(warningToastIdRef.current);
        warningToastIdRef.current = null;
      }
    };
  }, [removeToast]);

  // This component doesn't render anything
  return null;
}
