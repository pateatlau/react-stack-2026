/**
 * CrossDeviceAuthSync Component
 *
 * Manages cross-device authentication synchronization via WebSocket.
 * When a user logs out from one device/browser, this component ensures
 * all other active sessions are immediately terminated by listening to
 * WebSocket events from the backend.
 *
 * Features:
 * - Listens for force-logout events from the backend
 * - Disconnects WebSocket and logs out the user when forced logout is received
 * - Shows toast notification explaining the logout reason
 * - Handles session expiration and remote logout scenarios
 */

import { useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { useToast } from '../contexts/ToastContext';
import { connectWebSocket, disconnectWebSocket } from '../lib/websocket';

const DEBUG = import.meta.env.DEV;
const LOGOUT_DELAY = 3000; // 3 seconds grace period

// Force logout event data from backend
interface ForceLogoutData {
  reason: 'user-initiated' | 'remote-logout' | 'session-expired' | 'security';
  message: string;
  timestamp: number;
  targetSessionId?: string; // If present, only this session should logout
  excludeSessionToken?: string; // If present, this session should NOT logout
}

export function CrossDeviceAuthSync() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, accessToken, logout } = useAuthStore();
  const { error: showToast } = useToast();
  const processingLogoutRef = useRef(false);
  const currentSessionIdRef = useRef<string | null>(null);

  const handleForceLogout = useCallback(
    (data: ForceLogoutData) => {
      if (processingLogoutRef.current) {
        if (DEBUG) {
          console.log('[CrossDeviceSync] Already processing logout, skipping');
        }
        return;
      }

      console.log('[CrossDeviceSync] Force logout received:', data);
      console.log('[CrossDeviceSync] Current access token:', accessToken?.substring(0, 30) + '...');

      // If excludeSessionToken is specified, skip logout if it matches our session
      if (data.excludeSessionToken) {
        const currentSessionId = accessToken;

        console.log(
          '[CrossDeviceSync] Exclude token present:',
          data.excludeSessionToken.substring(0, 30) + '...'
        );
        console.log(
          '[CrossDeviceSync] Tokens match?',
          currentSessionId === data.excludeSessionToken
        );

        if (currentSessionId === data.excludeSessionToken) {
          console.log('[CrossDeviceSync] This session is excluded from logout, ignoring');
          return;
        }
      }

      // If targetSessionId is specified, check if it matches our session
      if (data.targetSessionId) {
        // Get current session ID from access token (it's the same)
        const currentSessionId = accessToken;

        if (currentSessionId !== data.targetSessionId) {
          if (DEBUG) {
            console.log('[CrossDeviceSync] Logout not for this session, ignoring');
          }
          return;
        }

        if (DEBUG) {
          console.log('[CrossDeviceSync] Logout targets this session');
        }
      }

      processingLogoutRef.current = true;

      // Show notification
      const messages: Record<ForceLogoutData['reason'], string> = {
        'user-initiated': 'You logged out from another device',
        'remote-logout': 'This device was logged out remotely',
        'session-expired': 'Your session expired',
        security: 'Logged out for security reasons',
      };

      const toastMessage = messages[data.reason] || data.message;

      showToast(toastMessage, LOGOUT_DELAY);

      // Delay logout to let user save work or see the message
      setTimeout(() => {
        // Perform logout
        logout();

        // Disconnect WebSocket
        disconnectWebSocket();

        // Navigate to login if not already there
        const publicRoutes = ['/login', '/signup'];
        if (!publicRoutes.includes(location.pathname)) {
          navigate('/login?reason=logged_out_another_device', { replace: true });
        }

        processingLogoutRef.current = false;
      }, LOGOUT_DELAY);
    },
    [accessToken, logout, navigate, location, showToast]
  );

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      // Not authenticated, no need to connect
      return;
    }

    if (DEBUG) {
      console.log('[CrossDeviceSync] Connecting WebSocket...');
    }

    // Connect to WebSocket server
    const socket = connectWebSocket(accessToken);

    // Store current session ID (same as access token)
    currentSessionIdRef.current = accessToken;

    // Listen for force-logout events
    socket.on('force-logout', handleForceLogout);

    // Handle connection events
    socket.on('connect', () => {
      if (DEBUG) {
        console.log('[CrossDeviceSync] WebSocket connected');
      }
    });

    socket.on('disconnect', (reason) => {
      if (DEBUG) {
        console.log('[CrossDeviceSync] WebSocket disconnected:', reason);
      }
    });

    socket.on('connect_error', (error) => {
      console.error('[CrossDeviceSync] WebSocket connection error:', error.message);
    });

    // Cleanup on unmount or when auth state changes
    return () => {
      if (DEBUG) {
        console.log('[CrossDeviceSync] Cleaning up WebSocket listeners');
      }

      socket.off('force-logout', handleForceLogout);
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');

      // Don't disconnect here - let logout handle it
      // This allows reconnection if user is still authenticated
    };
  }, [isAuthenticated, accessToken, handleForceLogout]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (!isAuthenticated) {
        disconnectWebSocket();
      }
    };
  }, [isAuthenticated]);

  // This component doesn't render anything
  return null;
}
