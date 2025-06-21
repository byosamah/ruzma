
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail, Briefcase } from 'lucide-react';
import { CURRENCIES } from '@/lib/currency';
import { useT } from '@/lib/i18n';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProfileFormData } from '@/hooks/profile/types';

interface PersonalInfoSectionProps {
  formData: ProfileFormData;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onCurrencyChange: (currency: string) => void;
}

export const PersonalInfoSection = ({
  formData,
  onFormChange,
  onCurrencyChange
}: PersonalInfoSectionProps) => {
  const t = useT();
  const { language } = useLanguage();

  return (
    <div className="space-y-6">
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
          <Select value={formData.currency || 'USD'} onValueChange={onCurrencyChange}>
            <SelectTrigger>
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
    </div>
  );
};
