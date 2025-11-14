import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuthStore } from '@react-stack/shared-hooks';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingFallback from './components/LoadingFallback';
import { Header } from './components/Header';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { SessionProvider } from './contexts/SessionContext';
import { ActiveSessionsProvider } from './contexts/ActiveSessionsContext';
import { ActivityTracker } from './components/ActivityTracker';
import { SessionManager } from './components/SessionManager';
import { CrossDeviceAuthSync } from './components/CrossDeviceAuthSync';
import { CrossTabAuthSync } from './components/CrossTabAuthSync';
import { SessionExpiredListener } from './components/SessionExpiredListener';
import { ToastContainer } from '@react-stack/shared-ui';

// Lazy load remote MFEs
const Login = lazy(() => import('authApp/Login'));
const Signup = lazy(() => import('authApp/Signup'));
const Sessions = lazy(() => import('authApp/Sessions'));
const TodosREST = lazy(() => import('todosApp/TodosREST'));
const TodosGraphQL = lazy(() => import('todosApp/TodosGraphQL'));
const ChatInterface = lazy(() => import('chatbotApp/ChatInterface'));

// Authenticated Home Dashboard
const Home = () => {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Full Stack Todo App</h1>
          <p className="text-xl text-gray-600">React + TypeScript with REST API & GraphQL</p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* REST Card */}
          <Link
            to="/todos/rest"
            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-blue-500"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                <svg
                  className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span className="text-blue-600 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">REST API</h2>
            <p className="text-gray-600 mb-4">
              Traditional REST endpoints with React Query for data fetching, caching, and state
              management.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center text-sm text-gray-500">
                <svg
                  className="w-4 h-4 text-green-500 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                HTTP/2 endpoints
              </li>
              <li className="flex items-center text-sm text-gray-500">
                <svg
                  className="w-4 h-4 text-green-500 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                React Query caching
              </li>
              <li className="flex items-center text-sm text-gray-500">
                <svg
                  className="w-4 h-4 text-green-500 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Optimistic updates
              </li>
            </ul>
          </Link>

          {/* GraphQL Card */}
          <Link
            to="/todos/graphql"
            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-purple-500"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                <svg
                  className="w-8 h-8 text-purple-600 group-hover:text-white transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <span className="text-purple-600 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">GraphQL</h2>
            <p className="text-gray-600 mb-4">
              Modern GraphQL API with Apollo Client for efficient data fetching.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center text-sm text-gray-500">
                <svg
                  className="w-4 h-4 text-green-500 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Efficient queries
              </li>
              <li className="flex items-center text-sm text-gray-500">
                <svg
                  className="w-4 h-4 text-green-500 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Apollo Client cache
              </li>
              <li className="flex items-center text-sm text-gray-500">
                <svg
                  className="w-4 h-4 text-green-500 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Type-safe operations
              </li>
            </ul>
          </Link>
        </div>

        {/* Additional Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Sessions Card */}
          <Link
            to="/sessions"
            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-green-500"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-500 transition-colors">
                <svg
                  className="w-8 h-8 text-green-600 group-hover:text-white transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <span className="text-green-600 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Sessions</h2>
            <p className="text-gray-600 mb-4">
              View and manage your active sessions across all devices.
            </p>
          </Link>

          {/* Chat Card */}
          <Link
            to="/chat"
            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-yellow-500 relative opacity-60 cursor-not-allowed pointer-events-none"
          >
            <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
              COMING SOON
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">AI Chatbot</h2>
            <p className="text-gray-600 mb-4">
              AI-powered chatbot assistant (placeholder for future development).
            </p>
          </Link>
        </div>

        {/* Tech Stack */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Tech Stack</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">⚛️</span>
              </div>
              <p className="text-sm font-medium text-gray-700">React 19</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">📘</span>
              </div>
              <p className="text-sm font-medium text-gray-700">TypeScript</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">🚀</span>
              </div>
              <p className="text-sm font-medium text-gray-700">Apollo Client</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">🔄</span>
              </div>
              <p className="text-sm font-medium text-gray-700">React Query</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Built with Vite, Tailwind CSS, and Module Federation</p>
        </div>
      </div>
    </div>
  );
};

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
};

// Public Route wrapper
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/home" replace />;
  return <>{children}</>;
};

// App Content wrapper to access toast context
const AppContent = () => {
  const { isAuthenticated } = useAuthStore();
  const { toasts, removeToast } = useToast();

  return (
    <>
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Session Management Components */}
      <SessionExpiredListener />
      <CrossTabAuthSync />
      {isAuthenticated && (
        <>
          <CrossDeviceAuthSync />
          <ActivityTracker enabled={true} throttleInterval={30000} />
          <SessionManager enabled={true} warningThreshold={60000} />
        </>
      )}

      {/* App Content */}
      <Header />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route
            path="/"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sessions"
            element={
              <ProtectedRoute>
                <Sessions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/todos/rest"
            element={
              <ProtectedRoute>
                <TodosREST />
              </ProtectedRoute>
            }
          />
          <Route
            path="/todos/graphql"
            element={
              <ProtectedRoute>
                <TodosGraphQL />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatInterface />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <SessionProvider warningThreshold={60000}>
          <ActiveSessionsProvider>
            <AppContent />
          </ActiveSessionsProvider>
        </SessionProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
