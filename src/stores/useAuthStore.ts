/**
 * Authentication Store (Zustand)
 * Manages auth state, login/logout, and token management
 * Includes cross-tab/window synchronization for auth state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginCredentials, SignupData } from '../types/auth.types';
import * as authApi from '../lib/api/auth.api';
import { broadcastAuthEvent } from '../lib/crossTabSync';
import { disconnectWebSocket } from '../lib/websocket';

interface AuthState {
  // State
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (signupData: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  fetchUser: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      console.log('[AuthStore] Store initialized');

      // Wrap set to log all state changes
      const loggedSet: typeof set = (partial) => {
        console.log('[AuthStore] State update called with:', partial);
        const result = set(partial);
        console.log('[AuthStore] New state after update:', get());
        return result;
      };

      return {
        // Initial state
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Login action
        login: async (credentials: LoginCredentials) => {
          console.log('[AuthStore] LOGIN FUNCTION CALLED');
          console.log('[AuthStore] Login started, clearing error');
          console.log('[AuthStore] Setting isLoading: true, error: null (login)');
          console.trace();
          loggedSet({ isLoading: true, error: null });
          try {
            const response = await authApi.login(credentials);

            if (response.success && response.data) {
              const { user, accessToken } = response.data;

              // Store access token in localStorage (persisted)
              localStorage.setItem('accessToken', accessToken);

              console.log('[AuthStore] Login successful, clearing error');
              loggedSet({
                user,
                accessToken,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });
              // Broadcast login event to other tabs
              setTimeout(() => {
                broadcastAuthEvent({
                  type: 'login',
                  timestamp: Date.now(),
                  data: {
                    user,
                    accessToken,
                    isAuthenticated: true,
                  },
                });
              }, 50);
            } else {
              // Set error if login failed (no throw needed)
              const errorMessage = response.message || 'Login failed';
              console.log('[AuthStore] Login failed, setting error:', errorMessage);
              loggedSet({
                user: null,
                accessToken: null,
                isAuthenticated: false,
                isLoading: false,
                error: errorMessage,
              });
              console.log('[AuthStore] Error state set, current error:', get().error);
              return;
            }
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'An error occurred during login';
            console.log('[AuthStore] Login failed, setting error:', errorMessage);
            loggedSet({
              user: null,
              accessToken: null,
              isAuthenticated: false,
              isLoading: false,
              error: errorMessage,
            });
            console.log('[AuthStore] Error state set, current error:', get().error);
            // Don't throw - error is already in state for UI to display
          }
        },

        // Signup action
        signup: async (signupData: SignupData) => {
          console.log('[AuthStore] Setting isLoading: true, error: null (signup)');
          console.trace();
          loggedSet({ isLoading: true, error: null });
          try {
            const response = await authApi.signup(signupData);

            if (response.success && response.data) {
              const { user, accessToken } = response.data;

              // Store access token
              localStorage.setItem('accessToken', accessToken);

              loggedSet({
                user,
                accessToken,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });

              // Broadcast login event to other tabs (signup = auto-login)
              // Small delay to ensure Zustand persist middleware has written to localStorage
              setTimeout(() => {
                broadcastAuthEvent({
                  type: 'login',
                  timestamp: Date.now(),
                  data: {
                    user,
                    accessToken,
                    isAuthenticated: true,
                  },
                });
              }, 50);
            } else {
              throw new Error(response.message || 'Signup failed');
            }
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'An error occurred during signup';
            loggedSet({
              user: null,
              accessToken: null,
              isAuthenticated: false,
              isLoading: false,
              error: errorMessage,
            });
            // Don't throw - error is already in state for UI to display
          }
        },

        // Logout action
        logout: async () => {
          try {
            // Disconnect WebSocket FIRST to prevent stale token usage
            disconnectWebSocket();

            // Call backend to clear refresh token cookie and delete session
            await authApi.logout();
          } catch (error) {
            console.error('Logout error:', error);
            // Continue with local logout even if API call fails
          } finally {
            // Clear local state
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');

            loggedSet({
              user: null,
              accessToken: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });

            // Broadcast logout event to other tabs
            // Immediate broadcast is OK since we're clearing state, not setting it
            broadcastAuthEvent({
              type: 'logout',
              timestamp: Date.now(),
            });
          }
        },

        // Refresh access token
        refreshToken: async () => {
          try {
            const { accessToken } = await authApi.refreshAccessToken();

            localStorage.setItem('accessToken', accessToken);

            loggedSet({
              accessToken,
              error: null,
            });
          } catch (error) {
            // Refresh failed - logout
            await get().logout();
            throw error;
          }
        },

        // Fetch current user
        fetchUser: async () => {
          console.log('[AuthStore] Setting isLoading: true, error: null (fetchUser)');
          console.trace();
          loggedSet({ isLoading: true, error: null });
          try {
            const user = await authApi.getCurrentUser();

            loggedSet({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user';
            loggedSet({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: errorMessage,
            });
            throw error;
          }
        },

        // Clear error
        clearError: () => loggedSet({ error: null }),
        setError: (error: string) => {
          console.log('[AuthStore] setError called with:', error);
          loggedSet({ error });
        },

        // Set user (for manual updates)
        setUser: (user: User | null) => loggedSet({ user, isAuthenticated: !!user }),

        // Set access token (for manual updates)
        setAccessToken: (token: string | null) => {
          if (token) {
            localStorage.setItem('accessToken', token);
          } else {
            localStorage.removeItem('accessToken');
          }
          loggedSet({ accessToken: token });
        },
      };
    },
    {
      name: 'auth-storage', // LocalStorage key
      partialize: (state) => ({
        // Only persist user and accessToken
        // DO NOT persist error, isLoading - these are ephemeral
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
      // Merge strategy: only merge persisted fields, don't overwrite others
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as Partial<AuthState>),
      }),
    }
  )
);
