import { customAlphabet } from 'nanoid';

/**
 * Security utilities for the application
 */

/**
 * Generate secure random token
 */
export const generateSecureToken = (length: number = 32): string => {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const nanoid = customAlphabet(alphabet, length);
  return nanoid();
};

/**
 * Generate UUID v4
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Hash string using Web Crypto API
 */
export const hashString = async (message: string): Promise<string> => {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

/**
 * Sanitize HTML to prevent XSS
 */
export const sanitizeHtml = (dirty: string): string => {
  const div = document.createElement('div');
  div.textContent = dirty;
  return div.innerHTML;
};

/**
 * Escape special characters in regex
 */
export const escapeRegex = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Validate URL to prevent open redirect
 */
export const isValidRedirectUrl = (url: string, allowedDomains: string[] = []): boolean => {
  try {
    const parsed = new URL(url, window.location.origin);
    
    // Check if it's a relative URL
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return true;
    }
    
    // Check if the domain is allowed
    if (allowedDomains.length > 0) {
      return allowedDomains.some(domain => parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`));
    }
    
    // By default, only allow same origin
    return parsed.origin === window.location.origin;
  } catch {
    return false;
  }
};

/**
 * Mask sensitive data
 */
export const maskSensitiveData = (
  data: string,
  visibleChars: number = 4,
  maskChar: string = '*'
): string => {
  if (data.length <= visibleChars) {
    return data;
  }
  
  const visible = data.slice(-visibleChars);
  const masked = maskChar.repeat(data.length - visibleChars);
  return masked + visible;
};

/**
 * Mask email address
 */
export const maskEmail = (email: string): string => {
  const [username, domain] = email.split('@');
  if (!domain) return email;
  
  const maskedUsername = username.length > 3 
    ? username[0] + '*'.repeat(username.length - 2) + username[username.length - 1]
    : '*'.repeat(username.length);
  
  return `${maskedUsername}@${domain}`;
};

/**
 * Rate limiter
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  constructor(
    private maxAttempts: number,
    private windowMs: number
  ) {}
  
  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(
      timestamp => now - timestamp < this.windowMs
    );
    
    if (validAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    
    return true;
  }
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
  
  resetAll(): void {
    this.attempts.clear();
  }
}

/**
 * CSRF token management
 */
export const csrfToken = {
  generate: (): string => {
    const token = generateSecureToken(32);
    sessionStorage.setItem('csrf_token', token);
    return token;
  },
  
  validate: (token: string): boolean => {
    const storedToken = sessionStorage.getItem('csrf_token');
    return storedToken === token;
  },
  
  get: (): string | null => {
    return sessionStorage.getItem('csrf_token');
  },
  
  clear: (): void => {
    sessionStorage.removeItem('csrf_token');
  }
};

/**
 * Content Security Policy helper
 */
export const generateCSPHeader = (options: {
  defaultSrc?: string[];
  scriptSrc?: string[];
  styleSrc?: string[];
  imgSrc?: string[];
  connectSrc?: string[];
  fontSrc?: string[];
  objectSrc?: string[];
  mediaSrc?: string[];
  frameSrc?: string[];
}): string => {
  const directives: string[] = [];
  
  Object.entries(options).forEach(([key, values]) => {
    if (values && values.length > 0) {
      const directive = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      directives.push(`${directive} ${values.join(' ')}`);
    }
  });
  
  return directives.join('; ');
};

/**
 * Secure storage wrapper
 */
export const secureStorage = {
  setItem: async (key: string, value: any): Promise<void> => {
    try {
      const serialized = JSON.stringify(value);
      const encrypted = btoa(serialized); // Basic encoding, use proper encryption in production
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Failed to store item securely:', error);
    }
  },
  
  getItem: async <T>(key: string): Promise<T | null> => {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      
      const decrypted = atob(encrypted);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Failed to retrieve item securely:', error);
      return null;
    }
  },
  
  removeItem: (key: string): void => {
    localStorage.removeItem(key);
  },
  
  clear: (): void => {
    localStorage.clear();
  }
};

/**
 * Input validation helpers
 */
export const validators = {
  isAlphanumeric: (value: string): boolean => /^[a-zA-Z0-9]+$/.test(value),
  isAlpha: (value: string): boolean => /^[a-zA-Z]+$/.test(value),
  isNumeric: (value: string): boolean => /^[0-9]+$/.test(value),
  isHexColor: (value: string): boolean => /^#[0-9A-F]{6}$/i.test(value),
  isSafeString: (value: string): boolean => !/[<>\"\'\/]/.test(value),
};