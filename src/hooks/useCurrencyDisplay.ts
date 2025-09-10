import { useMemo, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/core/useAuth';
import { useProfileQuery } from '@/hooks/core/useProfileQuery';
import { ServiceRegistry } from '@/services/core/ServiceRegistry';
import { CurrencyCode } from '@/lib/currency';
import { ConversionResult } from '@/services/core/ConversionService';
import { CurrencyConversionCoordinator } from '@/services/core/CurrencyConversionCoordinator';

export interface CurrencyDisplayOptions {
  showConversionIndicator?: boolean;
  showOriginalAmount?: boolean;
  compactFormat?: boolean;
  convertToUserCurrency?: boolean;
}

export interface CurrencyDisplayResult {
  formattedAmount: string;
  originalAmount: number;
  displayAmount: number;
  originalCurrency: CurrencyCode;
  displayCurrency: CurrencyCode;
  isConverted: boolean;
  conversionRate: number;
  conversionTooltip?: string;
  loading: boolean;
}

export interface UseCurrencyDisplayParams {
  amount: number;
  fromCurrency: CurrencyCode;
  toCurrency?: CurrencyCode; // If not provided, will use user's preferred currency
  options?: CurrencyDisplayOptions;
}

/**
 * Hook for displaying currency amounts with optional conversion
 * Provides formatted display text, conversion information, and loading states
 */
export const useCurrencyDisplay = ({
  amount,
  fromCurrency,
  toCurrency,
  options = {}
}: UseCurrencyDisplayParams): CurrencyDisplayResult => {
  // Validate fromCurrency to prevent undefined currencies from reaching the API
  const validatedFromCurrency = (fromCurrency && fromCurrency.trim() && fromCurrency !== 'undefined' && fromCurrency !== 'null') 
    ? fromCurrency 
    : 'USD' as CurrencyCode;
    
  if (fromCurrency !== validatedFromCurrency) {
    console.warn(`Invalid fromCurrency '${fromCurrency}' replaced with '${validatedFromCurrency}'`);
  }
  const { user } = useAuth();
  const { data: profile } = useProfileQuery(user);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    showConversionIndicator = true,
    showOriginalAmount = false,
    compactFormat = false,
    convertToUserCurrency = false,
  } = options;

  const conversionService = useMemo(() => {
    return ServiceRegistry.getInstance().getConversionService(user);
  }, [user]);

  const targetCurrency = useMemo(() => {
    if (toCurrency) return toCurrency;
    if (convertToUserCurrency && profile?.currency) return profile.currency as CurrencyCode;
    return validatedFromCurrency;
  }, [toCurrency, convertToUserCurrency, profile?.currency, validatedFromCurrency]);

  const language = useMemo(() => {
    // Determine language from profile country or default to English
    return profile?.country === 'SA' || profile?.country === 'AE' ? 'ar' : 'en';
  }, [profile?.country]);

  useEffect(() => {
    let isCancelled = false;

    const performConversion = async () => {
      setLoading(true);
      
      
      try {
        // Use the coordinator to ensure consistent rates with dashboard stats
        const coordinator = CurrencyConversionCoordinator.getInstance();
        const coordinatedResults = await coordinator.coordinatedBatchConversion(
          [{ amount, fromCurrency: validatedFromCurrency }],
          targetCurrency,
          user
        );
        
        const coordinatedResult = coordinatedResults[0];
        
        // Create full conversion result for display with proper formatting
        const conversionService = ServiceRegistry.getInstance().getConversionService(user);
        
        const result: ConversionResult = {
          originalAmount: amount,
          originalCurrency: validatedFromCurrency,
          convertedAmount: coordinatedResult.convertedAmount,
          convertedCurrency: targetCurrency,
          conversionRate: coordinatedResult.rate,
          formattedOriginal: conversionService.formatAmountWithCurrency(amount, validatedFromCurrency, language as 'en' | 'ar'),
          formattedConverted: conversionService.formatAmountWithCurrency(coordinatedResult.convertedAmount, targetCurrency, language as 'en' | 'ar'),
          isConverted: validatedFromCurrency !== targetCurrency,
        };

        if (!isCancelled) {
          setConversionResult(result);
        }
      } catch (error) {
        console.error('Currency conversion error:', error);
        
        if (!isCancelled) {
          // Fallback to original currency if conversion fails
          const conversionService = ServiceRegistry.getInstance().getConversionService(user);
          const fallbackResult: ConversionResult = {
            originalAmount: amount,
            originalCurrency: validatedFromCurrency,
            convertedAmount: amount,
            convertedCurrency: validatedFromCurrency,
            conversionRate: 1,
            formattedOriginal: conversionService.formatAmountWithCurrency(amount, validatedFromCurrency, language as 'en' | 'ar'),
            formattedConverted: conversionService.formatAmountWithCurrency(amount, validatedFromCurrency, language as 'en' | 'ar'),
            isConverted: false,
          };
          setConversionResult(fallbackResult);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    performConversion();

    return () => {
      isCancelled = true;
    };
  }, [amount, validatedFromCurrency, targetCurrency, language, user]);

  const result = useMemo((): CurrencyDisplayResult => {
    if (!conversionResult) {
      return {
        formattedAmount: `${amount}`,
        originalAmount: amount,
        displayAmount: amount,
        originalCurrency: validatedFromCurrency,
        displayCurrency: validatedFromCurrency,
        isConverted: false,
        conversionRate: 1,
        loading: true,
      };
    }

    const displayText = conversionService.getConversionDisplayText(conversionResult, {
      showConversionIndicator,
      showOriginalAmount,
      compactFormat,
    });

    const tooltip = conversionResult.isConverted 
      ? conversionService.getConversionTooltip(conversionResult, language as 'en' | 'ar')
      : undefined;

    return {
      formattedAmount: displayText,
      originalAmount: conversionResult.originalAmount,
      displayAmount: conversionResult.convertedAmount,
      originalCurrency: conversionResult.originalCurrency,
      displayCurrency: conversionResult.convertedCurrency,
      isConverted: conversionResult.isConverted,
      conversionRate: conversionResult.conversionRate,
      conversionTooltip: tooltip,
      loading: false,
    };
  }, [
    conversionResult,
    conversionService,
    showConversionIndicator,
    showOriginalAmount,
    compactFormat,
    language,
    amount,
    validatedFromCurrency,
  ]);

  return result;
};

/**
 * Hook for batch currency display - useful for lists of amounts
 */
export interface BatchCurrencyDisplayItem {
  amount: number;
  fromCurrency: CurrencyCode;
  id: string;
}

export const useBatchCurrencyDisplay = (
  items: BatchCurrencyDisplayItem[],
  toCurrency?: CurrencyCode,
  options: CurrencyDisplayOptions = {}
) => {
  const { user } = useAuth();
  const { data: profile } = useProfileQuery(user);
  const [results, setResults] = useState<Record<string, CurrencyDisplayResult>>({});
  const [loading, setLoading] = useState(true);

  const conversionService = useMemo(() => {
    return ServiceRegistry.getInstance().getConversionService(user);
  }, [user]);

  const targetCurrency = useMemo(() => {
    if (toCurrency) return toCurrency;
    if (options.convertToUserCurrency === true && profile?.currency) {
      return profile.currency as CurrencyCode;
    }
    return 'USD';
  }, [toCurrency, options.convertToUserCurrency, profile?.currency]);

  useEffect(() => {
    let isCancelled = false;

    const performBatchConversion = async () => {
      setLoading(true);

      try {
        // Validate and clean currency codes before batch conversion
        const validatedItems = items.map(item => {
          const validatedCurrency = (item.fromCurrency && item.fromCurrency.trim() && item.fromCurrency !== 'undefined' && item.fromCurrency !== 'null') 
            ? item.fromCurrency 
            : 'USD' as CurrencyCode;
          
          if (item.fromCurrency !== validatedCurrency) {
            console.warn(`Invalid fromCurrency '${item.fromCurrency}' for item '${item.id}' replaced with '${validatedCurrency}'`);
          }
          
          return { amount: item.amount, fromCurrency: validatedCurrency };
        });

        const batchResults = await conversionService.convertBatch(
          validatedItems,
          targetCurrency,
          { language: profile?.country === 'SA' || profile?.country === 'AE' ? 'ar' : 'en' }
        );

        if (!isCancelled) {
          const resultMap: Record<string, CurrencyDisplayResult> = {};
          
          items.forEach((item, index) => {
            const conversionResult = batchResults[index];
            
            const displayText = conversionService.getConversionDisplayText(conversionResult, options);
            
            resultMap[item.id] = {
              formattedAmount: displayText,
              originalAmount: conversionResult.originalAmount,
              displayAmount: conversionResult.convertedAmount,
              originalCurrency: conversionResult.originalCurrency,
              displayCurrency: conversionResult.convertedCurrency,
              isConverted: conversionResult.isConverted,
              conversionRate: conversionResult.conversionRate,
              conversionTooltip: conversionResult.isConverted 
                ? conversionService.getConversionTooltip(
                    conversionResult, 
                    profile?.country === 'SA' || profile?.country === 'AE' ? 'ar' : 'en'
                  )
                : undefined,
              loading: false,
            };
          });

          setResults(resultMap);
        }
      } catch (error) {
        console.error('Batch currency conversion error:', error);
        
        if (!isCancelled) {
          // Create fallback results
          const fallbackResults: Record<string, CurrencyDisplayResult> = {};
          items.forEach(item => {
            fallbackResults[item.id] = {
              formattedAmount: `${item.amount}`,
              originalAmount: item.amount,
              displayAmount: item.amount,
              originalCurrency: item.fromCurrency,
              displayCurrency: item.fromCurrency,
              isConverted: false,
              conversionRate: 1,
              loading: false,
            };
          });
          setResults(fallbackResults);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    if (items.length > 0) {
      performBatchConversion();
    } else {
      setLoading(false);
      setResults({});
    }

    return () => {
      isCancelled = true;
    };
  }, [items, targetCurrency, conversionService, profile?.country, options]);

  return {
    results,
    loading,
    targetCurrency,
  };
};

/**
 * Simple hook to get user's preferred currency without conversion
 */
export const useUserCurrencyPreference = (): {
  currency: CurrencyCode;
  language: 'en' | 'ar';
  loading: boolean;
} => {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfileQuery(user);

  return useMemo(() => ({
    currency: (profile?.currency as CurrencyCode) || 'USD',
    language: profile?.country === 'SA' || profile?.country === 'AE' ? 'ar' : 'en',
    loading: isLoading,
  }), [profile, isLoading]);
};