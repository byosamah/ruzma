
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// Icons replaced with emojis
import { useT } from '@/lib/i18n';
import { PersonalInfoSection } from './PersonalInfoSection';
import { BrandingSection } from './BrandingSection';
import { ProfileFormData } from '@/hooks/profile/types';

interface PersonalInformationFormProps {
  formData: ProfileFormData;
  isLoading: boolean;
  isSaved: boolean;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFormSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onCurrencyChange?: (currency: string) => void;
  onCountryChange?: (countryCode: string) => void;
  onLogoUpload?: (file: File) => void;
}

export const PersonalInformationForm = ({
  formData,
  isLoading,
  isSaved,
  onFormChange,
  onFormSubmit,
  onCancel,
  onCurrencyChange,
  onCountryChange,
  onLogoUpload
}: PersonalInformationFormProps) => {
  const t = useT();

  const handleCurrencyChange = (value: string) => {
    if (onCurrencyChange) {
      onCurrencyChange(value);
    }
  };

  const handleCountryChange = (countryCode: string) => {
    if (onCountryChange) {
      onCountryChange(countryCode);
    }
  };

  const handleLogoUpload = (file: File) => {
    if (onLogoUpload) {
      onLogoUpload(file);
    }
  };

  return (
    <Card className="lg:col-span-2 border-gray-200 shadow-none bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-gray-900">{t('personalInformation')}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <form onSubmit={onFormSubmit} className="space-y-6">
          <PersonalInfoSection
            formData={formData}
            onFormChange={onFormChange}
            onCurrencyChange={handleCurrencyChange}
            onCountryChange={handleCountryChange}
          />

          <BrandingSection
            formData={formData}
            onFormChange={onFormChange}
            onLogoUpload={handleLogoUpload}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              {t('cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-gray-900 hover:bg-gray-800 text-white border-0 shadow-none"
            >
              {isLoading ? (
                t('saving')
              ) : isSaved ? (
                t('saved')
              ) : (
                <>
                  <span className="text-lg mr-2">💾</span>
                  {t('saveChanges')}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
