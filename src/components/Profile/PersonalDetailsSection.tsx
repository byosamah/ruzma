
import React from 'react';
import { FormInput } from './FormInput';
import { ProfileFormData } from '@/hooks/profile/types';
import { useT } from '@/lib/i18n';

interface PersonalDetailsSectionProps {
  formData: ProfileFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors: Record<string, string>;
}

export const PersonalDetailsSection = ({
  formData,
  onChange,
  errors
}: PersonalDetailsSectionProps) => {
  const t = useT();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormInput
        id="name"
        name="name"
        label={t('fullName')}
        placeholder={t('enterFullName')}
        value={formData.name}
        onChange={onChange}
        error={errors.name}
        required
      />
      
      <FormInput
        id="email"
        name="email"
        type="email"
        label={t('email')}
        placeholder={t('enterEmail')}
        value={formData.email}
        onChange={onChange}
        error={errors.email}
        required
      />
      
      <FormInput
        id="company"
        name="company"
        label={t('company')}
        placeholder={t('company')}
        value={formData.company}
        onChange={onChange}
        error={errors.company}
      />
      
      <FormInput
        id="website"
        name="website"
        type="url"
        label={t('website')}
        placeholder="https://example.com"
        value={formData.website}
        onChange={onChange}
        error={errors.website}
      />
    </div>
  );
};
