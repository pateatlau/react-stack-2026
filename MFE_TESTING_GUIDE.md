# Micro-Frontend Testing Guide

## Architecture Overview

### What Was Built

**4 Micro-Frontends (MFEs)**:

1. **Shell (Host)** - Port 5173 - Main application that loads other MFEs
2. **Auth MFE (Remote)** - Port 5174 - Exposes Login, Signup, Sessions
3. **Todos MFE (Remote)** - Port 5175 - Exposes TodosREST, TodosGraphQL
4. **Chatbot MFE (Remote)** - Port 5176 - Exposes ChatInterface (placeholder)

**3 Shared Packages**:

1. **@react-stack/shared-ui** - Design system (Button, Input, Card, Badge, Toast)
2. **@react-stack/shared-hooks** - Zustand stores (authStore, sessionStore, todoStore)
3. **@react-stack/shared-utils** - API clients (Axios, Apollo, TanStack Query)

### Module Federation Setup

**Shell loads remotes dynamically**:

```javascript
remotes: {
  authApp: 'http://localhost:5174/assets/remoteEntry.js',
  todosApp: 'http://localhost:5175/assets/remoteEntry.js',
  chatbotApp: 'http://localhost:5176/assets/remoteEntry.js',
}
```

**Shared dependencies as singletons** (prevents duplication):

- React 19, React DOM
- React Router v7
- Zustand v5
- TanStack Query v5
- Apollo Client v4

---

## Prerequisites

### 1. Node.js Version

```bash
node --version
# Should be v20.19.0 or higher (v22.12.0+ also works)
```

If not, upgrade:

```bash
nvm install 20.19.0
nvm use 20.19.0
```

### 2. Backend Services

The MFEs need the backend running. Start backend services:

```bash
# In terminal 1 - Navigate to backend
cd /Users/patea/2026/projects/node-express-api-2026

# Start Caddy API Gateway
npm run caddy:up

# Start backend server
npm run dev
```

Backend should be running on:

- **API Gateway (Caddy)**: http://localhost:8080
- **Direct Backend**: http://localhost:4000

---

## Running MFEs - All Options

### Option 1: Run ALL MFEs Together (Recommended for Integration Testing)

This is the **recommended way** to test the full micro-frontend system.

```bash
cd /Users/patea/2026/projects/react-stack-2026

# Run all 4 MFEs with Caddy backend
npm run dev:caddy
```

**What this does**:

1. Copies `.env.caddy` to `.env.development` (configures backend URLs)
2. Starts all 4 MFEs concurrently:
   - [0] Shell: http://localhost:5173
   - [1] Auth MFE: http://localhost:5174
   - [2] Todos MFE: http://localhost:5175
   - [3] Chatbot MFE: http://localhost:5176

**You'll see output like**:

```
✓ Switched to CADDY backend (port 8080)
[0] VITE v7.2.2  ready in 164 ms
[0] ➜  Local:   http://localhost:5173/
[1] VITE v7.2.2  ready in 161 ms
[1] ➜  Local:   http://localhost:5174/
[2] VITE v7.2.2  ready in 169 ms
[2] ➜  Local:   http://localhost:5175/
[3] VITE v7.2.2  ready in 169 ms
[3] ➜  Local:   http://localhost:5176/
```

**To test**: Open browser to http://localhost:5173 (Shell will load remotes automatically)

**Alternative with local backend**:

```bash
npm run dev:local
# Uses backend on port 4000 instead of 8080
```

---

### Option 2: Run MFEs Individually (For Isolated Testing)

#### Test Shell Only

```bash
cd /Users/patea/2026/projects/react-stack-2026
npm run dev:shell
```

**Access**: http://localhost:5173

**What you'll see**:

- Shell layout and navigation
- Routes configured
- **ERROR**: Remote loading will fail (remotes not running)
- Use this to test: Shell UI, routing logic, error boundaries

#### Test Auth MFE Only

```bash
cd /Users/patea/2026/projects/react-stack-2026
npm run dev:auth
```

**Access**: http://localhost:5174

**What you'll see**:

