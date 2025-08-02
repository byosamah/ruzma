import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Enhanced async state management hook
 */
export function useAsync<T = any>() {
  const [state, setState] = useState<{
    data: T | null;
    error: Error | null;
    loading: boolean;
  }>({
    data: null,
    error: null,
    loading: false
  });

  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async (asyncFunction: () => Promise<T>) => {
    setState({ data: null, error: null, loading: true });

    try {
      const data = await asyncFunction();
      
      if (mountedRef.current) {
        setState({ data, error: null, loading: false });
      }
      
      return data;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      if (mountedRef.current) {
        setState({ data: null, error: errorObj, loading: false });
      }
      
      throw errorObj;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, error: null, loading: false });
  }, []);

  return {
    ...state,
    execute,
    reset,
    isIdle: !state.loading && !state.data && !state.error,
    isLoading: state.loading,
    isError: !!state.error,
    isSuccess: !!state.data && !state.error
  };
}

/**
 * Debounced async hook
 */
export function useDebouncedAsync<T = any>(delay: number = 500) {
  const async = useAsync<T>();
  const timeoutRef = useRef<NodeJS.Timeout>();

  const execute = useCallback((asyncFunction: () => Promise<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    return new Promise<T>((resolve, reject) => {
      timeoutRef.current = setTimeout(async () => {
        try {
          const result = await async.execute(asyncFunction);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  }, [async, delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...async,
    execute
  };
}

/**
 * Polling async hook
 */
export function usePollingAsync<T = any>(
  asyncFunction: () => Promise<T>,
  interval: number,
  options?: {
    enabled?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  }
) {
  const { enabled = true, onSuccess, onError } = options || {};
  const async = useAsync<T>();
  const intervalRef = useRef<NodeJS.Timeout>();

  const startPolling = useCallback(() => {
    const poll = async () => {
      try {
        const data = await async.execute(asyncFunction);
        onSuccess?.(data);
      } catch (error) {
        onError?.(error as Error);
      }
    };

    // Initial poll
    poll();

    // Set up interval
    intervalRef.current = setInterval(poll, interval);
  }, [async, asyncFunction, interval, onSuccess, onError]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      startPolling();
    } else {
      stopPolling();
    }

    return stopPolling;
  }, [enabled, startPolling, stopPolling]);

  return {
    ...async,
    startPolling,
    stopPolling,
    isPolling: !!intervalRef.current
  };
}

/**
 * Sequential async operations
 */
export function useSequentialAsync<T = any>() {
  const [results, setResults] = useState<T[]>([]);
  const [errors, setErrors] = useState<Error[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const execute = useCallback(async (
    asyncFunctions: Array<() => Promise<T>>
  ) => {
    setResults([]);
    setErrors([]);
    setLoading(true);
    setProgress(0);

    const newResults: T[] = [];
    const newErrors: Error[] = [];

    for (let i = 0; i < asyncFunctions.length; i++) {
      try {
        const result = await asyncFunctions[i]();
        newResults.push(result);
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        newErrors.push(errorObj);
      }

      setProgress(((i + 1) / asyncFunctions.length) * 100);
    }

    setResults(newResults);
    setErrors(newErrors);
    setLoading(false);

    return { results: newResults, errors: newErrors };
  }, []);

  return {
    results,
    errors,
    loading,
    progress,
    execute,
    hasErrors: errors.length > 0,
    successCount: results.length,
    errorCount: errors.length
  };
}

/**
 * Parallel async operations
 */
export function useParallelAsync<T = any>() {
  const [results, setResults] = useState<(T | Error)[]>([]);
  const [loading, setLoading] = useState(false);

  const execute = useCallback(async (
    asyncFunctions: Array<() => Promise<T>>
  ) => {
    setLoading(true);
    setResults([]);

    const promises = asyncFunctions.map(fn => 
      fn().catch(error => error instanceof Error ? error : new Error(String(error)))
    );

    const newResults = await Promise.all(promises);
    
    setResults(newResults);
    setLoading(false);

    return newResults;
  }, []);

  const successes = results.filter((r): r is T => !(r instanceof Error));
  const errors = results.filter((r): r is Error => r instanceof Error);

  return {
    results,
    successes,
    errors,
    loading,
    execute,
    hasErrors: errors.length > 0,
    successCount: successes.length,
    errorCount: errors.length
  };
}