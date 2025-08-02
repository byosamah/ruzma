# Ruzma System Centralization & Optimization Plan

## Executive Summary
This plan outlines a systematic approach to centralize shared functionality, reduce code duplication, and improve system performance through strategic refactoring and optimization.

## Phase 1: Centralized Utility System (Week 1-2)

### 1.1 Create Core Utility Modules

```typescript
// src/lib/utils/index.ts
export * from './api';
export * from './validation';
export * from './formatting';
export * from './date';
export * from './currency';
export * from './file';
export * from './security';
```

#### API Utilities (`src/lib/utils/api.ts`)
```typescript
// Centralized API response handler
export const handleApiResponse = async <T>(
  promise: Promise<any>,
  errorMessage?: string
): Promise<{ data?: T; error?: string }> => {
  try {
    const { data, error } = await promise;
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error(errorMessage || 'API Error:', error);
    return { error: error.message };
  }
};

// Centralized query builder
export const buildQuery = (
  baseQuery: any,
  filters: Record<string, any>
) => {
  return Object.entries(filters).reduce((query, [key, value]) => {
    if (value !== undefined && value !== null) {
      return query.eq(key, value);
    }
    return query;
  }, baseQuery);
};

// Batch operations
export const batchOperation = async <T>(
  items: T[],
  operation: (item: T) => Promise<any>,
  batchSize = 10
) => {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(operation));
    results.push(...batchResults);
  }
  return results;
};
```

#### Validation Utilities (`src/lib/utils/validation.ts`)
```typescript
import { z } from 'zod';

// Centralized validation schemas
export const commonSchemas = {
  email: z.string().email(),
  uuid: z.string().uuid(),
  positiveNumber: z.number().positive(),
  dateString: z.string().datetime(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  currency: z.enum(['USD', 'EUR', 'GBP', /* ... */]),
};

// Form validation helper
export const validateForm = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { isValid: boolean; errors?: Record<string, string>; data?: T } => {
  try {
    const validData = schema.parse(data);
    return { isValid: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.reduce((acc, err) => {
        acc[err.path[0]] = err.message;
        return acc;
      }, {} as Record<string, string>);
      return { isValid: false, errors };
    }
    return { isValid: false };
  }
};
```

#### Formatting Utilities (`src/lib/utils/formatting.ts`)
```typescript
// Centralized formatters
export const formatters = {
  currency: (amount: number, currency: string, locale: string) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(amount);
  },
  
  date: (date: Date | string, locale: string, format = 'medium') => {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: format as any,
    }).format(new Date(date));
  },
  
  fileSize: (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  },
  
  truncate: (text: string, length: number) => {
    if (text.length <= length) return text;
    return `${text.substring(0, length)}...`;
  },
};
```

### 1.2 Centralized Data Fetching Layer

```typescript
// src/lib/api/base.ts
import { supabase } from '@/integrations/supabase/client';
import { handleApiResponse } from '@/lib/utils/api';

export class BaseAPI {
  protected table: string;
  
  constructor(tableName: string) {
    this.table = tableName;
  }
  
  async findById(id: string) {
    return handleApiResponse(
      supabase.from(this.table).select('*').eq('id', id).single()
    );
  }
  
  async findAll(filters?: Record<string, any>) {
    let query = supabase.from(this.table).select('*');
    if (filters) {
      query = buildQuery(query, filters);
    }
    return handleApiResponse(query);
  }
  
  async create(data: any) {
    return handleApiResponse(
      supabase.from(this.table).insert(data).select().single()
    );
  }
  
  async update(id: string, data: any) {
    return handleApiResponse(
      supabase.from(this.table).update(data).eq('id', id).select().single()
    );
  }
  
  async delete(id: string) {
    return handleApiResponse(
      supabase.from(this.table).delete().eq('id', id)
    );
  }
}

// Specific APIs extending base
export class ProjectAPI extends BaseAPI {
  constructor() {
    super('projects');
  }
  
  async findBySlug(userId: string, slug: string) {
    return handleApiResponse(
      supabase
        .from(this.table)
        .select('*, milestones(*), clients(*)')
        .eq('user_id', userId)
        .eq('slug', slug)
        .single()
    );
  }
}
```

