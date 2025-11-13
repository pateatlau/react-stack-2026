# Phase 3: Cross-Device Auth Sync - Testing Guide

## ✅ Prerequisites Verified

- ✅ Backend running on port 4000
- ✅ Frontend running on port 5173
- ✅ Database connected
- ✅ WebSocket server initialized
- ✅ Session cleanup cron job active (every 15 minutes)
- ✅ Sessions table exists in database

## 📋 Manual Testing Checklist

### Test 1: WebSocket Connection ✓

**Objective**: Verify WebSocket connects on login and disconnects on logout

**Steps**:

1. Open browser at http://localhost:5173
2. Open DevTools Console (F12)
3. Login with credentials:
   - Email: `test@example.com`
   - Password: `password123`
4. **Expected**: Console shows:
   ```
   [WebSocket] Connected to server
   [CrossDeviceSync] Connecting WebSocket...
   [CrossDeviceSync] WebSocket connected
   ```
5. Click "Logout" button
6. **Expected**: Console shows:
   ```
   [WebSocket] Disconnecting...
   [WebSocket] Disconnected: io client disconnect
   ```

**Status**: [ ] Pass / [ ] Fail

---

### Test 2: Session Creation ✓

**Objective**: Verify session is created in database with device info

**Steps**:

1. Login to the application
2. Open backend logs or database
3. **Expected**: New session created with:
   - `userId`: Your user ID
   - `sessionToken`: JWT access token
   - `deviceInfo`: Browser, OS, device type (from User-Agent)
   - `ipAddress`: Your IP (or ::1 for localhost)
   - `createdAt`, `lastActivity`, `expiresAt`: Timestamps
4. Verify in database:
   ```sql
   SELECT * FROM "Session" ORDER BY "createdAt" DESC LIMIT 1;
   ```

**Status**: [ ] Pass / [ ] Fail

---

### Test 3: Active Sessions Page Display ✓

**Objective**: Verify sessions page shows all active sessions correctly

**Steps**:

1. Login to application
2. Navigate to http://localhost:5173/settings/sessions
3. **Expected UI Elements**:
   - Header: "Active Sessions"
   - Description text
   - At least 1 session card with:
     - Device icon (💻 or 📱)
     - Browser icon (🔵 Chrome, 🟠 Firefox, 🔷 Safari, etc.)
     - Device name (e.g., "Desktop")
     - Browser name (e.g., "Chrome")
     - OS name (e.g., "macOS")
     - IP Address
     - "Last Active: X minutes ago"
     - "Created: X minutes ago"
     - Blue ring around current session
     - "Current" badge on current session
4. **Expected**: Current session has NO logout button
5. **Expected**: Refresh button at bottom

**Status**: [ ] Pass / [ ] Fail

---

### Test 4: Single Device Logout ✓

**Objective**: Verify logging out a specific device works across browsers

**Steps**:

1. **Browser A (Chrome)**: Login at http://localhost:5173
2. **Browser B (Firefox/Safari)**: Login with same credentials
3. **Browser A**: Navigate to /settings/sessions
4. **Expected**: See 2 sessions listed
5. **Browser A**: Click "Logout" button on Browser B's session
6. **Expected in Browser A**:
   - Toast: "Device logged out successfully"
   - Browser B session disappears from list
7. **Expected in Browser B**:
   - Toast: "This device was logged out remotely" (after 3 seconds)
   - Auto-redirected to /login
   - No longer authenticated

**Status**: [ ] Pass / [ ] Fail

---

### Test 5: Logout All Other Devices ✓

**Objective**: Verify "Logout All Other Devices" button works

**Steps**:

1. **Browser A**: Login
2. **Browser B**: Login with same credentials
3. **Browser C**: Login with same credentials
4. **Browser A**: Navigate to /settings/sessions
5. **Expected**: See 3 sessions
6. **Expected**: "Logout All Other Devices" button visible at top
7. **Browser A**: Click "Logout All Other Devices"
8. **Expected**: Confirmation dialog appears
9. Click "OK" to confirm
10. **Expected in Browser A**:
    - Toast: "All other devices logged out successfully"
    - Only 1 session remains (current session)
11. **Expected in Browser B & C**:
    - Toast: "You logged out from another device"
    - Auto-redirected to /login
    - No longer authenticated

**Status**: [ ] Pass / [ ] Fail

---

### Test 6: Session Expiration ✓

**Objective**: Verify sessions expire and cleanup job works

**Steps**:

1. **Setup**: Temporarily change backend .env:
   ```
   SESSION_LIFETIME_HOURS=0.0027  # ~10 seconds for testing
   SESSION_CLEANUP_SCHEDULE="*/1 * * * *"  # Every minute
   ```
2. Restart backend server
3. Login to application
4. Wait 10+ seconds
5. Wait for cleanup cron (up to 1 minute)
6. **Expected**:
   - Toast notification: "Your session expired"
   - Auto-redirected to /login
   - Session removed from database

