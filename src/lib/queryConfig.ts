/**
 * Query-Specific Caching Strategies
 * Optimized caching configurations for different data types
 * Improves performance by matching cache duration to data volatility
 */

export const QUERY_CONFIGS = {
  // Static/rarely changing data - long cache
  profile: {
    staleTime: 30 * 60 * 1000,  // 30 minutes
    gcTime: 60 * 60 * 1000,     // 1 hour
  },
  
  branding: {
    staleTime: 45 * 60 * 1000,  // 45 minutes  
    gcTime: 90 * 60 * 1000,     // 1.5 hours
  },
  
  // Semi-static data - medium cache
  projects: {
    staleTime: 10 * 60 * 1000,  // 10 minutes
    gcTime: 30 * 60 * 1000,     // 30 minutes
  },
  
  clients: {
    staleTime: 15 * 60 * 1000,  // 15 minutes
    gcTime: 45 * 60 * 1000,     // 45 minutes
  },
  
  templates: {
    staleTime: 20 * 60 * 1000,  // 20 minutes
    gcTime: 60 * 60 * 1000,     // 1 hour
  },
  
  // Dynamic data - short cache
  dashboard: {
    staleTime: 5 * 60 * 1000,   // 5 minutes
    gcTime: 15 * 60 * 1000,     // 15 minutes
  },
  
  analytics: {
    staleTime: 10 * 60 * 1000,  // 10 minutes
    gcTime: 30 * 60 * 1000,     // 30 minutes
  },
  
  // Frequently changing data - minimal cache
  notifications: {
    staleTime: 2 * 60 * 1000,   // 2 minutes
    gcTime: 5 * 60 * 1000,      // 5 minutes
  },
  
  invoices: {
    staleTime: 5 * 60 * 1000,   // 5 minutes
    gcTime: 15 * 60 * 1000,     // 15 minutes
  },
  
  // Real-time data - very short cache
  milestones: {
    staleTime: 1 * 60 * 1000,   // 1 minute
    gcTime: 5 * 60 * 1000,      // 5 minutes
  },
  
  // Client-specific data - short cache (external users)
  clientProject: {
    staleTime: 3 * 60 * 1000,   // 3 minutes
    gcTime: 10 * 60 * 1000,     // 10 minutes
  },
} as const;

/**
 * Get optimized query configuration for a specific data type
 */
export function getQueryConfig(type: keyof typeof QUERY_CONFIGS) {
  return {
    ...QUERY_CONFIGS[type],
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
  };
}

/**
 * Get configuration for background data that updates frequently
 */
export function getBackgroundQueryConfig(type: keyof typeof QUERY_CONFIGS) {
  return {
    ...getQueryConfig(type),
    refetchInterval: QUERY_CONFIGS[type].staleTime / 2, // Refetch at half stale time
    refetchIntervalInBackground: false,
  };
}

/**
 * Get configuration for critical data that must be fresh
 */
export function getCriticalQueryConfig() {
  return {
    staleTime: 0,               // Always considered stale
    gcTime: 5 * 60 * 1000,      // 5 minutes
    retry: 2,                   // More retries for critical data
    refetchOnWindowFocus: true, // Refetch when user returns
    refetchOnReconnect: true,
    refetchOnMount: true,
  };
}

/**
 * Query key factories for consistent cache management
 */
export const QueryKeys = {
  // Profile data
  profile: (userId: string) => ['profile', userId],
  branding: (userId: string) => ['branding', userId],
  
  // Project data
  projects: (userId: string) => ['projects', userId],
  project: (userId: string, slug: string) => ['project', userId, slug],
  projectMilestones: (projectId: string) => ['milestones', projectId],
  
  // Client data
  clients: (userId: string) => ['clients', userId],
  client: (userId: string, clientId: string) => ['client', userId, clientId],
  
  // Dashboard data
  dashboard: (userId: string) => ['dashboard', userId],
  analytics: (userId: string, timeRange?: string) => ['analytics', userId, timeRange],
  
  // Templates
  templates: (userId: string) => ['templates', userId],
  publicTemplates: () => ['templates', 'public'],
  
  // Notifications
  notifications: (userId: string) => ['notifications', userId],
  
  // Invoices
  invoices: (userId: string) => ['invoices', userId],
  invoice: (userId: string, invoiceId: string) => ['invoice', userId, invoiceId],
  
  // Client project access
  clientProject: (token: string) => ['clientProject', token],
} as const;

/**
 * Cache invalidation patterns
 */
export const CacheInvalidation = {
  // When a project is updated, invalidate related data
  onProjectUpdate: (queryClient: { invalidateQueries: (options: { queryKey: unknown[] }) => void }, userId: string, projectId?: string) => {
    queryClient.invalidateQueries({ queryKey: QueryKeys.projects(userId) });
    queryClient.invalidateQueries({ queryKey: QueryKeys.dashboard(userId) });
    if (projectId) {
      queryClient.invalidateQueries({ queryKey: ['project', userId] });
      queryClient.invalidateQueries({ queryKey: QueryKeys.projectMilestones(projectId) });
    }
  },
  
  // When client data changes
  onClientUpdate: (queryClient: { invalidateQueries: (options: { queryKey: unknown[] }) => void }, userId: string) => {
    queryClient.invalidateQueries({ queryKey: QueryKeys.clients(userId) });
    queryClient.invalidateQueries({ queryKey: QueryKeys.projects(userId) });
    queryClient.invalidateQueries({ queryKey: QueryKeys.dashboard(userId) });
  },
  
  // When profile is updated
  onProfileUpdate: (queryClient: { invalidateQueries: (options: { queryKey: unknown[] }) => void }, userId: string) => {
    queryClient.invalidateQueries({ queryKey: QueryKeys.profile(userId) });
    queryClient.invalidateQueries({ queryKey: QueryKeys.dashboard(userId) });
  },
  
  // When invoice is created/updated
  onInvoiceUpdate: (queryClient: { invalidateQueries: (options: { queryKey: unknown[] }) => void }, userId: string) => {
    queryClient.invalidateQueries({ queryKey: QueryKeys.invoices(userId) });
    queryClient.invalidateQueries({ queryKey: QueryKeys.dashboard(userId) });
    queryClient.invalidateQueries({ queryKey: QueryKeys.analytics(userId) });
  },
} as const;