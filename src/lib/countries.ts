export interface Country {
  code: string; // ISO 3166-1 alpha-2
  name: { en: string; ar: string };
  flag: string; // Emoji flag
  currency: string;
  phoneCode: string;
}

export const COUNTRIES: Record<string, Country> = {
  SA: {
    code: 'SA',
    name: { en: 'Saudi Arabia', ar: 'المملكة العربية السعودية' },
    flag: '🇸🇦',
    currency: 'SAR',
    phoneCode: '+966'
  },
  JO: {
    code: 'JO',
    name: { en: 'Jordan', ar: 'الأردن' },
    flag: '🇯🇴',
    currency: 'JOD',
    phoneCode: '+962'
  },
  AE: {
    code: 'AE',
    name: { en: 'United Arab Emirates', ar: 'الإمارات العربية المتحدة' },
    flag: '🇦🇪',
    currency: 'AED',
    phoneCode: '+971'
  },
  EG: {
    code: 'EG',
    name: { en: 'Egypt', ar: 'مصر' },
    flag: '🇪🇬',
    currency: 'EGP',
    phoneCode: '+20'
  },
  US: {
    code: 'US',
    name: { en: 'United States', ar: 'الولايات المتحدة' },
    flag: '🇺🇸',
    currency: 'USD',
    phoneCode: '+1'
  },
  GB: {
    code: 'GB',
    name: { en: 'United Kingdom', ar: 'المملكة المتحدة' },
    flag: '🇬🇧',
    currency: 'GBP',
    phoneCode: '+44'
  },
  CA: {
    code: 'CA',
    name: { en: 'Canada', ar: 'كندا' },
    flag: '🇨🇦',
    currency: 'CAD',
    phoneCode: '+1'
  },
  AU: {
    code: 'AU',
    name: { en: 'Australia', ar: 'أستراليا' },
    flag: '🇦🇺',
    currency: 'AUD',
    phoneCode: '+61'
  },
  DE: {
    code: 'DE',
    name: { en: 'Germany', ar: 'ألمانيا' },
    flag: '🇩🇪',
    currency: 'EUR',
    phoneCode: '+49'
  },
  FR: {
    code: 'FR',
    name: { en: 'France', ar: 'فرنسا' },
    flag: '🇫🇷',
    currency: 'EUR',
    phoneCode: '+33'
  },
  KW: {
    code: 'KW',
    name: { en: 'Kuwait', ar: 'الكويت' },
    flag: '🇰🇼',
    currency: 'KWD',
    phoneCode: '+965'
  },
  QA: {
    code: 'QA',
    name: { en: 'Qatar', ar: 'قطر' },
    flag: '🇶🇦',
    currency: 'QAR',
    phoneCode: '+974'
  },
  BH: {
    code: 'BH',
    name: { en: 'Bahrain', ar: 'البحرين' },
    flag: '🇧🇭',
    currency: 'BHD',
    phoneCode: '+973'
  },
  OM: {
    code: 'OM',
    name: { en: 'Oman', ar: 'عُمان' },
    flag: '🇴🇲',
    currency: 'OMR',
    phoneCode: '+968'
  },
  LB: {
    code: 'LB',
    name: { en: 'Lebanon', ar: 'لبنان' },
    flag: '🇱🇧',
    currency: 'LBP',
    phoneCode: '+961'
  },
  MA: {
    code: 'MA',
    name: { en: 'Morocco', ar: 'المغرب' },
    flag: '🇲🇦',
    currency: 'MAD',
    phoneCode: '+212'
  },
  TN: {
    code: 'TN',
    name: { en: 'Tunisia', ar: 'تونس' },
    flag: '🇹🇳',
    currency: 'TND',
    phoneCode: '+216'
  },
  DZ: {
    code: 'DZ',
    name: { en: 'Algeria', ar: 'الجزائر' },
    flag: '🇩🇿',
    currency: 'DZD',
    phoneCode: '+213'
  },
  CH: {
    code: 'CH',
    name: { en: 'Switzerland', ar: 'سويسرا' },
    flag: '🇨🇭',
    currency: 'CHF',
    phoneCode: '+41'
  },
  JP: {
    code: 'JP',
    name: { en: 'Japan', ar: 'اليابان' },
    flag: '🇯🇵',
    currency: 'JPY',
    phoneCode: '+81'
  }
};

export type CountryCode = keyof typeof COUNTRIES;

export const getCountriesList = (language: 'en' | 'ar' = 'en') => {
  return Object.values(COUNTRIES).sort((a, b) => 
    a.name[language].localeCompare(b.name[language])
  );
};

export const getCountryByCode = (code: string): Country | undefined => {
  return COUNTRIES[code];
};

export const getCurrencyByCountry = (countryCode: string): string => {
  const country = getCountryByCode(countryCode);
  return country?.currency || 'USD';
};

export const getCountryByCurrency = (currency: string): Country | undefined => {
  return Object.values(COUNTRIES).find(country => country.currency === currency);
};

export const searchCountries = (query: string, language: 'en' | 'ar' = 'en'): Country[] => {
  if (!query) return getCountriesList(language);
  
  const searchQuery = query.toLowerCase();
  return Object.values(COUNTRIES).filter(country => 
    country.name[language].toLowerCase().includes(searchQuery) ||
    country.name[language].toLowerCase().startsWith(searchQuery) ||
    country.code.toLowerCase().includes(searchQuery)
  ).sort((a, b) => {
    // Prioritize countries that start with the search query
    const aStartsWith = a.name[language].toLowerCase().startsWith(searchQuery);
    const bStartsWith = b.name[language].toLowerCase().startsWith(searchQuery);
    
    if (aStartsWith && !bStartsWith) return -1;
    if (!aStartsWith && bStartsWith) return 1;
    
    return a.name[language].localeCompare(b.name[language]);
  });
};