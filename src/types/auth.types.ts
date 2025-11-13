/**
 * Authentication Types
 * Shared types between frontend and backend auth system
 */

export type Role = 'STARTER' | 'PRO';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: User;
    accessToken: string;
  };
}

export interface SessionInfo {
  lastActivityAt: Date | null;
  isExpired: boolean;
  timeRemainingMs: number;
  timeoutMs: number;
  timeRemainingMinutes: number;
}

export interface SessionResponse {
  success: boolean;
  data?: {
    session: SessionInfo;
  };
  message?: string;
  code?: string;
}
