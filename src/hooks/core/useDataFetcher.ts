import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/components/AuthStateContext';
import { ErrorHandler } from '@/services/core/ErrorHandler';

export interface UseDataFetcherOptions<T> {
  fetchFn: () => Promise<T>;
  dependencies?: any[];
  initialData?: T;
  requireAuth?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  enabled?: boolean;
  refetchInterval?: number;
  cacheKey?: string;
  cacheDuration?: number;
}

export interface UseDataFetcherResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isRefetching: boolean;
  lastFetchTime: Date | null;
}

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();

export function useDataFetcher<T>({
  fetchFn,
  dependencies = [],
  initialData = null,
  requireAuth = true,
  onSuccess,
  onError,
  enabled = true,
  refetchInterval,
  cacheKey,
  cacheDuration = 5 * 60 * 1000 // 5 minutes default
}: UseDataFetcherOptions<T>): UseDataFetcherResult<T> {
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefetching, setIsRefetching] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  
  const { user } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout>();
  const mountedRef = useRef(true);

  const fetchData = useCallback(async (isRefetch = false) => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    if (requireAuth && !user) {
      setData(null);
      setLoading(false);
      setError('Authentication required');
      return;
    }

    // Check cache
    if (cacheKey && !isRefetch) {
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cacheDuration) {
        setData(cached.data);
        setLoading(false);
        setLastFetchTime(new Date(cached.timestamp));
        return;
      }
    }

    try {
      if (isRefetch) {
        setIsRefetching(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const result = await fetchFn();
      
      if (!mountedRef.current) return;

      setData(result);
      setLastFetchTime(new Date());
      
      // Update cache
      if (cacheKey) {
        cache.set(cacheKey, { data: result, timestamp: Date.now() });
      }

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      if (!mountedRef.current) return;
      
      const errorMessage = ErrorHandler.getUserMessage(err);
      setError(errorMessage);
      
      ErrorHandler.handle(err, 'useDataFetcher', {
        showToast: false,
        logEvent: true
      });

      if (onError) {
        onError(err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setIsRefetching(false);
      }
    }
  }, [enabled, requireAuth, user, fetchFn, cacheKey, cacheDuration, onSuccess, onError]);

  // Initial fetch and dependency changes
  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    
    return () => {
      mountedRef.current = false;
    };
  }, [fetchData, ...dependencies]);

  // Set up refetch interval
  useEffect(() => {
    if (refetchInterval && refetchInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchData(true);
      }, refetchInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [refetchInterval, fetchData]);

  const refetch = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    isRefetching,
    lastFetchTime
  };
}

// Utility function to clear cache
export function clearDataCache(key?: string) {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

// Higher-order hook for common patterns
export function createDataFetcher<T>(
  fetchFn: () => Promise<T>,
  defaultOptions?: Partial<UseDataFetcherOptions<T>>
) {
  return (options?: Partial<UseDataFetcherOptions<T>>) => {
    return useDataFetcher<T>({
      fetchFn,
      ...defaultOptions,
      ...options
    });
  };
}