/**
 * Custom React hooks for GraphQL Todo operations
 *
 * These hooks wrap the generated Apollo hooks with additional functionality:
 * - Optimistic updates for instant UI feedback
 * - Cache management for consistent data
 * - Error handling with user-friendly messages
 * - Loading states
 */

import { useCallback, useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import {
  useGetTodosQuery,
  useGetTodoQuery,
  useCreateTodoMutation,
  useUpdateTodoMutation,
  useDeleteTodoMutation,
  useToggleTodoMutation,
  useTodoUpdatedSubscription,
  GetTodosDocument,
  type GetTodosQuery,
  type Todo,
  type CreateTodoInput,
  type UpdateTodoInput,
  type TodoFilterInput,
  type TodoSortField,
  type SortOrder,
} from '../generated/graphql';
import { getApolloErrorMessage } from '../lib/apolloClient';

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Hook to fetch paginated list of todos
 */
export const useGetTodos = (options?: {
  page?: number;
  limit?: number;
  filter?: TodoFilterInput;
  sortBy?: TodoSortField;
  sortOrder?: SortOrder;
}) => {
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const { data, loading, error, refetch, fetchMore } = useGetTodosQuery({
    variables: {
      page: options?.page || 1,
      limit: options?.limit || 10,
      filter: options?.filter,
      sortBy: options?.sortBy,
      sortOrder: options?.sortOrder,
    },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    context: { userId },
  });

  useEffect(() => {
    refetch();
  }, [userId, refetch]);

  return {
    todos: data?.todos.data || [],
    meta: data?.todos.meta,
    loading,
    error,
    refetch,
    fetchMore,
  };
};

/**
 * Hook to fetch a single todo by ID
 */
export const useGetTodo = (id: string) => {
  const { data, loading, error, refetch } = useGetTodoQuery({
    variables: { id },
    skip: !id, // Skip query if no ID provided
  });

  return {
    todo: data?.todo || null,
    loading,
    error: error ? getApolloErrorMessage(error) : null,
    refetch,
  };
};

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Hook to create a new todo with optimistic update
 */
export const useCreateTodo = () => {
  const [createTodoMutation, { loading, error }] = useCreateTodoMutation();

  const createTodo = useCallback(
    async (input: CreateTodoInput) => {
      try {
        const result = await createTodoMutation({
          variables: { input },
          // Optimistic response for instant UI update
          optimisticResponse: {
            __typename: 'Mutation',
            createTodo: {
              __typename: 'Todo',
              id: `temp-${Date.now()}`, // Temporary ID
              title: input.title,
              completed: input.completed || false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
          // Update cache after mutation
          update: (cache, { data: mutationData }) => {
            if (!mutationData?.createTodo) return;

            // Read existing todos from cache
            const existingData = cache.readQuery<GetTodosQuery>({
              query: GetTodosDocument,
              variables: { page: 1, limit: 10 },
            });

            if (existingData?.todos) {
              // Write updated todos back to cache
              cache.writeQuery({
                query: GetTodosDocument,
                variables: { page: 1, limit: 10 },
                data: {
                  todos: {
                    ...existingData.todos,
                    data: [mutationData.createTodo, ...existingData.todos.data],
                    meta: {
                      ...existingData.todos.meta,
                      total: existingData.todos.meta.total + 1,
                    },
                  },
                },
              });
            }
          },
        });

        return result.data?.createTodo;
      } catch (err) {
        console.error('Failed to create todo:', err);
        throw err;
      }
    },
    [createTodoMutation]
  );

  return {
    createTodo,
    loading,
    error: error ? getApolloErrorMessage(error) : null,
  };
};

/**
 * Hook to update an existing todo with optimistic update
 */
export const useUpdateTodo = () => {
  const [updateTodoMutation, { loading, error }] = useUpdateTodoMutation();

  const updateTodo = useCallback(
    async (id: string, input: UpdateTodoInput) => {
      try {
        const result = await updateTodoMutation({
          variables: { id, input },
          // Optimistic response
          optimisticResponse: {
            __typename: 'Mutation',
            updateTodo: {
              __typename: 'Todo',
              id,
              title: input.title || '',
              completed: input.completed ?? false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
        });

        return result.data?.updateTodo;
      } catch (err) {
        console.error('Failed to update todo:', err);
        throw err;
      }
    },
    [updateTodoMutation]
  );

  return {
    updateTodo,
    loading,
    error: error ? getApolloErrorMessage(error) : null,
  };
};

/**
 * Hook to delete a todo with cache eviction
 */
export const useDeleteTodo = () => {
  const [deleteTodoMutation, { loading, error }] = useDeleteTodoMutation();

  const deleteTodo = useCallback(
    async (id: string) => {
      try {
        const result = await deleteTodoMutation({
          variables: { id },
          // Optimistic response
          optimisticResponse: {
            __typename: 'Mutation',
            deleteTodo: true,
          },
          // Update cache after deletion
          update: (cache, { data: mutationData }) => {
            if (!mutationData?.deleteTodo) return;

            // Evict the deleted todo from cache
            cache.evict({ id: `Todo:${id}` });
            cache.gc(); // Garbage collect

            // Update todos list in cache
            const existingData = cache.readQuery<GetTodosQuery>({
              query: GetTodosDocument,
              variables: { page: 1, limit: 10 },
            });

            if (existingData?.todos) {
              cache.writeQuery({
                query: GetTodosDocument,
                variables: { page: 1, limit: 10 },
                data: {
                  todos: {
                    ...existingData.todos,
                    data: existingData.todos.data.filter((todo) => todo.id !== id),
                    meta: {
                      ...existingData.todos.meta,
                      total: existingData.todos.meta.total - 1,
                    },
                  },
                },
              });
            }
          },
        });

        return result.data?.deleteTodo;
      } catch (err) {
        console.error('Failed to delete todo:', err);
        throw err;
      }
    },
    [deleteTodoMutation]
  );

  return {
    deleteTodo,
    loading,
    error: error ? getApolloErrorMessage(error) : null,
  };
};

/**
 * Hook to toggle todo completion status with optimistic update
 */
export const useToggleTodo = () => {
  const [toggleTodoMutation, { loading, error }] = useToggleTodoMutation();

  const toggleTodo = useCallback(
    async (id: string, currentCompleted: boolean) => {
      try {
        const result = await toggleTodoMutation({
          variables: { id },
          // Optimistic response for instant feedback
          optimisticResponse: {
            __typename: 'Mutation',
            toggleTodo: {
              __typename: 'Todo',
              id,
              title: '', // Will be filled from cache
              completed: !currentCompleted,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
        });

        return result.data?.toggleTodo;
      } catch (err) {
        console.error('Failed to toggle todo:', err);
        throw err;
      }
    },
    [toggleTodoMutation]
  );

  return {
    toggleTodo,
    loading,
    error: error ? getApolloErrorMessage(error) : null,
  };
};

// ============================================================================
// SUBSCRIPTION HOOK
// ============================================================================

/**
 * Hook to subscribe to real-time todo updates
 */
export const useTodoSubscription = (options?: {
  onUpdate?: (todo: Todo) => void;
  skip?: boolean;
}) => {
  const { data, loading, error } = useTodoUpdatedSubscription({
    skip: options?.skip,
    onData: ({ data: subscriptionData }) => {
      const todo = subscriptionData.data?.todoUpdated;
      if (todo && options?.onUpdate) {
        options.onUpdate(todo);
      }
    },
  });

  return {
    todo: data?.todoUpdated || null,
    loading,
    error: error ? getApolloErrorMessage(error) : null,
  };
};

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook to get all todos operations in one object
 */
export const useTodos = (options?: {
  page?: number;
  limit?: number;
  filter?: TodoFilterInput;
  sortBy?: TodoSortField;
  sortOrder?: SortOrder;
  enableSubscription?: boolean;
}) => {
  const getTodosHook = useGetTodos(options);
  const createTodoHook = useCreateTodo();
  const updateTodoHook = useUpdateTodo();
  const deleteTodoHook = useDeleteTodo();
  const toggleTodoHook = useToggleTodo();

  // Always call subscription hook but conditionally use it
  const subscriptionData = useTodoSubscription({
    skip: !options?.enableSubscription,
    onUpdate: (todo) => {
      if (options?.enableSubscription) {
        console.log('Todo updated via subscription:', todo);
        // Don't refetch - Apollo cache is already updated by subscription
        // The UI will update automatically via cache reactivity
      }
    },
  });

  return {
    // Query data
    todos: getTodosHook.todos,
    meta: getTodosHook.meta,
    loading: getTodosHook.loading,
    error: getTodosHook.error,
    refetch: getTodosHook.refetch,

    // Mutations
    createTodo: createTodoHook.createTodo,
    updateTodo: updateTodoHook.updateTodo,
    deleteTodo: deleteTodoHook.deleteTodo,
    toggleTodo: toggleTodoHook.toggleTodo,

    // Mutation states
    isCreating: createTodoHook.loading,
    isUpdating: updateTodoHook.loading,
    isDeleting: deleteTodoHook.loading,
    isToggling: toggleTodoHook.loading,

    // Subscription
    subscription: options?.enableSubscription ? subscriptionData : null,
  };
};
