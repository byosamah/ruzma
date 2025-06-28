
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useT } from '@/lib/i18n';
import { useSecureForm } from '@/hooks/security/useSecureForm';
import { ProfileFormData } from '@/hooks/profile/types';
import { PersonalDetailsSection } from './PersonalDetailsSection';
import { ProfessionalDetailsSection } from './ProfessionalDetailsSection';
import { LogoUploadSection } from './LogoUploadSection';
import { FormActions } from './FormActions';

interface PersonalInformationFormProps {
  formData: ProfileFormData;
  isLoading: boolean;
  isSaved: boolean;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFormSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onCurrencyChange: (currency: string) => void;
  onLogoUpload: (file: File) => void;
}

export const PersonalInformationForm = ({
  formData,
  isLoading,
  isSaved,
  onFormChange,
  onFormSubmit,
  onCancel,
  onCurrencyChange,
  onLogoUpload
}: PersonalInformationFormProps) => {
  const t = useT();

  // Enhanced form validation rules
  const validationRules = {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-Z\s.-]+$/
    },
    email: {
      required: true,
      type: 'email' as const,
      maxLength: 254
    },
    company: {
      maxLength: 100
    },
    website: {
      type: 'url' as const,
      maxLength: 255
    },
    bio: {
      maxLength: 500
    },
    professionalTitle: {
      maxLength: 100
    },
    shortBio: {
      maxLength: 200
    }
  };

  const {
    errors,
    handleChange: secureHandleChange,
    handleSubmit: secureHandleSubmit
  } = useSecureForm(formData, validationRules, 'profile_form');

  // Wrapper to maintain compatibility with existing prop interface
  const handleSecureChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    secureHandleChange(name as keyof ProfileFormData, value);
    onFormChange(e); // Keep existing functionality
  };

  const handleSecureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    secureHandleSubmit(async () => {
      // Call the original submit handler directly
      onFormSubmit(e);
    });
  };

  return (
    <Card className="lg:col-span-2 border-gray-200 shadow-none bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-medium text-gray-900">
          {t('personalInformation')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <form onSubmit={handleSecureSubmit} className="space-y-4">
          <PersonalDetailsSection
            formData={formData}
            onChange={handleSecureChange}
            errors={errors}
          />

          <ProfessionalDetailsSection
            formData={formData}
            onChange={handleSecureChange}
            onCurrencyChange={onCurrencyChange}
            errors={errors}
          />

          <LogoUploadSection
            formData={formData}
            onLogoUpload={onLogoUpload}
          />

          <FormActions
            isLoading={isLoading}
            isSaved={isSaved}
            onCancel={onCancel}
          />
        </form>
      </CardContent>
    </Card>
  );
};
