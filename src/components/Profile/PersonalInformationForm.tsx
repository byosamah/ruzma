
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Save, X, Loader2, CheckCircle } from 'lucide-react';
import { currencies } from '@/lib/currency';
import { useT } from '@/lib/i18n';
import { useSecureForm } from '@/hooks/security/useSecureForm';
import { ProfileFormData } from '@/hooks/profile/types';

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
      pattern: /^[a-zA-Z\s.-]+$/,
    },
    email: {
      required: true,
      type: 'email' as const,
      maxLength: 254,
    },
    company: {
      maxLength: 100,
    },
    website: {
      type: 'url' as const,
      maxLength: 255,
    },
    bio: {
      maxLength: 500,
    },
    professionalTitle: {
      maxLength: 100,
    },
    shortBio: {
      maxLength: 200,
    }
  };

  const {
    formData: secureFormData,
    errors,
    handleChange: secureHandleChange,
    handleSubmit: secureHandleSubmit,
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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Enhanced file validation
      const MAX_LOGO_SIZE = 1024 * 1024; // 1MB
      const ALLOWED_LOGO_TYPES = ['image/jpeg', 'image/png', 'image/svg+xml'];
      
      if (file.size > MAX_LOGO_SIZE) {
        alert('Logo file must be less than 1MB');
        return;
      }
      
      if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
        alert('Logo must be JPEG, PNG, or SVG format');
        return;
      }
      
      onLogoUpload(file);
    }
  };

  return (
    <Card className="lg:col-span-2 border-gray-200 shadow-none bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-medium text-gray-900">{t('personalInformation')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <form onSubmit={handleSecureSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                {t('fullName')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleSecureChange}
                placeholder={t('enterFullName')}
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                {t('email')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleSecureChange}
                placeholder={t('enterEmail')}
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company" className="text-sm font-medium text-gray-700">
                {t('company')}
              </Label>
              <Input
                id="company"
                name="company"
                value={formData.company}
                onChange={handleSecureChange}
                placeholder={t('company')}
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.company && (
                <p className="text-sm text-red-600">{errors.company}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website" className="text-sm font-medium text-gray-700">
                {t('website')}
              </Label>
              <Input
                id="website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleSecureChange}
                placeholder="https://example.com"
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.website && (
                <p className="text-sm text-red-600">{errors.website}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm font-medium text-gray-700">
              {t('bio')}
            </Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleSecureChange}
              placeholder={t('bio')}
              rows={3}
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
            />
            {errors.bio && (
              <p className="text-sm text-red-600">{errors.bio}</p>
            )}
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
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="professionalTitle" className="text-sm font-medium text-gray-700">
                {t('professionalTitle')}
              </Label>
              <Input
                id="professionalTitle"
                name="professionalTitle"
                value={formData.professionalTitle}
                onChange={handleSecureChange}
                placeholder={t('professionalTitle')}
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.professionalTitle && (
                <p className="text-sm text-red-600">{errors.professionalTitle}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="shortBio" className="text-sm font-medium text-gray-700">
                Short Bio
              </Label>
              <Input
                id="shortBio"
                name="shortBio"
                value={formData.shortBio}
                onChange={handleSecureChange}
                placeholder="Brief description"
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.shortBio && (
                <p className="text-sm text-red-600">{errors.shortBio}</p>
              )}
              <p className="text-xs text-gray-500">
                {formData.shortBio.length}/200 characters
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo" className="text-sm font-medium text-gray-700">
              Logo
            </Label>
            <div className="flex items-center space-x-4">
              <Input
                id="logo"
                type="file"
                onChange={handleLogoUpload}
                accept="image/jpeg,image/png,image/svg+xml"
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('logo')?.click()}
                className="border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Logo
              </Button>
              {formData.logoUrl && (
                <img 
                  src={formData.logoUrl} 
                  alt="Logo preview" 
                  className="w-8 h-8 object-contain border border-gray-200 rounded"
                />
              )}
            </div>
            <p className="text-xs text-gray-500">
              JPEG, PNG, or SVG. Max 1MB.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <Button 
              type="button"
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading}
              className="border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              <X className="w-4 h-4 mr-2" />
              {t('cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : isSaved ? (
                <CheckCircle className="w-4 h-4 mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isLoading ? t('saving') : isSaved ? t('saved') : t('saveChanges')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
