/**
 * Performance optimization utilities
 */

export * from './requestCache';
export * from './lazyLoader';

// Performance monitoring utilities
export const performanceMonitor = {
  /**
   * Measure function execution time
   */
  measure: async <T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> => {
    const start = performance.now();
    
    try {
      const result = await fn();
      const duration = performance.now() - start;
      
      console.debug(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.error(`[Performance] ${name} failed after ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  },

  /**
   * Create performance observer
   */
  observe: (callback: (entries: PerformanceEntry[]) => void) => {
    const observer = new PerformanceObserver((list) => {
      callback(list.getEntries());
    });

    observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });

    return () => observer.disconnect();
  },

  /**
   * Get Web Vitals
   */
  getWebVitals: () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      // Time to First Byte
      ttfb: navigation.responseStart - navigation.requestStart,
      
      // DOM Content Loaded
      dcl: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      
      // Load Complete
      load: navigation.loadEventEnd - navigation.loadEventStart,
      
      // First Paint
      fp: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
      
      // First Contentful Paint
      fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
    };
  }
};