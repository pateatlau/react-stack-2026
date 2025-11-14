import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@react-stack/shared-hooks';
import { Button } from '@react-stack/shared-ui';
import { LogOut, User, ListTodo, MessageSquare, Activity } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-blue-600">
                React Stack 2026
              </Link>
              <span className="ml-3 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                Micro Frontends
              </span>
            </div>

            {/* Navigation */}
            {isAuthenticated && user && (
              <nav className="flex items-center space-x-4">
                <Link
                  to="/sessions"
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/sessions')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Sessions
                </Link>
                <Link
                  to="/todos/rest"
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/todos/rest') || isActive('/todos/graphql')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ListTodo className="w-4 h-4 mr-2" />
                  Todos
                </Link>
                <Link
                  to="/chat"
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/chat')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">
                    Coming Soon
                  </span>
                </Link>

                {/* User menu */}
                <div className="flex items-center ml-4 pl-4 border-l border-gray-200">
                  <div className="flex items-center text-sm text-gray-700 mr-3">
                    <User className="w-4 h-4 mr-2" />
                    <span className="font-medium">{user.email}</span>
                    <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
                      {user.role}
                    </span>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </nav>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            React Stack 2026 - Micro Frontend Architecture
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
