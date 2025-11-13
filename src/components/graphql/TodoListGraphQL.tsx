/**
 * TodoListGraphQL Component
 *
 * Main component for displaying and managing todos using GraphQL
 * Features:
 * - Paginated list of todos
 * - Real-time updates via subscriptions
 * - Create, update, delete, toggle todos
 * - Filtering and sorting
 */

import React, { useState } from 'react';
import { Link } from 'react-router';
import { TodoItemGraphQL } from './TodoItemGraphQL';
import { TodoFormGraphQL } from './TodoFormGraphQL';
import { useTodos } from '../../hooks/useGraphQLTodos';
import { type Todo, type TodoFilterInput, TodoSortField, SortOrder } from '../../generated/graphql';

export const TodoListGraphQL = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filter, setFilter] = useState<TodoFilterInput | undefined>(undefined);
  const [sortBy] = useState<TodoSortField>(TodoSortField.createdAt);
  const [sortOrder] = useState<SortOrder>(SortOrder.DESC);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Get all todo operations with real-time subscription
  const { todos, meta, loading, error, refetch, subscription } = useTodos({
    page,
    limit,
    filter,
    sortBy,
    sortOrder,
    enableSubscription: true,
  });

  // Check if error is rate limit related
  const isRateLimitError =
    error &&
    (error.includes('429') || error.includes('Too many requests') || error.includes('Rate limit'));

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setEditingTodo(null);
    setShowForm(false);
    // Don't refetch - mutations already update cache optimistically
  };

  const handleFormCancel = () => {
    setEditingTodo(null);
    setShowForm(false);
  };

  const handleFilterChange = (completed?: boolean) => {
    if (completed === undefined) {
      setFilter(undefined);
    } else {
      setFilter({ completed });
    }
    setPage(1); // Reset to first page
  };

  const handleNextPage = () => {
    if (meta && page < meta.totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Navigation */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Todo List <span className="text-blue-600">(GraphQL)</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time updates with Apollo Client & GraphQL Subscriptions
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          {showForm ? 'Hide Form' : 'Show Form'}
        </button>
      </div>

      {/* Subscription Status Indicator */}
      {subscription && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-sm text-green-700 font-medium">
              ⚡ Real-time updates active - Changes will appear instantly
            </p>
          </div>
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <TodoFormGraphQL
          todo={editingTodo}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          onClick={() => handleFilterChange(undefined)}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === undefined
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          All ({meta?.total || 0})
        </button>
        <button
          onClick={() => handleFilterChange(false)}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter?.completed === false
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => handleFilterChange(true)}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter?.completed === true
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Completed
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div
          className={`p-4 border rounded-lg ${
            isRateLimitError ? 'bg-yellow-50 border-yellow-300' : 'bg-red-50 border-red-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {isRateLimitError ? (
              <svg
                className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <div className="flex-1">
              <h3
                className={`text-sm font-semibold mb-1 ${
                  isRateLimitError ? 'text-yellow-800' : 'text-red-800'
                }`}
              >
                {isRateLimitError ? 'Rate Limit Exceeded' : 'Error'}
              </h3>
              {isRateLimitError ? (
                <div className="space-y-2">
                  <p className="text-sm text-yellow-700">
                    Too many requests were sent to the server. This is a temporary limit to prevent
                    overload.
                  </p>
                  <div className="bg-yellow-100 border border-yellow-200 rounded p-3 text-xs text-yellow-800">
                    <p className="font-medium mb-1">💡 Quick fixes:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Wait 10 seconds and click "Retry" below</li>
                      <li>Refresh the page to reset the connection</li>
                      <li>The backend rate limit is 10 requests per 10 seconds</li>
                    </ul>
                  </div>
                  <p className="text-xs text-yellow-600 mt-2">
                    Note: This app has been optimized to reduce requests. If this error persists,
                    the backend may need its rate limit adjusted.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-red-700">{error}</p>
              )}
              <button
                onClick={() => refetch()}
                className={`mt-3 px-3 py-1.5 text-xs font-medium rounded ${
                  isRateLimitError
                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border border-yellow-300'
                    : 'bg-red-100 text-red-800 hover:bg-red-200 border border-red-300'
                } transition-colors`}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && todos.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-500">Loading todos...</p>
          </div>
        </div>
      )}

      {/* Todo List */}
      {!loading && todos.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No todos</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new todo.</p>
        </div>
      )}

      {todos.length > 0 && (
        <div className="space-y-3">
          {todos.map((todo) => (
            <TodoItemGraphQL key={todo.id} todo={todo} onEdit={handleEditTodo} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-700">
              Page <span className="font-medium">{meta.page}</span> of{' '}
              <span className="font-medium">{meta.totalPages}</span>
            </p>
            <span className="text-gray-300">•</span>
            <p className="text-sm text-gray-500">{meta.total} total todos</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={page === 1 || loading}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={page >= meta.totalPages || loading}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Stats Footer */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Total</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{meta?.total || 0}</p>
        </div>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-600 font-medium uppercase tracking-wide">Active</p>
          <p className="text-2xl font-bold text-yellow-900 mt-1">
            {todos.filter((t) => !t.completed).length}
          </p>
        </div>
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs text-green-600 font-medium uppercase tracking-wide">Completed</p>
          <p className="text-2xl font-bold text-green-900 mt-1">
            {todos.filter((t) => t.completed).length}
          </p>
        </div>
      </div>
    </div>
  );
};