## Phase 2: UI Component Centralization (Week 2-3)

### 2.1 Create Compound Components

```typescript
// src/components/shared/DataTable/index.tsx
export const DataTable = {
  Root: DataTableRoot,
  Header: DataTableHeader,
  Body: DataTableBody,
  Row: DataTableRow,
  Cell: DataTableCell,
  Pagination: DataTablePagination,
  Search: DataTableSearch,
  Filters: DataTableFilters,
};

// Usage example:
<DataTable.Root data={projects} columns={columns}>
  <DataTable.Header />
  <DataTable.Search placeholder="Search projects..." />
  <DataTable.Filters>
    <StatusFilter />
    <DateRangeFilter />
  </DataTable.Filters>
  <DataTable.Body />
  <DataTable.Pagination />
</DataTable.Root>
```

### 2.2 Centralized Form Components

```typescript
// src/components/shared/Form/index.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export const Form = {
  Root: FormRoot,
  Field: FormField,
  Input: FormInput,
  Select: FormSelect,
  DatePicker: FormDatePicker,
  CurrencyInput: FormCurrencyInput,
  Submit: FormSubmit,
  Error: FormError,
};

// Centralized form hook
export const useFormHandler = <T extends Record<string, any>>(
  schema: z.ZodSchema<T>,
  onSubmit: (data: T) => Promise<void>,
  defaultValues?: Partial<T>
) => {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
  });
  
  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      form.setError('root', { message: error.message });
    }
  });
  
  return { form, handleSubmit };
};
```

### 2.3 Loading State Management

```typescript
// src/components/shared/LoadingStates/index.tsx
export const LoadingStates = {
  Skeleton: ({ type }: { type: 'card' | 'table' | 'form' }) => {
    const skeletons = {
      card: <CardSkeleton />,
      table: <TableSkeleton />,
      form: <FormSkeleton />,
    };
    return skeletons[type];
  },
  
  Spinner: ({ size = 'md' }) => (
    <div className={cn('animate-spin rounded-full border-b-2 border-primary', 
      sizes[size])} />
  ),
  
  ProgressBar: ({ progress }: { progress: number }) => (
    <Progress value={progress} className="w-full" />
  ),
};

// Centralized loading hook
export const useLoadingState = () => {
  const [states, setStates] = useState<Record<string, boolean>>({});
  
  const setLoading = (key: string, isLoading: boolean) => {
    setStates(prev => ({ ...prev, [key]: isLoading }));
  };
  
  const isLoading = (key: string) => states[key] || false;
  const isAnyLoading = () => Object.values(states).some(Boolean);
  
  return { setLoading, isLoading, isAnyLoading };
};
```

## Phase 3: Performance Optimization (Week 3-4)

### 3.1 Implement Lazy Loading Strategy

```typescript
// src/lib/performance/lazyLoader.ts
import { lazy, Suspense } from 'react';
import { LoadingStates } from '@/components/shared/LoadingStates';

export const createLazyComponent = (
  importFn: () => Promise<{ default: React.ComponentType<any> }>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = lazy(importFn);
  
  return (props: any) => (
    <Suspense fallback={fallback || <LoadingStates.Spinner />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Usage:
export const LazyAnalytics = createLazyComponent(
  () => import('@/pages/Analytics'),
  <LoadingStates.Skeleton type="card" />
);
```

### 3.2 Implement Request Deduplication

```typescript
// src/lib/performance/requestCache.ts
class RequestCache {
  private cache = new Map<string, Promise<any>>();
  private timeouts = new Map<string, NodeJS.Timeout>();
  
  async dedupe<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl = 5000
  ): Promise<T> {
    // Return existing promise if available
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }
    
    // Create new promise and cache it
    const promise = fetcher();
    this.cache.set(key, promise);
    
    // Set TTL
    const timeout = setTimeout(() => {
      this.cache.delete(key);
      this.timeouts.delete(key);
    }, ttl);
    
    this.timeouts.set(key, timeout);
    
    try {
      const result = await promise;
      return result;
    } catch (error) {
      this.cache.delete(key);
      throw error;
    }
  }
  
  invalidate(pattern?: string) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
          const timeout = this.timeouts.get(key);
          if (timeout) {
            clearTimeout(timeout);
            this.timeouts.delete(key);
          }
        }
      }
    } else {
      this.cache.clear();
      this.timeouts.forEach(timeout => clearTimeout(timeout));
      this.timeouts.clear();
    }
  }
}

export const requestCache = new RequestCache();
```

