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
