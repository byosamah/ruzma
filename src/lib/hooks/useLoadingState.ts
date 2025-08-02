import { useState, useCallback, useRef } from 'react';

/**
 * Centralized loading state management
 */
export function useLoadingState() {
  const [states, setStates] = useState<Record<string, boolean>>({});
  const countsRef = useRef<Record<string, number>>({});

  const setLoading = useCallback((key: string, isLoading: boolean) => {
    setStates(prev => ({ ...prev, [key]: isLoading }));
  }, []);

  const startLoading = useCallback((key: string) => {
    // Increment counter
    countsRef.current[key] = (countsRef.current[key] || 0) + 1;
    setLoading(key, true);
  }, [setLoading]);

  const stopLoading = useCallback((key: string) => {
    // Decrement counter
    countsRef.current[key] = Math.max(0, (countsRef.current[key] || 0) - 1);
    
    // Only set to false if counter is 0
    if (countsRef.current[key] === 0) {
      setLoading(key, false);
    }
  }, [setLoading]);

  const isLoading = useCallback((key: string) => {
    return states[key] || false;
  }, [states]);

  const isAnyLoading = useCallback((...keys: string[]) => {
    if (keys.length === 0) {
      return Object.values(states).some(Boolean);
    }
    return keys.some(key => states[key]);
  }, [states]);

  const isAllLoading = useCallback((...keys: string[]) => {
    if (keys.length === 0) {
      return false;
    }
    return keys.every(key => states[key]);
  }, [states]);

  const reset = useCallback((key?: string) => {
    if (key) {
      setStates(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      delete countsRef.current[key];
    } else {
      setStates({});
      countsRef.current = {};
    }
  }, []);

  const withLoading = useCallback(async <T,>(
    key: string,
    asyncFn: () => Promise<T>
  ): Promise<T> => {
    startLoading(key);
    try {
      return await asyncFn();
    } finally {
      stopLoading(key);
    }
  }, [startLoading, stopLoading]);

  return {
    states,
    setLoading,
    startLoading,
    stopLoading,
    isLoading,
    isAnyLoading,
    isAllLoading,
    reset,
    withLoading,
    // Commonly used keys
    keys: {
      submit: 'submit',
      fetch: 'fetch',
      delete: 'delete',
      update: 'update',
      upload: 'upload',
      download: 'download'
    }
  };
}

/**
 * Global loading indicator hook
 */
export function useGlobalLoading() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState<string>('');
  const countRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const show = useCallback((msg?: string) => {
    countRef.current++;
    
    if (msg) {
      setMessage(msg);
    }
    
    // Clear any pending hide timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    
    setVisible(true);
  }, []);

  const hide = useCallback(() => {
    countRef.current = Math.max(0, countRef.current - 1);
    
    if (countRef.current === 0) {
      // Delay hiding to prevent flashing
      timeoutRef.current = setTimeout(() => {
        setVisible(false);
        setMessage('');
      }, 200);
    }
  }, []);

  const reset = useCallback(() => {
    countRef.current = 0;
    setVisible(false);
    setMessage('');
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  return {
    visible,
    message,
    show,
    hide,
    reset
  };
}

/**
 * Progress tracking hook
 */
export function useProgress(total: number) {
  const [current, setCurrent] = useState(0);
  const [message, setMessage] = useState<string>('');

  const increment = useCallback((msg?: string) => {
    setCurrent(prev => Math.min(prev + 1, total));
    if (msg) setMessage(msg);
  }, [total]);

  const update = useCallback((value: number, msg?: string) => {
    setCurrent(Math.min(value, total));
    if (msg) setMessage(msg);
  }, [total]);

  const reset = useCallback(() => {
    setCurrent(0);
    setMessage('');
  }, []);

  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  const isComplete = current >= total;

  return {
    current,
    total,
    percentage,
    message,
    isComplete,
    increment,
    update,
    reset
  };
}