### 3.3 Optimize Bundle Size

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'vendor-utils': ['date-fns', 'zod', 'react-hook-form'],
          'vendor-charts': ['recharts'],
          'vendor-pdf': ['@react-pdf/renderer'],
        },
      },
    },
  },
  // Enable compression
  plugins: [
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ],
});
```

## Phase 4: State Management Centralization (Week 4-5)

### 4.1 Global State Store

```typescript
// src/lib/store/index.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AppState {
  // User state
  user: User | null;
  profile: Profile | null;
  
  // UI state
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  
  // Cache state
  cachedData: Map<string, any>;
  
  // Actions
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setCachedData: (key: string, data: any) => void;
  getCachedData: (key: string) => any;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        profile: null,
        sidebarOpen: true,
        theme: 'light',
        cachedData: new Map(),
        
        setUser: (user) => set({ user }),
        setProfile: (profile) => set({ profile }),
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        setTheme: (theme) => set({ theme }),
        setCachedData: (key, data) => {
          const cachedData = new Map(get().cachedData);
          cachedData.set(key, data);
          set({ cachedData });
        },
        getCachedData: (key) => get().cachedData.get(key),
      }),
      {
        name: 'ruzma-storage',
        partialize: (state) => ({
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
        }),
      }
    )
  )
);
```

### 4.2 Centralized Query Hooks

```typescript
// src/lib/hooks/useQuery.ts
import { useQuery as useReactQuery, useMutation } from '@tanstack/react-query';
import { requestCache } from '@/lib/performance/requestCache';

export const useQuery = <T>(
  key: string[],
  fetcher: () => Promise<T>,
  options?: any
) => {
  return useReactQuery({
    queryKey: key,
    queryFn: () => requestCache.dedupe(key.join('-'), fetcher),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

export const useMutationWithOptimisticUpdate = <T, V>(
  mutationFn: (variables: V) => Promise<T>,
  options?: any
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries(options.queryKey);
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(options.queryKey);
      
      // Optimistically update
      if (options.optimisticUpdate) {
        queryClient.setQueryData(options.queryKey, (old: any) =>
          options.optimisticUpdate(old, variables)
        );
      }
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(options.queryKey, context.previousData);
      }
    },
    onSettled: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(options.queryKey);
      requestCache.invalidate(options.queryKey.join('-'));
    },
    ...options,
  });
};
```

## Phase 5: Implementation Strategy

### 5.1 Migration Path

1. **Week 1**: Set up utility structure, migrate 20% of components
2. **Week 2**: Migrate forms and data tables
3. **Week 3**: Implement performance optimizations
4. **Week 4**: Centralize state management
5. **Week 5**: Testing and refinement

### 5.2 File Structure After Centralization

```
src/
├── lib/
│   ├── utils/           # Shared utilities
│   ├── api/            # Centralized API layer
│   ├── hooks/          # Shared hooks
│   ├── store/          # Global state
│   ├── performance/    # Performance utilities
│   └── constants/      # Shared constants
├── components/
│   ├── shared/         # Shared UI components
│   ├── domain/         # Domain-specific components
│   └── ui/            # Base UI components
├── pages/             # Page components (thin layer)
└── styles/           # Global styles
```

### 5.3 Performance Metrics Target

- **Initial Load**: < 1.5s (from 3s)
- **Route Change**: < 200ms (from 500ms)
- **API Response**: < 150ms (from 300ms)
- **Bundle Size**: < 300KB (from 800KB)

## Benefits of This Approach

1. **Code Reduction**: ~40% less code through reuse
2. **Maintenance**: Single source of truth for utilities
3. **Performance**: Faster loads through caching and optimization
4. **Developer Experience**: Consistent patterns and utilities
5. **Testing**: Easier to test centralized functions
6. **Scalability**: Easy to add new features using existing utilities

This centralization plan will transform your codebase into a highly maintainable, performant system with minimal duplication and maximum reusability.