# React Stack 2026 - Full Stack Todo App

A modern full-stack Todo application showcasing **REST API** and **GraphQL** implementations side-by-side.

## 🚀 Features

### Authentication & Security

- **JWT Authentication** - Secure login/signup with access and refresh tokens
- **Role-Based Access Control (RBAC)** - STARTER and PRO user tiers
- **Session Management** - Auto-logout after 5 minutes of inactivity with warnings
- **Activity Tracking** - Automatic session extension on user interaction
- **Cross-Tab Synchronization** - Login/logout syncs automatically across all browser tabs and windows
- **Protected Routes** - Authenticated and role-based route guards
- **Secure Token Storage** - Access tokens in localStorage, refresh tokens in httpOnly cookies

### Frontend Stack

- **React 19** - Latest React with modern hooks
- **TypeScript** - Full type safety
- **Vite 7** - Lightning-fast dev server and build tool
- **React Router v7** - Client-side routing
- **Tailwind CSS v4** - Modern utility-first styling

### Data Fetching - Dual Implementation

1. **REST API** with TanStack Query v5
   - HTTP/2 endpoints
   - Automatic caching and invalidation
   - Optimistic updates
   - Background refetching

2. **GraphQL** with Apollo Client v4
   - Single endpoint with precise queries
   - Real-time subscriptions via WebSocket
   - Normalized cache
   - Optimistic UI updates
   - Auto-generated TypeScript types

### Backend

- **Node.js + Express** - REST API
- **Apollo Server** - GraphQL API
- **MongoDB** - NoSQL database
- **PostgreSQL** - SQL database
- **Docker** - Containerized services

## 📁 Project Structure

```
react-stack-2026/
├── src/
│   ├── components/
│   │   ├── graphql/           # GraphQL-powered components
│   │   │   ├── TodoListGraphQL.tsx
│   │   │   ├── TodoFormGraphQL.tsx
│   │   │   └── TodoItemGraphQL.tsx
│   │   ├── TodoList.tsx        # REST API components
│   │   ├── TodoForm.tsx
│   │   ├── LoginPage.tsx       # Authentication
│   │   ├── SignupPage.tsx      # User registration
│   │   ├── Header.tsx          # Global header with session timer
│   │   ├── ProtectedRoute.tsx  # Route guards
│   │   ├── PublicRoute.tsx     # Public route wrapper
│   │   ├── NotFound.tsx        # 404 page
│   │   ├── Toast.tsx           # Notifications
│   │   ├── ActivityTracker.tsx # Session activity tracking
│   │   ├── SessionManager.tsx  # Auto-logout & warnings
│   │   └── Home.tsx            # Landing page
│   ├── contexts/
│   │   ├── SessionContext.tsx  # Shared session state
│   │   └── ToastContext.tsx    # Toast notifications
│   ├── stores/
│   │   └── useAuthStore.ts     # Zustand auth state
│   ├── hooks/
│   │   ├── useTodos.ts         # REST API hooks (React Query)
│   │   ├── useGraphQLTodos.ts  # GraphQL hooks (Apollo Client)
│   │   ├── useAuth.ts          # Authentication hook
│   │   └── useSession.ts       # Session monitoring
│   ├── graphql/
│   │   ├── queries/            # GraphQL query files
│   │   ├── mutations/          # GraphQL mutation files
│   │   ├── subscriptions/      # GraphQL subscription files
│   │   └── fragments.graphql   # Reusable fragments
│   ├── generated/
│   │   └── graphql.ts          # Auto-generated types & hooks
│   ├── lib/
│   │   ├── apolloClient.ts     # Apollo Client with auth
│   │   ├── queryClient.ts      # React Query setup
│   │   └── api/
│   │       ├── client.ts       # Axios with refresh interceptor
│   │       └── auth.api.ts     # Auth API calls
│   └── App.tsx                 # Main app with routing
├── docs/                        # Documentation
├── test-graphql-integration.sh  # Automated tests
└── codegen.yml                  # GraphQL Code Generator config
```

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js 20.19+ (or 22.12+)
- Docker & Docker Compose (for backend)

