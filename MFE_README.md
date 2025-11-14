# React Stack 2026 - Micro Frontend Architecture

Modern micro-frontend application built with React 19, Vite 7, and Module Federation.

## Architecture

This is a **micro-frontend architecture** with:

- **1 Shell Application** (Host) - Port 5173
- **4 Micro-Frontends** (Remotes):
  - Auth MFE - Port 5174
  - Todos MFE - Port 5175
  - Chatbot MFE (Placeholder) - Port 5176
- **3 Shared Packages**:
  - `@react-stack/shared-ui` - Design system components
  - `@react-stack/shared-hooks` - Zustand stores and React hooks
  - `@react-stack/shared-utils` - API clients, Apollo, Query client

## Tech Stack

- **React 19.0.0** - UI library
- **Vite 7.2.2** - Build tool and dev server
- **TypeScript 5.2** - Type safety
- **Module Federation** - Micro-frontend orchestration via `@originjs/vite-plugin-federation`
- **React Router v7.9.5** - Routing
- **TanStack Query v5** - REST API state management
- **Apollo Client v4** - GraphQL client
- **Zustand 5.0** - Global state management
- **Tailwind CSS v4** - Styling

## Project Structure

```
react-stack-2026/
├── apps/
│   ├── shell/              # Host application (Port 5173)
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   └── components/
│   │   │       ├── Layout.tsx
│   │   │       ├── ErrorBoundary.tsx
│   │   │       └── LoadingFallback.tsx
│   │   └── vite.config.ts  # Remotes: authApp, todosApp, chatbotApp
│   │
│   ├── auth-mfe/           # Auth micro-frontend (Port 5174)
│   │   ├── src/pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Signup.tsx
│   │   │   └── Sessions.tsx
│   │   └── vite.config.ts  # Exposes: Login, Signup, Sessions
│   │
│   ├── todos-mfe/          # Todos micro-frontend (Port 5175)
│   │   ├── src/pages/
│   │   │   ├── TodosREST.tsx
│   │   │   └── TodosGraphQL.tsx
│   │   └── vite.config.ts  # Exposes: TodosREST, TodosGraphQL
│   │
│   └── chatbot-mfe/        # Chatbot placeholder (Port 5176)
│       ├── src/pages/
│       │   └── ChatInterface.tsx
│       └── vite.config.ts  # Exposes: ChatInterface
│
└── packages/
    ├── shared-ui/          # Design system
    │   └── src/
    │       ├── components/
    │       │   ├── Button.tsx
    │       │   ├── Input.tsx
    │       │   ├── Card.tsx
    │       │   ├── Badge.tsx
    │       │   └── Toast.tsx
    │       └── styles/
    │           └── index.css
    │
    ├── shared-hooks/       # React hooks & Zustand stores
    │   └── src/
    │       └── stores/
    │           ├── authStore.ts
    │           ├── sessionStore.ts
    │           └── todoStore.ts
    │
    └── shared-utils/       # API clients
        └── src/
            ├── api/
            │   └── client.ts
            ├── queryClient.ts
            ├── apolloClient.ts
            └── types.ts
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Backend services running (see `node-express-api-2026` project)

### Installation

```bash
# Install all dependencies (root + workspaces)
npm install
```

### Development

#### Run all apps concurrently (recommended):

```bash
npm run dev
# or
npm run dev:caddy  # Use Caddy API Gateway (port 8080)
```

This starts:

- Shell: http://localhost:5173
- Auth MFE: http://localhost:5174
- Todos MFE: http://localhost:5175
- Chatbot MFE: http://localhost:5176

#### Run individual apps:

```bash
# Shell only
npm run dev:shell

# Auth MFE only
npm run dev:auth

# Todos MFE only
npm run dev:todos

# Chatbot MFE only
npm run dev:chatbot
```

### Environment Setup

Create `.env.development` file:

```env
VITE_API_URL=http://localhost:8080/api
VITE_GRAPHQL_URL=http://localhost:8080/graphql
```

Or use the helper scripts:

```bash
# Switch to Caddy backend (port 8080)
npm run use:caddy

# Switch to local backend (port 4000)
npm run use:local
```

### Build

```bash
# Build all apps
npm run build:all

