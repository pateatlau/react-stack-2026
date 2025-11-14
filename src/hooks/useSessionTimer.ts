/**
 * useSessionTimer Hook
 * Event-driven session tracking using local timer + WebSocket events
 * NO POLLING - calculates expiry based on last activity timestamp
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { getSocket } from '../lib/websocket';
import { apiClient } from '../lib/api/client';

// Session timeout - will be fetched from backend
let SESSION_TIMEOUT_MS = 5 * 60 * 1000; // Default 5 minutes, overridden by backend config

interface UseSessionTimerOptions {
  /** Warning threshold in milliseconds (default: 60000 = 1 minute) */
  warningThreshold?: number;
  /** Callback when session expires */
  onSessionExpired?: () => void;
  /** Callback when session warning (e.g., 1 minute remaining) */
  onSessionWarning?: (timeRemainingMs: number) => void;
}

export function useSessionTimer(options: UseSessionTimerOptions = {}) {
  const { warningThreshold = 60000, onSessionExpired, onSessionWarning } = options;

  const { isAuthenticated, logout } = useAuth();
  const [lastActivityAt, setLastActivityAt] = useState<Date | null>(() =>
    isAuthenticated ? new Date() : null
  );
  const [timeRemainingMs, setTimeRemainingMs] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const hasWarned = useRef(false);
  const hasExpiredRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [sessionTimeoutMs, setSessionTimeoutMs] = useState(SESSION_TIMEOUT_MS);
  const lastActivityAtRef = useRef<Date | null>(isAuthenticated ? new Date() : null);

  // Fetch session timeout from backend
  useEffect(() => {
    const fetchSessionTimeout = async () => {
      try {
        const response = await apiClient.get('/api/auth/config');
        if (response.data.success && response.data.data.sessionTimeoutMs) {
          const timeout = response.data.data.sessionTimeoutMs;
          SESSION_TIMEOUT_MS = timeout;
          setSessionTimeoutMs(timeout);
        }
      } catch {
        // Failed to fetch session timeout, using default
      }
    };

    fetchSessionTimeout();
  }, []);

  // Calculate time remaining
  const calculateTimeRemaining = useCallback(() => {
    if (!lastActivityAt) return null;

    const now = Date.now();
    const lastActivity = lastActivityAt.getTime();
    const elapsed = now - lastActivity;
    const remaining = sessionTimeoutMs - elapsed;

    return Math.max(0, remaining);
  }, [lastActivityAt, sessionTimeoutMs]);

  // Update activity timestamp (called on user actions)
  const updateActivity = useCallback(() => {
    const now = new Date();
    setLastActivityAt(now);
    lastActivityAtRef.current = now;
    setIsExpired(false);
    hasWarned.current = false;
    hasExpiredRef.current = false;
  }, []);

  // Reset state when user logs out (isAuthenticated becomes false)
  useEffect(() => {
    if (!isAuthenticated) {
      // Clear all state and refs when logged out
      setLastActivityAt(null);
      lastActivityAtRef.current = null;
      setTimeRemainingMs(null);
      setIsExpired(false);
      hasWarned.current = false;
      hasExpiredRef.current = false;

      // Clear timer if running
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isAuthenticated]);

  // Initialize state when user logs in
  useEffect(() => {
    if (isAuthenticated && !lastActivityAt) {
      const now = new Date();
      setLastActivityAt(now);
      lastActivityAtRef.current = now;
      setIsExpired(false);
      hasWarned.current = false;
      hasExpiredRef.current = false;
    }
  }, [isAuthenticated, lastActivityAt]);

  // Listen for activity update events from API interceptor
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleActivityUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ timestamp?: number }>;
      const timestamp = customEvent.detail?.timestamp
        ? new Date(customEvent.detail.timestamp)
        : new Date();

      // Update both state and ref
      setLastActivityAt(timestamp);
      lastActivityAtRef.current = timestamp;

      setIsExpired(false);
      hasWarned.current = false;
      hasExpiredRef.current = false;
    };

    window.addEventListener('session-activity-updated', handleActivityUpdate);

    return () => {
      window.removeEventListener('session-activity-updated', handleActivityUpdate);
    };
  }, [isAuthenticated]);

  // Listen for WebSocket session events
  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = getSocket();
    if (!socket) return;

    const handleSessionRefreshed = (data: { lastActivityAt: string }) => {
      const timestamp = new Date(data.lastActivityAt);
      setLastActivityAt(timestamp);
      lastActivityAtRef.current = timestamp;
      setIsExpired(false);
      hasWarned.current = false;
      hasExpiredRef.current = false;
    };

    const handleSessionExpiredWS = () => {
      setIsExpired(true);
      hasExpiredRef.current = true;
    };

    socket.on('session-refreshed', handleSessionRefreshed);
    socket.on('session-expired', handleSessionExpiredWS);

    return () => {
      socket.off('session-refreshed', handleSessionRefreshed);
      socket.off('session-expired', handleSessionExpiredWS);
    };
  }, [isAuthenticated]);

  // Timer to check session expiry (every second)
  useEffect(() => {
    if (!isAuthenticated || !lastActivityAt) {
      return;
    }

    // Update timer every second
    timerRef.current = setInterval(() => {
      // Use ref to get latest value (not stale closure)
      const currentLastActivity = lastActivityAtRef.current;
      if (!currentLastActivity) return;

      // Calculate remaining time directly
      const now = Date.now();
      const lastActivity = currentLastActivity.getTime();
      const elapsed = now - lastActivity;
      const remaining = Math.max(0, sessionTimeoutMs - elapsed);

      setTimeRemainingMs(remaining);

      // Check if expired
      if (remaining === 0 && !hasExpiredRef.current) {
        setIsExpired(true);
        hasExpiredRef.current = true;
        onSessionExpired?.();
      }

      // Check if warning threshold reached
      if (remaining <= warningThreshold && remaining > 0 && !hasWarned.current) {
        hasWarned.current = true;
        onSessionWarning?.(remaining);
      }

      // Reset warning if time increased (activity detected)
      if (remaining > warningThreshold && hasWarned.current) {
        hasWarned.current = false;
      }
    }, 1000); // Check every second

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [
    isAuthenticated,
    lastActivityAt,
    sessionTimeoutMs,
    warningThreshold,
    onSessionExpired,
    onSessionWarning,
  ]);

  // Trigger logout when expired
  useEffect(() => {
    if (isExpired && isAuthenticated && hasExpiredRef.current) {
      logout();
    }
  }, [isExpired, isAuthenticated, logout]);

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
    timeRemainingMs,
    timeRemainingMinutes: timeRemainingMs ? Math.floor(timeRemainingMs / 60000) : null,
    isExpired,
    lastActivityAt,
    formatTimeRemaining,
    updateActivity,
  };
}
