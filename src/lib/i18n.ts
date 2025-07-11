
import { useLanguage } from "@/contexts/LanguageContext";
import { authTranslations } from "./translations/auth";
import { dashboardTranslations } from "./translations/dashboard";
import { projectTranslations } from "./translations/projects";
import { clientTranslations } from "./translations/client";
import { commonTranslations } from "./translations/common";
import { profileTranslations } from "./translations/profile";
import { clientsTranslations } from "./translations/clients";
import { analyticsTranslations } from "./translations/analytics";
import { plansTranslations } from "./translations/plans";

// Combine all translations
const translations = {
  en: {
    ...commonTranslations.en,
    ...authTranslations.en,
    ...dashboardTranslations.en,
    ...projectTranslations.en,
    ...clientTranslations.en,
    ...profileTranslations.en,
    ...clientsTranslations.en,
    ...analyticsTranslations.en,
    ...plansTranslations.en,
  },
  ar: {
    ...commonTranslations.ar,
    ...authTranslations.ar,
    ...dashboardTranslations.ar,
    ...projectTranslations.ar,
    ...clientTranslations.ar,
    ...profileTranslations.ar,
    ...clientsTranslations.ar,
    ...analyticsTranslations.ar,
    ...plansTranslations.ar,
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