- Auth MFE running in **standalone mode** (bootstrap.tsx)
- Routes: `/login`, `/signup`, `/sessions`
- Fully functional authentication pages
- No Shell layout (just the pages themselves)

**Test scenarios**:

1. Navigate to http://localhost:5174/login - Login form
2. Navigate to http://localhost:5174/signup - Signup form
3. Navigate to http://localhost:5174/sessions - Sessions list

#### Test Todos MFE Only

```bash
cd /Users/patea/2026/projects/react-stack-2026
npm run dev:todos
```

**Access**: http://localhost:5175

**What you'll see**:

- Todos MFE running in standalone mode
- Routes: `/todos/rest`, `/todos/graphql`, `/` (defaults to REST)
- Fully functional todo management

**Test scenarios**:

1. Navigate to http://localhost:5175/todos/rest - REST API todos
2. Navigate to http://localhost:5175/todos/graphql - GraphQL todos
3. Test CRUD operations in both

#### Test Chatbot MFE Only

```bash
cd /Users/patea/2026/projects/react-stack-2026
npm run dev:chatbot
```

**Access**: http://localhost:5176

**What you'll see**:

- Chatbot MFE running in standalone mode
- "Coming Soon" placeholder with feature preview
- Mock chat interface (non-functional)

---

### Option 3: Run Specific Combinations

#### Shell + Auth Only

```bash
# Terminal 1
npm run dev:shell

# Terminal 2
npm run dev:auth
```

**Test**: Navigate to http://localhost:5173/login

- Should load Auth MFE's Login component
- Todos and Chatbot routes will fail (remotes not running)

#### Shell + Todos Only

```bash
# Terminal 1
npm run dev:shell

# Terminal 2
npm run dev:todos
```

**Test**: Navigate to http://localhost:5173/todos/rest

- Should load Todos MFE's TodosREST component
- Auth and Chatbot routes will fail

#### All Remotes Running Separately

```bash
# Terminal 1 - Shell
npm run dev:shell

# Terminal 2 - Auth
npm run dev:auth

# Terminal 3 - Todos
npm run dev:todos

# Terminal 4 - Chatbot
npm run dev:chatbot
```

**Same as Option 1** but with more control over individual servers.

---

## Testing Scenarios

### Scenario 1: Test Shell in Isolation

**Goal**: Verify Shell layout, routing, and error handling

```bash
npm run dev:shell
```

**Tests**:

1. ✅ Shell starts on port 5173
2. ✅ Layout renders (header with navigation)
3. ✅ Routes are configured
4. ❌ Remote loading fails (expected - no remotes running)
5. ✅ Error boundaries catch failures
6. ✅ Loading fallback displays

**Browser**: http://localhost:5173

**Expected behavior**:

- See "Loading..." or error for missing remotes
- Header/layout still renders
- Error boundaries prevent full app crash

---

### Scenario 2: Test Auth MFE in Isolation

**Goal**: Verify Auth MFE works standalone

```bash
npm run dev:auth
```

**Tests**:

1. ✅ Auth MFE starts on port 5174
2. ✅ Navigate to `/login` - Login form renders
3. ✅ Navigate to `/signup` - Signup form renders
4. ✅ Navigate to `/sessions` - Sessions page renders
5. ✅ Forms are interactive
6. ✅ Can submit (will hit backend if running)

**Browser tests**:

- http://localhost:5174/login
- http://localhost:5174/signup
- http://localhost:5174/sessions

**Expected behavior**:

- No Shell layout (standalone mode)
- Forms work independently
- Can test without Shell running

---

### Scenario 3: Test Todos MFE in Isolation

**Goal**: Verify Todos MFE works standalone

```bash
npm run dev:todos
```

**Tests**:

1. ✅ Todos MFE starts on port 5175
2. ✅ Navigate to `/todos/rest` - REST implementation
3. ✅ Navigate to `/todos/graphql` - GraphQL implementation
4. ✅ Both implementations render independently
5. ✅ Can test CRUD without Shell

**Browser tests**:

- http://localhost:5175/todos/rest
- http://localhost:5175/todos/graphql

**Expected behavior**:

