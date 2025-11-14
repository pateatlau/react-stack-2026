/**
 * Header Component
 * Global navigation header with user info, role badge, logout, and session timer
 */

import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@react-stack/shared-hooks';
import { LogOut, Clock, User } from 'lucide-react';

export function Header() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const location = useLocation();
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Calculate session time remaining (mock implementation)
  useEffect(() => {
    if (!isAuthenticated) return;

    // Set initial time to 5 minutes (300 seconds)
    setTimeRemaining(300);

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 0) return null;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogout = async () => {
    logout();
    window.location.href = '/';
  };

  // Don't show header on login/signup pages
  if (
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/signup'
  ) {
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
          <Link to="/home" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Todo App</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/home"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/home'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Home
            </Link>
            <Link
              to="/todos/rest"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/todos/rest'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              REST API
            </Link>
            <Link
              to="/todos/graphql"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/todos/graphql'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              GraphQL
            </Link>
            <Link
              to="/sessions"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                location.pathname === '/sessions'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>Sessions</span>
            </Link>
            <Link
              to="/chat"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/chat'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Chat
            </Link>
          </nav>

          {/* User Info & Actions */}
          <div className="flex items-center gap-4">
            {/* Session Timer - Always show when authenticated */}
            {isAuthenticated && timeRemaining !== null && timeRemaining !== undefined && (
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
                <span className="text-sm font-medium text-gray-900">{user?.email || 'Guest'}</span>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                  USER
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
      </div>
    </header>
  );
}
