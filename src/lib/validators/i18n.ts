import { useT } from '@/lib/i18n';

// Create a function that returns validation messages based on current language
export const createValidationMessages = () => {
  const t = useT();
  
  return {
    required: t('required'),
    invalidEmail: t('invalidEmail'),
    minLength: (min: number) => t('minLength', { min: min.toString() }),
    maxLength: (max: number) => t('maxLength', { max: max.toString() }),
    passwordRequirements: t('passwordRequirements'),
    passwordsNoMatch: t('passwordsNoMatch'),
    minValue: (min: number) => t('minValue', { min: min.toString() }),
    projectNameRequired: t('projectNameRequired'),
    projectBriefMinLength: t('projectBriefMinLength'),
    milestoneRequired: t('milestoneRequired'),
    milestoneTitleRequired: t('milestoneTitleRequired'),
    milestoneDescriptionRequired: t('milestoneDescriptionRequired'),
    priceMinimum: t('priceMinimum'),
    clientNameRequired: t('clientNameRequired'),
    clientNameMaxLength: t('clientNameMaxLength'),
    emailMaxLength: t('emailMaxLength'),
    notesMaxLength: t('notesMaxLength'),
    fullNameRequired: t('fullNameRequired'),
    nameMaxLength: t('nameMaxLength'),
    selectCountry: t('selectCountry'),
    passwordMinLength: t('passwordMinLength'),
    confirmPasswordRequired: t('confirmPasswordRequired'),
    currentPasswordRequired: t('currentPasswordRequired'),
    confirmNewPasswordRequired: t('confirmNewPasswordRequired'),
  };
};

// Hook that provides validation messages with current language
export const useValidationMessages = () => {
  return createValidationMessages();
};