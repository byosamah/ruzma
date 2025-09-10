import { User } from '@supabase/supabase-js';
import { BaseService } from './BaseService';
import { ExchangeRateService } from './ExchangeRateService';
import { CurrencyService } from './CurrencyService';
import { CurrencyCode, formatCurrency as formatCurrencyUtil, getCurrencySymbol } from '@/lib/currency';

export interface ConversionResult {
  originalAmount: number;
  originalCurrency: CurrencyCode;
  convertedAmount: number;
  convertedCurrency: CurrencyCode;
  conversionRate: number;
  formattedOriginal: string;
  formattedConverted: string;
  isConverted: boolean;
}

export interface ConversionDisplayOptions {
  showConversionIndicator?: boolean;
  showOriginalAmount?: boolean;
  compactFormat?: boolean;
  language?: 'en' | 'ar';
}

export class ConversionService extends BaseService {
  private exchangeRateService: ExchangeRateService;
  private currencyService: CurrencyService;

  constructor(user: User | null) {
    super(user);
    this.exchangeRateService = new ExchangeRateService(user);
    this.currencyService = new CurrencyService(user);
  }

  /**
   * Convert an amount from one currency to another with full formatting
   */
  async convertWithFormatting(
    amount: number,
    fromCurrency: CurrencyCode,
    toCurrency: CurrencyCode,
    options: ConversionDisplayOptions = {}
  ): Promise<ConversionResult> {
    const { language = 'en' } = options;
    
    // If currencies are the same, no conversion needed
    if (fromCurrency === toCurrency) {
      const formatted = formatCurrencyUtil(amount, fromCurrency, language);
      return {
        originalAmount: amount,
        originalCurrency: fromCurrency,
        convertedAmount: amount,
        convertedCurrency: toCurrency,
        conversionRate: 1,
        formattedOriginal: formatted,
        formattedConverted: formatted,
        isConverted: false,
      };
    }

    // Get conversion rate and convert
    const conversionRate = await this.exchangeRateService.getConversionRate(fromCurrency, toCurrency);
    const convertedAmount = amount * conversionRate;

    // Format both amounts
    const formattedOriginal = formatCurrencyUtil(amount, fromCurrency, language);
    const formattedConverted = formatCurrencyUtil(convertedAmount, toCurrency, language);

    return {
      originalAmount: amount,
      originalCurrency: fromCurrency,
      convertedAmount,
      convertedCurrency: toCurrency,
      conversionRate,
      formattedOriginal,
      formattedConverted,
      isConverted: true,
    };
  }

  /**
   * Get display text with conversion indicator
   */
  getConversionDisplayText(
    result: ConversionResult,
    options: ConversionDisplayOptions = {}
  ): string {
    const { 
      showConversionIndicator = true, 
      showOriginalAmount = true, 
      compactFormat = false 
    } = options;

    if (!result.isConverted) {
      return result.formattedConverted;
    }

    if (compactFormat) {
      // Compact format: "~$100 USD"
      return `~${result.formattedConverted}`;
    }

    if (showOriginalAmount && showConversionIndicator) {
      // Full format: "$100 USD (~75 EUR)"
      return `${result.formattedOriginal} (~${result.formattedConverted})`;
    }

    if (showConversionIndicator) {
      // Conversion indicator only: "~$75 EUR"
      return `~${result.formattedConverted}`;
    }

    // Just the converted amount
    return result.formattedConverted;
  }

  /**
   * Convert amount to user's preferred currency
   */
  async convertToUserCurrency(
    amount: number,
    fromCurrency: CurrencyCode,
    options: ConversionDisplayOptions = {}
  ): Promise<ConversionResult> {
    const userCurrency = await this.currencyService.getUserCurrency();
    return this.convertWithFormatting(amount, fromCurrency, userCurrency, options);
  }

  /**
   * Convert multiple amounts in batch (for performance)
   * Ensures all conversions use the same exchange rates for consistency
   */
  async convertBatch(
    amounts: Array<{ amount: number; fromCurrency: CurrencyCode }>,
    toCurrency: CurrencyCode,
    options: ConversionDisplayOptions = {}
  ): Promise<ConversionResult[]> {
    // Get unique currencies to minimize API calls
    const uniqueCurrencies = [...new Set(amounts.map(a => a.fromCurrency))];
    
    // Preload rates for all currencies to ensure consistency
    const ratesCache: Record<string, Record<string, number>> = {};
    
    for (const currency of uniqueCurrencies) {
      if (currency !== toCurrency) {
        ratesCache[currency] = await this.exchangeRateService.getExchangeRates(currency);
      }
    }

    // Convert all amounts using the same cached rates
    const results: ConversionResult[] = [];
    
    for (const { amount, fromCurrency } of amounts) {
      if (fromCurrency === toCurrency) {
        const formatted = formatCurrencyUtil(amount, fromCurrency, options.language || 'en');
        results.push({
          originalAmount: amount,
          originalCurrency: fromCurrency,
          convertedAmount: amount,
          convertedCurrency: toCurrency,
          conversionRate: 1,
          formattedOriginal: formatted,
          formattedConverted: formatted,
          isConverted: false,
        });
      } else {
        const rates = ratesCache[fromCurrency];
        const conversionRate = rates?.[toCurrency] || 1;
        const convertedAmount = amount * conversionRate;
        
        const formattedOriginal = formatCurrencyUtil(amount, fromCurrency, options.language || 'en');
        const formattedConverted = formatCurrencyUtil(convertedAmount, toCurrency, options.language || 'en');

        results.push({
          originalAmount: amount,
          originalCurrency: fromCurrency,
          convertedAmount,
          convertedCurrency: toCurrency,
          conversionRate,
          formattedOriginal,
          formattedConverted,
          isConverted: true,
        });
      }
    }

    return results;
  }

