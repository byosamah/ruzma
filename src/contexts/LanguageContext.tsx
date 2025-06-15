
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

type Language = "en" | "ar";

interface LanguageContextProps {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Default to English; optionally auto-detect here
  const [language, setLanguage] = useState<Language>("en");

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
    <LanguageContext.Provider value={{ language, setLanguage }}>
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
