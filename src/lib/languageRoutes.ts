export type Language = "en" | "ar";

export const DEFAULT_LANGUAGE: Language = "en";
export const SUPPORTED_LANGUAGES: Language[] = ["en", "ar"];

/**
 * Extract language from pathname
 * /en/dashboard -> en
 * /ar/projects -> ar
 * /dashboard -> null
 */
export function getLanguageFromPath(pathname: string): Language | null {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  if (SUPPORTED_LANGUAGES.includes(firstSegment as Language)) {
    return firstSegment as Language;
  }
  
  return null;
}

/**
 * Get the path without language prefix
 * /en/dashboard -> /dashboard
 * /ar/projects -> /projects
 * /dashboard -> /dashboard
 */
export function getPathWithoutLanguage(pathname: string): string {
  const language = getLanguageFromPath(pathname);
  if (language) {
    return pathname.replace(`/${language}`, '') || '/';
  }
  return pathname;
}

/**
 * Add language prefix to path
 * (/dashboard, en) -> /en/dashboard
 * (/projects, ar) -> /ar/projects
 */
export function addLanguageToPath(pathname: string, language: Language): string {
  const pathWithoutLang = getPathWithoutLanguage(pathname);
  return `/${language}${pathWithoutLang}`;
}

/**
 * Get stored language from localStorage with fallback
 */
export function getStoredLanguage(): Language {
  try {
    const stored = localStorage.getItem('ruzma-language');
    if (stored && SUPPORTED_LANGUAGES.includes(stored as Language)) {
      return stored as Language;
    }
  } catch (error) {
    // Fallback to default language if localStorage fails
  }
  return DEFAULT_LANGUAGE;
}

/**
 * Store language in localStorage
 */
export function storeLanguage(language: Language): void {
  try {
    localStorage.setItem('ruzma-language', language);
  } catch (error) {
    // Silent error - localStorage access is optional
  }
}

/**
 * Check if a path should be redirected to include language
 */
export function shouldRedirectToLanguage(pathname: string): boolean {
  // Don't redirect client project routes, contract approval routes, or API routes
  if (pathname.startsWith('/client/') || 
      pathname.startsWith('/contract/') || 
      pathname.startsWith('/api/')) {
    return false;
  }
  
  // Don't redirect if already has language
  if (getLanguageFromPath(pathname)) {
    return false;
  }
  
  return true;
}