
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DollarSign } from 'lucide-react';
import { CURRENCIES } from '@/lib/currency';
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

  return (
    <div className="space-y-2">
      <Label htmlFor="currency" className="text-sm font-medium">{t('preferredCurrencyLabel')}{required && ' *'}</Label>
      <div className="relative">
        <DollarSign className="absolute left-3 rtl:left-auto rtl:right-3 top-3 h-4 w-4 text-slate-400 z-10 pointer-events-none" />
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="pl-10 rtl:pl-3 rtl:pr-10 h-10 sm:h-11 text-sm">
            <SelectValue placeholder={t('selectCurrencyPlaceholder')} />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
            {Object.entries(CURRENCIES).map(([code, { symbol, name }]) => (
              <SelectItem key={code} value={code} className="hover:bg-gray-50">
                {symbol.en} {name} ({code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {error && <p className="text-xs sm:text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};
