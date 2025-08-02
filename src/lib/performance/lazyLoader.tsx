import { lazy, Suspense, ComponentType, ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Options for lazy loading components
 */
interface LazyLoadOptions {
  fallback?: ReactNode;
  delay?: number;
  errorBoundary?: boolean;
  preload?: boolean;
}

/**
 * Error boundary for lazy loaded components
 */
class LazyErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center p-8">
          <p className="text-destructive">Failed to load component</p>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Default loading fallbacks by component type
 */
export const defaultFallbacks = {
  page: (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  ),
  
  card: (
    <div className="space-y-3">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  ),
  
  table: (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  ),
  
  form: (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-32" />
    </div>
  ),
  
  default: <Skeleton className="h-64 w-full" />
};

/**
 * Create a lazy loaded component with enhanced features
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): T {
  const {
    fallback = defaultFallbacks.default,
    delay = 0,
    errorBoundary = true,
    preload = false
  } = options;

  // Create lazy component
  const LazyComponent = lazy(async () => {
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    return importFn();
  });

  // Preload if requested
  if (preload) {
    importFn();
  }

  // Create wrapper component
  const WrappedComponent = (props: any) => {
    const content = (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );

    if (errorBoundary) {
      return (
        <LazyErrorBoundary fallback={fallback}>
          {content}
        </LazyErrorBoundary>
      );
    }

    return content;
  };

  // Add preload method
  (WrappedComponent as any).preload = importFn;

  return WrappedComponent as T;
}

/**
 * Create lazy loaded routes
 */
export function lazyRoute(
  path: string,
  importFn: () => Promise<{ default: ComponentType<any> }>,
  options?: LazyLoadOptions
) {
  return {
    path,
    element: createLazyComponent(importFn, {
      fallback: defaultFallbacks.page,
      errorBoundary: true,
      ...options
    })
  };
}

/**
 * Preload multiple components
 */
export async function preloadComponents(
  components: Array<{ preload: () => Promise<any> }>
): Promise<void> {
  const promises = components
    .filter(comp => typeof comp.preload === 'function')
    .map(comp => comp.preload());

  await Promise.allSettled(promises);
}

/**
 * Create lazy loaded component map
 */
export function createLazyMap<T extends Record<string, () => Promise<{ default: ComponentType<any> }>>>(
  imports: T,
  options?: LazyLoadOptions
): { [K in keyof T]: ComponentType<any> } {
  const result: any = {};

  for (const [key, importFn] of Object.entries(imports)) {
    result[key] = createLazyComponent(importFn, options);
  }

  return result;
}

/**
 * Intersection observer for lazy loading
 */
export function useLazyLoad(
  ref: React.RefObject<HTMLElement>,
  onIntersect: () => void,
  options?: IntersectionObserverInit
) {
  React.useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onIntersect();
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, onIntersect, options]);
}