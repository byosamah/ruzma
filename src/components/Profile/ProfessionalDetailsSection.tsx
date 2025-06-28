
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormInput } from './FormInput';
import { ProfileFormData } from '@/hooks/profile/types';
import { currencies } from '@/lib/currency';
import { useT } from '@/lib/i18n';

interface ProfessionalDetailsSectionProps {
  formData: ProfileFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onCurrencyChange: (currency: string) => void;
  errors: Record<string, string>;
}

export const ProfessionalDetailsSection = ({
  formData,
  onChange,
  onCurrencyChange,
  errors
}: ProfessionalDetailsSectionProps) => {
  const t = useT();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="bio" className="text-sm font-medium text-gray-700">
          {t('bio')}
        </Label>
        <Textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={onChange}
          placeholder={t('bio')}
          rows={3}
          className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
        />
        {errors.bio && <p className="text-sm text-red-600">{errors.bio}</p>}
        <p className="text-xs text-gray-500">
          {formData.bio.length}/500 characters
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="currency" className="text-sm font-medium text-gray-700">
          {t('currency')}
        </Label>
        <Select value={formData.currency} onValueChange={onCurrencyChange}>
          <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {currencies.map(currency => (
              <SelectItem key={currency.code} value={currency.code}>
                {currency.code} - {currency.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          id="professionalTitle"
          name="professionalTitle"
          label={t('professionalTitle')}
          placeholder={t('professionalTitle')}
          value={formData.professionalTitle}
          onChange={onChange}
          error={errors.professionalTitle}
        />
        
        <div className="space-y-2">
          <FormInput
            id="shortBio"
            name="shortBio"
            label="Short Bio"
            placeholder="Brief description"
            value={formData.shortBio}
            onChange={onChange}
            error={errors.shortBio}
          />
          <p className="text-xs text-gray-500">
            {formData.shortBio.length}/200 characters
          </p>
        </div>
      </div>
    </div>
  );
};
