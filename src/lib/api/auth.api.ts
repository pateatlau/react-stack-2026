/**
 * Authentication API Client
 * Handles all auth-related API calls
 */

import { apiClient } from './client';
import type {
  LoginCredentials,
  SignupData,
  AuthResponse,
  User,
  SessionResponse,
} from '../../types/auth.types';

/**
 * Login with email and password
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
  return data;
}

/**
 * Signup / Register new user
 */
export async function signup(signupData: SignupData): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/api/auth/signup', signupData);
  return data;
}

/**
 * Logout user (clears refresh token cookie)
 */
export async function logout(): Promise<void> {
  await apiClient.post('/api/auth/logout');
}

/**
 * Refresh access token using refresh token cookie
 */
export async function refreshAccessToken(): Promise<{ accessToken: string }> {
  const { data } = await apiClient.post<{ success: boolean; data: { accessToken: string } }>(
    '/api/auth/refresh'
  );
  return data.data;
}

/**
 * Get current authenticated user info
 */
export async function getCurrentUser(): Promise<User> {
  const { data } = await apiClient.get<{ success: boolean; data: { user: User } }>('/api/auth/me');
  return data.data.user;
}

/**
 * Get current session status and time remaining
 */
export async function getSessionStatus(): Promise<SessionResponse> {
  const { data } = await apiClient.get<SessionResponse>('/api/auth/session');
  return data;
}
