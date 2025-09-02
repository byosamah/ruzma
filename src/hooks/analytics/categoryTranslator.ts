import { useT } from '@/lib/i18n';

// Map category keys to their translation keys
const categoryTranslationMap: Record<string, string> = {
  'webDevelopment': 'webDevelopment',
  'mobileApp': 'mobileApp',
  'designBranding': 'designBranding',
  'marketing': 'marketing',
  'dataAnalytics': 'dataAnalytics',
  'ecommerce': 'ecommerce',
  'backendDevelopment': 'backendDevelopment',
  'consulting': 'consulting',
  'other': 'other',
};

export const useCategoryTranslator = () => {
  const t = useT();
  
  return (categoryKey: string): string => {
    const translationKey = categoryTranslationMap[categoryKey];
    return translationKey ? t(translationKey) : categoryKey;
  };
};