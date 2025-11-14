export { apiClient, setAuthToken } from './api/client';
export { queryClient } from './queryClient';
export { apolloClient } from './apolloClient';
export * from './types';

// WebSocket
export {
  connectWebSocket,
  disconnectWebSocket,
  getSocket,
  isSocketConnected,
  emitEvent,
  onEvent,
  offEvent,
} from './websocket';

// Cross-tab sync
export {
  broadcastAuthEvent,
  listenToAuthEvents,
  getAuthStateFromStorage,
  hasAuthStateChanged,
  type AuthEvent,
  type AuthEventType,
} from './crossTabSync';

// Re-export User type from types
export type { User } from './types';
