/**
 * Request cache for deduplication and performance
 */
export class RequestCache {
  private cache = new Map<string, Promise<any>>();
  private timeouts = new Map<string, NodeJS.Timeout>();
  private results = new Map<string, { data: any; timestamp: number }>();

  /**
   * Deduplicate requests with the same key
   */
  async dedupe<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: {
      ttl?: number;
      staleWhileRevalidate?: number;
    } = {}
  ): Promise<T> {
    const { ttl = 5000, staleWhileRevalidate = 0 } = options;

    // Check for cached result
    const cached = this.results.get(key);
    if (cached) {
      const age = Date.now() - cached.timestamp;
      
      // Return cached data if still fresh
      if (age < ttl) {
        return cached.data;
      }
      
      // Return stale data while revalidating
      if (staleWhileRevalidate > 0 && age < ttl + staleWhileRevalidate) {
        // Revalidate in background
        this.revalidate(key, fetcher, ttl);
        return cached.data;
      }
    }

    // Return existing promise if available
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    // Create new promise and cache it
    const promise = this.execute(key, fetcher, ttl);
    this.cache.set(key, promise);

    return promise;
  }

  /**
   * Execute fetcher and cache result
   */
  private async execute<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number
  ): Promise<T> {
    try {
      const result = await fetcher();
      
      // Cache successful result
      this.results.set(key, {
        data: result,
        timestamp: Date.now()
      });

      // Set TTL for cache cleanup
      this.setTTL(key, ttl);

      return result;
    } catch (error) {
      // Remove from cache on error
      this.cache.delete(key);
      throw error;
    } finally {
      // Remove promise from cache
      this.cache.delete(key);
    }
  }

  /**
   * Revalidate cache entry in background
   */
  private async revalidate<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number
  ): Promise<void> {
    try {
      const result = await fetcher();
      this.results.set(key, {
        data: result,
        timestamp: Date.now()
      });
      this.setTTL(key, ttl);
    } catch (error) {
      console.error(`Failed to revalidate cache for key: ${key}`, error);
    }
  }

  /**
   * Set TTL for cache entry
   */
  private setTTL(key: string, ttl: number): void {
    // Clear existing timeout
    const existingTimeout = this.timeouts.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      this.results.delete(key);
      this.timeouts.delete(key);
    }, ttl);

    this.timeouts.set(key, timeout);
  }

  /**
   * Invalidate cache entries
   */
  invalidate(pattern?: string | RegExp): void {
    if (!pattern) {
      // Clear all
      this.cache.clear();
      this.results.clear();
      this.timeouts.forEach(timeout => clearTimeout(timeout));
      this.timeouts.clear();
      return;
    }

    // Clear matching entries
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    
    for (const key of [...this.cache.keys(), ...this.results.keys()]) {
      if (regex.test(key)) {
        this.cache.delete(key);
        this.results.delete(key);
        
        const timeout = this.timeouts.get(key);
        if (timeout) {
          clearTimeout(timeout);
          this.timeouts.delete(key);
        }
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    cacheSize: number;
    pendingRequests: number;
    hitRate: number;
  } {
    return {
      cacheSize: this.results.size,
      pendingRequests: this.cache.size,
      hitRate: 0 // Would need to track hits/misses for accurate rate
    };
  }

  /**
   * Preload cache entries
   */
  async preload<T>(
    entries: Array<{
      key: string;
      fetcher: () => Promise<T>;
      ttl?: number;
    }>
  ): Promise<void> {
    const promises = entries.map(({ key, fetcher, ttl }) =>
      this.dedupe(key, fetcher, { ttl })
    );

    await Promise.allSettled(promises);
  }
}

// Create singleton instance
export const requestCache = new RequestCache();