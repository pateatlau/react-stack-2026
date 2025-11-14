/**
 * SessionExpiredListener Component
 * Listens for session-expired events from API client and triggers logout
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';

export function SessionExpiredListener() {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();
  const { warning } = useToast();

  useEffect(() => {
    const handleSessionExpired = async (e: Event) => {
      const customEvent = e as CustomEvent;

      if (!isAuthenticated) {
        return;
      }

      // Perform logout
      await logout();

      // Show notification
      warning('Your session expired due to inactivity. Please login again.', 8000);

      // Redirect to login
      navigate('/login?reason=session_expired', { replace: true });
    };

    // Listen for session-expired events from API client
    window.addEventListener('session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('session-expired', handleSessionExpired);
    };
  }, [logout, navigate, warning, isAuthenticated]);

  // This component doesn't render anything
  return null;
}
