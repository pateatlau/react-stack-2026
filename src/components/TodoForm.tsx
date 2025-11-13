import { useState, type FormEvent } from 'react';
import { safeValidateCreateTodo, type CreateTodoInput } from '../types/todo';
import Button from './Button';

interface TodoFormProps {
  onSubmit: (data: CreateTodoInput) => Promise<void>;
  isSubmitting?: boolean;
}

export default function TodoForm({ onSubmit, isSubmitting = false }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [completed, setCompleted] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors([]);

    // ✅ Client-side validation using Zod schema (same as backend)
    const result = safeValidateCreateTodo({ title, completed });

    if (!result.success) {
      // Extract error messages from Zod validation
      const errorMessages = result.error.issues.map((issue: { message: string }) => issue.message);
      setErrors(errorMessages);
      return;
    }

    try {
      // ✅ result.data is fully validated and typed
      await onSubmit(result.data);
      // Reset form on success
      setTitle('');
      setCompleted(false);
    } catch (err) {
      setErrors(['Failed to create todo. Please try again.']);
      console.error('Todo creation error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error messages */}
      {errors.length > 0 && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Validation errors</h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc space-y-1 pl-5">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Title input */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Enter todo title..."
          disabled={isSubmitting}
        />
        <p className="mt-1 text-xs text-gray-500">1-200 characters</p>
      </div>

      {/* Completed checkbox */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="completed"
          checked={completed}
          onChange={(e) => setCompleted(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          disabled={isSubmitting}
        />
        <label htmlFor="completed" className="ml-2 block text-sm text-gray-900">
          Mark as completed
        </label>
      </div>

      {/* Submit button */}
      <Button type="submit" disabled={isSubmitting || !title.trim()}>
        {isSubmitting ? 'Creating...' : 'Create Todo'}
      </Button>
    </form>
  );
}
