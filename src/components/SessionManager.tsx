/**
 * SessionManager Component
 * Manages session timeout, warnings, and auto-logout
 * Uses SessionProvider for shared session state
 */

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
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
  const { warning } = useToast();
  const { timeRemainingMs, isExpired } = useSession();
  const hasShownWarningRef = useRef<boolean>(false);
  const hasExpiredRef = useRef<boolean>(false);

  // Handle session expiration
  useEffect(() => {
    if (!enabled || !isAuthenticated || !isExpired || hasExpiredRef.current) {
      return;
    }

    hasExpiredRef.current = true;

    if (debug) {
      console.log('[SessionManager] Session expired - logging out');
    }

    const performLogout = async () => {
      await logout();

      if (showExpiryToast) {
        warning('Your session has expired. Please login again.', 8000);
      }

      navigate('/login?reason=session_expired', { replace: true });
    };

    performLogout();
  }, [enabled, isAuthenticated, isExpired, logout, navigate, warning, showExpiryToast, debug]);

  // Handle session warning
  useEffect(() => {
    if (
      !enabled ||
      !isAuthenticated ||
      !timeRemainingMs ||
      timeRemainingMs > warningThreshold ||
      hasShownWarningRef.current
    ) {
      return;
    }

    hasShownWarningRef.current = true;

    const seconds = Math.floor(timeRemainingMs / 1000);

    if (debug) {
      console.log('[SessionManager] Session warning triggered -', seconds, 'seconds remaining');
    }

    warning(
      `Your session will expire in ${seconds} seconds due to inactivity. Move your mouse or press a key to stay logged in.`,
      10000 // Show for 10 seconds
    );
  }, [enabled, isAuthenticated, timeRemainingMs, warningThreshold, warning, debug]);

  // Reset warning flag when session is extended (user was active)
  useEffect(() => {
    if (timeRemainingMs && timeRemainingMs > warningThreshold) {
      hasShownWarningRef.current = false;
    }
  }, [timeRemainingMs, warningThreshold]);

  // Reset expired flag when user logs in
  useEffect(() => {
    if (isAuthenticated && !isExpired) {
      hasExpiredRef.current = false;
      hasShownWarningRef.current = false;
    }
  }, [isAuthenticated, isExpired]);

  // Debug logging
  useEffect(() => {
    if (debug && isAuthenticated && timeRemainingMs !== null) {
      const minutes = Math.floor(timeRemainingMs / 60000);
      const seconds = Math.floor((timeRemainingMs % 60000) / 1000);
      console.log(`[SessionManager] Time remaining: ${minutes}m ${seconds}s`);
    }
  }, [debug, isAuthenticated, timeRemainingMs]);

  // This component doesn't render anything
  return null;
}
