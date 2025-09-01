# Hooks Directory Guide

## 📁 Directory Structure
```
src/hooks/
├── core/                      # Core application hooks
│   ├── useAuth.ts            # Authentication state management
│   ├── useProfile.ts         # User profile operations
│   └── useSupabaseAuth.ts    # Supabase auth integration
├── dashboard/                # Dashboard-specific hooks
│   ├── useDashboardData.ts   # Dashboard data fetching
│   ├── useDashboardStats.ts  # Statistics calculations
│   └── useDashboardSEO.ts    # SEO meta generation
├── clients/                  # Client management hooks
├── subscription/             # Subscription management
├── useProjectTemplates.ts    # Project templates
├── useUsageTracking.ts       # Plan limits and usage
├── useLanguageNavigation.ts  # i18n navigation
├── useDashboard.ts           # Main dashboard hook
└── use-mobile.ts             # Mobile detection
```

## 🎯 Hook Patterns & Conventions

### ✅ Core Hook Pattern
```typescript
// File: useAuth.ts
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent } from '@/lib/authSecurity';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  authChecked: boolean;
}

export const useAuth = (): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Implementation details...
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          logSecurityEvent('auth_session_error', { error: error.message });
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        logSecurityEvent('auth_session_exception', { error: String(error) });
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    };

    getSession();
    
    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        setAuthChecked(true);
        
        if (event === 'SIGNED_IN' && session?.user) {
          logSecurityEvent('auth_signin', { userId: session.user.id });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, session, loading, authChecked };
};
```

### ❌ What NOT to do
```typescript
// ❌ DON'T use default export for hooks
export default function useAuth() { /* ... */ }

// ❌ DON'T ignore TypeScript
export const useAuth = () => {
  const [user, setUser] = useState(null); // Missing type

// ❌ DON'T forget cleanup
useEffect(() => {
  const subscription = supabase.auth.onAuthStateChange(handler);
  // Missing cleanup function
}, []);

// ❌ DON'T ignore error handling
const { data, error } = await supabase.from('table').select('*');
// Not handling error
```

## 🏗️ Core Hooks (Critical - Don't Break)

### useAuth Hook
```typescript
// Used throughout the app for authentication
const { user, session, loading, authChecked } = useAuth();

// ✅ Always check authChecked before rendering
if (loading || !authChecked) {
  return <LoadingSpinner />;
}

// ✅ Always handle unauthenticated state
if (!user) {
  return <Navigate to="/login" />;
}
```

### useProfile Hook
```typescript
// Extends user data with profile information
const { profile, loading, updateProfile } = useProfile(user);

// ✅ Profile data structure
interface Profile {
  id: string;
  email: string;
  full_name?: string;
  company?: string;
  currency: string;
  user_type: 'free' | 'pro' | 'enterprise';
  project_count: number;
  storage_used: number;
}
```

### useLanguageNavigation Hook
```typescript
// ✅ ALWAYS use for navigation to maintain i18n routes
const { navigate } = useLanguageNavigation();

// ✅ DO - Maintains language in URL
navigate('/dashboard'); // Goes to /{currentLang}/dashboard

// ❌ DON'T use React Router navigate directly
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate(); // Breaks i18n routing
```

## 📊 Data Fetching Hooks

### TanStack Query Integration Pattern
```typescript
// File: useDashboardData.ts
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/core/useAuth';

export const useDashboardDataQuery = (user: User | null) => {
  return useQuery({
    queryKey: ['dashboard', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      // Parallel data fetching
      const [profileResult, projectsResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single(),
        
        supabase
          .from('projects')
          .select(`
            *,
            client:clients(*),
            milestones(*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ]);

      if (profileResult.error) throw profileResult.error;
      if (projectsResult.error) throw projectsResult.error;

      return {
        profile: profileResult.data,
        projects: projectsResult.data || [],
      };
    },
    enabled: !!user, // Only run when user exists
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000,   // 30 minutes
  });
};
```

### Mutation Hook Pattern
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ServiceRegistry } from '@/services/core/ServiceRegistry';

export const useCreateProject = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const projectService = ServiceRegistry.getInstance().getProjectService(user);

  return useMutation({
    mutationFn: projectService.createProject.bind(projectService),
    onSuccess: (newProject) => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // Optimistic update
      queryClient.setQueryData(['project', newProject.slug], newProject);
      
      toast.success('Project created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create project');
    },
  });
};
```

## 🔄 State Management Hooks

### Service Integration Pattern
```typescript
// File: useProjectActions.ts
export const useProjectActions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Get service instance
  const projectService = useMemo(
    () => ServiceRegistry.getInstance().getProjectService(user),
    [user]
  );

  const createProject = useMutation({
    mutationFn: projectService.createProject.bind(projectService),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });

  const updateProject = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Project> }) =>
      projectService.updateProject(id, updates),
    onMutate: async ({ id, updates }) => {
      // Optimistic update pattern
      await queryClient.cancelQueries({ queryKey: ['project', id] });
      
      const previousProject = queryClient.getQueryData(['project', id]);
      
      queryClient.setQueryData(['project', id], (old: any) => ({
        ...old,
        ...updates,
        updated_at: new Date().toISOString(),
      }));

      return { previousProject };
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      if (context?.previousProject) {
        queryClient.setQueryData(['project', id], context.previousProject);
      }
    },
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
    }
  });

  return {
    createProject: createProject.mutate,
    updateProject: updateProject.mutate,
    isCreating: createProject.isLoading,
    isUpdating: updateProject.isLoading,
  };
};
```