- No Shell layout
- Full todo functionality
- Both REST and GraphQL work

---

### Scenario 4: Test Chatbot MFE in Isolation

**Goal**: Verify Chatbot placeholder

```bash
npm run dev:chatbot
```

**Tests**:

1. ✅ Chatbot MFE starts on port 5176
2. ✅ "Coming Soon" banner displays
3. ✅ Feature preview cards render
4. ✅ Mock chat interface shows
5. ✅ UI is polished and complete

**Browser**: http://localhost:5176

**Expected behavior**:

- Beautiful placeholder UI
- No errors
- Ready for future implementation

---

### Scenario 5: Test Full Integration (All MFEs)

**Goal**: Verify Module Federation and full system

```bash
npm run dev:caddy
# or
npm run dev
```

**Tests**:

1. ✅ All 4 servers start
2. ✅ Shell loads at http://localhost:5173
3. ✅ Navigate to `/login` - Auth MFE loads remotely
4. ✅ Navigate to `/todos/rest` - Todos MFE loads remotely
5. ✅ Navigate to `/chat` - Chatbot MFE loads remotely
6. ✅ Shared state works (login persists across MFEs)
7. ✅ Navigation works between all routes
8. ✅ No duplicate React/Router instances

**Browser DevTools checks**:

**Network Tab**:

```
✓ http://localhost:5174/assets/remoteEntry.js (Auth MFE)
✓ http://localhost:5175/assets/remoteEntry.js (Todos MFE)
✓ http://localhost:5176/assets/remoteEntry.js (Chatbot MFE)
✓ Shared dependencies load once (singleton pattern)
```

**Console**:

```
✓ No errors about duplicate React
✓ No module loading errors
✓ Zustand stores work across MFEs
```

---

## Testing the Module Federation

### Verify Remote Loading

1. **Start all MFEs**: `npm run dev:caddy`

2. **Open Browser DevTools**: http://localhost:5173

3. **Check Network Tab**:
   - Filter by "remoteEntry"
   - Should see 3 requests:
     - `http://localhost:5174/assets/remoteEntry.js` (200 OK)
     - `http://localhost:5175/assets/remoteEntry.js` (200 OK)
     - `http://localhost:5176/assets/remoteEntry.js` (200 OK)

4. **Navigate to `/login`**:
   - Watch Network tab
   - Should lazy-load Auth MFE chunks
   - Login component from port 5174 renders in Shell (port 5173)

5. **Navigate to `/todos/rest`**:
   - Todos MFE chunks load
   - TodosREST component from port 5175 renders

### Verify Singleton Sharing

1. **Open Console**: http://localhost:5173

2. **Run**:

   ```javascript
   // Check React version
   console.log(React.version); // Should be 19.x.x

   // Check if zustand store is shared
   console.log(window.__REACT_DEVTOOLS_GLOBAL_HOOK__);
   ```

3. **Test shared state**:
   - Login at `/login` (Auth MFE)
   - Navigate to `/sessions` (still Auth MFE)
   - User info should persist (Zustand store is singleton)
   - Navigate to `/todos/rest` (Todos MFE)
   - User info in header should still show (shared state works!)

---

## Common Issues & Solutions

### Issue 1: "Cannot find module '@react-stack/...'"

**Cause**: Workspace packages not linked

**Solution**:

```bash
cd /Users/patea/2026/projects/react-stack-2026
npm install
```

### Issue 2: Remote loading fails

**Symptoms**:

- Error: "Failed to fetch http://localhost:5174/assets/remoteEntry.js"
- Blank page or error boundary

**Solution**:

- Make sure ALL 4 MFEs are running: `npm run dev:caddy`
- Check each port individually:
  - http://localhost:5173 (Shell)
  - http://localhost:5174 (Auth)
  - http://localhost:5175 (Todos)
  - http://localhost:5176 (Chatbot)

### Issue 3: Port already in use

**Symptoms**:

```
Error: Port 5173 is already in use
```

**Solution**:

```bash
# Find and kill process using the port
lsof -ti:5173 | xargs kill -9
# Repeat for 5174, 5175, 5176 if needed

# Or restart all
# Press Ctrl+C to stop current processes
npm run dev:caddy  # Restart all
```

