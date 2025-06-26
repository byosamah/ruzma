
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DollarSign } from 'lucide-react';
import { CURRENCIES } from '@/lib/currency';

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
  return (
    <div className="space-y-2">
      <Label htmlFor="currency">Preferred Currency{required && ' *'}</Label>
      <div className="relative">
        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400 z-10" />
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="pl-10">
            <SelectValue placeholder="Select your currency" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CURRENCIES).map(([code, { symbol, name }]) => (
              <SelectItem key={code} value={code}>
                {symbol.en} {name} ({code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};