**Note**: Remember to restore original values after testing!

**Status**: [ ] Pass / [ ] Fail

---

### Test 7: WebSocket Reconnection ✓

**Objective**: Verify WebSocket reconnects after network interruption

**Steps**:

1. Login to application
2. Open DevTools Console
3. Simulate network interruption:
   - DevTools → Network tab → Throttling → "Offline"
4. Wait 5 seconds
5. Re-enable network: Throttling → "No throttling"
6. **Expected**: Console shows:
   ```
   [WebSocket] Disconnected: transport close
   [WebSocket] Reconnected after X attempts
   ```

**Status**: [ ] Pass / [ ] Fail

---

### Test 8: Error Handling ✓

**Objective**: Verify graceful error handling

**Test 8a: Backend Offline**

1. Stop backend server
2. Try to navigate to /settings/sessions
3. **Expected**: Error message displayed: "Failed to fetch sessions"
4. Restart backend
5. Click "🔄 Refresh Sessions"
6. **Expected**: Sessions load successfully

**Test 8b: WebSocket Connection Failure**

1. Login to application
2. Backend WebSocket server crashes (simulate by commenting out `initializeWebSocket`)
3. **Expected**: Console shows connection errors but app remains functional
4. Sessions page should still work (API calls work without WebSocket)

**Test 8c: API Error**

1. Navigate to /settings/sessions
2. Try to logout a non-existent session (manually edit sessionId in DevTools)
3. **Expected**: Toast error: "Failed to logout device"
4. Page remains functional

**Status**: [ ] Pass / [ ] Fail

---

### Test 9: Cross-Tab Sync (Bonus) ✓

**Objective**: Verify cross-tab auth sync still works alongside cross-device sync

**Steps**:

1. Open Tab A at http://localhost:5173
2. Login
3. Open Tab B (same browser) at http://localhost:5173
4. **Expected**: Tab B automatically authenticated (existing feature)
5. Tab A: Click "Logout"
6. **Expected**: Both tabs logged out (existing feature + new WebSocket)

**Status**: [ ] Pass / [ ] Fail

---

### Test 10: Session Limit ✓

**Objective**: Verify max sessions per user limit works

**Steps**:

1. Login on 5 different browsers/devices
2. Navigate to /settings/sessions on any device
3. **Expected**: See exactly 5 sessions
4. Try to login on 6th device
5. **Expected**:
   - 6th login succeeds
   - Oldest session automatically deleted
   - Total sessions remains at 5
6. Check /settings/sessions
7. **Expected**: See 5 sessions (oldest one removed)

**Status**: [ ] Pass / [ ] Fail

---

## 🔍 Database Inspection Queries

```sql
-- View all sessions
SELECT
  id,
  "userId",
  LEFT("sessionToken", 20) as token_start,
  "deviceInfo"->>'browser' as browser,
  "deviceInfo"->>'os' as os,
  "ipAddress",
  "lastActivity",
  "createdAt"
FROM "Session"
ORDER BY "createdAt" DESC;

-- Count sessions per user
SELECT "userId", COUNT(*) as session_count
FROM "Session"
GROUP BY "userId";

-- Find expired sessions (should be cleaned up)
SELECT COUNT(*) as expired_sessions
FROM "Session"
WHERE "expiresAt" < NOW();

-- Check recent session activity
SELECT
  "userId",
  COUNT(*) as active_sessions,
  MAX("lastActivity") as most_recent_activity
FROM "Session"
WHERE "expiresAt" > NOW()
GROUP BY "userId";
```

---

## 🐛 Known Issues / Limitations

1. **Local Testing**: IP address shows as `::1` (localhost IPv6) instead of real IP
2. **Device Detection**: User-Agent parsing may not detect all device types accurately
3. **Session Cleanup**: Cron runs every 15 minutes, so expired sessions may persist briefly

---

## ✅ Success Criteria

Phase 3 is considered **PASSED** if:

- [x] Task 1: Backend configuration verified
- [ ] Task 2-3: Login creates session with WebSocket connection
- [ ] Task 4: Active Sessions page displays correctly
- [ ] Task 5: Single device logout works across browsers
- [ ] Task 6: Logout all devices works correctly
- [ ] Task 7: Session expiration triggers force-logout
- [ ] Task 8: Error handling is graceful (no crashes)

---

## 📝 Notes

- Backend URL: http://localhost:4000
- Frontend URL: http://localhost:5173
- WebSocket URL: ws://localhost:4000 (Socket.io handles this)
- Test Credentials: Check backend seed data or create new user
- Session Lifetime: 168 hours (7 days) in production config
- Max Sessions: 5 per user
- Cleanup Schedule: Every 15 minutes

---

## 🚀 Next Steps After Testing

1. Document any bugs found
2. Fix critical issues
3. Proceed to Phase 4: Polish & Optimization
4. Consider adding automated E2E tests with Playwright/Cypress
