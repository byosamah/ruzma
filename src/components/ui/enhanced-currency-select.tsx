import React, { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Coins } from 'lucide-react';
import { CURRENCIES, CurrencyCode, searchCurrencies } from '@/lib/currency';

interface EnhancedCurrencySelectProps {
  value: string;
  onChange: (currency: string) => void;
  placeholder?: string;
  showSearch?: boolean;
  className?: string;
}

export const EnhancedCurrencySelect: React.FC<EnhancedCurrencySelectProps> = ({
  value,
  onChange,
  placeholder,
  showSearch = true,
  className = ""
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCurrencies = useMemo(() => {
    if (searchQuery) {
      return searchCurrencies(searchQuery);
    } else {
      return CURRENCIES;
    }
  }, [searchQuery]);

  const formatCurrency = (value: number, currency: CurrencyCode) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(value);
  };

  const selectedCurrency = CURRENCIES.find(c => c.code === value);

  return (
    <div className="space-y-3">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={`h-11 ${className}`}>
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder={placeholder || 'Select currency'}>
              {selectedCurrency && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">{selectedCurrency.symbol}</span>
                  <span className="text-muted-foreground">{selectedCurrency.name}</span>
                </div>
              )}
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent className="w-full">
          <div className="p-2 space-y-3">
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search currencies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>
            )}
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {filteredCurrencies.map((currency) => {
              return (
                <SelectItem key={currency.code} value={currency.code} className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                      {currency.code}
                    </span>
                    <div>
                      <p className="font-medium">{currency.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(100, currency.code)}
                      </p>
                    </div>
                  </div>
                </SelectItem>
              );
            })}
          </div>
          
          {filteredCurrencies.length === 0 && (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No currencies found
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};