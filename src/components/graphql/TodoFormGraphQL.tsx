/**
 * TodoFormGraphQL Component
 *
 * Form for creating and updating todos with GraphQL mutations
 */

import React, { useState } from 'react';
import { z } from 'zod';
import { type Todo, type CreateTodoInput, type UpdateTodoInput } from '../../generated/graphql';
import { useCreateTodo, useUpdateTodo } from '../../hooks/useGraphQLTodos';

// Validation schema
const todoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  completed: z.boolean(),
});

interface TodoFormGraphQLProps {
  todo?: Todo | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const TodoFormGraphQL = ({ todo, onSuccess, onCancel }: TodoFormGraphQLProps) => {
  const [title, setTitle] = useState(todo?.title || '');
  const [completed, setCompleted] = useState(todo?.completed || false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { createTodo, loading: isCreating, error: createError } = useCreateTodo();
  const { updateTodo, loading: isUpdating, error: updateError } = useUpdateTodo();

  const isLoading = isCreating || isUpdating;
  const error = createError || updateError;
  const isEditMode = !!todo;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError(null);

    // Validate input
    const result = todoSchema.safeParse({ title: title.trim(), completed });
    if (!result.success) {
      setValidationError(result.error.issues[0].message);
      return;
    }

    try {
      if (isEditMode && todo) {
        // Update existing todo
        const input: UpdateTodoInput = {
          title: result.data.title,
          completed: result.data.completed,
        };
        await updateTodo(todo.id, input);
      } else {
        // Create new todo
        const input: CreateTodoInput = {
          title: result.data.title,
          completed: result.data.completed,
        };
        await createTodo(input);
      }

      // Reset form on success
      setTitle('');
      setCompleted(false);
      setValidationError(null);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Form submission error:', err);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setCompleted(false);
    setValidationError(null);
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-lg shadow-sm p-6"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {isEditMode ? 'Edit Todo' : 'Create New Todo'}
      </h2>

      {/* Title Input */}
      <div className="mb-4">
        <label htmlFor="todo-title" className="block text-sm font-medium text-gray-700 mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="todo-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading}
          placeholder="Enter todo title..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-50"
          autoFocus
        />
      </div>

      {/* Completed Checkbox */}
      <div className="mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={completed}
            onChange={(e) => setCompleted(e.target.checked)}
            disabled={isLoading}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
          />
          <span className="text-sm font-medium text-gray-700">Mark as completed</span>
        </label>
      </div>

      {/* Error Messages */}
      {validationError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{validationError}</p>
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isLoading || !title.trim()}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {isEditMode ? 'Updating...' : 'Creating...'}
            </span>
          ) : (
            <span>{isEditMode ? 'Update Todo' : 'Create Todo'}</span>
          )}
        </button>

        {(isEditMode || onCancel) && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Optimistic Update Indicator */}
      {isLoading && (
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-xs text-blue-700">
            ⚡ Optimistic update: Changes will appear instantly and sync with server
          </p>
        </div>
      )}
    </form>
  );
};
