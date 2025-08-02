import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Debounce a value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Debounce a callback function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  options?: {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
  }
): T {
  const { leading = false, trailing = true, maxWait } = options || {};
  
  const timeoutRef = useRef<NodeJS.Timeout>();
  const maxTimeoutRef = useRef<NodeJS.Timeout>();
  const lastCallTime = useRef<number>(0);
  const lastArgs = useRef<any[]>();

  const clearTimeouts = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = undefined;
    }
  }, []);

  const flush = useCallback(() => {
    if (lastArgs.current && trailing) {
      callback(...lastArgs.current);
    }
    clearTimeouts();
    lastArgs.current = undefined;
  }, [callback, trailing, clearTimeouts]);

  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    lastArgs.current = args;
    const now = Date.now();

    // Leading edge
    if (leading && !timeoutRef.current) {
      callback(...args);
    }

    clearTimeouts();

    // Set trailing timeout
    if (trailing) {
      timeoutRef.current = setTimeout(() => {
        callback(...args);
        lastArgs.current = undefined;
        clearTimeouts();
      }, delay);
    }

    // Set max wait timeout
    if (maxWait && (!lastCallTime.current || now - lastCallTime.current >= maxWait)) {
      lastCallTime.current = now;
      
      if (!leading) {
        callback(...args);
      }
      
      maxTimeoutRef.current = setTimeout(() => {
        lastCallTime.current = 0;
      }, maxWait);
    }
  }, [callback, delay, leading, trailing, maxWait, clearTimeouts]) as T;

  // Cleanup on unmount
  useEffect(() => {
    return clearTimeouts;
  }, [clearTimeouts]);

  // Add flush method
  (debouncedCallback as any).flush = flush;
  (debouncedCallback as any).cancel = clearTimeouts;

  return debouncedCallback;
}

/**
 * Throttle a callback function
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  options?: {
    leading?: boolean;
    trailing?: boolean;
  }
): T {
  const { leading = true, trailing = true } = options || {};
  
  const lastCallTime = useRef<number>(0);
  const lastArgs = useRef<any[]>();
  const timeoutRef = useRef<NodeJS.Timeout>();

  const throttledCallback = useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime.current;

    lastArgs.current = args;

    const invokeCallback = () => {
      lastCallTime.current = Date.now();
      callback(...args);
    };

    if (timeSinceLastCall >= delay) {
      // Leading edge
      if (leading) {
        invokeCallback();
      } else {
        lastCallTime.current = now;
      }

      // Set trailing timeout
      if (trailing) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          if (lastArgs.current) {
            invokeCallback();
            lastArgs.current = undefined;
          }
        }, delay);
      }
    } else if (trailing && !timeoutRef.current) {
      // Schedule trailing call
      timeoutRef.current = setTimeout(() => {
        if (lastArgs.current) {
          invokeCallback();
          lastArgs.current = undefined;
        }
        timeoutRef.current = undefined;
      }, delay - timeSinceLastCall);
    }
  }, [callback, delay, leading, trailing]) as T;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
}

/**
 * Debounced state hook
 */
export function useDebouncedState<T>(
  initialValue: T,
  delay: number
): [T, T, (value: T) => void] {
  const [value, setValue] = useState<T>(initialValue);
  const debouncedValue = useDebounce(value, delay);

  return [value, debouncedValue, setValue];
}

/**
 * Search input hook with debouncing
 */
export function useDebouncedSearch(
  onSearch: (query: string) => void,
  delay: number = 300
) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const debouncedSearch = useDebouncedCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        await onSearch(searchQuery);
      } finally {
        setIsSearching(false);
      }
    },
    delay
  );

  const handleChange = useCallback((value: string) => {
    setQuery(value);
    if (value.trim()) {
      setIsSearching(true);
    }
    debouncedSearch(value);
  }, [debouncedSearch]);

  const clear = useCallback(() => {
    setQuery('');
    setIsSearching(false);
    debouncedSearch.cancel();
  }, [debouncedSearch]);

  return {
    query,
    isSearching,
    handleChange,
    clear
  };
}