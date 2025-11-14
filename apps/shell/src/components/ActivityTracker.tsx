/**
 * ActivityTracker Component
 * Tracks user activity (mouse, keyboard) and updates backend session
 */

import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@react-stack/shared-hooks';
import { apiClient } from '@react-stack/shared-utils';

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
  const lastBroadcastRef = useRef<number>(0);
  const isUpdatingRef = useRef<boolean>(false);

  const updateActivity = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    const now = Date.now();
    const timeSinceLastBroadcast = now - lastBroadcastRef.current;

    // Throttle broadcasts to once per second to avoid overwhelming the timer
    if (timeSinceLastBroadcast >= 1000) {
      // Broadcast activity to frontend immediately (for local timer)
      window.dispatchEvent(
        new CustomEvent('session-activity-updated', {
          detail: { timestamp: now },
        })
      );

      lastBroadcastRef.current = now;
    }

    // Only update backend if throttle interval has passed
    const timeSinceLastUpdate = now - lastActivityRef.current;
    if (timeSinceLastUpdate < throttleInterval || isUpdatingRef.current) {
      return;
    }

    isUpdatingRef.current = true;
    lastActivityRef.current = now;

    try {
      // Fetch user info to trigger lastActivityAt update on backend
      await apiClient.get('/api/auth/me');
    } catch (error) {
      // Failed to update activity
    } finally {
      isUpdatingRef.current = false;
    }
  }, [isAuthenticated, throttleInterval]);

  useEffect(() => {
    if (!enabled || !isAuthenticated) {
      return;
    }

    // Activity event handlers
    const handleActivity = () => {
      updateActivity();
    };

    // Listen to various user activity events
    // Use capture phase to catch events early
    const events = ['mousedown', 'mousemove', 'keydown', 'click'] as const;

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [enabled, isAuthenticated, updateActivity]);

  // This component doesn't render anything
  return null;
}
