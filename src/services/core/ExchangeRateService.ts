import { User } from '@supabase/supabase-js';
import { BaseService } from './BaseService';
import { CurrencyCode, CURRENCIES } from '@/lib/currency';

export interface ExchangeRate {
  from_currency: string;
  to_currency: string;
  rate: number;
  last_updated: string;
}

export interface CachedRates {
  base_currency: string;
  rates: Record<string, number>;
  last_updated: string;
}

export class ExchangeRateService extends BaseService {
  private readonly API_BASE_URL = 'https://api.exchangerate-api.com/v4/latest';
  private readonly CACHE_KEY_PREFIX = 'exchange_rates_';
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
  private readonly DEFAULT_RATES: Record<string, number> = {
    // Fallback rates relative to USD (approximate)
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    SAR: 3.75,
    AED: 3.67,
    JOD: 0.71,
    EGP: 48.7,
    KWD: 0.31,
    QAR: 3.64,
    BHD: 0.38,
    OMR: 0.38,
    LBP: 15000,
    MAD: 10.1,
    TND: 3.1,
    DZD: 134.5,
    CAD: 1.36,
    AUD: 1.52,
    CHF: 0.88,
    JPY: 149.8,
  };

  constructor(user: User | null) {
    super(user);
  }

  /**
   * Get cached exchange rates from localStorage
   */
  private getCachedRates(baseCurrency: CurrencyCode): CachedRates | null {
    try {
      const cacheKey = `${this.CACHE_KEY_PREFIX}${baseCurrency}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) return null;
      
      const parsedCache: CachedRates = JSON.parse(cached);
      const cacheAge = Date.now() - new Date(parsedCache.last_updated).getTime();
      
      if (cacheAge > this.CACHE_DURATION) {
        localStorage.removeItem(cacheKey);
        return null;
      }
      
      return parsedCache;
    } catch (error) {
      this.logOperation('get_cached_rates_error', { error: String(error) });
      return null;
    }
  }

  /**
   * Cache exchange rates in localStorage
   */
  private setCachedRates(baseCurrency: CurrencyCode, rates: Record<string, number>): void {
    try {
      const cacheKey = `${this.CACHE_KEY_PREFIX}${baseCurrency}`;
      const cacheData: CachedRates = {
        base_currency: baseCurrency,
        rates,
        last_updated: new Date().toISOString(),
      };
      
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      this.logOperation('set_cached_rates_error', { error: String(error) });
    }
  }

  /**
   * Fetch fresh exchange rates from API
   */
  private async fetchRatesFromAPI(baseCurrency: CurrencyCode): Promise<Record<string, number> | null> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/${baseCurrency}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.rates || typeof data.rates !== 'object') {
        throw new Error('Invalid API response format');
      }


      this.logOperation('fetch_rates_success', { 
        baseCurrency, 
        rateCount: Object.keys(data.rates).length 
      });

      return data.rates;
    } catch (error) {
      this.logOperation('fetch_rates_error', { 
        baseCurrency, 
        error: String(error) 
      });
      return null;
    }
  }

  /**
   * Get exchange rates with caching fallback
   */
  async getExchangeRates(baseCurrency: CurrencyCode = 'USD'): Promise<Record<string, number>> {
    // Check cache first
    const cachedRates = this.getCachedRates(baseCurrency);
    if (cachedRates) {
      return cachedRates.rates;
    }

    // Try to fetch from API
    const freshRates = await this.fetchRatesFromAPI(baseCurrency);
    if (freshRates) {
      // Filter rates to only include supported currencies
      const filteredRates = Object.fromEntries(
        Object.entries(freshRates).filter(([currency]) => 
          currency in CURRENCIES
        )
      );
      
      this.setCachedRates(baseCurrency, filteredRates);
      return filteredRates;
    }

    // Fallback to default rates
    this.logOperation('using_fallback_rates', { baseCurrency });
    
    if (baseCurrency === 'USD') {
      return this.DEFAULT_RATES;
    }
    
    // Convert default USD rates to the requested base currency
    const usdRate = this.DEFAULT_RATES[baseCurrency];
    if (!usdRate) {
      return this.DEFAULT_RATES; // Return USD rates if base currency not found
    }
    
    const convertedRates = Object.fromEntries(
      Object.entries(this.DEFAULT_RATES).map(([currency, rate]) => [
        currency,
        currency === baseCurrency ? 1 : rate / usdRate
      ])
    );
    
    return convertedRates;
  }

  /**
   * Convert amount between currencies
   */
  async convertCurrency(
    amount: number,
    fromCurrency: CurrencyCode,
    toCurrency: CurrencyCode
  ): Promise<number> {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    const rates = await this.getExchangeRates(fromCurrency);
    const rate = rates[toCurrency];
    
    if (!rate) {
      this.logOperation('conversion_rate_not_found', { fromCurrency, toCurrency });
      return amount; // Return original amount if rate not found
    }

    const convertedAmount = amount * rate;
    
    this.logOperation('currency_converted', {
      amount,
      fromCurrency,
      toCurrency,
      rate,
      convertedAmount,
    });

    return convertedAmount;
  }

  /**
   * Get conversion rate between two currencies
   */
  async getConversionRate(fromCurrency: CurrencyCode, toCurrency: CurrencyCode): Promise<number> {
    if (fromCurrency === toCurrency) {
      return 1;
    }

    const rates = await this.getExchangeRates(fromCurrency);
    const rate = rates[toCurrency] || 1;
    
    
    return rate;
  }

  /**
   * Check if rates are cached and fresh
   */
  areCachedRatesFresh(baseCurrency: CurrencyCode): boolean {
    const cachedRates = this.getCachedRates(baseCurrency);
    return cachedRates !== null;
  }

  /**
   * Clear all cached rates (useful for testing or manual refresh)
   */
  clearCache(): void {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.CACHE_KEY_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      this.logOperation('cache_cleared', { keysRemoved: keysToRemove.length });
    } catch (error) {
      this.logOperation('cache_clear_error', { error: String(error) });
    }
  }

  /**
   * Preload rates for multiple currencies
   */
  async preloadRates(currencies: CurrencyCode[]): Promise<void> {
    const promises = currencies.map(currency => this.getExchangeRates(currency));
    await Promise.allSettled(promises);
    
    this.logOperation('rates_preloaded', { currencies });
  }

  /**
   * Get rate freshness info for debugging
   */
  getRateInfo(baseCurrency: CurrencyCode): {
    cached: boolean;
    lastUpdated: string | null;
    cacheAge: number | null;
  } {
    const cachedRates = this.getCachedRates(baseCurrency);
    
    if (!cachedRates) {
      return {
        cached: false,
        lastUpdated: null,
        cacheAge: null,
      };
    }
    
    const cacheAge = Date.now() - new Date(cachedRates.last_updated).getTime();
    
    return {
      cached: true,
      lastUpdated: cachedRates.last_updated,
      cacheAge,
    };
  }
}