### Issue 4: Vite version error

**Symptoms**:

```
You are using Node.js 20.16.0
Vite requires Node.js version 20.19+
```

**Solution**:

```bash
nvm install 20.19.0
nvm use 20.19.0
node --version  # Verify
```

### Issue 5: Backend not responding

**Symptoms**:

- Login fails
- Todos don't load
- 401/500 errors

**Solution**:

```bash
# Check backend is running
# Terminal in node-express-api-2026
npm run caddy:up  # Start Caddy
npm run dev       # Start backend

# Check URLs match
cat .env.development
# Should show:
# VITE_API_URL=http://localhost:8080/api
# VITE_GRAPHQL_URL=http://localhost:8080/graphql
```

---

## Testing Checklist

### Shell Testing (Isolated)

- [ ] Starts on port 5173
- [ ] Layout renders
- [ ] Navigation header shows
- [ ] Routes configured
- [ ] Error boundaries work

### Auth MFE Testing (Isolated)

- [ ] Starts on port 5174
- [ ] `/login` renders Login form
- [ ] `/signup` renders Signup form
- [ ] `/sessions` renders Sessions list
- [ ] Forms are interactive

### Todos MFE Testing (Isolated)

- [ ] Starts on port 5175
- [ ] `/todos/rest` renders REST todos
- [ ] `/todos/graphql` renders GraphQL todos
- [ ] Can create/update/delete todos

### Chatbot MFE Testing (Isolated)

- [ ] Starts on port 5176
- [ ] "Coming Soon" banner shows
- [ ] Feature cards display
- [ ] Mock chat interface renders

### Integration Testing (All MFEs)

- [ ] All 4 servers start successfully
- [ ] Shell loads at http://localhost:5173
- [ ] Can navigate to `/login` (Auth MFE loads)
- [ ] Can navigate to `/signup` (Auth MFE loads)
- [ ] Can navigate to `/sessions` (Auth MFE loads)
- [ ] Can navigate to `/todos/rest` (Todos MFE loads)
- [ ] Can navigate to `/todos/graphql` (Todos MFE loads)
- [ ] Can navigate to `/chat` (Chatbot MFE loads)
- [ ] Login state persists across MFEs
- [ ] No duplicate React errors in console
- [ ] RemoteEntry.js files load in Network tab
- [ ] Lazy loading works (chunks load on navigation)

---

## Quick Reference

### Start Commands

```bash
# All MFEs (recommended)
npm run dev:caddy

# Individual MFEs
npm run dev:shell    # Port 5173
npm run dev:auth     # Port 5174
npm run dev:todos    # Port 5175
npm run dev:chatbot  # Port 5176

# Switch backends
npm run use:caddy    # Port 8080 (API Gateway)
npm run use:local    # Port 4000 (Direct)
```

### URLs

| Service     | URL                   | Purpose                  |
| ----------- | --------------------- | ------------------------ |
| Shell       | http://localhost:5173 | Main app (loads remotes) |
| Auth MFE    | http://localhost:5174 | Standalone auth pages    |
| Todos MFE   | http://localhost:5175 | Standalone todos         |
| Chatbot MFE | http://localhost:5176 | Standalone chatbot       |

### Remote Entry Points

```
http://localhost:5174/assets/remoteEntry.js  (Auth)
http://localhost:5175/assets/remoteEntry.js  (Todos)
http://localhost:5176/assets/remoteEntry.js  (Chatbot)
```

---

## Next Steps

1. ✅ **Start Backend**: Get backend services running
2. ✅ **Start All MFEs**: Run `npm run dev:caddy`
3. ✅ **Open Shell**: http://localhost:5173
4. ✅ **Test Auth Flow**: Login → Sessions → Logout
5. ✅ **Test Todos**: Create/Read/Update/Delete
6. ✅ **Test Navigation**: All routes work
7. ✅ **Check DevTools**: No errors, remotes load
8. ✅ **Test Isolated**: Run each MFE individually

**Happy Testing! 🚀**
