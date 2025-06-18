
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail, Save, DollarSign } from 'lucide-react';
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
  };
  isLoading: boolean;
  isSaved: boolean;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFormSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onCurrencyChange?: (currency: string) => void;
}

export const PersonalInformationForm = ({
  formData,
  isLoading,
  isSaved,
  onFormChange,
  onFormSubmit,
  onCancel,
  onCurrencyChange,
}: PersonalInformationFormProps) => {
  const t = useT();
  const { language } = useLanguage();

  const handleCurrencyChange = (value: string) => {
    if (onCurrencyChange) {
      onCurrencyChange(value);
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
            <Label htmlFor="bio">{t('bio')}</Label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder={t('bioPlaceholder')}
              value={formData.bio}
              onChange={onFormChange}
            />
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