### 1. Start Backend Services

```bash
cd backend
docker-compose up -d
cd server
npm install
npm run dev
```

Backend will run on:

- REST API: http://localhost:4000/api
- GraphQL: http://localhost:4000/graphql
- GraphQL Playground: http://localhost:4000/graphql (browser)

### 2. Start Frontend

```bash
npm install
npm run dev
```

Frontend will run on: http://localhost:5173

## 🎯 Routes

### Public Routes (Unauthenticated)

- **`/login`** - Login page
- **`/signup`** - User registration (choose STARTER or PRO role)

### Protected Routes (Authenticated)

- **`/`** - Home page with navigation cards
- **`/rest`** - Todo list using REST API (React Query) - All users
- **`/graphql`** - Todo list using GraphQL (Apollo Client) - **PRO users only**

### Special Routes

- **`/404`** - Not found page (authenticated users)
- Invalid routes redirect to `/login` (unauthenticated users)

## 🔐 Authentication

### User Roles

| Feature            | STARTER | PRO |
| ------------------ | ------- | --- |
| REST API Access    | ✅      | ✅  |
| GraphQL API Access | ❌      | ✅  |
| Home Page          | ✅      | ✅  |
| Session Management | ✅      | ✅  |

### Getting Started

1. **Create an Account**:
   - Navigate to http://localhost:5173/signup
   - Choose role: STARTER (free) or PRO (full features)
   - Fill in name, email, password

2. **Login**:
   - Navigate to http://localhost:5173/login
   - Enter credentials
   - Redirected to home page

3. **Session Timeout**:
   - After 5 minutes of inactivity, you'll see a warning
   - At 1 minute remaining, a toast notification appears
   - Move your mouse or interact to reset the timer
   - Auto-logout occurs after timeout

### Authentication Flow

```
Signup/Login → Access Token (15 min) + Refresh Token (7 days)
              ↓
      Protected Routes
              ↓
      Session Monitoring (30s polling)
              ↓
      Activity Tracking (mouse, keyboard, scroll)
              ↓
      Cross-Tab Sync (login/logout across all tabs)
              ↓
      Token Expires → Auto-refresh
              ↓
      Session Timeout (5 min) → Warning → Logout (all tabs)
```

### Features

- **Auto-Refresh**: Access tokens automatically refreshed when expired
- **Cross-Tab Sync**: Login/logout in one tab automatically syncs to all other tabs/windows
- **Session Timer**: Visual countdown in header showing time remaining
- **Activity Tracking**: User interactions reset the session timer
- **Toast Notifications**: Success, error, warning, and info messages
- **Route Protection**: Automatic redirect to login for unauthenticated users
- **Role-Based UI**: Different features visible based on user role

## 🔧 Development

### Generate GraphQL Types

After changing GraphQL schema:

```bash
npm run graphql:codegen
```

### Watch Mode (Auto-generate on schema changes)

```bash
npm run graphql:watch
```

### Run Tests

```bash
# Automated integration tests
./test-graphql-integration.sh

# Manual testing guide
cat TESTING_GUIDE.md
```

### Build for Production

```bash
npm run build
npm run preview
```

## 📊 REST vs GraphQL Comparison

| Feature                | REST API                              | GraphQL                         |
| ---------------------- | ------------------------------------- | ------------------------------- |
| **Endpoint**           | Multiple (/api/todos, /api/todos/:id) | Single (/graphql)               |
| **Data Fetching**      | Fixed response structure              | Request only needed fields      |
| **Real-time**          | No (requires polling)                 | Yes (WebSocket subscriptions)   |
| **Type Safety**        | Manual types                          | Auto-generated from schema      |
| **Caching**            | React Query                           | Apollo Client normalized cache  |
| **Optimistic Updates** | ✅ Manual implementation              | ✅ Built-in support             |
| **Over-fetching**      | Common                                | Eliminated                      |
| **Under-fetching**     | Requires multiple requests            | Single request with nested data |

## 🎨 GraphQL Features Showcase

### Queries

