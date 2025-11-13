/**
 * Cross-Tab Authentication Synchronization
 *
 * Listens to localStorage events to sync authentication state across tabs/windows.
 * When a user logs in or out in one tab, all other tabs are automatically updated.
 */

// Storage keys for cross-tab sync
const AUTH_EVENT_KEY = 'auth-event';
const AUTH_STATE_KEY = 'auth-storage'; // Zustand persist key

// Configuration
const EVENT_CLEANUP_DELAY = 100; // ms to wait before cleaning up event
const EVENT_MAX_AGE = 5000; // ms - events older than this are considered stale
const DEBUG = import.meta.env.DEV; // Only log in development

export type AuthEventType = 'login' | 'logout';

export interface AuthEvent {
  type: AuthEventType;
  timestamp: number;
  tabId?: string; // Optional: to identify which tab sent the event
  data?: {
    user: unknown;
    accessToken: string;
    isAuthenticated: boolean;
  };
}

/**
 * Check if localStorage is available and working
 */
function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Broadcast an authentication event to other tabs
 * Uses localStorage to trigger storage events in other tabs
 */
export function broadcastAuthEvent(event: AuthEvent): void {
  if (!isLocalStorageAvailable()) {
    if (DEBUG) {
      console.warn('[CrossTabSync] localStorage not available, cannot broadcast event');
    }
    return;
  }

  try {
    // Add tab ID for debugging (optional)
    const eventWithTabId: AuthEvent = {
      ...event,
      tabId: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    // Write to localStorage to trigger storage event
    localStorage.setItem(AUTH_EVENT_KEY, JSON.stringify(eventWithTabId));

    if (DEBUG) {
      console.log('[CrossTabSync] Broadcasting event:', eventWithTabId.type);
    }

    // Clean up after a short delay
    setTimeout(() => {
      try {
        localStorage.removeItem(AUTH_EVENT_KEY);
      } catch {
        // Silently fail cleanup - not critical
      }
    }, EVENT_CLEANUP_DELAY);
  } catch (error) {
    console.error('[CrossTabSync] Failed to broadcast auth event:', error);
  }
}

/**
 * Listen for authentication events from other tabs
 * Returns a cleanup function to remove the listener
 */
export function listenToAuthEvents(onEvent: (event: AuthEvent) => void): () => void {
  if (!isLocalStorageAvailable()) {
    if (DEBUG) {
      console.warn('[CrossTabSync] localStorage not available, cannot listen for events');
    }
    // Return no-op cleanup function
    return () => {};
  }

  const handleStorageChange = (e: StorageEvent) => {
    // Only handle auth events
    if (e.key !== AUTH_EVENT_KEY) return;
    if (!e.newValue) return;

    try {
      const event = JSON.parse(e.newValue) as AuthEvent;

      // Validate event structure
      if (!event.type || typeof event.timestamp !== 'number') {
        if (DEBUG) {
          console.warn('[CrossTabSync] Invalid auth event structure:', event);
        }
        return;
      }

      // Ignore events older than EVENT_MAX_AGE (stale events)
      const age = Date.now() - event.timestamp;
      if (age > EVENT_MAX_AGE) {
        if (DEBUG) {
          console.warn('[CrossTabSync] Ignoring stale event (age:', age, 'ms)');
        }
        return;
      }

      if (DEBUG) {
        console.log('[CrossTabSync] Received event:', event.type, 'from', event.tabId || 'unknown');
      }

      onEvent(event);
    } catch (error) {
      console.error('[CrossTabSync] Failed to parse auth event:', error);
    }
  };

  // Add storage event listener
  window.addEventListener('storage', handleStorageChange);

  // Return cleanup function
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
}

/**
 * Get the current auth state from localStorage
 * Used when a tab detects a login event to sync state
 */
export function getAuthStateFromStorage(): {
  user: unknown;
  accessToken: string | null;
  isAuthenticated: boolean;
} | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }

  try {
    const stored = localStorage.getItem(AUTH_STATE_KEY);
    if (!stored) return null;

    const state = JSON.parse(stored);

    // Validate state structure
    if (!state || typeof state !== 'object') {
      if (DEBUG) {
        console.warn('[CrossTabSync] Invalid auth state structure');
      }
      return null;
    }

    return {
      user: state.state?.user || null,
      accessToken: state.state?.accessToken || null,
      isAuthenticated: state.state?.isAuthenticated || false,
    };
  } catch (error) {
    console.error('[CrossTabSync] Failed to get auth state:', error);
    return null;
  }
}

/**
 * Check if auth state has changed in localStorage
 * Useful for detecting changes that happened in other tabs
 */
export function hasAuthStateChanged(
  currentUser: unknown,
  currentIsAuthenticated: boolean
): boolean {
  const storedState = getAuthStateFromStorage();

  if (!storedState) {
    return currentIsAuthenticated; // State was cleared
  }

  // Check if authentication status changed
  if (storedState.isAuthenticated !== currentIsAuthenticated) {
    return true;
  }

  // Check if user changed (comparing user IDs)
  const currentUserId = (currentUser as { id?: string })?.id;
  const storedUserId = (storedState.user as { id?: string })?.id;

  return currentUserId !== storedUserId;
}
