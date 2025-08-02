
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Coins } from 'lucide-react';
import { CURRENCIES, getPopularCurrencies } from '@/lib/currency';
import { useLanguage } from '@/contexts/LanguageContext';
import { useT } from '@/lib/i18n';

interface CurrencySelectProps {
  value: string;
  onChange: (currency: string) => void;
  error?: string;
  required?: boolean;
}

export const CurrencySelect: React.FC<CurrencySelectProps> = ({
  value,
  onChange,
  error,
  required = false
}) => {
  const t = useT();
  const { language } = useLanguage();
  
  // Show popular currencies first, then all others
  const popularCurrencies = getPopularCurrencies();
  const otherCurrencies = Object.keys(CURRENCIES).filter(code => !popularCurrencies.includes(code as any));

  return (
    <div className="space-y-2">
      <Label htmlFor="currency" className="text-sm font-medium">{t('preferredCurrencyLabel')}{required && ' *'}</Label>
      <div className="relative">
        <Coins className="absolute left-3 rtl:left-auto rtl:right-3 top-3 h-4 w-4 text-slate-400 z-10 pointer-events-none" />
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="pl-10 rtl:pl-3 rtl:pr-10 h-10 sm:h-11 text-sm">
            <SelectValue placeholder={t('selectCurrencyPlaceholder')} />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
            {/* Popular currencies first */}
            <div className="p-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
              {t('popular')}
            </div>
            {CURRENCIES.slice(0, 6).map((currency) => (
              <SelectItem key={currency.code} value={currency.code} className="hover:bg-gray-50">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{currency.symbol}</span>
                  <span>{currency.name}</span>
                  <span className="text-xs text-gray-500">({currency.code})</span>
                </div>
              </SelectItem>
            ))}
            
            {otherCurrencies.length > 0 && (
              <>
                <div className="p-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-t mt-1 pt-3">
                  {t('all')}
                </div>
                {otherCurrencies.map((code) => {
                  const { symbol, name } = CURRENCIES[code];
                  return (
                    <SelectItem key={code} value={code} className="hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{symbol[language]}</span>
                        <span>{name}</span>
                        <span className="text-xs text-gray-500">({code})</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </>
            )}
          </SelectContent>
        </Select>
      </div>
      {error && <p className="text-xs sm:text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};
