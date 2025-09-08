import React from 'react';
import { CurrencyCode } from '@/lib/currency';
import { useCurrencyDisplay, CurrencyDisplayOptions } from '@/hooks/useCurrencyDisplay';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface CurrencyDisplayProps extends CurrencyDisplayOptions {
  amount: number;
  fromCurrency: CurrencyCode;
  toCurrency?: CurrencyCode;
  className?: string;
  loadingClassName?: string;
  showTooltip?: boolean;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * A component that displays currency amounts with optional conversion
 * Handles loading states, tooltips, and responsive formatting
 */
export function CurrencyDisplay({
  amount,
  fromCurrency,
  toCurrency,
  className,
  loadingClassName,
  showTooltip = true,
  placeholder = '...',
  size = 'md',
  ...options
}: CurrencyDisplayProps) {
  const {
    formattedAmount,
    isConverted,
    conversionTooltip,
    loading
  } = useCurrencyDisplay({
    amount,
    fromCurrency,
    toCurrency,
    options
  });

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  if (loading) {
    return (
      <span 
        className={cn(
          'inline-flex items-center gap-1 text-muted-foreground',
          sizeClasses[size],
          loadingClassName
        )}
      >
        <Loader2 className="h-3 w-3 animate-spin" />
        {placeholder}
      </span>
    );
  }

  const content = (
    <span 
      className={cn(
        'inline-block',
        sizeClasses[size],
        isConverted && 'border-b border-dashed border-muted-foreground/50',
        className
      )}
      title={showTooltip && conversionTooltip ? conversionTooltip : undefined}
    >
      {formattedAmount}
    </span>
  );

  return content;
}

export interface CurrencyAmountProps {
  amount: number;
  currency: CurrencyCode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSymbol?: boolean;
}

/**
 * Simple component for displaying amounts in a single currency (no conversion)
 */
export function CurrencyAmount({
  amount,
  currency,
  className,
  size = 'md',
  showSymbol = true
}: CurrencyAmountProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <CurrencyDisplay
      amount={amount}
      fromCurrency={currency}
      toCurrency={currency} // Same currency, no conversion
      convertToUserCurrency={false}
      className={cn(sizeClasses[size], className)}
      size={size}
      showTooltip={false}
    />
  );
}

export interface ConvertibleAmountProps {
  amount: number;
  fromCurrency: CurrencyCode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showOriginal?: boolean;
  compact?: boolean;
}

/**
 * Component that always converts to user's preferred currency
 */
export function ConvertibleAmount({
  amount,
  fromCurrency,
  className,
  size = 'md',
  showOriginal = false,
  compact = false
}: ConvertibleAmountProps) {
  return (
    <CurrencyDisplay
      amount={amount}
      fromCurrency={fromCurrency}
      convertToUserCurrency={true}
      showOriginalAmount={showOriginal}
      compactFormat={compact}
      className={className}
      size={size}
    />
  );
}

export interface ProjectCurrencyDisplayProps {
  amount: number;
  projectCurrency: CurrencyCode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showConversion?: boolean;
  isClientView?: boolean;
}

/**
 * Component specifically for project-related amounts
 * Shows amount in project currency with optional conversion indicator
 */
export function ProjectCurrencyDisplay({
  amount,
  projectCurrency,
  className,
  size = 'md',
  showConversion = true,
  isClientView = false
}: ProjectCurrencyDisplayProps) {
  // For client view, don't convert - show in project currency only
  // For freelancer view, show conversion if currencies differ
  if (isClientView) {
    return (
      <CurrencyAmount
        amount={amount}
        currency={projectCurrency}
        className={className}
        size={size}
      />
    );
  }

  return (
    <CurrencyDisplay
      amount={amount}
      fromCurrency={projectCurrency}
      convertToUserCurrency={showConversion}
      showOriginalAmount={false}
      showConversionIndicator={showConversion}
      className={className}
      size={size}
    />
  );
}