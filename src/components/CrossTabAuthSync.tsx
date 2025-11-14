/**
 * Cross-Tab Authentication Synchronization Component
 *
 * Listens for auth events from other tabs/windows and syncs the auth state.
 * Handles both login and logout events to keep all tabs in sync.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { listenToAuthEvents, getAuthStateFromStorage, type AuthEvent } from '../lib/crossTabSync';
import type { User } from '../types/auth.types';

const DEBUG = import.meta.env.DEV;

export function CrossTabAuthSync() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, setUser, setAccessToken } = useAuthStore();

  // Use ref to track if we're currently processing an event to prevent race conditions
  const processingEventRef = useRef(false);
  // Use ref to track our own tab ID to ignore our own events
  const tabIdRef = useRef(`tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  const handleAuthEvent = useCallback(
    (event: AuthEvent) => {
      // CRITICAL: Ignore events from our own tab to prevent race conditions
      // The storage event can fire in the same tab in some browsers
      if (event.tabId === tabIdRef.current) {
        if (DEBUG) {
          console.log('[CrossTabSync] Ignoring event from own tab:', event.type);
        }
        return;
      }

      // Prevent concurrent processing
      if (processingEventRef.current) {
        if (DEBUG) {
          console.log('[CrossTabSync] Already processing event, skipping');
        }
        return;
      }

      processingEventRef.current = true;

      try {
        if (event.type === 'logout') {
          // Another tab logged out - sync logout in this tab
          if (isAuthenticated) {
            // Clear local state (without calling API since other tab already did)
            // Note: Don't call logout() from store to avoid infinite loop
            try {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('user');
              localStorage.removeItem('auth-storage'); // Clear Zustand persisted state
            } catch (error) {
              console.error('[CrossTabSync] Failed to clear localStorage:', error);
            }

            // Update store state
            setUser(null);
            setAccessToken(null);

            // Redirect to login if on a protected route
            const publicRoutes = ['/login', '/signup'];
            if (!publicRoutes.includes(location.pathname)) {
              // Use setTimeout to avoid navigation during render
              setTimeout(() => {
                navigate('/login?reason=logged_out_another_tab', { replace: true });
              }, 0);
            }
          }
        } else if (event.type === 'login') {
          // Another tab logged in - sync login in this tab
          if (!isAuthenticated) {
            // Get the current auth state from localStorage
            const authState = getAuthStateFromStorage();

            if (authState && authState.isAuthenticated && authState.user && authState.accessToken) {
              // Validate that we have required data
              const user = authState.user as User;

              if (!user.id || !user.email) {
                console.error('[CrossTabSync] Invalid user data in auth state');
                return;
              }

              // Update store state
              setUser(user);
              setAccessToken(authState.accessToken);

              // Redirect to home if on login/signup page
              const publicRoutes = ['/login', '/signup'];
              if (publicRoutes.includes(location.pathname)) {
                // Use setTimeout to avoid navigation during render
                setTimeout(() => {
                  navigate('/', { replace: true });
                }, 0);
              }
              // If on any other page, stay on current page
            } else {
              if (DEBUG) {
                console.warn('[CrossTabSync] Invalid or incomplete auth state:', authState);
              }
            }
          }
        }
      } catch (error) {
        console.error('[CrossTabSync] Error handling auth event:', error);
      } finally {
        // Reset processing flag after a small delay to prevent rapid re-triggers
        setTimeout(() => {
          processingEventRef.current = false;
        }, 50);
      }
    },
    [isAuthenticated, navigate, location, setUser, setAccessToken]
  );

  useEffect(() => {
    // Start listening for auth events from other tabs
    const cleanup = listenToAuthEvents(handleAuthEvent);

    // Cleanup listener on unmount
    return () => {
      cleanup();
      processingEventRef.current = false;
    };
  }, [handleAuthEvent]);

  // This component doesn't render anything
  return null;
}
