import { 
  useQuery as useReactQuery, 
  useMutation as useReactMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions
} from '@tanstack/react-query';
import { requestCache } from '@/lib/performance/requestCache';

/**
 * Enhanced useQuery hook with caching
 */
export function useQuery<T = unknown>(
  key: string | string[],
  fetcher: () => Promise<T>,
  options?: Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'> & {
    cache?: boolean;
    cacheTTL?: number;
  }
) {
  const { cache = true, cacheTTL = 5 * 60 * 1000, ...queryOptions } = options || {};
  const queryKey = Array.isArray(key) ? key : [key];
  const cacheKey = queryKey.join(':');

  return useReactQuery({
    queryKey,
    queryFn: cache 
      ? () => requestCache.dedupe(cacheKey, fetcher, { ttl: cacheTTL })
      : fetcher,
    staleTime: cacheTTL,
    gcTime: cacheTTL * 2,
    ...queryOptions
  });
}

/**
 * Enhanced useMutation hook with optimistic updates
 */
export function useMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, Error, TVariables> & {
    invalidateKeys?: string[][];
    optimisticUpdate?: (variables: TVariables) => void;
  }
) {
  const queryClient = useQueryClient();
  const { invalidateKeys = [], optimisticUpdate, ...mutationOptions } = options || {};

  return useReactMutation({
    mutationFn,
    onMutate: async (variables) => {
      // Cancel outgoing queries
      const promises = invalidateKeys.map(key => 
        queryClient.cancelQueries({ queryKey: key })
      );
      await Promise.all(promises);

      // Optimistic update
      if (optimisticUpdate) {
        optimisticUpdate(variables);
      }

      // Return context for rollback
      const previousData: Record<string, unknown> = {};
      invalidateKeys.forEach(key => {
        previousData[key.join(':')] = queryClient.getQueryData(key);
      });

      return { previousData };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        Object.entries(context.previousData).forEach(([key, data]) => {
          const queryKey = key.split(':');
          queryClient.setQueryData(queryKey, data);
        });
      }
      
      // Call original onError
      options?.onError?.(error, variables, context);
    },
    onSettled: async (data, error, variables, context) => {
      // Invalidate and refetch
      const promises = invalidateKeys.map(key => {
        // Invalidate cache
        requestCache.invalidate(key.join(':'));
        // Invalidate query
        return queryClient.invalidateQueries({ queryKey: key });
      });
      await Promise.all(promises);
      
      // Call original onSettled
      options?.onSettled?.(data, error, variables, context);
    },
    ...mutationOptions
  });
}

/**
 * Prefetch query data
 */
export function usePrefetch() {
  const queryClient = useQueryClient();

  return async <T = unknown>(
    key: string | string[],
    fetcher: () => Promise<T>,
    options?: {
      cache?: boolean;
      cacheTTL?: number;
    }
  ) => {
    const { cache = true, cacheTTL = 5 * 60 * 1000 } = options || {};
    const queryKey = Array.isArray(key) ? key : [key];
    const cacheKey = queryKey.join(':');

    await queryClient.prefetchQuery({
      queryKey,
      queryFn: cache 
        ? () => requestCache.dedupe(cacheKey, fetcher, { ttl: cacheTTL })
        : fetcher,
      staleTime: cacheTTL
    });
  };
}

/**
 * Invalidate queries and clear cache
 */
export function useInvalidate() {
  const queryClient = useQueryClient();

  return (keys: string[][]) => {
    keys.forEach(key => {
      // Clear request cache
      requestCache.invalidate(key.join(':'));
      // Invalidate React Query cache
      queryClient.invalidateQueries({ queryKey: key });
    });
  };
}