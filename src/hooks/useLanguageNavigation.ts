import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { addLanguageToPath, getPathWithoutLanguage } from '@/lib/languageRoutes';

export function useLanguageNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();

  /**
   * Navigate to a path with the current language prefix
   */
  const navigateWithLanguage = (path: string, options?: { replace?: boolean; state?: any }) => {
    const pathWithLanguage = addLanguageToPath(path, language);
    navigate(pathWithLanguage, options);
  };

  /**
   * Get current path without language prefix
   */
  const getCurrentPath = () => {
    return getPathWithoutLanguage(location.pathname);
  };

  /**
   * Get current path with specific language prefix
   */
  const getPathWithLanguage = (targetLanguage: string) => {
    const currentPath = getCurrentPath();
    return addLanguageToPath(currentPath, targetLanguage as 'en' | 'ar');
  };

  return {
    navigate: navigateWithLanguage,
    getCurrentPath,
    getPathWithLanguage,
    location
  };
}