/**
 * Session Skeleton Loader
 *
 * Animated skeleton loader for session cards.
 * Provides visual feedback while session data is loading.
 */

export function SessionSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
      <div className="flex items-start justify-between">
        {/* Device Info Skeleton */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            {/* Device Icon */}
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>

            {/* Device Name and Browser */}
            <div className="flex-1">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
            </div>
          </div>

          {/* Additional Details Skeleton */}
          <div className="space-y-2 mt-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-52"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
          </div>
        </div>

        {/* Logout Button Skeleton */}
        <div className="ml-4 w-20 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    </div>
  );
}

/**
 * Multiple Session Skeletons
 *
 * Renders multiple skeleton loaders for the sessions list
 */
interface SessionSkeletonsProps {
  count?: number;
}

export function SessionSkeletons({ count = 3 }: SessionSkeletonsProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <SessionSkeleton key={index} />
      ))}
    </div>
  );
}
