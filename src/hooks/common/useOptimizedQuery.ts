/**
 * Optimized Query Hook
 * Provides query configurations optimized for different data types
 * Automatically applies appropriate caching strategies
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getQueryConfig, getBackgroundQueryConfig, getCriticalQueryConfig, QUERY_CONFIGS } from '@/lib/queryConfig';

type QueryType = keyof typeof QUERY_CONFIGS;

interface OptimizedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  queryKey: unknown[];
  queryFn: () => Promise<T>;
  type: QueryType;
  background?: boolean;
  critical?: boolean;
}

/**
 * Hook for optimized queries with automatic caching configuration
 */
export function useOptimizedQuery<T>(options: OptimizedQueryOptions<T>) {
  const { queryKey, queryFn, type, background = false, critical = false, ...otherOptions } = options;
  
  // Select appropriate configuration
  let config;
  if (critical) {
    config = getCriticalQueryConfig();
  } else if (background) {
    config = getBackgroundQueryConfig(type);
  } else {
    config = getQueryConfig(type);
  }
  
  return useQuery({
    queryKey,
    queryFn,
    ...config,
    ...otherOptions, // Allow overriding config
  });
}

/**
 * Example usage in a component:
 * 
 * ```typescript
 * const { data: profile, isLoading } = useOptimizedQuery({
 *   queryKey: QueryKeys.profile(userId),
 *   queryFn: () => profileService.getProfile(),
 *   type: 'profile',
 *   enabled: !!userId,
 * });
 * 
 * const { data: dashboard } = useOptimizedQuery({
 *   queryKey: QueryKeys.dashboard(userId),
 *   queryFn: () => dashboardService.getDashboardData(),
 *   type: 'dashboard',
 *   background: true, // Enable background updates
 * });
 * 
 * const { data: notifications } = useOptimizedQuery({
 *   queryKey: QueryKeys.notifications(userId),
 *   queryFn: () => notificationService.getNotifications(),
 *   type: 'notifications',
 *   critical: true, // Always fetch fresh data
 * });
 * ```
 */