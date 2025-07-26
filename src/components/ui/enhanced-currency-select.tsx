import React, { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, DollarSign } from 'lucide-react';
import { 
  CURRENCIES, 
  CurrencyCode, 
  getAllCurrencies, 
  getPopularCurrencies, 
  searchCurrencies,
  getPossibleCountriesByCurrency 
} from '@/lib/currency';
import { getCountryByCode } from '@/lib/countries';
import { useLanguage } from '@/contexts/LanguageContext';
import { useT } from '@/lib/i18n';

interface EnhancedCurrencySelectProps {
  value: string;
  onChange: (currency: string) => void;
  placeholder?: string;
  showSearch?: boolean;
  showCountryFlags?: boolean;
  className?: string;
}

export const EnhancedCurrencySelect: React.FC<EnhancedCurrencySelectProps> = ({
  value,
  onChange,
  placeholder,
  showSearch = true,
  showCountryFlags = true,
  className = ""
}) => {
  const { language } = useLanguage();
  const t = useT();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCurrencies = useMemo(() => {
    if (searchQuery) {
      return searchCurrencies(searchQuery, language);
    } else {
      return getAllCurrencies();
    }
  }, [searchQuery, language]);

  const getCurrencyDisplayInfo = (currencyCode: CurrencyCode) => {
    const currency = CURRENCIES[currencyCode];
    const countries = getPossibleCountriesByCurrency(currencyCode);
    const country = countries.length === 1 ? getCountryByCode(countries[0]) : null;
    
    // Special case for EUR to show EU flag
    let flag = country?.flag;
    if (currencyCode === 'EUR') {
      flag = '🇪🇺';
    }
    
    return {
      symbol: currency.symbol[language],
      name: currency.name,
      flag: flag
    };
  };

  const selectedCurrencyInfo = value ? getCurrencyDisplayInfo(value as CurrencyCode) : null;

  return (
    <div className="space-y-3">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={`h-11 ${className}`}>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder={placeholder || t('selectCurrency')}>
              {selectedCurrencyInfo && (
                <div className="flex items-center gap-2">
                  {showCountryFlags && selectedCurrencyInfo.flag && (
                    <span className="text-sm">{selectedCurrencyInfo.flag}</span>
                  )}
                  <span className="font-medium">{selectedCurrencyInfo.symbol}</span>
                  <span className="text-muted-foreground">{selectedCurrencyInfo.name}</span>
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
                  placeholder={t('searchCurrencies')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>
            )}
            
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {filteredCurrencies.map((currencyCode) => {
              const info = getCurrencyDisplayInfo(currencyCode);
              return (
                <SelectItem key={currencyCode} value={currencyCode} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    {showCountryFlags && info.flag && (
                      <span className="text-sm">{info.flag}</span>
                    )}
                    <span className="font-medium">{info.symbol}</span>
                    <span className="text-muted-foreground">{info.name}</span>
                    <span className="text-xs text-muted-foreground">({currencyCode})</span>
                  </div>
                </SelectItem>
              );
            })}
          </div>
          
          {filteredCurrencies.length === 0 && (
            <div className="p-4 text-center text-muted-foreground text-sm">
              {t('noCurrenciesFound')}
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};