```graphql
# Get paginated todos with filtering and sorting
query GetTodos {
  todos(page: 1, limit: 10, filter: { completed: false }, sortBy: createdAt, sortOrder: DESC) {
    data {
      id
      title
      completed
      createdAt
    }
    meta {
      total
      page
      totalPages
    }
  }
}
```

### Mutations

```graphql
# Create a new todo
mutation CreateTodo {
  createTodo(input: { title: "Learn GraphQL", completed: false }) {
    id
    title
    completed
  }
}
```

### Subscriptions

```graphql
# Real-time updates
subscription TodoUpdated {
  todoUpdated {
    id
    title
    completed
  }
}
```

## 🔍 Key Implementations

### Apollo Client Setup

- HTTP Link for queries/mutations
- WebSocket Link for subscriptions
- Split Link for routing (queries → HTTP, subscriptions → WS)
- Error handling link
- Logging link (dev only)
- Normalized InMemoryCache with pagination support

### Custom Hooks

- `useGetTodos()` - Paginated query with cache-and-network strategy
- `useCreateTodo()` - Mutation with optimistic update
- `useUpdateTodo()` - Mutation with cache update
- `useDeleteTodo()` - Mutation with cache eviction
- `useToggleTodo()` - Instant completion toggle
- `useTodoSubscription()` - Real-time updates

### Components

- `TodoListGraphQL` - Main list with pagination, filtering, stats
- `TodoFormGraphQL` - Create/edit form with Zod validation
- `TodoItemGraphQL` - Individual todo with toggle/delete actions

## 📚 Documentation

- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Comprehensive manual testing guide
- **[PERFORMANCE_OPTIMIZATION.md](PERFORMANCE_OPTIMIZATION.md)** - Performance metrics and optimizations
- **[PHASE_6_SUMMARY.md](PHASE_6_SUMMARY.md)** - Testing & optimization summary
- **[ROUTING.md](ROUTING.md)** - React Router v7 implementation details
- **[docs/TECH_STACK.md](docs/TECH_STACK.md)** - Full technology stack
- **[docs/DOCKER.md](docs/DOCKER.md)** - Docker setup and configuration

## 🎯 Testing

Run automated integration tests:

```bash
chmod +x test-graphql-integration.sh
./test-graphql-integration.sh
```

Tests cover:

- Backend connectivity (GraphQL + REST)
- Query operations (pagination, filtering, sorting)
- Mutation operations (create, update, delete, toggle)
- Frontend routes
- Real-time subscriptions

## 🚀 Performance

### Bundle Size

- **Production Build**: 176 KB gzipped
- **Initial Load**: ~200ms (network dependent)
- **Cached Load**: ~20ms (instant from memory)
- **Optimistic Update**: ~5ms (perceived as instant)

### Optimizations

- ✅ Optimistic updates for all mutations
- ✅ Normalized Apollo cache
- ✅ Cache-and-network → cache-first strategy
- ✅ Manual cache updates (no unnecessary refetches)
- ✅ WebSocket auto-reconnection
- ✅ Fragment reusability
- ✅ Type-safe operations

## � Switching Between REST and GraphQL

This project demonstrates **both** REST and GraphQL implementations side-by-side.

### Navigate Between Implementations

Simply use the navigation in the app:

- **Home Page**: http://localhost:5173/
- **REST API**: http://localhost:5173/rest
- **GraphQL**: http://localhost:5173/graphql

### Using REST Implementation

```typescript
// File: src/hooks/useTodos.ts
import { useTodos } from '../hooks/useTodos';

function TodoList() {
  const { todos, isLoading, error, createTodo, updateTodo, deleteTodo } = useTodos();

  // Uses React Query with REST endpoints
  // Endpoint: http://localhost:4000/api/todos
}
```

### Using GraphQL Implementation

```typescript
// File: src/hooks/useGraphQLTodos.ts
import { useTodos } from '../hooks/useGraphQLTodos';

function TodoListGraphQL() {
  const { todos, loading, error, createTodo, updateTodo, deleteTodo } = useTodos({
    enableSubscription: true, // Enable real-time updates
  });

  // Uses Apollo Client with GraphQL
  // Endpoint: http://localhost:4000/graphql
  // WebSocket: ws://localhost:4000/graphql
}
```

