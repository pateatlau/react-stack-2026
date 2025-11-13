# Cross-Tab Authentication Sync - Testing Guide

## Quick Test Instructions

### Test 1: Basic Logout Sync (30 seconds)

**Setup:**

1. Open app in **Tab A**: `http://localhost:5173`
2. Open app in **Tab B**: `http://localhost:5173`
3. Log in as any user in both tabs

**Test Steps:**

1. In **Tab A**, click the **Logout** button in the header
2. Switch to **Tab B**

**Expected Result:**

- ✅ Tab B automatically logs out (no refresh needed)
- ✅ Tab B shows login page
- ✅ Both tabs display "logged out" state

---

### Test 2: Basic Login Sync (30 seconds)

**Setup:**

1. Ensure both **Tab A** and **Tab B** are logged out
2. Both tabs should show the login page

**Test Steps:**

1. In **Tab A**, enter credentials and click **Login**
2. Wait for redirect to home page
3. Switch to **Tab B**

**Expected Result:**

- ✅ Tab B automatically logs in (no refresh needed)
- ✅ Tab B redirects to home page
- ✅ Both tabs show authenticated state with user name in header

---

### Test 3: Session Timeout Sync (6 minutes)

**Setup:**

1. Open app in **Tab A** and **Tab B**
2. Log in as any user in both tabs

**Test Steps:**

1. Do NOT interact with either tab for 5 minutes
2. Watch for session warnings at 4-minute mark

**Expected Result:**

- ✅ At 4 minutes: Both tabs show "Your session will expire in 60 seconds" warning
- ✅ At 5 minutes: Both tabs automatically log out
- ✅ Both tabs redirect to login page with "session_expired" message

---

### Test 4: Login While on Different Pages (1 minute)

**Setup:**

1. **Tab A**: Go to login page (`/login`)
2. **Tab B**: Go to home page (`/`) - will redirect to login since not authenticated

**Test Steps:**

1. In **Tab A**, log in successfully
2. Immediately switch to **Tab B** (before auto-redirect)

**Expected Result:**

- ✅ Tab A: Redirects to home page (`/`)
- ✅ Tab B: Also automatically logs in and redirects to home page
- ✅ Both tabs show authenticated state

---

### Test 5: Multiple Tabs (3+ tabs) (1 minute)

**Setup:**

1. Open app in **Tabs A, B, and C**
2. Ensure all tabs are logged out

**Test Steps:**

1. In **Tab A**, log in
2. Wait for all tabs to sync
3. Switch to **Tab B**
4. In **Tab B**, click logout

**Expected Result:**

- ✅ After step 1: All tabs (A, B, C) are logged in
- ✅ After step 4: All tabs (A, B, C) are logged out
- ✅ All tabs redirect to login page

---

### Test 6: New Window Sync (1 minute)

**Setup:**

1. Open app in a browser window
2. Log in

**Test Steps:**

1. Open a **new browser window** (Cmd+N on Mac, Ctrl+N on Windows)
2. Navigate to app URL: `http://localhost:5173`
3. The new window should be automatically logged in (state from localStorage)

**Test Steps (Continued):** 4. In the **original window**, click logout 5. Switch to the **new window**

**Expected Result:**

- ✅ New window starts authenticated (no login required)
- ✅ New window automatically logs out when original window logs out
- ✅ Both windows redirect to login page

---

### Test 7: Rapid Login/Logout (30 seconds)

**Setup:**

1. Open app in **Tab A** and **Tab B**
2. Both tabs logged out

**Test Steps:**

1. In **Tab A**, log in
2. Immediately (within 1 second), in **Tab B**, refresh the page
3. Wait 2 seconds
4. In **Tab A**, log out
5. Immediately switch to **Tab B**

**Expected Result:**

- ✅ Tab B syncs to logged-in state after step 3
- ✅ Tab B syncs to logged-out state after step 5
- ✅ No errors or race conditions
- ✅ Final state: Both tabs logged out

---

## Expected Behaviors Summary

### On Logout (any tab):

- ✅ All other tabs automatically log out
- ✅ All tabs clear auth state
- ✅ All tabs redirect to `/login`
- ✅ No manual refresh required

### On Login (any tab):

- ✅ All other tabs automatically log in
- ✅ All tabs set auth state with user data
- ✅ Tabs on login/signup pages → redirect to home
- ✅ Tabs on other pages → stay on current page (now authenticated)
- ✅ No manual refresh required

### On Session Timeout:

- ✅ All tabs show warning at 1 minute remaining
- ✅ All tabs automatically log out at 5 minutes
- ✅ All tabs redirect to login with "session_expired" reason
- ✅ Session state synced across all tabs

---

## Debug Checklist

If syncing is NOT working:

### Check Browser Console

Open DevTools (F12) and look for:

```
[CrossTabSync] Received auth event: login
[CrossTabSync] Received auth event: logout
[CrossTabSync] Syncing login from another tab
[CrossTabSync] Syncing logout from another tab
```

### Check localStorage

In browser console:

```javascript
// Check auth state
localStorage.getItem('auth-storage');

// Check auth events (will be empty most of the time)
localStorage.getItem('auth-event');

// Test storage access
localStorage.setItem('test', '1');
localStorage.getItem('test'); // Should return '1'
```

### Common Issues

1. **localStorage disabled**: Check if in private/incognito mode
2. **Different ports**: Ensure all tabs use same URL (localhost:5173)
3. **Browser extensions**: Disable ad blockers or privacy extensions temporarily
4. **CORS errors**: Check backend is running on port 4000

### Monitor Storage Events

Add this to console to see all storage events:

```javascript
window.addEventListener('storage', (e) => {
  console.log('Storage event:', {
    key: e.key,
    newValue: e.newValue,
    oldValue: e.oldValue,
    url: e.url,
  });
});
```

---

## Performance Check

Sync should be near-instantaneous:

- ✅ **<50ms** - Event propagation time
- ✅ **<100ms** - State update and re-render
- ✅ **<200ms** - Total time from action to sync

If sync takes longer than 500ms, check:

1. CPU throttling in DevTools
2. Slow localStorage (browser issue)
3. JavaScript errors blocking execution

---

## Browser Compatibility Test

Test in multiple browsers:

- ✅ Chrome/Edge (primary)
- ✅ Firefox
- ✅ Safari (Mac only)
- ✅ Brave
- ✅ Opera

Expected: Works in all modern browsers

---

## Manual Testing Checklist

Use this checklist when testing:

- [ ] Test 1: Basic Logout Sync
- [ ] Test 2: Basic Login Sync
- [ ] Test 3: Session Timeout Sync
- [ ] Test 4: Login While on Different Pages
- [ ] Test 5: Multiple Tabs (3+)
- [ ] Test 6: New Window Sync
- [ ] Test 7: Rapid Login/Logout

**All tests passed?** ✅ Cross-tab sync is working correctly!

**Any test failed?** ❌ Check debug steps above or review code in:

- `src/lib/crossTabSync.ts`
- `src/components/CrossTabAuthSync.tsx`
- `src/stores/useAuthStore.ts`
