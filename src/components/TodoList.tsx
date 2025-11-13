import { useState } from 'react';
import { Link } from 'react-router';
import { useTodos, useCreateTodo, useToggleTodo, useDeleteTodo } from '../hooks/useTodos';
import type { CreateTodoInput } from '../types/todo';
import TodoForm from './TodoForm';
import Button from './Button';

export default function TodoList() {
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const limit = 10;

  // Queries
  const { data, isLoading, error } = useTodos({ page, limit });

  // Mutations
  const createTodo = useCreateTodo();
  const toggleTodo = useToggleTodo();
  const deleteTodo = useDeleteTodo();

  const handleCreate = async (input: CreateTodoInput) => {
    await createTodo.mutateAsync(input);
    setShowForm(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-slate-500">Loading todos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">Error loading todos</div>
          <div className="text-slate-600">{error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-2xl mx-auto px-6">
        {/* Navigation */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Home
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8 text-slate-800">Todo List (REST API)</h1>

        {/* Create Todo Form - Toggle visibility */}
        <div className="mb-8">
          {!showForm ? (
            <Button
              onClick={() => setShowForm(true)}
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              + Add New Todo
            </Button>
          ) : (
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-slate-800">Create New Todo</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>
              <TodoForm onSubmit={handleCreate} isSubmitting={createTodo.isPending} />
            </div>
          )}
        </div>

        {/* Todo List */}
        <div className="space-y-3">
          {data?.data.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
              <div className="text-slate-400 text-lg">No todos yet</div>
              <div className="text-slate-400 text-sm mt-1">Create one to get started!</div>
            </div>
          ) : (
            data?.data.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={(e) => toggleTodo.mutate({ id: todo.id, completed: e.target.checked })}
                  className="w-5 h-5 text-orange-500 border-slate-300 rounded focus:ring-orange-500 focus:ring-offset-0 cursor-pointer"
                />
                <span
                  className={`flex-1 text-slate-800 ${
                    todo.completed ? 'line-through text-slate-400' : ''
                  }`}
                >
                  {todo.title}
                </span>
                <Button
                  onClick={() => deleteTodo.mutate(todo.id)}
                  disabled={deleteTodo.isPending}
                  className="text-sm px-3 py-1 bg-red-500 hover:bg-red-600"
                >
                  {deleteTodo.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {data && data.meta.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="bg-slate-600 hover:bg-slate-700"
            >
              Previous
            </Button>
            <span className="text-slate-600">
              Page {page} of {data.meta.totalPages}
            </span>
            <Button
              onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
              disabled={page === data.meta.totalPages}
              className="bg-slate-600 hover:bg-slate-700"
            >
              Next
            </Button>
          </div>
        )}

        {/* Stats */}
        {data && (
          <div className="mt-8 text-center text-sm text-slate-500">
            {data.meta.total} total todo{data.meta.total !== 1 ? 's' : ''}
            {data.data.length > 0 && ` • ${data.data.filter((t) => t.completed).length} completed`}
          </div>
        )}
      </div>
    </div>
  );
}
