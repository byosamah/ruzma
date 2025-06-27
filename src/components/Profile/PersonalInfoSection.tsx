
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail, Briefcase } from 'lucide-react';
import { CURRENCIES } from '@/lib/currency';
import { useT } from '@/lib/i18n';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProfileFormData } from '@/hooks/profile/types';
import { useAuth } from '@/hooks/dashboard/useAuth';

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
  const { user } = useAuth();

  // Get the name from signup data if form data name is empty
  const displayName = formData.name || user?.user_metadata?.full_name || user?.user_metadata?.name || '';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm text-gray-700">{t('fullName')} *</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="name"
              name="name"
              placeholder={t('enterFullName')}
              value={displayName}
              onChange={onFormChange}
              className="pl-10 border-gray-200 focus:border-gray-300 focus:ring-0"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm text-gray-700">{t('emailAddress')}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={t('enterEmail')}
              value={formData.email}
              onChange={onFormChange}
              className="pl-10 border-gray-200 focus:border-gray-300 focus:ring-0"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company" className="text-sm text-gray-700">{t('company')}</Label>
          <Input
            id="company"
            name="company"
            placeholder={t('companyName')}
            value={formData.company}
            onChange={onFormChange}
            className="border-gray-200 focus:border-gray-300 focus:ring-0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website" className="text-sm text-gray-700">{t('website')}</Label>
          <Input
            id="website"
            name="website"
            type="url"
            placeholder={t('websiteUrl')}
            value={formData.website}
            onChange={onFormChange}
            className="border-gray-200 focus:border-gray-300 focus:ring-0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="professionalTitle" className="text-sm text-gray-700">Professional Title</Label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="professionalTitle"
            name="professionalTitle"
            placeholder="e.g., UI/UX Designer, Web Developer"
            value={formData.professionalTitle || ''}
            onChange={onFormChange}
            className="pl-10 border-gray-200 focus:border-gray-300 focus:ring-0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="currency" className="text-sm text-gray-700">{t('preferredCurrency')}</Label>
        <Select value={formData.currency || 'USD'} onValueChange={onCurrencyChange}>
          <SelectTrigger className="border-gray-200 focus:border-gray-300 focus:ring-0">
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

      <div className="space-y-2">
        <Label htmlFor="shortBio" className="text-sm text-gray-700">Short Bio (1-2 lines for client pages)</Label>
        <textarea
          id="shortBio"
          name="shortBio"
          rows={2}
          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 resize-none text-sm"
          placeholder="A brief description of your expertise and experience..."
          value={formData.shortBio || ''}
          onChange={onFormChange}
          maxLength={200}
        />
        <p className="text-xs text-gray-500">
          {(formData.shortBio || '').length}/200 characters
        </p>
      </div>
    </div>
  );
};
