/**
 * TodoItemGraphQL Component
 *
 * Individual todo item with GraphQL mutations for toggle and delete
 */

import { useState } from 'react';
import { type Todo } from '../../generated/graphql';
import { useToggleTodo, useDeleteTodo } from '../../hooks/useGraphQLTodos';

interface TodoItemGraphQLProps {
  todo: Todo;
  onEdit?: (todo: Todo) => void;
}

export const TodoItemGraphQL = ({ todo, onEdit }: TodoItemGraphQLProps) => {
  const { toggleTodo, loading: isToggling } = useToggleTodo();
  const { deleteTodo, loading: isDeleting } = useDeleteTodo();
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async () => {
    try {
      setError(null);
      await toggleTodo(todo.id, todo.completed);
    } catch (err) {
      setError('Failed to toggle todo');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
      setError(null);
      await deleteTodo(todo.id);
    } catch (err) {
      setError('Failed to delete todo');
      console.error(err);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(todo);
    }
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={handleToggle}
        disabled={isToggling || isDeleting}
        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
        aria-label={`Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`}
      />

      {/* Todo Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate ${
            todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
          }`}
        >
          {todo.title}
        </p>
        {todo.updatedAt && (
          <p className="text-xs text-gray-400 mt-0.5">
            Updated: {new Date(todo.updatedAt).toLocaleString()}
          </p>
        )}
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {onEdit && (
          <button
            onClick={handleEdit}
            disabled={isDeleting}
            className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label={`Edit "${todo.title}"`}
          >
            Edit
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={isDeleting || isToggling}
          className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label={`Delete "${todo.title}"`}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>

      {/* Loading Overlay */}
      {(isToggling || isDeleting) && (
        <div className="absolute inset-0 bg-white/50 rounded-lg flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};
