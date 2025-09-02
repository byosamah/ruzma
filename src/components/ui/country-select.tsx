import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { COUNTRIES, searchCountries } from '@/lib/countries';
import { useT } from '@/lib/i18n';

interface CountrySelectProps {
  value?: string;
  onChange: (countryCode: string) => void;
  onCurrencyChange?: (currency: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export const CountrySelect = ({
  value,
  onChange,
  onCurrencyChange,
  error,
  required = false,
  disabled = false,
  className
}: CountrySelectProps) => {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const language = 'en'; // Could be dynamic based on context

  const selectedCountry = value ? COUNTRIES[value] : undefined;
  const filteredCountries = searchCountries(searchQuery, language);

  const handleSelect = (countryCode: string) => {
    const country = COUNTRIES[countryCode];
    if (country) {
      onChange(countryCode);
      
      // Auto-suggest currency based on country
      if (onCurrencyChange && country.currency) {
        onCurrencyChange(country.currency);
      }
    }
    setOpen(false);
    setSearchQuery('');
  };

  // Handle keyboard navigation for quick jump to countries
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key.length === 1 && e.key.match(/[a-zA-Z]/)) {
      const query = e.key.toLowerCase();
      setSearchQuery(query);
      
      // Find first country that starts with this letter
      const matchingCountry = filteredCountries.find(country => 
        country.name[language].toLowerCase().startsWith(query)
      );
      
      if (matchingCountry && !value) {
        // Auto-select if no country is selected
        handleSelect(matchingCountry.code);
      }
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium">
        {t('country')}
        {required && ' *'}
      </Label>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between h-10 sm:h-11",
              !selectedCountry && "text-muted-foreground",
              error && "border-red-500"
            )}
            disabled={disabled}
            onKeyDown={handleKeyDown}
          >
            <div className="flex items-center gap-2">
              {selectedCountry ? (
                <>
                  <span className="text-lg">{selectedCountry.flag}</span>
                  <span className="truncate">{selectedCountry.name[language]}</span>
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4 text-slate-400" />
                  <span>{t('selectCountry')}</span>
                </>
              )}
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-full p-0 bg-white border border-gray-200 shadow-lg z-50">
          <Command>
            <CommandInput 
              placeholder={t('searchCountries')}
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="border-none focus:ring-0"
            />
            <CommandEmpty>{t('noCountryFound')}</CommandEmpty>
            <CommandList className="max-h-64 overflow-y-auto">
              <CommandGroup>
                {filteredCountries.map((country) => (
                  <CommandItem
                    key={country.code}
                    value={country.code}
                    onSelect={() => handleSelect(country.code)}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-2"
                  >
                    <span className="text-lg">{country.flag}</span>
                    <span className="flex-1 truncate">{country.name[language]}</span>
                    <span className="text-xs text-gray-500">{country.currency}</span>
                    {selectedCountry?.code === country.code && (
                      <Check className="ml-auto h-4 w-4 text-primary" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {error && (
        <p className="text-xs sm:text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
};