
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  getLanguageFromPath, 
  getStoredLanguage, 
  storeLanguage, 
  shouldRedirectToLanguage,
  addLanguageToPath,
  DEFAULT_LANGUAGE
} from "@/lib/languageRoutes";

type Language = "en" | "ar";

interface LanguageContextProps {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize from URL or localStorage, default to English as requested
  const location = useLocation();
  const navigate = useNavigate();
  
  const initialLanguage = (() => {
    const urlLanguage = getLanguageFromPath(location.pathname);
    if (urlLanguage) return urlLanguage;
    return getStoredLanguage();
  })();
  
  const [language, setLanguage] = useState<Language>(initialLanguage);

  // Enhanced setLanguage that handles persistence and navigation
  const enhancedSetLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    storeLanguage(newLanguage);
    
    // If we're on a route that should have language prefix, navigate to new language
    const currentPath = location.pathname;
    const urlLanguage = getLanguageFromPath(currentPath);
    
    if (urlLanguage && urlLanguage !== newLanguage) {
      const pathWithoutLang = currentPath.replace(`/${urlLanguage}`, '');
      const newPath = addLanguageToPath(pathWithoutLang, newLanguage);
      navigate(newPath, { replace: true });
    }
  };

  // Handle initial redirect if needed
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Redirect root to default language dashboard
    if (currentPath === '/') {
      navigate(`/${DEFAULT_LANGUAGE}/dashboard`, { replace: true });
      return;
    }
    
    // Redirect old routes to language-prefixed routes
    if (shouldRedirectToLanguage(currentPath)) {
      const newPath = addLanguageToPath(currentPath, language);
      navigate(newPath, { replace: true });
    }
  }, [location.pathname, navigate, language]);

  useEffect(() => {
    if (language === "ar") {
      document.documentElement.dir = "rtl";
      document.body.style.fontFamily = '"IBM Plex Sans Arabic", system-ui, sans-serif';
      document.title = "رزمة - نظام إدارة للأعمال الحرة";
    } else {
      document.documentElement.dir = "ltr";
      document.body.style.fontFamily = '"IBM Plex Sans Arabic", system-ui, sans-serif';
      document.title = "Ruzma - Freelancers management system";
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: enhancedSetLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextProps => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
