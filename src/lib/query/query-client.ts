import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/error-handler';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes cache retention
        refetchOnWindowFocus: false, // Prevent jarring refetches while admin is editing forms
        retry: (failureCount, error) => {
          // Never retry on 4xx validation or unauthorized errors
          if (error instanceof ApiError && (error.isValidationError || error.isUnauthorized || error.isForbidden)) {
            return false;
          }
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
