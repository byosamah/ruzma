import { CurrencyCode } from '@/lib/currency';
import { ConversionService } from './ConversionService';
import { ServiceRegistry } from './ServiceRegistry';
import { User } from '@supabase/supabase-js';

/**
 * Coordinates currency conversions to ensure consistency across components
 * Prevents race conditions and inconsistent exchange rates
 */
export class CurrencyConversionCoordinator {
  private static instance: CurrencyConversionCoordinator;
  private conversionPromises: Map<string, Promise<any>> = new Map();
  private ratesCache: Map<string, Record<string, number>> = new Map();
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): CurrencyConversionCoordinator {
    if (!CurrencyConversionCoordinator.instance) {
      CurrencyConversionCoordinator.instance = new CurrencyConversionCoordinator();
      
      // Clear both coordinator cache and exchange service cache on fresh instance
      CurrencyConversionCoordinator.instance.clearRatesCache();
    }
    return CurrencyConversionCoordinator.instance;
  }

  private constructor() {}

  /**
   * Generate a cache key for rate caching
   */
  private getRateCacheKey(fromCurrency: CurrencyCode, toCurrency: CurrencyCode): string {
    return `${fromCurrency}_to_${toCurrency}`;
  }

  /**
   * Check if rates cache is still valid
   */
  private isRatesCacheValid(): boolean {
    return Date.now() - this.cacheTimestamp < this.CACHE_DURATION;
  }

  /**
   * Clear the rates cache
   */
  clearRatesCache(): void {
    this.ratesCache.clear();
    this.cacheTimestamp = 0;
    this.conversionPromises.clear();
  }

  /**
   * Get conversion rate with coordination to prevent inconsistencies
   */
  async getCoordinatedConversionRate(
    fromCurrency: CurrencyCode,
    toCurrency: CurrencyCode,
    user: User | null
  ): Promise<number> {
    if (!user) return 1;
    if (fromCurrency === toCurrency) return 1;

    const cacheKey = this.getRateCacheKey(fromCurrency, toCurrency);

    // Check if we have a valid cached rate
    if (this.isRatesCacheValid() && this.ratesCache.has(cacheKey)) {
      const rates = this.ratesCache.get(cacheKey);
      return rates?.[toCurrency] || 1;
    }

    // Check if there's already a pending request for this conversion
    const promiseKey = `rate_${cacheKey}`;
    if (this.conversionPromises.has(promiseKey)) {
      return this.conversionPromises.get(promiseKey);
    }

    // Create new conversion promise
    const conversionPromise = this.fetchAndCacheRate(fromCurrency, toCurrency, user);
    this.conversionPromises.set(promiseKey, conversionPromise);

    try {
      const rate = await conversionPromise;
      return rate;
    } finally {
      // Clean up the promise after resolution
      this.conversionPromises.delete(promiseKey);
    }
  }

  /**
   * Fetch and cache the conversion rate
   */
  private async fetchAndCacheRate(
    fromCurrency: CurrencyCode,
    toCurrency: CurrencyCode,
    user: User
  ): Promise<number> {
    try {
      const conversionService = ServiceRegistry.getInstance().getConversionService(user);
      
      // Force clear both conversion service cache and exchange rate service cache to get fresh rates
      conversionService.clearConversionCache();
      
      // Also clear the exchange rate service localStorage cache
      const exchangeRateService = conversionService.getExchangeRateService();
      exchangeRateService.clearCache();
      
      const rate = await conversionService.getExchangeRateService().getConversionRate(fromCurrency, toCurrency);
      
      
      // Cache the rate
      const cacheKey = this.getRateCacheKey(fromCurrency, toCurrency);
      if (!this.ratesCache.has(cacheKey)) {
        this.ratesCache.set(cacheKey, {});
      }
      const rateMap = this.ratesCache.get(cacheKey)!;
      rateMap[toCurrency] = rate;
      
      // Update cache timestamp
      this.cacheTimestamp = Date.now();
      
      return rate;
    } catch (error) {
      console.error(`Failed to fetch conversion rate ${fromCurrency} → ${toCurrency}:`, error);
      
      // Try to get fallback rate from DEFAULT_RATES
      const exchangeRateService = ServiceRegistry.getInstance().getConversionService(user).getExchangeRateService();
      const fallbackRates = (exchangeRateService as any).DEFAULT_RATES;
      
      if (fallbackRates && fallbackRates[toCurrency] && fallbackRates[fromCurrency]) {
        const fallbackRate = fallbackRates[toCurrency] / fallbackRates[fromCurrency];
        console.log(`Using fallback rate ${fromCurrency} → ${toCurrency}: ${fallbackRate}`);
        return fallbackRate;
      }
      
      console.warn(`No fallback rate available for ${fromCurrency} → ${toCurrency}, using rate 1`);
      return 1; // Final fallback rate
    }
  }

  /**
   * Coordinate multiple conversions to use the same exchange rates
   */
  async coordinatedBatchConversion(
    conversions: Array<{ amount: number; fromCurrency: CurrencyCode }>,
    toCurrency: CurrencyCode,
    user: User | null
  ): Promise<Array<{ originalAmount: number; convertedAmount: number; rate: number }>> {
    if (!user) {
      return conversions.map(conv => ({
        originalAmount: conv.amount,
        convertedAmount: conv.amount,
        rate: 1
      }));
    }

    // Get all unique currency pairs
    const uniquePairs = [...new Set(conversions.map(conv => 
      conv.fromCurrency !== toCurrency ? `${conv.fromCurrency}_${toCurrency}` : null
    ).filter(Boolean))];

    // Ensure all rates are cached with the same timestamp
    await Promise.all(
      uniquePairs.map(pair => {
        if (pair) {
          const [fromCurrency] = pair.split('_');
          return this.getCoordinatedConversionRate(fromCurrency as CurrencyCode, toCurrency, user);
        }
        return Promise.resolve(1);
      })
    );

    // Now convert all amounts using the cached rates
    const results = conversions.map(conversion => {
      if (conversion.fromCurrency === toCurrency) {
        console.log(`Coordinator: Same currency ${conversion.fromCurrency}, no conversion needed`);
        return {
          originalAmount: conversion.amount,
          convertedAmount: conversion.amount,
          rate: 1
        };
      }

      const cacheKey = this.getRateCacheKey(conversion.fromCurrency, toCurrency);
      const rates = this.ratesCache.get(cacheKey);
      const rate = rates?.[toCurrency] || 1;
      const convertedAmount = conversion.amount * rate;
      
      
      return {
        originalAmount: conversion.amount,
        convertedAmount,
        rate
      };
    });

    return results;
  }

  /**
   * Get health status of the coordinator
   */
  getHealthStatus(): {
    cachedRates: number;
    pendingConversions: number;
    cacheAge: number;
    isHealthy: boolean;
  } {
    const cacheAge = Date.now() - this.cacheTimestamp;
    const isHealthy = this.conversionPromises.size < 10 && cacheAge < this.CACHE_DURATION;

    return {
      cachedRates: this.ratesCache.size,
      pendingConversions: this.conversionPromises.size,
      cacheAge,
      isHealthy
    };
  }
}