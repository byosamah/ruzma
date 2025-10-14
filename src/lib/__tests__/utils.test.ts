import { describe, it, expect } from 'vitest';
import { cn, formatDate, formatDateTime, formatTime, formatFileSize } from '../utils';

describe('utils', () => {
  describe('cn (className merger)', () => {
    it('should merge single class name', () => {
      expect(cn('text-red-500')).toBe('text-red-500');
    });

    it('should merge multiple class names', () => {
      expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
    });

    it('should handle conditional class names', () => {
      expect(cn('base', true && 'active')).toBe('base active');
      expect(cn('base', false && 'active')).toBe('base');
    });

    it('should merge conflicting Tailwind classes correctly', () => {
      // twMerge should keep the last conflicting class
      expect(cn('px-2', 'px-4')).toBe('px-4');
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    });

    it('should handle arrays of class names', () => {
      expect(cn(['text-red-500', 'bg-blue-500'])).toBe('text-red-500 bg-blue-500');
    });

    it('should handle objects with boolean values', () => {
      expect(cn({
        'text-red-500': true,
        'bg-blue-500': false,
        'font-bold': true
      })).toBe('text-red-500 font-bold');
    });

    it('should handle mixed input types', () => {
      expect(cn(
        'base',
        { 'active': true, 'disabled': false },
        ['extra', 'classes'],
        undefined,
        null,
        ''
      )).toBe('base active extra classes');
    });

    it('should remove duplicate classes', () => {
      expect(cn('text-red-500', 'text-red-500')).toBe('text-red-500');
    });
  });

  describe('formatDate', () => {
    const testDate = new Date('2024-01-15T10:30:00Z');

    it('should format date in English by default', () => {
      const formatted = formatDate(testDate, 'en');
      expect(formatted).toContain('January');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
    });

    it('should format date in Arabic', () => {
      const formatted = formatDate(testDate, 'ar');
      // Arabic months use Arabic numerals and text
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });

    it('should handle string date input', () => {
      const formatted = formatDate('2024-01-15', 'en');
      expect(formatted).toContain('January');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
    });

    it('should handle Date object input', () => {
      const date = new Date('2024-12-25');
      const formatted = formatDate(date, 'en');
      expect(formatted).toContain('December');
      expect(formatted).toContain('25');
    });

    it('should use en locale when no locale provided', () => {
      const formatted = formatDate(testDate);
      expect(formatted).toContain('January');
    });
  });

  describe('formatDateTime', () => {
    const testDate = new Date('2024-01-15T14:30:00Z');

    it('should format date and time in English', () => {
      const formatted = formatDateTime(testDate, 'en');
      expect(formatted).toContain('January');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
      // Time should be included
      expect(formatted.length).toBeGreaterThan(15);
    });

    it('should format date and time in Arabic', () => {
      const formatted = formatDateTime(testDate, 'ar');
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });

    it('should handle string date input', () => {
      const formatted = formatDateTime('2024-01-15T14:30:00Z', 'en');
      expect(formatted).toContain('January');
    });

    it('should include time component', () => {
      const formatted = formatDateTime(testDate, 'en');
      // Should have hour and minute
      expect(formatted.split(':').length).toBeGreaterThanOrEqual(2);
    });

    it('should use en locale when no locale provided', () => {
      const formatted = formatDateTime(testDate);
      expect(formatted).toContain('January');
    });
  });

  describe('formatTime', () => {
    const testDate = new Date('2024-01-15T14:30:00Z');

    it('should format time in English', () => {
      const formatted = formatTime(testDate, 'en');
      // Should contain time separator
      expect(formatted).toContain(':');
      expect(typeof formatted).toBe('string');
    });

    it('should format time in Arabic', () => {
      const formatted = formatTime(testDate, 'ar');
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });

    it('should handle string date input', () => {
      const formatted = formatTime('2024-01-15T14:30:00Z', 'en');
      expect(formatted).toContain(':');
    });

    it('should only show time, not date', () => {
      const formatted = formatTime(testDate, 'en');
      // Should not contain month name
      expect(formatted).not.toContain('January');
      expect(formatted).not.toContain('2024');
    });

    it('should use en locale when no locale provided', () => {
      const formatted = formatTime(testDate);
      expect(formatted).toContain(':');
    });
  });

  describe('formatFileSize', () => {
    it('should format 0 bytes', () => {
      expect(formatFileSize(0, 'en')).toBe('0 Bytes');
      expect(formatFileSize(0, 'ar')).toBe('0 بايت');
    });

    it('should format bytes in English', () => {
      expect(formatFileSize(500, 'en')).toBe('500 Bytes');
      expect(formatFileSize(1000, 'en')).toBe('1000 Bytes');
    });

    it('should format bytes in Arabic', () => {
      expect(formatFileSize(500, 'ar')).toBe('500 بايت');
    });

    it('should format kilobytes in English', () => {
      const result = formatFileSize(1024, 'en');
      expect(result).toContain('KB');
      expect(result).toBe('1 KB');
    });

    it('should format kilobytes in Arabic', () => {
      const result = formatFileSize(1024, 'ar');
      expect(result).toContain('كيلو بايت');
    });

    it('should format megabytes in English', () => {
      const result = formatFileSize(1024 * 1024, 'en');
      expect(result).toContain('MB');
      expect(result).toBe('1 MB');
    });

    it('should format megabytes in Arabic', () => {
      const result = formatFileSize(1024 * 1024, 'ar');
      expect(result).toContain('ميجا بايت');
    });

    it('should format gigabytes in English', () => {
      const result = formatFileSize(1024 * 1024 * 1024, 'en');
      expect(result).toContain('GB');
      expect(result).toBe('1 GB');
    });

    it('should format gigabytes in Arabic', () => {
      const result = formatFileSize(1024 * 1024 * 1024, 'ar');
      expect(result).toContain('جيجا بايت');
    });

    it('should handle decimal values', () => {
      const result = formatFileSize(1536, 'en'); // 1.5 KB
      expect(result).toBe('1.5 KB');
    });

    it('should handle large decimal values', () => {
      const result = formatFileSize(1024 * 1024 * 2.5, 'en'); // 2.5 MB
      expect(result).toBe('2.5 MB');
    });

    it('should use en locale when no locale provided', () => {
      expect(formatFileSize(1024)).toContain('KB');
      expect(formatFileSize(1024)).not.toContain('كيلو');
    });

    it('should round to 2 decimal places', () => {
      const result = formatFileSize(1234567, 'en'); // ~1.18 MB
      const decimals = result.split(' ')[0].split('.')[1];
      if (decimals) {
        expect(decimals.length).toBeLessThanOrEqual(2);
      }
    });

    it('should handle very large files', () => {
      const result = formatFileSize(5 * 1024 * 1024 * 1024, 'en'); // 5 GB
      expect(result).toBe('5 GB');
    });

    it('should handle values between size boundaries', () => {
      const result = formatFileSize(1500, 'en'); // 1.46 KB
      expect(result).toContain('KB');
      expect(parseFloat(result)).toBeGreaterThan(1);
      expect(parseFloat(result)).toBeLessThan(2);
    });
  });
});
