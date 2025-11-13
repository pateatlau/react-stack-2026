/**
 * Active Sessions Page
 *
 * Displays all active sessions for the current user.
 * Allows users to view device information and logout specific devices.
 *
 * Features:
 * - List all active sessions with device details
 * - Show browser, OS, device type, IP, and last activity
 * - Mark current session with badge
 * - Logout individual devices
 * - Logout all other devices at once
 * - Auto-refresh sessions
 * - Responsive design
 */

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useActiveSessions } from '../contexts/ActiveSessionsContext';
import { useToast } from '../contexts/ToastContext';
import { SessionSkeletons } from '../components/SessionSkeleton';

export function ActiveSessions() {
  const {
    sessions,
    loading,
    error,
    currentSessionId,
    logoutDevice,
    logoutAllOtherDevices,
    refresh,
  } = useActiveSessions();
  const { success: showSuccess, error: showError } = useToast();
  const [logoutLoading, setLogoutLoading] = useState<string | null>(null);

  // Handle logout device
  const handleLogoutDevice = async (sessionId: string) => {
    try {
      setLogoutLoading(sessionId);
      await logoutDevice(sessionId);
      showSuccess('Device logged out successfully');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to logout device');
    } finally {
      setLogoutLoading(null);
    }
  };

  // Handle logout all other devices
  const handleLogoutAll = async () => {
    if (!confirm('Are you sure you want to logout all other devices?')) {
      return;
    }

    try {
      setLogoutLoading('all');
      await logoutAllOtherDevices();
      showSuccess('All other devices logged out successfully');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to logout all devices');
    } finally {
      setLogoutLoading(null);
    }
  };

  // Get device icon based on device type
  const getDeviceIcon = (deviceType?: string) => {
    if (!deviceType) return '💻';

    const type = deviceType.toLowerCase();
    if (type.includes('mobile') || type.includes('phone')) return '📱';
    if (type.includes('tablet')) return '📱';
    return '💻';
  };

  // Get browser icon
  const getBrowserIcon = (browser?: string) => {
    if (!browser) return '🌐';

    const b = browser.toLowerCase();
    if (b.includes('chrome')) return '🔵';
    if (b.includes('firefox')) return '🟠';
    if (b.includes('safari')) return '🔷';
    if (b.includes('edge')) return '🟦';
    return '🌐';
  };

  if (loading && sessions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Active Sessions
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your active sessions across different devices and browsers
            </p>
          </div>

          {/* Loading Skeletons */}
          <SessionSkeletons count={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 animate-in fade-in duration-300">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Active Sessions</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your active sessions across different devices and browsers
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-red-600 dark:text-red-400">⚠️</span>
              <p className="ml-3 text-red-800 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Logout All Button */}
        {sessions.length > 1 && (
          <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-500">
            <button
              onClick={handleLogoutAll}
              disabled={logoutLoading === 'all'}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            >
              {logoutLoading === 'all' ? 'Logging out...' : 'Logout All Other Devices'}
            </button>
          </div>
        )}

        {/* Sessions List */}
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center animate-in fade-in duration-500">
              <p className="text-gray-600 dark:text-gray-400">No active sessions found</p>
            </div>
          ) : (
            sessions.map((session, index) => {
              const isCurrentSession = session.sessionToken === currentSessionId;
              const deviceInfo = session.deviceInfo || {};

              return (
                <div
                  key={session.id}
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-in fade-in slide-in-from-bottom-4 transition-all duration-200 hover:shadow-lg ${
                    isCurrentSession ? 'ring-2 ring-blue-500' : ''
                  }`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'backwards',
                  }}
                >
                  <div className="flex items-start justify-between">
                    {/* Device Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">{getDeviceIcon(deviceInfo.device)}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            {deviceInfo.device || 'Unknown Device'}
                            {isCurrentSession && (
                              <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                                Current
                              </span>
                            )}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <span>{getBrowserIcon(deviceInfo.browser)}</span>
                            <span>{deviceInfo.browser || 'Unknown Browser'}</span>
                            <span>•</span>
                            <span>{deviceInfo.os || 'Unknown OS'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Additional Details */}
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        {session.ipAddress && (
                          <p>
                            <span className="font-medium">IP Address:</span> {session.ipAddress}
                          </p>
                        )}
                        <p>
                          <span className="font-medium">Last Active:</span>{' '}
                          {formatDistanceToNow(new Date(session.lastActivity), { addSuffix: true })}
                        </p>
                        <p>
                          <span className="font-medium">Created:</span>{' '}
                          {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>

                    {/* Logout Button */}
                    {!isCurrentSession && (
                      <button
                        onClick={() => handleLogoutDevice(session.id)}
                        disabled={logoutLoading === session.id}
                        className="ml-4 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                      >
                        {logoutLoading === session.id ? 'Logging out...' : 'Logout'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Refresh Button */}
        <div className="mt-6 text-center">
          <button
            onClick={refresh}
            disabled={loading}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium disabled:opacity-50 transition-all duration-200 hover:scale-110 active:scale-95"
          >
            {loading ? 'Refreshing...' : '🔄 Refresh Sessions'}
          </button>
        </div>
      </div>
    </div>
  );
}
