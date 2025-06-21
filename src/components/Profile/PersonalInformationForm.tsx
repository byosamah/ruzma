
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { PersonalInfoSection } from './PersonalInfoSection';
import { BrandingSection } from './BrandingSection';

interface PersonalInformationFormProps {
  formData: {
    name: string;
    email: string;
    company: string;
    website: string;
    bio: string;
    currency?: string;
    professionalTitle?: string;
    shortBio?: string;
    primaryColor?: string;
    logoUrl?: string;
  };
  isLoading: boolean;
  isSaved: boolean;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFormSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onCurrencyChange?: (currency: string) => void;
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
  onLogoUpload
}: PersonalInformationFormProps) => {
  const t = useT();

  const handleCurrencyChange = (value: string) => {
    if (onCurrencyChange) {
      onCurrencyChange(value);
    }
  };

  const handleLogoUpload = (file: File) => {
    if (onLogoUpload) {
      onLogoUpload(file);
    }
  };

  return (
    <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>{t('personalInformation')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onFormSubmit} className="space-y-6">
          <PersonalInfoSection
            formData={formData}
            onFormChange={onFormChange}
            onCurrencyChange={handleCurrencyChange}
          />

          <BrandingSection
            formData={formData}
            onFormChange={onFormChange}
            onLogoUpload={handleLogoUpload}
          />

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                t('saving')
              ) : isSaved ? (
                t('saved')
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
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
