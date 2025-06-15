
import { useLanguage } from "@/contexts/LanguageContext";
import { authTranslations } from "./translations/auth";
import { dashboardTranslations } from "./translations/dashboard";
import { projectTranslations } from "./translations/projects";
import { clientTranslations } from "./translations/client";
import { landingTranslations } from "./translations/landing";

// Combine all translations
const translations = {
  en: {
    ...authTranslations.en,
    ...dashboardTranslations.en,
    ...projectTranslations.en,
    ...clientTranslations.en,
    ...landingTranslations.en,
  },
  ar: {
    ...authTranslations.ar,
    ...dashboardTranslations.ar,
    ...projectTranslations.ar,
    ...clientTranslations.ar,
    ...landingTranslations.ar,
  },
};

export type TranslationKey = keyof typeof translations["en"];

export function translate(key: TranslationKey, lang: "en" | "ar", vars?: Record<string, string>) {
  let text = translations[lang][key] || key;
  if (vars) {
    Object.entries(vars).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, v);
    });
  }
  return text;
}

export function useT() {
  const { language } = useLanguage();
  return (key: TranslationKey, vars?: Record<string, string>) =>
    translate(key, language, vars);
}
