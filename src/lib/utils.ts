import { clsx, type ClassValue } from 'clsx';
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date according to the current language locale
 */
export function formatDate(date: string | Date, locale: string = 'en'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(dateObj);
}

/**
 * Format date and time according to the current language locale
 */
export function formatDateTime(date: string | Date, locale: string = 'en'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
}

/**
 * Format time according to the current language locale
 */
export function formatTime(date: string | Date, locale: string = 'en'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
}

/**
 * Format file size in a human-readable format
 */
export function formatFileSize(bytes: number, locale: string = 'en'): string {
  const sizes = locale === 'ar' 
    ? ['بايت', 'كيلو بايت', 'ميجا بايت', 'جيجا بايت']
    : ['Bytes', 'KB', 'MB', 'GB'];
    
  if (bytes === 0) return `0 ${sizes[0]}`;
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = Math.round(bytes / Math.pow(1024, i) * 100) / 100;
  
  return `${size} ${sizes[i]}`;
}
