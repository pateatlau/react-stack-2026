/**
 * Cross-Tab Sync Debug Utilities
 * Helpful functions for testing and debugging cross-tab synchronization
 * Only available in development mode
 */

import { broadcastAuthEvent } from './crossTabSync';

/**
 * Debug utilities namespace
 * Available in browser console as window.crossTabSyncDebug
 */
export const crossTabSyncDebug = {
  /**
   * Manually trigger a login event (for testing)
   */
  triggerLogin: () => {
    console.log('[CrossTabSyncDebug] Manually triggering login event');
    broadcastAuthEvent({
      type: 'login',
      timestamp: Date.now(),
      data: {
        user: { id: 'test', email: 'test@example.com', name: 'Test User', role: 'STARTER' },
        accessToken: 'test-token',
        isAuthenticated: true,
      },
    });
  },

  /**
   * Manually trigger a logout event (for testing)
   */
  triggerLogout: () => {
    console.log('[CrossTabSyncDebug] Manually triggering logout event');
    broadcastAuthEvent({
      type: 'logout',
      timestamp: Date.now(),
    });
  },

  /**
   * Check current auth state in localStorage
   */
  checkAuthState: () => {
    const authStorage = localStorage.getItem('auth-storage');
    const accessToken = localStorage.getItem('accessToken');
    const authEvent = localStorage.getItem('auth-event');

    console.log('[CrossTabSyncDebug] Current auth state:');
    console.log('- auth-storage:', authStorage ? JSON.parse(authStorage) : null);
    console.log('- accessToken:', accessToken);
    console.log('- auth-event:', authEvent ? JSON.parse(authEvent) : null);

    return {
      authStorage: authStorage ? JSON.parse(authStorage) : null,
      accessToken,
      authEvent: authEvent ? JSON.parse(authEvent) : null,
    };
  },

  /**
   * Clear all auth-related localStorage items
   */
  clearAuthState: () => {
    console.log('[CrossTabSyncDebug] Clearing all auth state');
    localStorage.removeItem('auth-storage');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('auth-event');
    console.log('[CrossTabSyncDebug] Auth state cleared');
  },

  /**
   * Monitor storage events in real-time
   */
  monitorStorageEvents: () => {
    console.log('[CrossTabSyncDebug] Monitoring storage events... (Press Ctrl+C to stop)');

    const handler = (e: StorageEvent) => {
      if (e.key === 'auth-event' || e.key === 'auth-storage' || e.key === 'accessToken') {
        console.log('[CrossTabSyncDebug] Storage event detected:');
        console.log('- Key:', e.key);
        console.log('- Old Value:', e.oldValue);
        console.log('- New Value:', e.newValue);
        console.log('- URL:', e.url);
      }
    };

    window.addEventListener('storage', handler);

    return () => {
      window.removeEventListener('storage', handler);
      console.log('[CrossTabSyncDebug] Stopped monitoring storage events');
    };
  },

  /**
   * Test localStorage availability
   */
  testLocalStorage: () => {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, 'test');
      const value = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);

      const isWorking = value === 'test';
      console.log(
        '[CrossTabSyncDebug] localStorage test:',
        isWorking ? '✅ Working' : '❌ Not working'
      );
      return isWorking;
    } catch (error) {
      console.error('[CrossTabSyncDebug] localStorage test failed:', error);
      return false;
    }
  },

  /**
   * Get help text
   */
  help: () => {
    console.log(`
[CrossTabSyncDebug] Available commands:

• triggerLogin()       - Manually trigger a login event
• triggerLogout()      - Manually trigger a logout event
• checkAuthState()     - View current auth state in localStorage
• clearAuthState()     - Clear all auth state
• monitorStorageEvents() - Monitor storage events in real-time
• testLocalStorage()   - Test if localStorage is working
• help()               - Show this help message

Example usage:
  window.crossTabSyncDebug.triggerLogin()
  window.crossTabSyncDebug.checkAuthState()
    `);
  },
};

// Make debug utilities available globally in development
if (import.meta.env.DEV) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).crossTabSyncDebug = crossTabSyncDebug;
  console.log(
    '[CrossTabSync] Debug utilities available at window.crossTabSyncDebug\n' +
      'Run window.crossTabSyncDebug.help() for available commands'
  );
}
