import { useState, type FormEvent } from 'react';
import { useTodos, useCreateTodo, useToggleTodo, useDeleteTodo } from '../hooks/useTodos';
import Button from './Button';

export default function TodoList() {
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Queries
  const { data, isLoading, error } = useTodos({ page, limit });

  // Mutations
  const createTodo = useCreateTodo();
  const toggleTodo = useToggleTodo();
  const deleteTodo = useDeleteTodo();

  const handleCreate = async (e: FormEvent) => {
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
        <h1 className="text-3xl font-bold mb-8 text-slate-800">Todo List</h1>

        {/* Create Todo Form */}
        <form onSubmit={handleCreate} className="mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
              placeholder="Add a new todo..."
              className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              disabled={createTodo.isPending}
            />
            <Button type="submit" disabled={createTodo.isPending || !newTodoTitle.trim()}>
              {createTodo.isPending ? 'Adding...' : 'Add Todo'}
            </Button>
          </div>
          {createTodo.error && (
            <div className="mt-2 text-sm text-red-500">
              Failed to create todo: {createTodo.error.message}
            </div>
          )}
        </form>

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
