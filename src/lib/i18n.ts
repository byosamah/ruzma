
import { useLanguage } from "@/contexts/LanguageContext";

const translations = {
  en: {
    dashboard: "Dashboard",
    profile: "Profile",
    signOut: "Sign Out",
    login: "Login",
    signUp: "Sign Up",
    // Add more keys as needed
  },
  ar: {
    dashboard: "لوحة التحكم",
    profile: "الملف الشخصي",
    signOut: "تسجيل الخروج",
    login: "تسجيل الدخول",
    signUp: "إنشاء حساب",
    // Add more keys as needed
  },
};

export type TranslationKey = keyof typeof translations["en"];

// Standalone translation function (for functional use)
export function translate(key: TranslationKey, lang: "en" | "ar") {
  return translations[lang][key] || key;
}

// React hook for translation
export function useT() {
  const { language } = useLanguage();
  return (key: TranslationKey) => translations[language][key] || key;
}
