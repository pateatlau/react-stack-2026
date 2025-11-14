import { create } from 'zustand';

export interface Todo {
  id: string;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TodoState {
  todos: Todo[];
  isLoading: boolean;
  error: string | null;

  setTodos: (todos: Todo[]) => void;
  addTodo: (todo: Todo) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  removeTodo: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useTodoStore = create<TodoState>((set) => ({
  todos: [],
  isLoading: false,
  error: null,

  setTodos: (todos) => set({ todos }),

  addTodo: (todo) => set((state) => ({ todos: [...state.todos, todo] })),

  updateTodo: (id, updates) =>
    set((state) => ({
      todos: state.todos.map((todo) => (todo.id === id ? { ...todo, ...updates } : todo)),
    })),

  removeTodo: (id) =>
    set((state) => ({
      todos: state.todos.filter((todo) => todo.id !== id),
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
