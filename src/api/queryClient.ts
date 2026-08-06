import { QueryClient } from '@tanstack/react-query';

/**
 * React Query is the read/write cache layer over the local SQLite source.
 * Offline-First defaults: data is considered fresh for a while and retries are
 * conservative, since the "network" is the local database.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      gcTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
