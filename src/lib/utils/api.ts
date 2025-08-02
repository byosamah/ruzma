import { PostgrestError } from '@supabase/supabase-js';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

/**
 * Centralized API response handler
 */
export const handleApiResponse = async <T>(
  promise: Promise<any>,
  errorMessage?: string
): Promise<ApiResponse<T>> => {
  try {
    const { data, error } = await promise;
    if (error) throw error;
    return { data };
  } catch (error) {
    const message = error instanceof Error ? error.message : (errorMessage || 'An error occurred');
    console.error(message, error);
    return { error: message };
  }
};

/**
 * Build query with filters
 */
export const buildQuery = (
  baseQuery: any,
  filters: Record<string, any>
) => {
  return Object.entries(filters).reduce((query, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        return query.in(key, value);
      }
      return query.eq(key, value);
    }
    return query;
  }, baseQuery);
};

/**
 * Batch operations for better performance
 */
export const batchOperation = async <T, R>(
  items: T[],
  operation: (item: T) => Promise<R>,
  batchSize = 10
): Promise<R[]> => {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(operation));
    results.push(...batchResults);
  }
  
  return results;
};

/**
 * Retry failed operations
 */
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError!;
};

/**
 * Handle Supabase errors
 */
export const handleSupabaseError = (error: PostgrestError): string => {
  // Handle common Supabase errors
  if (error.code === '23505') {
    return 'This record already exists';
  }
  if (error.code === '23503') {
    return 'Cannot delete this record as it is referenced by other data';
  }
  if (error.code === '42501') {
    return 'You do not have permission to perform this action';
  }
  if (error.code === 'PGRST116') {
    return 'The requested resource was not found';
  }
  
  return error.message || 'An unexpected error occurred';
};

/**
 * Create a debounced API call
 */
export const debounceApiCall = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => Promise<ReturnType<T>>) => {
  let timeoutId: NodeJS.Timeout;
  let resolvePromise: (value: ReturnType<T>) => void;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    
    return new Promise<ReturnType<T>>((resolve) => {
      resolvePromise = resolve;
      timeoutId = setTimeout(async () => {
        const result = await func(...args);
        resolvePromise(result);
      }, delay);
    });
  };
};