### Key Differences

| Aspect            | REST Implementation | GraphQL Implementation     |
| ----------------- | ------------------- | -------------------------- |
| **Import Path**   | `../hooks/useTodos` | `../hooks/useGraphQLTodos` |
| **Loading State** | `isLoading`         | `loading`                  |
| **Real-time**     | ❌ No               | ✅ Yes (subscriptions)     |
| **Endpoint**      | `/api/todos`        | `/graphql`                 |
| **Data Fetching** | React Query         | Apollo Client              |

**For detailed comparison**, see [REST_VS_GRAPHQL.md](REST_VS_GRAPHQL.md)

## 🔍 Apollo DevTools

Use Apollo Client DevTools to inspect GraphQL operations and cache.

### Installation

1. Install browser extension:
   - [Chrome](https://chrome.google.com/webstore/detail/apollo-client-devtools/jdkknkkbebbapilgoeccciglkfbmbnfm)
   - [Firefox](https://addons.mozilla.org/en-US/firefox/addon/apollo-developer-tools/)

2. Open your app at http://localhost:5173/graphql

3. Open browser DevTools (F12) → **Apollo** tab

### Features

#### 1. Query Inspector

View all queries and mutations with:

- Variables sent
- Response data
- Execution time
- Cache hit/miss

#### 2. Cache Inspector

Explore the Apollo normalized cache:

```
ROOT_QUERY
├─ todos (filter: {completed: false})
│  ├─ data: [Todo:1, Todo:2, Todo:3]
│  └─ meta: {...}
Todo:1
├─ id: "1"
├─ title: "Learn GraphQL"
└─ completed: false
```

#### 3. Mutation Tracker

See mutation lifecycle:

- Optimistic response (instant)
- Server response (real)
- Cache updates

#### 4. Subscription Monitor

Watch real-time updates:

- WebSocket connection status
- Incoming subscription data
- Cache updates from subscriptions

### Debugging Tips

**Check Cache Policy:**

```typescript
// In Apollo tab → Queries → [Your Query]
// Look for: fetchPolicy: "cache-first" or "cache-and-network"
```

**Inspect Optimistic Updates:**

```typescript
// In Apollo tab → Mutations → [Your Mutation]
// See optimisticResponse applied immediately
// Then see actual server response
```

**Monitor Network Requests:**

```typescript
// Apollo tab shows:
// ✅ Served from cache (instant)
// 🌐 Network request (fetching)
// ⚠️ Error (with details)
```

## �🛠️ Tech Stack

**Frontend:**

- React 19, TypeScript, Vite 7, React Router v7
- Apollo Client v4, GraphQL Code Generator
- TanStack Query v5, Zustand v5
- Tailwind CSS v4, Zod

**Backend:**

- Node.js, Express, Apollo Server
- MongoDB, PostgreSQL
- GraphQL, REST API
- Docker, Docker Compose

## 📖 Resources

### Official Documentation

- [Apollo Client Documentation](https://www.apollographql.com/docs/react/)
- [GraphQL Code Generator](https://the-guild.dev/graphql/codegen)
- [React Router v7](https://reactrouter.com/)
- [TanStack Query](https://tanstack.com/query/latest)

### Project Documentation

- [Cross-Tab Authentication Sync](./docs/CROSS_TAB_AUTH_SYNC.md) - How login/logout syncs across tabs
- [Backend API Documentation](../node-express-api-2026/docs/API.md) - Complete REST and GraphQL API reference
- [Troubleshooting Guide](../node-express-api-2026/docs/TROUBLESHOOTING.md) - Common issues and solutions
- [Deployment Guide](../node-express-api-2026/docs/DEPLOYMENT.md) - Production deployment instructions
- [Testing Guide](../node-express-api-2026/docs/TESTING.md) - Comprehensive testing plan
- [Vite Documentation](https://vitejs.dev/)
- [shadcn/ui](https://ui.shadcn.com/)
