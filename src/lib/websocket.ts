/**
 * WebSocket Connection Manager
 * Manages Socket.io client connection for cross-device auth sync
 */

import { io, Socket } from 'socket.io-client';

// Backend WebSocket URL
const WS_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Socket.io client instance
let socket: Socket | null = null;

/**
 * Connect to WebSocket server with authentication
 */
export function connectWebSocket(accessToken: string): Socket {
  // If already connected, return existing socket
  if (socket?.connected) {
    return socket;
  }

  // Disconnect existing socket if any
  if (socket) {
    socket.disconnect();
  }

  // Create new socket connection
  socket = io(WS_URL, {
    auth: {
      token: accessToken,
    },
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
    transports: ['polling', 'websocket'], // Start with polling, upgrade to WebSocket after auth
    upgrade: true, // Allow upgrade to WebSocket if available
    rememberUpgrade: false, // Don't remember the upgrade for next connection
    forceNew: false,
  });

  // Setup heartbeat
  let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  socket.on('connect', () => {
    console.log('[WebSocket] Connected to server');

    // Start heartbeat (every 30 seconds)
    heartbeatInterval = setInterval(() => {
      socket?.emit('ping');
    }, 30000);
  });

  socket.on('disconnect', (reason) => {
    console.log('[WebSocket] Disconnected:', reason);

    // Clear heartbeat
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  });

  socket.on('pong', () => {
    // Heartbeat response received
    console.debug('[WebSocket] Heartbeat pong received');
  });

  socket.on('connect_error', (error) => {
    console.error('[WebSocket] Connection error:', error.message);
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log('[WebSocket] Reconnected after', attemptNumber, 'attempts');
  });

  socket.on('reconnect_error', (error) => {
    console.error('[WebSocket] Reconnection error:', error.message);
  });

  socket.on('reconnect_failed', () => {
    console.error('[WebSocket] Reconnection failed after all attempts');
  });

  // Connect to server
  socket.connect();

  return socket;
}

/**
 * Disconnect from WebSocket server
 */
export function disconnectWebSocket(): void {
  if (socket) {
    console.log('[WebSocket] Disconnecting...');
    socket.disconnect();
    socket = null;
  }
}

/**
 * Get current socket instance
 */
export function getSocket(): Socket | null {
  return socket;
}

/**
 * Check if socket is connected
 */
export function isSocketConnected(): boolean {
  return socket?.connected || false;
}

/**
 * Emit event to server
 */
export function emitEvent(event: string, data?: unknown): void {
  if (socket?.connected) {
    socket.emit(event, data);
  } else {
    console.warn('[WebSocket] Cannot emit event - socket not connected');
  }
}

/**
 * Listen to server event
 */
export function onEvent(event: string, handler: (...args: unknown[]) => void): void {
  socket?.on(event, handler);
}

/**
 * Remove event listener
 */
export function offEvent(event: string, handler?: (...args: unknown[]) => void): void {
  if (handler) {
    socket?.off(event, handler);
  } else {
    socket?.off(event);
  }
}
