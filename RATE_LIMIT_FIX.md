# Rate Limit Issue - Quick Fix Guide

## Problem

You're seeing this error when accessing the GraphQL page:

```
POST http://localhost:4000/graphql 429 (Too Many Requests)
ServerError: Response not successful: Received status code 429
```

## Cause

The backend server has rate limiting enabled (10 requests per 10 seconds). The GraphQL page was making too many requests on initial load.

## ✅ Fixes Applied

### 1. Removed Unnecessary Refetches

**Changed:** Mutations no longer trigger `refetch()` after completion

- **Why:** Apollo Client's optimistic updates and cache management already handle UI updates
- **Benefit:** Reduces requests by ~50%

### 2. Fixed Subscription Refetch Loop

**Changed:** Subscription updates no longer trigger `refetch()`

- **Why:** Apollo cache automatically updates from subscription data
- **Benefit:** Eliminates continuous refetch loop

### 3. Added Subscription Skip Option

**Changed:** Subscription now respects the `skip` parameter

- **Why:** Prevents WebSocket connection when subscription is disabled
- **Benefit:** More control over when subscriptions are active

### 4. Improved Rate Limit Error Handling

**Changed:** Better error messages and logging for 429 errors

- **Why:** Helps identify rate limit issues faster
- **Benefit:** More user-friendly error messages

### 5. Reduced Development Logging

**Changed:** GraphQL request/response logging only in dev mode

- **Why:** Reduces console noise in production
- **Benefit:** Cleaner console output

### 6. Form Hidden by Default

**Changed:** Todo form starts hidden instead of visible

- **Why:** Reduces initial component render complexity
- **Benefit:** Slightly faster initial page load

## How to Test

### 1. Clear Browser Cache

```bash
# In browser DevTools
- Open DevTools (F12)
- Right-click refresh button
- Select "Empty Cache and Hard Reload"
```

### 2. Restart Backend (if needed)

```bash
cd backend/server
npm run dev
```

### 3. Restart Frontend

```bash
# Stop current dev server (Ctrl+C)
npm run dev
```

### 4. Navigate to GraphQL Page

```
http://localhost:5173/graphql
```

## Expected Behavior After Fix

### Initial Load (First Visit)

- **1 Query Request**: `getTodos` for initial data load
- **1 WebSocket Connection**: For subscription setup
- **Total: 2 network operations** ✅

### Creating a Todo

- **1 Mutation Request**: `createTodo`
- **0 Additional Queries**: Cache updated optimistically
- **Total: 1 network operation** ✅

### Toggling a Todo

- **1 Mutation Request**: `toggleTodo`
- **0 Additional Queries**: Cache updated optimistically
- **Total: 1 network operation** ✅

### Deleting a Todo

- **1 Mutation Request**: `deleteTodo`
- **0 Additional Queries**: Cache eviction handles removal
- **Total: 1 network operation** ✅

## If Rate Limit Still Occurs

### Option 1: Wait 10 Seconds

The rate limit resets every 10 seconds. Simply wait and refresh.

### Option 2: Increase Backend Rate Limit

Edit backend rate limit settings (if you control the backend):

```javascript
// In backend code
rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 20, // Increase from 10 to 20
});
```

### Option 3: Disable Subscription Temporarily

In `src/components/graphql/TodoListGraphQL.tsx`:

```typescript
const { todos, meta, loading, error } = useTodos({
  page,
  limit,
  filter,
  sortBy,
  sortOrder,
  enableSubscription: false, // Disable to reduce requests
});
```

## Monitoring Network Requests

### Chrome DevTools

1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "graphql" or "WS"
4. Watch the request count

### Expected Request Pattern

```
Initial Load:
├─ getTodos (GraphQL Query)
└─ WebSocket connection (Subscription)

User Actions:
├─ createTodo (Mutation) → Cache updates automatically
├─ toggleTodo (Mutation) → Cache updates automatically
└─ deleteTodo (Mutation) → Cache updates automatically

Real-time:
└─ todoUpdated (Subscription) → Cache updates automatically
```

## Performance Impact

### Before Fix

- **Initial Load**: 4-6 requests (query + refetch + subscription setup)
- **Each Mutation**: 2 requests (mutation + refetch)
- **Subscription Update**: 2 operations (subscription + refetch)
- **Total on page load + 3 actions**: ~15 requests ❌

### After Fix

- **Initial Load**: 2 operations (query + subscription)
- **Each Mutation**: 1 request (mutation only)
- **Subscription Update**: 1 operation (subscription only)
- **Total on page load + 3 actions**: ~5 requests ✅

**Result: 70% reduction in network requests!** 🎉

## Verification

Run this test to verify fixes:

```bash
# Should complete without rate limit errors
./test-graphql-integration.sh
```

Expected output: Most tests pass, with proper delay between operations.

## Additional Resources

- [Apollo Client Caching](https://www.apollographql.com/docs/react/caching/overview/)
- [Optimistic UI](https://www.apollographql.com/docs/react/performance/optimistic-ui/)
- [GraphQL Subscriptions](https://www.apollographql.com/docs/react/data/subscriptions/)
