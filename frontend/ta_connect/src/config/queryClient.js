import { QueryClient } from '@tanstack/react-query';

/**
 * Configure React Query client with optimized cache settings
 * - Stale time: 5 minutes - data is considered fresh for 5 mins
 * - Cache time: 10 minutes - data is kept in cache for 10 mins
 * - Retry: 1 attempt on failure
 * - Refetch on mount if data is stale
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnMount: 'stale',
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'stale',
    },
    mutations: {
      retry: 1,
    },
  },
});