## 🌐 i18n & Navigation Hooks

### Language Hook Pattern
```typescript
// File: useLanguage.ts
import { useContext } from 'react';
import { LanguageContext } from '@/contexts/LanguageContext';

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

// Usage in components
const { currentLanguage, t, dir } = useLanguage();
```

### Translation Hook (useT)
```typescript
// File: useT.ts (simplified version)
export const useT = () => {
  const { t } = useLanguage();
  return t;
};

// Usage - ALWAYS use this for text
const t = useT();
return <h1>{t('dashboard.welcome')}</h1>;

// ❌ DON'T hardcode text
return <h1>Welcome to Dashboard</h1>;
```

## 📱 UI State Hooks

### Mobile Detection Hook
```typescript
// File: use-mobile.ts
import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}

// Usage
const isMobile = useIsMobile();
return isMobile ? <MobileLayout /> : <DesktopLayout />;
```

### Usage Tracking Hook
```typescript
// File: useUsageTracking.ts
export const useUsageTracking = (profile: UserProfile | null, projects: Project[]) => {
  return useMemo(() => {
    if (!profile) return {
      canCreateProject: false,
      projectsUsed: 0,
      projectsLimit: 0,
      storageUsed: 0,
      storageLimit: 0,
    };

    const userType = profile.user_type || 'free';
    const limits = getUserPlanLimits(userType);

    return {
      canCreateProject: projects.length < limits.maxProjects,
      projectsUsed: projects.length,
      projectsLimit: limits.maxProjects,
      storageUsed: profile.storage_used || 0,
      storageLimit: limits.maxStorageMB * 1024 * 1024,
      clientsUsed: profile.client_count || 0,
      clientsLimit: limits.maxClients,
    };
  }, [profile, projects]);
};
```

## 🔒 Security in Hooks

### Protected Data Fetching
```typescript
// ✅ DO - Always check authentication
export const useProtectedData = () => {
  const { user, authChecked } = useAuth();
  
  return useQuery({
    queryKey: ['protected-data', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Authentication required');
      
      const { data, error } = await supabase
        .from('protected_table')
        .select('*')
        .eq('user_id', user.id); // RLS will enforce this
      
      if (error) throw error;
      return data;
    },
    enabled: authChecked && !!user, // Wait for auth check
  });
};
```

### Error Handling in Hooks
```typescript
// ✅ DO - Proper error handling
export const useDataWithErrorHandling = () => {
  const { data, error, isLoading } = useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
    onError: (error: any) => {
      // Log security events for database errors
      if (error.code) {
        logSecurityEvent('database_error', {
          code: error.code,
          message: error.message,
        });
      }
      
      // Show user-friendly error
      toast.error('Failed to load data. Please try again.');
    },
  });

  return { data, error, isLoading };
};
```

## 🚨 Common Hook Pitfalls

### Dependency Arrays
```typescript
// ❌ DON'T forget dependencies
useEffect(() => {
  fetchData(userId);
}, []); // Missing userId dependency

// ✅ DO include all dependencies
useEffect(() => {
  fetchData(userId);
}, [userId]);

// ✅ DO use useCallback for complex dependencies
const fetchData = useCallback(async () => {
  // fetch logic
}, [dependency1, dependency2]);

useEffect(() => {
  fetchData();
}, [fetchData]);
```

### Memory Leaks
```typescript
// ❌ DON'T forget cleanup
useEffect(() => {
  const subscription = supabase
    .channel('public:projects')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, handleChange)
    .subscribe();
  
  // Missing cleanup
}, []);

// ✅ DO cleanup subscriptions
useEffect(() => {
  const subscription = supabase
    .channel('public:projects')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, handleChange)
    .subscribe();
  
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

## 📋 Hook Development Checklist

Before creating/modifying hooks:

- [ ] Proper TypeScript interfaces and return types
- [ ] Handles loading and error states
- [ ] Includes proper cleanup functions
- [ ] Uses correct dependency arrays
- [ ] Integrates with authentication when needed
- [ ] Follows existing naming conventions
- [ ] Includes proper error handling and logging
- [ ] Uses TanStack Query for server state
- [ ] Respects RLS policies for data access
- [ ] Includes JSDoc comments for complex logic

## 🎯 Hook Usage Quick Reference

### Authentication Flow
```typescript
// Always use this pattern for auth-dependent components
const { user, loading, authChecked } = useAuth();

if (loading || !authChecked) return <LoadingSpinner />;
if (!user) return <Navigate to="/login" />;
```

### Data Fetching Flow
```typescript
// Standard pattern for data fetching
const { data, isLoading, error } = useQuery({
  queryKey: ['resource', user?.id],
  queryFn: () => fetchResource(user!.id),
  enabled: !!user,
});

if (isLoading) return <LoadingState />;
if (error) return <ErrorState />;
if (!data) return <EmptyState />;
```

### Service Integration Flow
```typescript
// Pattern for using services in hooks
const { user } = useAuth();
const service = ServiceRegistry.getInstance().getServiceName(user);

const mutation = useMutation({
  mutationFn: service.methodName.bind(service),
  onSuccess: () => queryClient.invalidateQueries(['key']),
});
```

### Navigation Flow
```typescript
// ALWAYS use this for navigation
const { navigate } = useLanguageNavigation();
navigate('/path'); // Maintains language prefix
```