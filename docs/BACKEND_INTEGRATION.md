# Backend Integration Guide

## Overview

This guide describes how to integrate the React frontend with the Node.js Express REST API backend.

## Current Stack Analysis

### Frontend (react-stack-2026)

- **Framework:** React 19
- **State Management:** Zustand (already configured)
- **Data Fetching:** TanStack Query v5 (already configured)
- **Styling:** Tailwind CSS v4
- **Build Tool:** Vite 7
- **Testing:** Vitest

### Backend (node-express-api-2026)

- **Framework:** Express + TypeScript
- **Database:** PostgreSQL (Prisma) or MongoDB (Mongoose)
- **API Types:** REST + GraphQL
- **Security:** Helmet, Rate Limiting, CORS
- **Documentation:** Swagger/OpenAPI
- **Port:** 4000 (default)

## Recommended Integration Approach

### **Option 1: TanStack Query + Axios** ⭐ **RECOMMENDED**

**Why this approach:**

- ✅ TanStack Query already installed and configured
- ✅ Type-safe with TypeScript
- ✅ Built-in caching, refetching, and optimistic updates
- ✅ Automatic request deduplication
- ✅ Error handling and retry logic
- ✅ DevTools for debugging
- ✅ Axios provides interceptors for auth tokens

**Tech Stack:**

```json
{
  "data-fetching": "TanStack Query v5",
  "http-client": "Axios",
  "type-generation": "OpenAPI TypeScript Codegen",
  "state-management": "Zustand (for global state)",
  "validation": "Zod (runtime validation)"
}
```

---

### Option 2: TanStack Query + Fetch API

**Pros:**

- No additional dependencies
- Native browser API
- Lighter bundle size

**Cons:**

- No request/response interceptors
- Manual auth token injection
- Less convenient error handling

---

### Option 3: SWR + Axios

**Pros:**

- Lighter than TanStack Query
- Good for simple use cases

**Cons:**

- Need to install new dependency
- Less features than TanStack Query
- TanStack Query already configured

---

### Option 4: RTK Query (Redux Toolkit Query)

**Pros:**

- Full Redux integration
- Generated hooks

**Cons:**

- Need Redux setup
- Heavier bundle
- TanStack Query simpler

---

## Implementation Plan (Option 1)

### Phase 1: Setup & Configuration

#### 1. Install Dependencies

```bash
npm install axios zod
npm install -D @openapitools/openapi-generator-cli
```

#### 2. Create API Client Configuration

**File: `src/lib/api/client.ts`**

```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 - token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh token logic
        const refreshToken = localStorage.getItem('refresh_token');
        const { data } = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
          refreshToken,
        });

        localStorage.setItem('access_token', data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

#### 3. Create Type Definitions

**File: `src/types/todo.ts`**

```typescript
export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoInput {
  title: string;
  completed?: boolean;
}

export interface UpdateTodoInput {
  title?: string;
  completed?: boolean;
}

