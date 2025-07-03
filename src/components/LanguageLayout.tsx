import React, { useEffect, ReactNode } from 'react';
import { useParams, useLocation, Navigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  getLanguageFromPath, 
  shouldRedirectToLanguage, 
  addLanguageToPath,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE 
} from '@/lib/languageRoutes';

interface LanguageLayoutProps {
  children: ReactNode;
}

export function LanguageLayout({ children }: LanguageLayoutProps) {
  const { lang } = useParams<{ lang: string }>();
  const location = useLocation();
  const { language, setLanguage } = useLanguage();

  // Check if the URL language parameter is valid
  const urlLanguage = lang as 'en' | 'ar';
  const isValidLanguage = urlLanguage && SUPPORTED_LANGUAGES.includes(urlLanguage);

  useEffect(() => {
    // If URL has valid language, sync it with context
    if (isValidLanguage && language !== urlLanguage) {
      setLanguage(urlLanguage);
    }
  }, [urlLanguage, isValidLanguage, language, setLanguage]);

  // If no language in URL or invalid language, redirect to default
  if (!isValidLanguage) {
    const targetPath = addLanguageToPath(location.pathname, DEFAULT_LANGUAGE);
    return <Navigate to={targetPath} replace />;
  }

  return <>{children}</>;
}

// Higher-order component for pages that need language context
export function withLanguageLayout<P extends object>(Component: React.ComponentType<P>) {
  return function LanguageWrappedComponent(props: P) {
    return (
      <LanguageLayout>
        <Component {...props} />
      </LanguageLayout>
    );
  };
}