# Build shell only
npm run build:shell
```

## Module Federation Configuration

### Shell (Host)

```typescript
// apps/shell/vite.config.ts
remotes: {
  authApp: 'http://localhost:5174/assets/remoteEntry.js',
  todosApp: 'http://localhost:5175/assets/remoteEntry.js',
  chatbotApp: 'http://localhost:5176/assets/remoteEntry.js',
}
```

### Remote MFEs

Each MFE exposes specific components:

- **Auth MFE**: `./Login`, `./Signup`, `./Sessions`
- **Todos MFE**: `./TodosREST`, `./TodosGraphQL`
- **Chatbot MFE**: `./ChatInterface`

## Routing

All routes are managed by the Shell:

| Route            | MFE     | Component     | Protected |
| ---------------- | ------- | ------------- | --------- |
| `/login`         | Auth    | Login         | No        |
| `/signup`        | Auth    | Signup        | No        |
| `/sessions`      | Auth    | Sessions      | Yes       |
| `/todos/rest`    | Todos   | TodosREST     | Yes       |
| `/todos/graphql` | Todos   | TodosGraphQL  | Yes       |
| `/chat`          | Chatbot | ChatInterface | Yes       |

## Shared Dependencies

All MFEs share these dependencies as **singletons**:

- `react` & `react-dom` (v19)
- `react-router` & `react-router-dom` (v7)
- `zustand` (v5)
- `@tanstack/react-query` (v5)
- `@apollo/client` (v4)

This ensures:

- Single instance of each library
- Shared state works correctly
- Reduced bundle size

## Features

### Implemented

- ✅ Micro-frontend architecture with Module Federation
- ✅ Authentication (Login, Signup, Sessions)
- ✅ JWT-based auth with refresh tokens
- ✅ Session management across devices
- ✅ Todo management (REST & GraphQL)
- ✅ Shared component library (Tailwind CSS v4)
- ✅ Shared state management (Zustand)
- ✅ Shared data fetching (TanStack Query + Apollo)
- ✅ Protected routes with auth guards
- ✅ Error boundaries per MFE
- ✅ Loading states for lazy-loaded components

### Coming Soon (Phase 4-5)

- 🔄 AI Chatbot with natural language interface
- 🔄 Vector database integration (RAG)
- 🔄 Real-time streaming responses
- 🔄 Conversation history

## Development Workflow

### Adding a New MFE

1. Create new directory in `apps/`
2. Setup `package.json` and `vite.config.ts`
3. Configure Module Federation to expose components
4. Add remote to Shell's `vite.config.ts`
5. Add routes to Shell's `App.tsx`
6. Add dev script to root `package.json`

### Adding Shared Components

1. Add component to `packages/shared-ui/src/components/`
2. Export from `packages/shared-ui/src/index.ts`
3. Use in any MFE: `import { Component } from '@react-stack/shared-ui'`

### Adding Shared Hooks/Stores

1. Add hook/store to `packages/shared-hooks/src/`
2. Export from `packages/shared-hooks/src/index.ts`
3. Use in any MFE: `import { useStore } from '@react-stack/shared-hooks'`

## Troubleshooting

### Module not found errors

If you see "Cannot find module '@react-stack/...'":

```bash
npm install  # Reinstall workspace links
```

### Hot reload not working

Restart the specific MFE:

```bash
npm run dev:auth  # or dev:todos, dev:chatbot, dev:shell
```

### Remote loading fails

1. Ensure all 4 servers are running
2. Check console for CORS errors
3. Verify remote URLs in Shell's vite.config.ts

## Backend Integration

This frontend connects to microservices backend:

- **API Gateway**: http://localhost:8080 (Caddy)
- **Direct Backend**: http://localhost:4000 (Development)

### API Endpoints

- `POST /api/auth/login` - Login
- `POST /api/auth/signup` - Sign up
- `POST /api/auth/logout` - Logout
- `GET /api/sessions` - Get user sessions
- `DELETE /api/sessions/:id` - Terminate session
- `GET /api/todos` - Get todos (REST)
- `POST /api/todos` - Create todo (REST)
- `POST /graphql` - GraphQL endpoint

## Performance

### Bundle Sizes (estimated)

- **Shell**: ~200KB (routing, layout, providers)
- **Auth MFE**: ~50KB (lazy loaded)
- **Todos MFE**: ~100KB (lazy loaded)
- **Chatbot MFE**: ~30KB (placeholder, lazy loaded)
- **Shared**: ~150KB (loaded once, cached)

**Initial load**: ~350KB (Shell + Shared)
**Total if all loaded**: ~530KB

### Loading Strategy

- Shell loads immediately with routing and layout
- MFEs are lazy-loaded on navigation
- Shared dependencies are loaded once and cached
- Error boundaries prevent cascade failures

## Scripts Reference

| Command               | Description               |
| --------------------- | ------------------------- |
| `npm run dev`         | Run all apps concurrently |
| `npm run dev:all`     | Alias for `npm run dev`   |
| `npm run dev:shell`   | Run Shell only            |
| `npm run dev:auth`    | Run Auth MFE only         |
| `npm run dev:todos`   | Run Todos MFE only        |
| `npm run dev:chatbot` | Run Chatbot MFE only      |
| `npm run build:all`   | Build all apps            |
| `npm run build:shell` | Build Shell only          |
| `npm run use:caddy`   | Switch to Caddy backend   |
| `npm run use:local`   | Switch to local backend   |

## Next Steps

1. ✅ **Phase 1 Complete**: Micro-frontend infrastructure
2. **Phase 2 (Weeks 3-4)**: Extract Auth Service from backend
3. **Phase 3 (Weeks 5-6)**: Additional microservices
4. **Phase 4 (Weeks 7-8)**: AI Service backend
5. **Phase 5 (Weeks 9-10)**: Chatbot MFE implementation

## License

Private - Internal Use Only
