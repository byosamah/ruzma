
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
      <Label htmlFor="currency" className="apple-body text-foreground font-medium">
        Preferred Currency{required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="relative">
        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className={`apple-input pl-12 ${error ? 'border-destructive focus:ring-destructive' : ''}`}>
            <SelectValue placeholder="Select your currency" />
          </SelectTrigger>
          <SelectContent className="apple-card max-h-60">
            {Object.entries(CURRENCIES).map(([code, { symbol, name }]) => (
              <SelectItem key={code} value={code} className="apple-body py-3">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{symbol.en}</span>
                  <span>{name}</span>
                  <span className="text-muted-foreground">({code})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {error && (
        <p className="text-sm text-destructive font-medium animate-apple-fade-in">
          {error}
        </p>
      )}
    </div>
  );
};
