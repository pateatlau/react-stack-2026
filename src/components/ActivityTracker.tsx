/**
 * ActivityTracker Component
 * Tracks user activity (mouse, keyboard) and updates backend session
 */

import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as authApi from '../lib/api/auth.api';

interface ActivityTrackerProps {
  /** Enable activity tracking (default: true) */
  enabled?: boolean;
  /** Throttle interval in milliseconds (default: 30000 = 30 seconds) */
  throttleInterval?: number;
  /** Debug mode - log activity events (default: false) */
  debug?: boolean;
}

export function ActivityTracker({
  enabled = true,
  throttleInterval = 30000, // 30 seconds
  debug = false,
}: ActivityTrackerProps) {
  const { isAuthenticated } = useAuth();
  const lastActivityRef = useRef<number>(0);
  const isUpdatingRef = useRef<boolean>(false);

  const updateActivity = useCallback(async () => {
    if (!isAuthenticated || isUpdatingRef.current) {
      return;
    }

    const now = Date.now();
    const timeSinceLastUpdate = now - lastActivityRef.current;

    // Only update if throttle interval has passed
    if (timeSinceLastUpdate < throttleInterval) {
      return;
    }

    isUpdatingRef.current = true;
    lastActivityRef.current = now;

    try {
      // Fetch user info to trigger lastActivityAt update on backend
      await authApi.getCurrentUser();
      if (debug) {
        console.log('[ActivityTracker] Activity updated at', new Date().toISOString());
      }
    } catch (error) {
      if (debug) {
        console.error('[ActivityTracker] Failed to update activity:', error);
      }
    } finally {
      isUpdatingRef.current = false;
    }
  }, [isAuthenticated, throttleInterval, debug]);

  useEffect(() => {
    if (!enabled || !isAuthenticated) {
      return;
    }

    // Activity event handlers
    const handleActivity = () => {
      updateActivity();
    };

    // Listen to various user activity events
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'] as const;

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    if (debug) {
      console.log('[ActivityTracker] Started tracking activity');
    }

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (debug) {
        console.log('[ActivityTracker] Stopped tracking activity');
      }
    };
  }, [enabled, isAuthenticated, updateActivity, debug]);

  // This component doesn't render anything
  return null;
}
