import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface AsyncOperationOptions {
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useAsyncOperation = <T extends unknown[], R>(
  operation: (...args: T) => Promise<R>,
  options: AsyncOperationOptions = {}
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (...args: T): Promise<R | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await operation(...args);
      
      if (options.successMessage) {
        toast.success(options.successMessage);
      }
      
      options.onSuccess?.();
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      setError(error);
      
      if (options.errorMessage) {
        toast.error(options.errorMessage);
      }
      
      options.onError?.(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [operation, options]);

  return {
    execute,
    loading,
    error
  };
};