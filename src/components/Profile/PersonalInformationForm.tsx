
import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail, Save, DollarSign, Briefcase, Upload, Palette } from 'lucide-react';
import { CURRENCIES, CurrencyCode } from '@/lib/currency';
import { useT } from '@/lib/i18n';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { language } = useLanguage();
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleCurrencyChange = (value: string) => {
    if (onCurrencyChange) {
      onCurrencyChange(value);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onLogoUpload) {
      onLogoUpload(file);
    }
    // Reset file input
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  return (
    <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>{t('personalInformation')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onFormSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('fullName')}</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="name"
                  name="name"
                  placeholder={t('enterFullName')}
                  value={formData.name}
                  onChange={onFormChange}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('emailAddress')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t('enterEmail')}
                  value={formData.email}
                  onChange={onFormChange}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">{t('company')}</Label>
              <Input
                id="company"
                name="company"
                placeholder={t('companyName')}
                value={formData.company}
                onChange={onFormChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">{t('website')}</Label>
              <Input
                id="website"
                name="website"
                type="url"
                placeholder={t('websiteUrl')}
                value={formData.website}
                onChange={onFormChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="professionalTitle">Professional Title</Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="professionalTitle"
                name="professionalTitle"
                placeholder="e.g., UI/UX Designer, Web Developer"
                value={formData.professionalTitle || ''}
                onChange={onFormChange}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">{t('preferredCurrency')}</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400 z-10" />
              <Select value={formData.currency || 'USD'} onValueChange={handleCurrencyChange}>
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder={t('selectCurrency')} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CURRENCIES).map(([code, { symbol, name }]) => (
                    <SelectItem key={code} value={code}>
                      {symbol[language]} {name} ({code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortBio">Short Bio (1-2 lines for client pages)</Label>
            <textarea
              id="shortBio"
              name="shortBio"
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="A brief description of your expertise and experience..."
              value={formData.shortBio || ''}
              onChange={onFormChange}
              maxLength={200}
            />
            <p className="text-xs text-slate-500">
              {(formData.shortBio || '').length}/200 characters
            </p>
          </div>

          <Separator />

          {/* Brand Elements */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Brand Elements
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Brand Logo */}
              <div className="space-y-2">
                <Label>Brand Logo</Label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center bg-slate-50">
                    {formData.logoUrl ? (
                      <img
                        src={formData.logoUrl}
                        alt="Brand Logo"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <Upload className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => logoInputRef.current?.click()}
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      Upload
                    </Button>
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 2MB</p>
                  </div>
                </div>
              </div>

              {/* Brand Color */}
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Brand Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="primaryColor"
                    name="primaryColor"
                    value={formData.primaryColor || '#050c1e'}
                    onChange={onFormChange}
                    className="w-10 h-10 border rounded-md cursor-pointer"
                  />
                  <Input
                    value={formData.primaryColor || '#050c1e'}
                    onChange={onFormChange}
                    name="primaryColor"
                    placeholder="#050c1e"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

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
