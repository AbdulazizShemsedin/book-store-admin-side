import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/error-handler';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute baseline fresh cache
        gcTime: 10 * 60 * 1000, // 10 minutes cache retention
        refetchOnWindowFocus: false, // Prevent jarring refetches while admin is editing forms
        refetchOnReconnect: 'always', // Auto-sync active view when network reconnects
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff: 1s, 2s, 4s...
        retry: (failureCount, error) => {
          // Never retry aborted requests (from route navigation or unmount)
          if (
            error?.name === 'AbortError' ||
            (error instanceof Error && error.message.toLowerCase().includes('abort'))
          ) {
            return false;
          }
          // Never retry on deterministic 4xx client errors (400, 401, 403, 404, 422)
          if (error instanceof ApiError) {
            if (
              error.isValidationError ||
              error.isUnauthorized ||
              error.isForbidden ||
              error.status === 404 ||
              error.status === 400
            ) {
              return false;
            }
          }
          // Only retry transient 5xx server errors or network disconnects up to 2 times
          return failureCount < 2;
        },
      },
      mutations: {
        retry: false, // Never auto-retry destructive or creation mutations
      },
    },
  });
}

export const queryClient = createQueryClient();
