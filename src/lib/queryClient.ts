import { QueryClient } from '@tanstack/react-query';
import type { ApiError } from '../types/todo';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
      // Global error handler
      throwOnError: false,
    },
    mutations: {
      retry: 0,
      // Global error handler for mutations
      onError: (error) => {
        console.error('Mutation error:', error);
        // You can add toast notifications here
      },
    },
  },
});

// Helper to extract API error message
export const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const apiError = (error as { response?: { data?: ApiError } }).response?.data;
    if (apiError?.error) {
      return apiError.error;
    }
    if (apiError?.message) {
      return apiError.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
};
