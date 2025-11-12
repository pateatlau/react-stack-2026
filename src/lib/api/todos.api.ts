import { apiClient } from './client';
import type {
  Todo,
  CreateTodoInput,
  UpdateTodoInput,
  PaginatedTodosResponse,
} from '../../types/todo';

export const todosApi = {
  /**
   * Get all todos with pagination
   */
  getAll: async (params?: { page?: number; limit?: number }) => {
    const { data } = await apiClient.get<PaginatedTodosResponse>('/api/todos', {
      params,
    });
    return data;
  },

  /**
   * Get single todo by ID
   */
  getById: async (id: string) => {
    const { data } = await apiClient.get<Todo>(`/api/todos/${id}`);
    return data;
  },

  /**
   * Create a new todo
   */
  create: async (input: CreateTodoInput) => {
    const { data } = await apiClient.post<Todo>('/api/todos', input);
    return data;
  },

  /**
   * Update an existing todo
   */
  update: async (id: string, input: UpdateTodoInput) => {
    const { data } = await apiClient.put<Todo>(`/api/todos/${id}`, input);
    return data;
  },

  /**
   * Delete a todo
   */
  delete: async (id: string) => {
    await apiClient.delete(`/api/todos/${id}`);
  },

  /**
   * Toggle todo completion status
   */
  toggle: async (id: string, completed: boolean) => {
    const { data } = await apiClient.put<Todo>(`/api/todos/${id}`, {
      completed,
    });
    return data;
  },
};
