/**
 * Header Component
 * Global navigation header with user info, role badge, logout, and session timer
 */

import React from 'react';
import { Link, useLocation } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { useSession } from '../contexts/SessionContext';
import { useActiveSessions } from '../hooks/useActiveSessions';
import { LogOut, Clock, User } from 'lucide-react';

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const { timeRemainingMs, isExpired } = useSession();
  const { sessions } = useActiveSessions();

  const handleLogout = async () => {
    await logout();
  };

  // Calculate time remaining in seconds
  const timeRemaining = timeRemainingMs ? Math.floor(timeRemainingMs / 1000) : null;

  // Don't show header on login/signup pages
  if (location.pathname === '/login' || location.pathname === '/signup') {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Todo App</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Home
            </Link>
            <Link
              to="/rest"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/rest'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              REST API
            </Link>
            {user?.role === 'PRO' && (
              <Link
                to="/graphql"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/graphql'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                GraphQL
              </Link>
            )}
            <Link
              to="/settings/sessions"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                location.pathname === '/settings/sessions'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>Sessions</span>
              {sessions.length > 0 && (
                <span
                  className={`inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-xs font-semibold transition-colors ${
                    location.pathname === '/settings/sessions'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {sessions.length}
                </span>
              )}
            </Link>
          </nav>

          {/* User Info & Actions */}
          <div className="flex items-center gap-4">
            {/* Session Timer */}
            {!isExpired && timeRemaining && (
              <div
                className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md text-sm ${
                  timeRemaining <= 60
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : timeRemaining <= 120
                      ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                      : 'bg-gray-50 text-gray-600 border border-gray-200'
                }`}
                title="Session timeout"
              >
                <Clock className="w-4 h-4" />
                <span className="font-medium tabular-nums">
                  {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
                </span>
              </div>
            )}

            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-md border border-gray-200">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">{user?.name}</span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    user?.role === 'PRO'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {user?.role}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center gap-1 pb-3 border-t border-gray-100 pt-3 mt-2">
          <Link
            to="/"
            className={`flex-1 text-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              location.pathname === '/'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Home
          </Link>
          <Link
            to="/rest"
            className={`flex-1 text-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              location.pathname === '/rest'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            REST
          </Link>
          {user?.role === 'PRO' && (
            <Link
              to="/graphql"
              className={`flex-1 text-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/graphql'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              GraphQL
            </Link>
          )}
          <Link
            to="/settings/sessions"
            className={`flex-1 text-center px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
              location.pathname === '/settings/sessions'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span>Sessions</span>
            {sessions.length > 0 && (
              <span
                className={`inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-xs font-semibold transition-colors ${
                  location.pathname === '/settings/sessions'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {sessions.length}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
