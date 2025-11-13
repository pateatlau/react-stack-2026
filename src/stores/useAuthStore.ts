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
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login action
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(credentials);

          if (response.success && response.data) {
            const { user, accessToken } = response.data;

            // Store access token in localStorage (persisted)
            localStorage.setItem('accessToken', accessToken);

            set({
              user,
              accessToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            // Broadcast login event to other tabs
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
            throw new Error(response.message || 'Login failed');
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'An error occurred during login';
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      // Signup action
      signup: async (signupData: SignupData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.signup(signupData);

          if (response.success && response.data) {
            const { user, accessToken } = response.data;

            // Store access token
            localStorage.setItem('accessToken', accessToken);

            set({
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
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          throw error;
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

          set({
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

          set({
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
        set({ isLoading: true, error: null });
        try {
          const user = await authApi.getCurrentUser();

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user';
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Set user (for manual updates)
      setUser: (user: User | null) => set({ user, isAuthenticated: !!user }),

      // Set access token (for manual updates)
      setAccessToken: (token: string | null) => {
        if (token) {
          localStorage.setItem('accessToken', token);
        } else {
          localStorage.removeItem('accessToken');
        }
        set({ accessToken: token });
      },
    }),
    {
      name: 'auth-storage', // LocalStorage key
      partialize: (state) => ({
        // Only persist user and accessToken
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
