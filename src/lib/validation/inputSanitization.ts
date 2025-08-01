export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove javascript: URLs
    .replace(/javascript:/gi, '')
    // Remove event handlers
    .replace(/on\w+\s*=/gi, '')
    // Remove other potentially dangerous content
    .replace(/<iframe[^>]*>/gi, '')
    .replace(/<object[^>]*>/gi, '')
    .replace(/<embed[^>]*>/gi, '');
};

export const sanitizeHTML = (html: string): string => {
  if (typeof html !== 'string') return '';
  
  return html
    // Remove dangerous tags
    .replace(/<(script|iframe|object|embed)[^>]*>.*?<\/\1>/gi, '')
    // Remove event handlers and javascript: URLs
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '')
    .replace(/src\s*=\s*["']javascript:[^"']*["']/gi, '')
    // Allow data URLs for images but sanitize others
    .replace(/src\s*=\s*["']data:(?!image\/)[^"']*["']/gi, '')
    // Remove style attributes that might contain expressions
    .replace(/style\s*=\s*["'][^"']*expression[^"']*["']/gi, '');
};