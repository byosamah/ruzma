import { format, formatDistance, formatRelative, isValid, parseISO } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

/**
 * Currency formatter
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback for unsupported currencies
    return `${currency} ${amount.toFixed(2)}`;
  }
};

/**
 * Number formatter
 */
export const formatNumber = (
  value: number,
  locale: string = 'en-US',
  options?: Intl.NumberFormatOptions
): string => {
  return new Intl.NumberFormat(locale, options).format(value);
};

/**
 * Percentage formatter
 */
export const formatPercentage = (
  value: number,
  decimals: number = 0,
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
};

/**
 * Date formatters
 */
export const formatDate = (
  date: Date | string,
  formatStr: string = 'PP',
  locale: string = 'en'
): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(parsedDate)) {
    return 'Invalid date';
  }
  
  const dateLocale = locale === 'ar' ? ar : enUS;
  return format(parsedDate, formatStr, { locale: dateLocale });
};

export const formatDateTime = (
  date: Date | string,
  locale: string = 'en'
): string => {
  return formatDate(date, 'PPpp', locale);
};

export const formatRelativeTime = (
  date: Date | string,
  locale: string = 'en'
): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(parsedDate)) {
    return 'Invalid date';
  }
  
  const dateLocale = locale === 'ar' ? ar : enUS;
  return formatDistance(parsedDate, new Date(), { 
    addSuffix: true,
    locale: dateLocale 
  });
};

export const formatRelativeDate = (
  date: Date | string,
  baseDate: Date = new Date(),
  locale: string = 'en'
): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(parsedDate)) {
    return 'Invalid date';
  }
  
  const dateLocale = locale === 'ar' ? ar : enUS;
  return formatRelative(parsedDate, baseDate, { locale: dateLocale });
};

/**
 * File size formatter
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Text formatters
 */
export const truncate = (
  text: string,
  length: number,
  suffix: string = '...'
): string => {
  if (text.length <= length) return text;
  return text.substring(0, length - suffix.length) + suffix;
};

export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const capitalizeWords = (text: string): string => {
  return text
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const camelToTitle = (text: string): string => {
  return text
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
};

/**
 * Phone number formatter
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length === 10) {
    // US format: (123) 456-7890
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    // US format with country code: +1 (123) 456-7890
    return cleaned.replace(/(\d)(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4');
  }
  
  // Return original if no format matches
  return phone;
};

/**
 * Name formatter
 */
export const formatName = (firstName?: string, lastName?: string): string => {
  const parts = [firstName, lastName].filter(Boolean);
  return parts.join(' ');
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Duration formatter
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  
  return parts.join(' ');
};

/**
 * Status formatter
 */
export const formatStatus = (status: string): string => {
  return status
    .split('_')
    .map(word => capitalize(word))
    .join(' ');
};

/**
 * Invoice number formatter
 */
export const formatInvoiceNumber = (number: number, prefix: string = 'INV'): string => {
  return `${prefix}-${String(number).padStart(6, '0')}`;
};

/**
 * Remove HTML tags
 */
export const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, '');
};

/**
 * Format list as string
 */
export const formatList = (
  items: string[],
  locale: string = 'en',
  type: 'conjunction' | 'disjunction' = 'conjunction'
): string => {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  
  try {
    // Check if Intl.ListFormat is available
    if ('ListFormat' in Intl) {
      return new (Intl as any).ListFormat(locale, { type }).format(items);
    }
    throw new Error('ListFormat not supported');
  } catch {
    // Fallback for unsupported locales
    const last = items[items.length - 1];
    const rest = items.slice(0, -1);
    const separator = type === 'conjunction' ? ' and ' : ' or ';
    return rest.join(', ') + separator + last;
  }
};