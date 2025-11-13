# Cross-Tab Authentication Synchronization

## Overview

The authentication system now includes **automatic cross-tab/window synchronization**. When a user logs in or out in one browser tab, all other tabs and windows are automatically updated without requiring a manual refresh.

## Features

### 1. **Automatic Logout Sync**

- When a user logs out in Tab A, Tab B automatically logs out
- Works for manual logout (clicking logout button)
- Works for automatic logout (session timeout)
- User is redirected to login page in all tabs

### 2. **Automatic Login Sync**

- When a user logs in in Tab A, Tab B automatically logs in
- The authenticated state is synced across all tabs
- Tab A: Redirected to home page (`/`)
- Tab B: Stays on current page (unless on login/signup, then redirects to home)

### 3. **Session Timeout Sync**

- When a session expires in one tab, all tabs are logged out
- Session expiry warnings are shown in all active tabs
- All tabs redirect to login page with appropriate message

## Implementation

### Architecture

The cross-tab sync system uses the Browser Storage API's `storage` event:

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Tab A                          Tab B                   │
│  ┌──────────┐                   ┌──────────┐           │
│  │  Login   │                   │  Home    │           │
│  │  Button  │                   │  Page    │           │
│  └────┬─────┘                   └────▲─────┘           │
│       │                              │                  │
│       │ 1. User logs in              │                  │
│       ▼                              │                  │
│  ┌────────────┐                      │                  │
│  │ authStore  │                      │                  │
│  │  .login()  │                      │                  │
│  └────┬───────┘                      │                  │
│       │                              │                  │
│       │ 2. Broadcast event           │                  │
│       ▼                              │                  │
│  ┌──────────────────┐                │                  │
│  │  localStorage    │                │                  │
│  │  'auth-event'    │ ───────────────┼─────────────┐   │
│  │  { type: login } │                │             │   │
│  └──────────────────┘                │             │   │
│                                       │             │   │
│                           3. storage  │             │   │
│                              event    │             │   │
│                                       │             │   │
│                              ┌────────▼─────────┐   │   │
│                              │ CrossTabAuthSync │   │   │
│                              │   Component      │   │   │
│                              └────────┬─────────┘   │   │
│                                       │             │   │
│                          4. Sync auth │             │   │
│                             state     │             │   │
│                                       │             │   │
│                              ┌────────▼─────────┐   │   │
│                              │   authStore      │   │   │
│                              │  .setUser()      │   │   │
│                              │  .setAccessToken │   │   │
│                              └──────────────────┘   │   │
│                                                     │   │
└─────────────────────────────────────────────────────┘   │
                                                          │
                                                          │
  Tab C (also gets synced)                                │
  ┌──────────────────────────────────────────────────┐   │
  │  ┌────────────────────────────────────────┐      │   │
  │  │ CrossTabAuthSync listens for events ───┼──────┘   │
  │  └────────────────────────────────────────┘          │
  └──────────────────────────────────────────────────────┘
