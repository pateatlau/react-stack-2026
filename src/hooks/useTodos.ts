import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { todosApi } from '../lib/api/todos.api';
import type { CreateTodoInput, UpdateTodoInput, Todo } from '../types/todo';

// Query keys factory for type-safe cache management
export const todoKeys = {
  all: ['todos'] as const,
  lists: () => [...todoKeys.all, 'list'] as const,
  list: (userId: string | null, params?: { page?: number; limit?: number }) =>
    [...todoKeys.lists(), { userId, ...params }] as const,
  details: () => [...todoKeys.all, 'detail'] as const,
  detail: (id: string) => [...todoKeys.details(), id] as const,
};

/**
 * Hook to fetch all todos with pagination
 */
import { useAuthStore } from '../stores/useAuthStore';

export const useTodos = (params?: { page?: number; limit?: number }) => {
  const userId = useAuthStore((state) => state.user?.id ?? null);
  return useQuery({
    queryKey: todoKeys.list(userId, params),
    queryFn: () => todosApi.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch a single todo by ID
 */
export const useTodo = (id: string) => {
  return useQuery({
    queryKey: todoKeys.detail(id),
    queryFn: () => todosApi.getById(id),
    enabled: !!id, // Only fetch if id exists
  });
};

/**
 * Hook to create a new todo
 */
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

/**
 * Hook to update an existing todo
 */
export const useUpdateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTodoInput }) =>
      todosApi.update(id, input),
    onSuccess: (data, variables) => {
      // Update cache for single todo
      queryClient.setQueryData(todoKeys.detail(variables.id), data);
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
    },
  });
};

/**
 * Hook to delete a todo
 */
export const useDeleteTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => todosApi.delete(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: todoKeys.detail(id) });
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
    },
  });
};

/**
 * Hook to toggle todo completion with optimistic update
 */
export const useToggleTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      todosApi.toggle(id, completed),
    // Optimistic update for instant UI feedback
    onMutate: async ({ id, completed }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: todoKeys.detail(id) });

      // Snapshot previous value
      const previousTodo = queryClient.getQueryData(todoKeys.detail(id));

      // Optimistically update cache
      queryClient.setQueryData(todoKeys.detail(id), (old: Todo | undefined) =>
        old ? { ...old, completed } : old
      );

      return { previousTodo };
    },
    onError: (_err, variables, context) => {
      // Rollback on error
      if (context?.previousTodo) {
        queryClient.setQueryData(todoKeys.detail(variables.id), context.previousTodo);
      }
    },
    onSettled: (_data, _error, variables) => {
      // Refetch to sync with server
      queryClient.invalidateQueries({ queryKey: todoKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
    },
  });
};
