import React, { useEffect, useState } from 'react';
import { useSessionStore } from '@react-stack/shared-hooks';
import { Button, Card, CardContent, Badge } from '@react-stack/shared-ui';
import { apiClient } from '@react-stack/shared-utils';
import { format } from 'date-fns';
import { Monitor, Trash2 } from 'lucide-react';

const Sessions: React.FC = () => {
  const { sessions, setSessions, setLoading, setError, isLoading, error } = useSessionStore();
  const [terminatingId, setTerminatingId] = useState<string | null>(null);
  const [isLogoutAllPending, setIsLogoutAllPending] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get('/auth/sessions');
      if (response.data.success) {
        const sessionsData = Array.isArray(response.data.data)
          ? response.data.data
          : response.data.data?.sessions || [];
        setSessions(sessionsData);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleTerminate = async (sessionId: string) => {
    setTerminatingId(sessionId);

    try {
      const response = await apiClient.delete(`/auth/sessions/${sessionId}`);
      if (response.data.success) {
        await fetchSessions();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to terminate session');
    } finally {
      setTerminatingId(null);
    }
  };

  const handleLogoutAll = async () => {
    if (!confirm('Are you sure you want to logout all other devices?')) {
      return;
    }

    setIsLogoutAllPending(true);
    setError(null);

    try {
      const response = await apiClient.delete('/auth/sessions/all');
      if (response.data.success) {
        await fetchSessions();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to logout all devices');
    } finally {
      setIsLogoutAllPending(false);
    }
  };

  // Parse device name from user agent
  const getDeviceName = (deviceInfo?: any) => {
    if (!deviceInfo) return 'Unknown Device';

    // deviceInfo contains: browser, os, deviceType, userAgent
    const browser = deviceInfo.browser || 'Unknown Browser';
    const os = deviceInfo.os || 'Unknown OS';
    const deviceType = deviceInfo.deviceType || 'Desktop';

    return `${browser} on ${os} (${deviceType})`;
  };

  if (isLoading && sessions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Active Sessions</h1>
          <p className="mt-2 text-gray-600">Manage your active sessions across all devices</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Logout All Button */}
        {sessions.length > 1 && (
          <div className="mb-6">
            <button
              onClick={handleLogoutAll}
              disabled={isLogoutAllPending || terminatingId !== null}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed"
            >
              {isLogoutAllPending ? 'Logging out...' : 'Logout All Other Devices'}
            </button>
          </div>
        )}

        <div className="space-y-4">
          {sessions.map((session) => (
            <Card key={session.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Monitor className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {getDeviceName(session.deviceInfo)}
                        </h3>
                        {session.isCurrent && <Badge variant="success">Current</Badge>}
                        {session.isActive && !session.isCurrent && (
                          <Badge variant="default">Active</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">IP: {session.ipAddress}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Last active: {format(new Date(session.lastActivity), 'PPpp')}
                      </p>
                      <p className="text-sm text-gray-500">
                        Created: {format(new Date(session.createdAt), 'PPpp')}
                      </p>
                    </div>
                  </div>

                  {!session.isCurrent && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleTerminate(session.id)}
                      disabled={terminatingId === session.id}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {terminatingId === session.id ? 'Terminating...' : 'Terminate'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {sessions.length === 0 && !isLoading && (
            <Card>
              <CardContent className="p-12 text-center">
                <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions found</h3>
                <p className="text-gray-600">You don't have any active sessions at the moment.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sessions;
