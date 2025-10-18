
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
// Icons replaced with emojis
import { EnhancedCurrencySelect } from '@/components/ui/enhanced-currency-select';
import { CountrySelect } from '@/components/ui/country-select';
import { useT } from '@/lib/i18n';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProfileFormData } from '@/hooks/profile/types';
import { useAuth } from '@/hooks/core/useAuth';

interface PersonalInfoSectionProps {
  formData: ProfileFormData;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onCurrencyChange: (currency: string) => void;
  onCountryChange: (countryCode: string) => void;
}

export const PersonalInfoSection = ({
  formData,
  onFormChange,
  onCurrencyChange,
  onCountryChange
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
            <span className="absolute left-3 top-3 text-lg text-gray-400">👤</span>
            <Input
              id="name"
              name="name"
              placeholder={t('enterFullName')}
              value={displayName}
              onChange={onFormChange}
              className="pl-10 border-gray-300 border"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm text-gray-700">{t('emailAddress')}</Label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-lg text-gray-400">📧</span>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={t('enterEmail')}
              value={formData.email}
              onChange={onFormChange}
              className="pl-10 border-gray-300 border"
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
            className="border-gray-300 border"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website" className="text-sm text-gray-700">{t('website')}</Label>
          <Input
            id="website"
            name="website"
            type="text"
            placeholder={t('websiteUrl')}
            value={formData.website}
            onChange={onFormChange}
            className="border-gray-300 border"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="professionalTitle" className="text-sm text-gray-700">{t('professionalTitle')}</Label>
        <div className="relative">
          <span className="absolute left-3 top-3 text-lg text-gray-400">💼</span>
          <Input
            id="professionalTitle"
            name="professionalTitle"
            placeholder={t('professionalTitlePlaceholder')}
            value={formData.professionalTitle || ''}
            onChange={onFormChange}
            className="pl-10 border-gray-300 border"
          />
        </div>
      </div>

      {/* Country Selection */}
      <div className="space-y-2">
        <CountrySelect
          value={formData.country}
          onChange={onCountryChange}
          onCurrencyChange={onCurrencyChange}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="currency" className="text-sm text-gray-700">{t('preferredCurrency')}</Label>
        <EnhancedCurrencySelect
          value={formData.currency || 'USD'}
          onChange={onCurrencyChange}
          placeholder={t('selectCurrencyPlaceholder')}
          showSearch={true}
          showCountryFlags={true}
          className="border-gray-300 border"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="shortBio" className="text-sm text-gray-700">{t('shortBio')}</Label>
        <Textarea
          id="shortBio"
          name="shortBio"
          rows={2}
          className="border-gray-300 border text-sm resize-none"
          placeholder={t('shortBioPlaceholder')}
          value={formData.shortBio || ''}
          onChange={onFormChange}
          maxLength={200}
        />
        <p className="text-xs text-gray-500">
          {(formData.shortBio || '').length}/200 {t('characters')}
        </p>
      </div>
    </div>
  );
};