```

### Core Components

#### 1. **crossTabSync.ts** - Event Broadcasting Utility

Located at: `src/lib/crossTabSync.ts`

**Key Functions:**

- `broadcastAuthEvent()` - Broadcasts login/logout events to other tabs
- `listenToAuthEvents()` - Listens for events from other tabs
- `getAuthStateFromStorage()` - Retrieves current auth state from localStorage

**How it works:**

- Uses `localStorage.setItem()` to trigger `storage` events in other tabs
- Only the tab that wrote the value receives no event (prevents self-sync)
- Events are time-stamped and validated to prevent stale events

#### 2. **useAuthStore.ts** - Enhanced Auth Store

Located at: `src/stores/useAuthStore.ts`

**Changes:**

- `login()` - Now broadcasts login event after successful authentication
- `signup()` - Now broadcasts login event after successful registration
- `logout()` - Now broadcasts logout event after clearing state

#### 3. **CrossTabAuthSync.tsx** - Sync Component

Located at: `src/components/CrossTabAuthSync.tsx`

**Responsibilities:**

- Listens for auth events from other tabs
- Updates local auth state when events are received
- Handles navigation (redirects) based on current location
- Manages race conditions and edge cases

**Event Handlers:**

- **Logout Event**: Clears auth state, redirects to `/login`
- **Login Event**: Sets auth state from localStorage, redirects to `/` if on login/signup

#### 4. **App.tsx** - Integration Point

The `CrossTabAuthSync` component is integrated into the app:

```tsx
<CrossTabAuthSync />
```

Placed alongside other global components like `SessionManager` and `ActivityTracker`.

## Testing Guide

### Manual Testing Scenarios

#### Test 1: Logout from One Tab

1. Open the app in **Tab A** and **Tab B**
2. Log in as any user in both tabs
3. In **Tab A**, click the logout button
4. **Expected Result:**
   - Tab A: Redirected to `/login`
   - Tab B: Automatically logs out and redirects to `/login`

#### Test 2: Session Timeout Logout

1. Open the app in **Tab A** and **Tab B**
2. Log in and wait for session to expire (5 minutes of inactivity)
3. **Expected Result:**
   - Both tabs show session expiry warning at 1 minute remaining
   - Both tabs automatically log out after 5 minutes
   - Both tabs redirect to `/login?reason=session_expired`

#### Test 3: Login from One Tab

1. Open the app in **Tab A** (logged out) on `/login`
2. Open the app in **Tab B** (logged out) on `/login`
3. In **Tab A**, log in with valid credentials
4. **Expected Result:**
   - Tab A: Redirected to home page (`/`)
   - Tab B: Automatically logs in and redirects to home page (`/`)

#### Test 4: Login While on Different Pages

1. **Tab A**: Log in and navigate to `/rest` page
2. **Tab B**: Logged out, on home page
3. Log out from **Tab A**
4. **Expected Result:**
   - Tab A: Redirected to `/login`
   - Tab B: Redirected to `/login`
5. Log in from **Tab A**
6. **Expected Result:**
   - Tab A: Redirected to `/` (home)
   - Tab B: Stays on home page, now authenticated

#### Test 5: Multiple Tabs (3+)

1. Open the app in **Tabs A, B, and C**
2. Log in from **Tab A**
3. **Expected Result:**
   - All tabs (A, B, C) are logged in
4. Log out from **Tab B**
5. **Expected Result:**
   - All tabs (A, B, C) are logged out

#### Test 6: New Window (not just tab)

1. Open the app in a browser window
2. Log in
3. Open a **new browser window** (not a new tab)
4. Navigate to the app URL in the new window
5. **Expected Result:**
   - New window is automatically logged in (state synced via localStorage)
6. Log out from the original window
7. **Expected Result:**
   - New window automatically logs out

## Technical Details

### Storage Event Behavior

The `storage` event has specific behavior:

- **Only fired in OTHER tabs/windows**, not the current tab
- **Requires the same origin** (protocol + domain + port)
- **Works across regular windows and incognito windows** (separate storage)

### Why Not Use Broadcast Channel API?

The `storage` event was chosen over `BroadcastChannel` API because:

1. **Better browser support** - Works in all modern browsers
2. **Persistent state** - Auth state is already in localStorage
3. **Simpler implementation** - No need for separate channel management
4. **Automatic cleanup** - Events are fire-and-forget

### Race Conditions Handled

#### 1. **Rapid Login/Logout**

- Events are timestamped
- Stale events (>5 seconds old) are ignored

#### 2. **Multiple Tabs Logging In**

- Each tab broadcasts its own event
- State is synced from localStorage (single source of truth)
- Last write wins

#### 3. **Session Timeout During Login**

- Session timeout broadcasts logout event
- Login can proceed, will override logout state

## Debugging

### Enable Debug Logging

Add console logs to track sync events:

```tsx
// In CrossTabAuthSync.tsx
const handleAuthEvent = (event: AuthEvent) => {
  console.log('[CrossTabSync] Received event:', event);
  // ... rest of handler
};
```

### Check localStorage

You can inspect auth events in browser DevTools:

```javascript
// In browser console
localStorage.getItem('auth-event');
localStorage.getItem('auth-storage');
```

### Monitor Storage Events

Add a global listener to see all storage events:

```javascript
window.addEventListener('storage', (e) => {
  console.log('Storage event:', e.key, e.newValue);
});
```

## Limitations

1. **Same Browser Only** - Sync only works across tabs/windows in the same browser
2. **Same Origin** - Must be the same protocol, domain, and port
3. **localStorage Dependency** - Requires localStorage to be enabled
4. **No Cross-Device Sync** - Cannot sync between different devices/computers

## Future Enhancements

Potential improvements for future versions:

1. **WebSocket-Based Sync** - Real-time sync across devices using WebSocket
2. **Server-Side Session Management** - Centralized session tracking
3. **Token Revocation** - Immediate token invalidation on logout
4. **Conflict Resolution** - Better handling of simultaneous login/logout
5. **Sync Status Indicator** - UI indicator showing sync status

## Troubleshooting

### Issue: Tabs not syncing

**Possible Causes:**

1. localStorage is disabled (private browsing mode)
2. Different domains/ports (e.g., localhost:5173 vs localhost:5174)
3. Browser extensions blocking storage events

**Solutions:**

- Check browser console for errors
- Verify localStorage is enabled: `localStorage.setItem('test', '1')`
- Ensure all tabs are on the same origin

### Issue: Multiple redirects

**Possible Cause:** Redirect loop due to navigation logic

**Solution:** Check `CrossTabAuthSync.tsx` navigation logic and ensure proper guards

### Issue: State desync

**Possible Cause:** Race condition or localStorage corruption

**Solution:**

1. Clear localStorage: `localStorage.clear()`
2. Hard refresh all tabs
3. Log in again

## Security Considerations

1. **No Sensitive Data in Events** - Auth events only contain metadata, not passwords
2. **Same-Origin Policy** - Storage events only fire for same origin
3. **Token Validation** - Tokens are still validated on the backend
4. **No Additional Attack Surface** - Uses existing localStorage storage

## Performance

- **Minimal Overhead** - Event listeners are passive
- **No Polling** - Event-driven, no continuous checking
- **Fast Sync** - Near-instantaneous (<50ms) event propagation
- **Low Memory** - Single event listener per tab

## Browser Compatibility

- ✅ Chrome/Edge (all versions)
- ✅ Firefox (all versions)
- ✅ Safari (all versions)
- ✅ Opera (all versions)
- ❌ IE11 (not supported due to Vite)

## Summary

Cross-tab auth sync provides a seamless authentication experience across multiple browser tabs and windows. Users can log in or out from any tab and see the change reflected everywhere instantly, without manual refresh.

**Key Benefits:**

- Improved user experience
- Consistent auth state across tabs
- Automatic session timeout sync
- No configuration required

**Implementation:** Fully transparent to the user, works automatically with existing auth system.