  /**
   * Get exchange rate info for display
   */
  async getExchangeRateInfo(
    fromCurrency: CurrencyCode,
    toCurrency: CurrencyCode
  ): Promise<{
    rate: number;
    formattedRate: string;
    lastUpdated: string | null;
    isStale: boolean;
  }> {
    const rate = await this.exchangeRateService.getConversionRate(fromCurrency, toCurrency);
    const rateInfo = this.exchangeRateService.getRateInfo(fromCurrency);
    
    // Format the rate (e.g., "1 USD = 3.75 SAR")
    const fromSymbol = getCurrencySymbol(fromCurrency);
    const toSymbol = getCurrencySymbol(toCurrency);
    const formattedRate = `1 ${fromSymbol} = ${rate.toFixed(4)} ${toSymbol}`;
    
    // Check if rate is stale (older than 2 hours)
    const isStale = rateInfo.cacheAge ? rateInfo.cacheAge > 2 * 60 * 60 * 1000 : true;

    return {
      rate,
      formattedRate,
      lastUpdated: rateInfo.lastUpdated,
      isStale,
    };
  }

  /**
   * Format amount with currency symbol and handle RTL
   */
  formatAmountWithCurrency(
    amount: number,
    currency: CurrencyCode,
    language: 'en' | 'ar' = 'en'
  ): string {
    return formatCurrencyUtil(amount, currency, language);
  }

  /**
   * Check if conversion is needed between two currencies
   */
  needsConversion(fromCurrency: CurrencyCode, toCurrency: CurrencyCode): boolean {
    return fromCurrency !== toCurrency;
  }

  /**
   * Get conversion tooltip text
   */
  getConversionTooltip(
    result: ConversionResult,
    language: 'en' | 'ar' = 'en'
  ): string {
    if (!result.isConverted) {
      return '';
    }

    const rateText = language === 'ar' 
      ? `معدل التحويل: ${result.conversionRate.toFixed(4)}`
      : `Exchange rate: ${result.conversionRate.toFixed(4)}`;
    
    const originalText = language === 'ar'
      ? `المبلغ الأصلي: ${result.formattedOriginal}`
      : `Original amount: ${result.formattedOriginal}`;

    return `${originalText}\n${rateText}`;
  }

  /**
   * Validate if currency conversion is supported
   */
  isCurrencySupported(currency: string): currency is CurrencyCode {
    return this.currencyService.isValidCurrency(currency);
  }

  /**
   * Get available currencies for conversion
   */
  getAvailableCurrencies(): CurrencyCode[] {
    return Object.keys(formatCurrencyUtil) as CurrencyCode[];
  }

  /**
   * Calculate total from mixed currency amounts
   */
  async calculateTotal(
    items: Array<{ amount: number; currency: CurrencyCode }>,
    targetCurrency: CurrencyCode
  ): Promise<{
    total: number;
    formattedTotal: string;
    breakdown: ConversionResult[];
  }> {
    // Convert all items to target currency
    const conversions = await Promise.all(
      items.map(item => 
        this.convertWithFormatting(item.amount, item.currency, targetCurrency)
      )
    );

    // Calculate total
    const total = conversions.reduce((sum, conversion) => sum + conversion.convertedAmount, 0);
    const formattedTotal = formatCurrencyUtil(total, targetCurrency);

    return {
      total,
      formattedTotal,
      breakdown: conversions,
    };
  }

  /**
   * Clear all cached rates (useful for testing and fixing rate inconsistencies)
   */
  clearConversionCache(): void {
    this.exchangeRateService.clearCache();
    this.logOperation('conversion_cache_cleared', {});
  }

  /**
   * Force refresh exchange rates to ensure consistency
   */
  async forceRefreshRates(baseCurrency: CurrencyCode = 'USD'): Promise<void> {
    // Clear cache first
    this.clearConversionCache();
    
    // Force fetch fresh rates
    await this.exchangeRateService.getExchangeRates(baseCurrency);
    
    this.logOperation('rates_force_refreshed', { baseCurrency });
  }

  /**
   * Get the underlying exchange rate service instance
   */
  getExchangeRateService(): ExchangeRateService {
    return this.exchangeRateService;
  }

  /**
   * Get health status of conversion service
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    ratesFresh: boolean;
    lastUpdate: string | null;
    supportedCurrencies: number;
  }> {
    try {
      const userCurrency = await this.currencyService.getUserCurrency();
      const rateInfo = this.exchangeRateService.getRateInfo(userCurrency);
      const supportedCurrencies = this.getAvailableCurrencies().length;
      
      // Check if rates are fresh (less than 2 hours old)
      const ratesFresh = rateInfo.cacheAge ? rateInfo.cacheAge < 2 * 60 * 60 * 1000 : false;
      
      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      
      if (!ratesFresh) {
        status = 'degraded';
      }
      
      if (!rateInfo.cached && supportedCurrencies < 10) {
        status = 'unhealthy';
      }

      return {
        status,
        ratesFresh,
        lastUpdate: rateInfo.lastUpdated,
        supportedCurrencies,
      };
    } catch (error) {
      this.logOperation('health_check_error', { error: String(error) });
      return {
        status: 'unhealthy',
        ratesFresh: false,
        lastUpdate: null,
        supportedCurrencies: 0,
      };
    }
  }
}