export interface PaginatedTodosResponse {
  data: Todo[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiError {
  error: string;
  details?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}
```

#### 4. Create API Service Layer

**File: `src/lib/api/todos.api.ts`**

```typescript
import { apiClient } from './client';
import { Todo, CreateTodoInput, UpdateTodoInput, PaginatedTodosResponse } from '../../types/todo';

export const todosApi = {
  // Get all todos with pagination
  getAll: async (params?: { page?: number; limit?: number }) => {
    const { data } = await apiClient.get<PaginatedTodosResponse>('/api/todos', {
      params,
    });
    return data;
  },

  // Get single todo
  getById: async (id: string) => {
    const { data } = await apiClient.get<Todo>(`/api/todos/${id}`);
    return data;
  },

  // Create todo
  create: async (input: CreateTodoInput) => {
    const { data } = await apiClient.post<Todo>('/api/todos', input);
    return data;
  },

  // Update todo
  update: async (id: string, input: UpdateTodoInput) => {
    const { data } = await apiClient.put<Todo>(`/api/todos/${id}`, input);
    return data;
  },

  // Delete todo
  delete: async (id: string) => {
    await apiClient.delete(`/api/todos/${id}`);
  },

  // Toggle todo completion
  toggle: async (id: string, completed: boolean) => {
    const { data } = await apiClient.put<Todo>(`/api/todos/${id}`, {
      completed,
    });
    return data;
  },
};
```

#### 5. Create TanStack Query Hooks

**File: `src/hooks/useTodos.ts`**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { todosApi } from '../lib/api/todos.api';
import { CreateTodoInput, UpdateTodoInput } from '../types/todo';

// Query keys
export const todoKeys = {
  all: ['todos'] as const,
  lists: () => [...todoKeys.all, 'list'] as const,
  list: (params?: { page?: number; limit?: number }) => [...todoKeys.lists(), params] as const,
  details: () => [...todoKeys.all, 'detail'] as const,
  detail: (id: string) => [...todoKeys.details(), id] as const,
};

// Get all todos
export const useTodos = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: todoKeys.list(params),
    queryFn: () => todosApi.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single todo
export const useTodo = (id: string) => {
  return useQuery({
    queryKey: todoKeys.detail(id),
    queryFn: () => todosApi.getById(id),
    enabled: !!id, // Only fetch if id exists
  });
};

// Create todo
export const useCreateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTodoInput) => todosApi.create(input),
    onSuccess: () => {
      // Invalidate and refetch todos list
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
    },
  });
};

// Update todo
export const useUpdateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTodoInput }) =>
      todosApi.update(id, input),
    onSuccess: (data, variables) => {
      // Update cache for single todo
      queryClient.setQueryData(todoKeys.detail(variables.id), data);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
    },
  });
};

// Delete todo
export const useDeleteTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => todosApi.delete(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: todoKeys.detail(id) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
    },
  });
};

// Toggle todo completion
export const useToggleTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      todosApi.toggle(id, completed),
    // Optimistic update
    onMutate: async ({ id, completed }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: todoKeys.detail(id) });

      // Snapshot previous value
      const previousTodo = queryClient.getQueryData(todoKeys.detail(id));

      // Optimistically update
      queryClient.setQueryData(todoKeys.detail(id), (old: any) => ({
        ...old,
        completed,
      }));

      return { previousTodo };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTodo) {
        queryClient.setQueryData(todoKeys.detail(variables.id), context.previousTodo);
      }
    },
    onSettled: (data, error, variables) => {
      // Refetch to sync with server
      queryClient.invalidateQueries({ queryKey: todoKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
    },
  });
};
```

#### 6. Create UI Components

**File: `src/components/TodoList.tsx`**

```typescript
import React, { useState } from 'react';
import { useTodos, useCreateTodo, useToggleTodo, useDeleteTodo } from '../hooks/useTodos';
import Button from './Button';

export default function TodoList() {
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [page, setPage] = useState(1);

  // Queries
  const { data, isLoading, error } = useTodos({ page, limit: 10 });

  // Mutations
  const createTodo = useCreateTodo();
  const toggleTodo = useToggleTodo();
  const deleteTodo = useDeleteTodo();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    try {
      await createTodo.mutateAsync({ title: newTodoTitle.trim() });
      setNewTodoTitle('');
    } catch (err) {
      console.error('Failed to create todo:', err);
    }
  };

  if (isLoading) {
    return <div>Loading todos...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Todo List</h1>

      {/* Create Todo Form */}
      <form onSubmit={handleCreate} className="mb-6 flex gap-2">
        <input
          type="text"
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          placeholder="Add a new todo..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
          disabled={createTodo.isPending}
        />
        <Button type="submit" disabled={createTodo.isPending}>
          {createTodo.isPending ? 'Adding...' : 'Add'}
        </Button>
      </form>

      {/* Todo List */}
      <div className="space-y-2">
        {data?.data.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center gap-3 p-4 bg-white border rounded-lg"
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={(e) =>
                toggleTodo.mutate({ id: todo.id, completed: e.target.checked })
              }
              className="w-5 h-5"
            />
            <span
              className={`flex-1 ${
                todo.completed ? 'line-through text-gray-400' : ''
              }`}
            >
              {todo.title}
            </span>
            <Button
              onClick={() => deleteTodo.mutate(todo.id)}
              disabled={deleteTodo.isPending}
              variant="destructive"
            >
              Delete
            </Button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {data && data.meta.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <Button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="px-4 py-2">
            Page {page} of {data.meta.totalPages}
          </span>
          <Button
            onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
            disabled={page === data.meta.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
```

#### 7. Environment Configuration

**File: `.env.development`**

```bash
VITE_API_URL=http://localhost:4000
```

**File: `.env.production`**

```bash
VITE_API_URL=https://api.yourdomain.com
```

#### 8. Update Query Client Configuration

**File: `src/lib/queryClient.ts`**

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
```

---

## Advanced Features

### 1. Authentication Store with Zustand

**File: `src/stores/useAuth.ts`**

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (tokens: { accessToken: string; refreshToken: string }, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      login: (tokens, user) =>
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          user,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

### 2. Error Boundary Component

**File: `src/components/ErrorBoundary.tsx`**

```typescript
import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600">{this.state.error?.message}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Try again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

### 3. Global Error Handler Hook

**File: `src/hooks/useErrorHandler.ts`**

```typescript
import { useEffect } from 'react';
import { toast } from 'react-hot-toast'; // or your toast library

export const useErrorHandler = (error: Error | null) => {
  useEffect(() => {
    if (error) {
      // Handle specific error types
      if (error.message.includes('Network Error')) {
        toast.error('Network error. Please check your connection.');
      } else if (error.message.includes('401')) {
        toast.error('Session expired. Please login again.');
      } else {
        toast.error(error.message || 'An error occurred');
      }
    }
  }, [error]);
};
```

---

## Testing Strategy

### 1. Mock API for Testing

**File: `src/test/mocks/handlers.ts`**

```typescript
import { http, HttpResponse } from 'msw';

const API_BASE_URL = 'http://localhost:4000';

export const handlers = [
  // Get all todos
  http.get(`${API_BASE_URL}/api/todos`, () => {
    return HttpResponse.json({
      data: [
        {
          id: '1',
          title: 'Test Todo',
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    });
  }),

  // Create todo
  http.post(`${API_BASE_URL}/api/todos`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: '2',
      ...body,
      completed: body.completed || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }),
];
```

### 2. Test Setup

**File: `src/test/setup.ts`**

```typescript
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

export const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## Performance Optimization

### 1. React Query Configuration

```typescript
{
  // Prefetch on hover
  queries: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  }
}
```

### 2. Lazy Loading

```typescript
const TodoList = lazy(() => import('./components/TodoList'));
```

### 3. Debounce Search

```typescript
import { useDebouncedValue } from './hooks/useDebounce';

const [search, setSearch] = useState('');
const debouncedSearch = useDebouncedValue(search, 500);

const { data } = useTodos({ search: debouncedSearch });
```

---

## Deployment Checklist

- [ ] Set `VITE_API_URL` in production environment
- [ ] Configure CORS on backend for production domain
- [ ] Enable HTTPS
- [ ] Set up CDN for static assets
- [ ] Configure rate limiting
- [ ] Add monitoring (Sentry)
- [ ] Set up CI/CD pipeline
- [ ] Enable compression (Vite does this automatically)
- [ ] Test error boundaries
- [ ] Add loading states for all mutations

---

## Next Steps

1. **Implement authentication pages** (Login/Register)
2. **Add form validation** (React Hook Form + Zod)
3. **Implement real-time updates** (WebSocket or polling)
4. **Add toast notifications** (react-hot-toast or sonner)
5. **Set up error tracking** (Sentry)
6. **Add loading skeletons** for better UX
7. **Implement offline support** (PWA)

---

## Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Axios Docs](https://axios-http.com/)
- [Zustand Docs](https://zustand-demo.pmnd.rs/)
- [Backend API Swagger](http://localhost:4000/api-docs)

---

## Troubleshooting

### CORS Issues

```typescript
// Backend: src/middleware/security.ts
corsConfig: {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}
```

### 401 Unauthorized

- Check if token is being sent in headers
- Verify token is not expired
- Check backend JWT_SECRET

### Network Errors

- Verify backend is running on port 4000
- Check `VITE_API_URL` environment variable
- Test API directly with Postman/curl

### Type Errors

- Regenerate types from OpenAPI spec
- Check API response matches type definitions
- Use `unknown` type and validate at runtime with Zod
