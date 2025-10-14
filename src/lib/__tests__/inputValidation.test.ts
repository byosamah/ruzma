import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  sanitizeInput,
  sanitizeHTML,
  validateEmail,
  validateProjectName,
  validateAmount,
  validateFileUpload,
  sanitizeFilename,
  validateJSONData,
} from '../inputValidation';

// Mock the authSecurity module to avoid actual logging
vi.mock('../authSecurity', () => ({
  logSecurityEvent: vi.fn(),
}));

describe('inputValidation', () => {
  describe('sanitizeInput', () => {
    it('should return empty string for null or undefined', () => {
      expect(sanitizeInput(null as any)).toBe('');
      expect(sanitizeInput(undefined as any)).toBe('');
      expect(sanitizeInput('' as any)).toBe('');
    });

    it('should remove script tags', () => {
      const input = 'Hello <script>alert("xss")</script> World';
      expect(sanitizeInput(input)).toBe('Hello  World');
    });

    it('should remove javascript: URLs', () => {
      const input = 'Click <a href="javascript:alert(1)">here</a>';
      expect(sanitizeInput(input)).toBe('Click <a href="alert(1)">here</a>');
    });

    it('should remove event handlers', () => {
      const input = '<div onclick="alert(1)">Click me</div>';
      expect(sanitizeInput(input)).toBe('<div "alert(1)">Click me</div>'); // Regex removes attribute name but leaves value
    });

    it('should remove data:text/html URLs', () => {
      const input = '<a href="data:text/html,<script>alert(1)</script>">Link</a>';
      // data:text/html is removed, then script tags are removed
      expect(sanitizeInput(input)).toBe('<a href=",">Link</a>');
    });

    it('should trim whitespace', () => {
      const input = '  Hello World  ';
      expect(sanitizeInput(input)).toBe('Hello World');
    });

    it('should handle normal text without modification', () => {
      const input = 'This is normal text with some punctuation!';
      expect(sanitizeInput(input)).toBe('This is normal text with some punctuation!');
    });

    it('should handle multiple script tags', () => {
      const input = '<script>alert(1)</script>text<script>alert(2)</script>';
      expect(sanitizeInput(input)).toBe('text');
    });
  });

  describe('sanitizeHTML', () => {
    it('should return empty string for null or undefined', () => {
      expect(sanitizeHTML(null as any)).toBe('');
      expect(sanitizeHTML(undefined as any)).toBe('');
      expect(sanitizeHTML('' as any)).toBe('');
    });

    it('should remove script tags', () => {
      const html = '<p>Hello</p><script>alert("xss")</script><p>World</p>';
      expect(sanitizeHTML(html)).toBe('<p>Hello</p><p>World</p>');
    });

    it('should remove iframe tags', () => {
      const html = '<div><iframe src="evil.com"></iframe></div>';
      expect(sanitizeHTML(html)).toBe('<div></div>');
    });

    it('should remove object and embed tags', () => {
      const html = '<object data="evil.swf"></object><embed src="evil.swf">';
      expect(sanitizeHTML(html)).toBe('');
    });

    it('should remove link and meta tags', () => {
      const html = '<link rel="stylesheet" href="evil.css"><meta http-equiv="refresh">';
      expect(sanitizeHTML(html)).toBe('');
    });

    it('should remove all event handlers', () => {
      const html = '<div onclick="alert(1)" onmouseover="alert(2)">Content</div>';
      expect(sanitizeHTML(html)).toBe('<div >Content</div>'); // Leaves a space after removing attributes
    });

    it('should allow image data URLs but remove others', () => {
      const html = '<img src="data:image/png;base64,xyz"><a href="data:text/html,evil">Link</a>';
      const result = sanitizeHTML(html);
      expect(result).toContain('data:image/png;base64,xyz');
      expect(result).not.toContain('data:text/html');
    });

    it('should handle safe HTML without modification', () => {
      const html = '<p>Hello <strong>World</strong>!</p><ul><li>Item 1</li></ul>';
      expect(sanitizeHTML(html)).toBe(html);
    });
  });

  describe('validateEmail', () => {
    it('should return invalid for empty email', () => {
      expect(validateEmail('')).toEqual({ isValid: false, error: 'Email is required' });
      expect(validateEmail(null as any)).toEqual({ isValid: false, error: 'Email is required' });
    });

    it('should validate correct email formats', () => {
      expect(validateEmail('user@example.com')).toEqual({ isValid: true });
      expect(validateEmail('test.user@example.co.uk')).toEqual({ isValid: true });
      expect(validateEmail('user+tag@example.com')).toEqual({ isValid: true });
    });

    it('should reject invalid email formats', () => {
      expect(validateEmail('invalid')).toMatchObject({ isValid: false, error: 'Invalid email format' });
      expect(validateEmail('invalid@')).toMatchObject({ isValid: false, error: 'Invalid email format' });
      expect(validateEmail('@example.com')).toMatchObject({ isValid: false, error: 'Invalid email format' });
      expect(validateEmail('user @example.com')).toMatchObject({ isValid: false, error: 'Invalid email format' });
    });

    it('should reject emails that are too long', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      expect(validateEmail(longEmail)).toMatchObject({ isValid: false, error: 'Email is too long' });
    });

    it('should sanitize emails with XSS attempts', () => {
      const xssEmail = 'user<script>alert(1)</script>@example.com';
      const result = validateEmail(xssEmail);
      // After sanitization becomes "user@example.com" which is valid
      expect(result.isValid).toBe(true);
    });

    it('should handle special characters in local part', () => {
      expect(validateEmail('user.name@example.com')).toEqual({ isValid: true });
      expect(validateEmail('user_name@example.com')).toEqual({ isValid: true });
      expect(validateEmail('user-name@example.com')).toEqual({ isValid: true });
    });
  });

  describe('validateProjectName', () => {
    it('should return invalid for empty name', () => {
      expect(validateProjectName('')).toEqual({ isValid: false, error: 'Project name is required' });
      expect(validateProjectName(null as any)).toEqual({ isValid: false, error: 'Project name is required' });
    });

    it('should reject names that are too short', () => {
      expect(validateProjectName('A')).toMatchObject({
        isValid: false,
        error: 'Project name must be at least 2 characters'
      });
    });

    it('should reject names that are too long', () => {
      const longName = 'A'.repeat(101);
      expect(validateProjectName(longName)).toMatchObject({
        isValid: false,
        error: 'Project name is too long (max 100 characters)'
      });
    });

    it('should accept valid project names', () => {
      expect(validateProjectName('My Project')).toEqual({ isValid: true });
      expect(validateProjectName('Project 123')).toEqual({ isValid: true });
      expect(validateProjectName('Project-Name_2024')).toEqual({ isValid: true });
    });

    it('should sanitize names with XSS attempts', () => {
      const xssName = 'Project<script>alert(1)</script>';
      const result = validateProjectName(xssName);
      // After sanitization, should still validate based on sanitized version
      expect(result.isValid).toBe(true);
    });

    it('should handle names with exactly 100 characters', () => {
      const maxName = 'A'.repeat(100);
      expect(validateProjectName(maxName)).toEqual({ isValid: true });
    });

    it('should handle names with exactly 2 characters', () => {
      expect(validateProjectName('AB')).toEqual({ isValid: true });
    });
  });

  describe('validateAmount', () => {
    it('should return invalid for empty amount', () => {
      expect(validateAmount('')).toMatchObject({ isValid: false, error: 'Amount is required' });
      expect(validateAmount(null as any)).toMatchObject({ isValid: false, error: 'Amount is required' });
      expect(validateAmount(undefined as any)).toMatchObject({ isValid: false, error: 'Amount is required' });
    });

    it('should validate number amounts', () => {
      expect(validateAmount(100)).toEqual({ isValid: true });
      expect(validateAmount(0)).toEqual({ isValid: true });
      expect(validateAmount(999999999.99)).toEqual({ isValid: true });
    });

    it('should validate string amounts', () => {
      expect(validateAmount('100')).toEqual({ isValid: true });
      expect(validateAmount('99.99')).toEqual({ isValid: true });
      expect(validateAmount('0.01')).toEqual({ isValid: true });
    });

    it('should reject invalid formats', () => {
      expect(validateAmount('abc')).toMatchObject({ isValid: false, error: 'Invalid amount format' });
      expect(validateAmount('$100')).toMatchObject({ isValid: false, error: 'Invalid amount format' });
    });

    it('should reject negative amounts', () => {
      expect(validateAmount(-1)).toMatchObject({ isValid: false, error: 'Amount cannot be negative' });
      expect(validateAmount('-50')).toMatchObject({ isValid: false, error: 'Amount cannot be negative' });
    });

    it('should reject amounts that are too large', () => {
      expect(validateAmount(1000000000)).toMatchObject({ isValid: false, error: 'Amount is too large' });
      expect(validateAmount('9999999999')).toMatchObject({ isValid: false, error: 'Amount is too large' });
    });

    it('should reject amounts with more than 2 decimal places', () => {
      expect(validateAmount(99.999)).toMatchObject({
        isValid: false,
        error: 'Amount cannot have more than 2 decimal places'
      });
      expect(validateAmount('100.123')).toMatchObject({
        isValid: false,
        error: 'Amount cannot have more than 2 decimal places'
      });
    });

    it('should accept amounts with exactly 2 decimal places', () => {
      expect(validateAmount(99.99)).toEqual({ isValid: true });
      expect(validateAmount('100.50')).toEqual({ isValid: true });
    });

    it('should accept whole numbers without decimals', () => {
      expect(validateAmount(100)).toEqual({ isValid: true });
      expect(validateAmount('500')).toEqual({ isValid: true });
    });
  });

  describe('validateFileUpload', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should return invalid for no file', () => {
      expect(validateFileUpload(null as any)).toEqual({ isValid: false, error: 'No file provided' });
    });

    it('should reject files that are too large', () => {
      const largeFile = new File(['a'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
      expect(validateFileUpload(largeFile)).toMatchObject({
        isValid: false,
        error: 'File size exceeds 5MB limit'
      });
    });

    it('should accept files within size limit', () => {
      const smallFile = new File(['small content'], 'small.jpg', { type: 'image/jpeg' });
      expect(validateFileUpload(smallFile)).toEqual({ isValid: true });
    });

    it('should accept allowed file types', () => {
      const jpegFile = new File(['content'], 'file.jpg', { type: 'image/jpeg' });
      expect(validateFileUpload(jpegFile)).toEqual({ isValid: true });

      const pngFile = new File(['content'], 'file.png', { type: 'image/png' });
      expect(validateFileUpload(pngFile)).toEqual({ isValid: true });

      const gifFile = new File(['content'], 'file.gif', { type: 'image/gif' });
      expect(validateFileUpload(gifFile)).toEqual({ isValid: true });

      const webpFile = new File(['content'], 'file.webp', { type: 'image/webp' });
      expect(validateFileUpload(webpFile)).toEqual({ isValid: true });

      const pdfFile = new File(['content'], 'file.pdf', { type: 'application/pdf' });
      expect(validateFileUpload(pdfFile)).toEqual({ isValid: true });
    });

    it('should reject disallowed file types', () => {
      const txtFile = new File(['content'], 'file.txt', { type: 'text/plain' });
      expect(validateFileUpload(txtFile)).toMatchObject({
        isValid: false,
        error: expect.stringContaining('Invalid file type')
      });

      const exeFile = new File(['content'], 'file.exe', { type: 'application/octet-stream' });
      expect(validateFileUpload(exeFile)).toMatchObject({
        isValid: false,
        error: expect.stringContaining('Invalid file type')
      });
    });

    it('should reject files with suspicious extensions', () => {
      const exeFile = new File(['content'], 'malware.exe', { type: 'image/jpeg' });
      expect(validateFileUpload(exeFile)).toMatchObject({
        isValid: false,
        error: 'File contains suspicious content'
      });

      const batFile = new File(['content'], 'script.bat', { type: 'image/png' });
      expect(validateFileUpload(batFile)).toMatchObject({
        isValid: false,
        error: 'File contains suspicious content'
      });

      const jsFile = new File(['content'], 'evil.js', { type: 'image/png' });
      expect(validateFileUpload(jsFile)).toMatchObject({
        isValid: false,
        error: 'File contains suspicious content'
      });
    });

    it('should handle files at exactly 5MB', () => {
      const exactFile = new File(['a'.repeat(5 * 1024 * 1024)], 'exact.jpg', { type: 'image/jpeg' });
      expect(validateFileUpload(exactFile)).toEqual({ isValid: true });
    });
  });

  describe('sanitizeFilename', () => {
    it('should return "file" for empty or invalid input', () => {
      expect(sanitizeFilename('')).toBe('file');
      expect(sanitizeFilename(null as any)).toBe('file');
      expect(sanitizeFilename(undefined as any)).toBe('file');
    });

    it('should replace special characters with underscores', () => {
      expect(sanitizeFilename('file@name#.jpg')).toBe('file_name_.jpg');
      // Multiple underscores get collapsed to single underscore
      expect(sanitizeFilename('my file (1).png')).toBe('my_file_1_.png');
    });

    it('should replace multiple underscores with single', () => {
      expect(sanitizeFilename('file___name.jpg')).toBe('file_name.jpg');
    });

    it('should remove leading/trailing dots and underscores', () => {
      expect(sanitizeFilename('..file.jpg')).toBe('file.jpg');
      expect(sanitizeFilename('file.jpg..')).toBe('file.jpg');
      // Leading underscores removed, then multiple underscores collapsed
      expect(sanitizeFilename('__file__.jpg')).toBe('file_.jpg');
    });

    it('should limit filename length to 100 characters', () => {
      const longName = 'a'.repeat(150) + '.jpg';
      const result = sanitizeFilename(longName);
      expect(result.length).toBe(100);
    });

    it('should preserve valid filenames', () => {
      expect(sanitizeFilename('document.pdf')).toBe('document.pdf');
      expect(sanitizeFilename('photo-2024.jpg')).toBe('photo-2024.jpg');
    });

    it('should handle filenames with dots', () => {
      expect(sanitizeFilename('my.file.name.jpg')).toBe('my.file.name.jpg');
    });
  });

  describe('validateJSONData', () => {
    it('should validate simple JSON objects', () => {
      expect(validateJSONData({ name: 'Test', age: 25 })).toEqual({ isValid: true });
      expect(validateJSONData({ items: [1, 2, 3] })).toEqual({ isValid: true });
    });

    it('should validate arrays', () => {
      expect(validateJSONData([1, 2, 3, 4])).toEqual({ isValid: true });
      expect(validateJSONData(['a', 'b', 'c'])).toEqual({ isValid: true });
    });

    it('should reject data that is too large', () => {
      const largeData = { data: 'a'.repeat(2 * 1024 * 1024) };
      expect(validateJSONData(largeData)).toMatchObject({
        isValid: false,
        error: 'Data is too large'
      });
    });

    it('should reject data containing script tags', () => {
      const xssData = { content: '<script>alert(1)</script>' };
      expect(validateJSONData(xssData)).toMatchObject({
        isValid: false,
        error: 'Data contains potentially unsafe content'
      });
    });

    it('should reject data containing javascript: URLs', () => {
      const xssData = { url: 'javascript:alert(1)' };
      expect(validateJSONData(xssData)).toMatchObject({
        isValid: false,
        error: 'Data contains potentially unsafe content'
      });
    });

    it('should handle nested objects', () => {
      const nestedData = {
        user: {
          name: 'John',
          address: {
            city: 'New York',
            country: 'USA'
          }
        }
      };
      expect(validateJSONData(nestedData)).toEqual({ isValid: true });
    });

    it('should handle null and undefined values', () => {
      expect(validateJSONData({ value: null })).toEqual({ isValid: true });
      expect(validateJSONData(null)).toEqual({ isValid: true });
    });

    it('should handle boolean and number values', () => {
      expect(validateJSONData(true)).toEqual({ isValid: true });
      expect(validateJSONData(false)).toEqual({ isValid: true });
      expect(validateJSONData(42)).toEqual({ isValid: true });
    });
  });
});
