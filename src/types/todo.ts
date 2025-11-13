/**
 * Frontend types for Todo application
 *
 * These types are imported from the backend shared schemas
 * to ensure type consistency across the full stack.
 */

// Re-export types from backend shared schemas (use '../shared' for Docker, 'todo-backend/shared' for local)
export type {
  Todo,
  CreateTodoInput,
  UpdateTodoInput,
  TodoQueryParams,
  PaginationMeta,
  ApiError,
} from '../shared';

// Re-export schemas for validation
export {
  TodoSchema,
  CreateTodoInputSchema,
  UpdateTodoInputSchema,
  TodoQueryParamsSchema,
  safeValidateCreateTodo,
  safeValidateUpdateTodo,
} from '../shared';

// Frontend-specific type aliases for convenience
export type { Todo as TodosResponse } from '../shared';

// Paginated response type (combining backend types)
import type { Todo, PaginationMeta } from '../shared';

export interface PaginatedTodosResponse {
  data: Todo[];
  meta: PaginationMeta;
}
