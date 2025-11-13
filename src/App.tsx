import { ApolloProvider } from '@apollo/client/react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { apolloClient } from './lib/apolloClient';
import TodoList from './components/TodoList';
import { TodoListGraphQL } from './components/graphql';
import { Home } from './components/Home';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { ActiveSessions } from './pages/ActiveSessions';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import { Header } from './components/Header';
import { NotFound } from './components/NotFound';
import { ToastContainer } from './components/Toast';
import { ActivityTracker } from './components/ActivityTracker';
import { SessionManager } from './components/SessionManager';
import { CrossTabAuthSync } from './components/CrossTabAuthSync';
import { CrossDeviceAuthSync } from './components/CrossDeviceAuthSync';
import { CrossTabSyncErrorBoundary } from './components/CrossTabSyncErrorBoundary';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { SessionProvider } from './contexts/SessionContext';
import { useAuth } from './hooks/useAuth';

function App() {
  return (
    <BrowserRouter>
      <ApolloProvider client={apolloClient}>
        <ToastProvider>
          <SessionProvider pollInterval={30000} warningThreshold={60000}>
            <AppContent />
          </SessionProvider>
        </ToastProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </ApolloProvider>
    </BrowserRouter>
  );
}

function AppContent() {
  const { toasts, removeToast } = useToast();
  const { isAuthenticated } = useAuth();

  return (
    <>
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Cross-Tab Auth Sync - Sync login/logout across tabs */}
      <CrossTabSyncErrorBoundary>
        <CrossTabAuthSync />
      </CrossTabSyncErrorBoundary>

      {/* Cross-Device Auth Sync - Sync login/logout across devices via WebSocket */}
      <CrossDeviceAuthSync />

      {/* Activity Tracker - Updates lastActivityAt on user interaction */}
      <ActivityTracker enabled={isAuthenticated} throttleInterval={30000} />

      {/* Session Manager - Auto-logout and warnings */}
      <SessionManager enabled={isAuthenticated} warningThreshold={60000} showExpiryToast={true} />

      <Header />
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          }
        />
        <Route
          path="/rest"
          element={
            <ProtectedRoute>
              <TodoList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/graphql"
          element={
            <ProtectedRoute requiredRole="PRO">
              <TodoListGraphQL />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/sessions"
          element={
            <ProtectedRoute>
              <ActiveSessions />
            </ProtectedRoute>
          }
        />
        {/* 404 - Catch all routes */}
        <Route
          path="*"
          element={isAuthenticated ? <NotFound /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </>
  );
}

export default App;
