export const CURRENCIES = {
  // Major World Currencies (Top 20)
  USD: { symbol: { en: '$', ar: '$' }, name: 'US Dollar', decimals: 2, region: 'North America', popular: true },
  EUR: { symbol: { en: '€', ar: '€' }, name: 'Euro', decimals: 2, region: 'Europe', popular: true },
  GBP: { symbol: { en: '£', ar: '£' }, name: 'British Pound', decimals: 2, region: 'Europe', popular: true },
  JPY: { symbol: { en: '¥', ar: '¥' }, name: 'Japanese Yen', decimals: 0, region: 'Asia', popular: true },
  CNY: { symbol: { en: '¥', ar: '¥' }, name: 'Chinese Yuan', decimals: 2, region: 'Asia', popular: true },
  CAD: { symbol: { en: 'C$', ar: 'CAD' }, name: 'Canadian Dollar', decimals: 2, region: 'North America', popular: true },
  AUD: { symbol: { en: 'A$', ar: 'AUD' }, name: 'Australian Dollar', decimals: 2, region: 'Oceania', popular: true },
  CHF: { symbol: { en: 'CHF', ar: 'CHF' }, name: 'Swiss Franc', decimals: 2, region: 'Europe', popular: true },
  SEK: { symbol: { en: 'kr', ar: 'SEK' }, name: 'Swedish Krona', decimals: 2, region: 'Europe', popular: true },
  NOK: { symbol: { en: 'kr', ar: 'NOK' }, name: 'Norwegian Krone', decimals: 2, region: 'Europe', popular: true },

  // Middle East & North Africa (MENA) - Existing ones enhanced
  SAR: { symbol: { en: 'SAR', ar: 'ر.س' }, name: 'Saudi Riyal', decimals: 2, region: 'MENA', popular: true },
  AED: { symbol: { en: 'AED', ar: 'د.إ' }, name: 'UAE Dirham', decimals: 2, region: 'MENA', popular: true },
  QAR: { symbol: { en: 'QAR', ar: 'ر.ق' }, name: 'Qatari Riyal', decimals: 2, region: 'MENA', popular: true },
  KWD: { symbol: { en: 'KWD', ar: 'د.ك' }, name: 'Kuwaiti Dinar', decimals: 3, region: 'MENA', popular: true },
  BHD: { symbol: { en: 'BHD', ar: 'د.ب' }, name: 'Bahraini Dinar', decimals: 3, region: 'MENA', popular: true },
  OMR: { symbol: { en: 'OMR', ar: 'ر.ع' }, name: 'Omani Rial', decimals: 3, region: 'MENA', popular: true },
  JOD: { symbol: { en: 'JOD', ar: 'د.ا' }, name: 'Jordanian Dinar', decimals: 3, region: 'MENA', popular: true },
  EGP: { symbol: { en: 'EGP', ar: 'ج.م' }, name: 'Egyptian Pound', decimals: 2, region: 'MENA', popular: true },
  LBP: { symbol: { en: 'LBP', ar: 'ل.ل' }, name: 'Lebanese Pound', decimals: 2, region: 'MENA', popular: false },
  MAD: { symbol: { en: 'MAD', ar: 'د.م' }, name: 'Moroccan Dirham', decimals: 2, region: 'MENA', popular: false },
  TND: { symbol: { en: 'TND', ar: 'د.ت' }, name: 'Tunisian Dinar', decimals: 3, region: 'MENA', popular: false },
  DZD: { symbol: { en: 'DZD', ar: 'د.ج' }, name: 'Algerian Dinar', decimals: 2, region: 'MENA', popular: false },
  ILS: { symbol: { en: '₪', ar: '₪' }, name: 'Israeli Shekel', decimals: 2, region: 'MENA', popular: false },
  IQD: { symbol: { en: 'IQD', ar: 'ع.د' }, name: 'Iraqi Dinar', decimals: 3, region: 'MENA', popular: false },
  SYP: { symbol: { en: 'SYP', ar: 'ل.س' }, name: 'Syrian Pound', decimals: 2, region: 'MENA', popular: false },
  YER: { symbol: { en: 'YER', ar: 'ر.ي' }, name: 'Yemeni Rial', decimals: 2, region: 'MENA', popular: false },
  LYD: { symbol: { en: 'LYD', ar: 'د.ل' }, name: 'Libyan Dinar', decimals: 3, region: 'MENA', popular: false },
  IRR: { symbol: { en: 'IRR', ar: 'ر.ا' }, name: 'Iranian Rial', decimals: 2, region: 'MENA', popular: false },

  // Asia Pacific
  INR: { symbol: { en: '₹', ar: '₹' }, name: 'Indian Rupee', decimals: 2, region: 'Asia', popular: true },
  KRW: { symbol: { en: '₩', ar: '₩' }, name: 'South Korean Won', decimals: 0, region: 'Asia', popular: true },
  SGD: { symbol: { en: 'S$', ar: 'SGD' }, name: 'Singapore Dollar', decimals: 2, region: 'Asia', popular: true },
  HKD: { symbol: { en: 'HK$', ar: 'HKD' }, name: 'Hong Kong Dollar', decimals: 2, region: 'Asia', popular: true },
  MYR: { symbol: { en: 'RM', ar: 'MYR' }, name: 'Malaysian Ringgit', decimals: 2, region: 'Asia', popular: false },
  THB: { symbol: { en: '฿', ar: 'THB' }, name: 'Thai Baht', decimals: 2, region: 'Asia', popular: false },
  IDR: { symbol: { en: 'Rp', ar: 'IDR' }, name: 'Indonesian Rupiah', decimals: 2, region: 'Asia', popular: false },
  PHP: { symbol: { en: '₱', ar: 'PHP' }, name: 'Philippine Peso', decimals: 2, region: 'Asia', popular: false },
  VND: { symbol: { en: '₫', ar: 'VND' }, name: 'Vietnamese Dong', decimals: 0, region: 'Asia', popular: false },
  TWD: { symbol: { en: 'NT$', ar: 'TWD' }, name: 'Taiwan Dollar', decimals: 2, region: 'Asia', popular: false },
  BDT: { symbol: { en: '৳', ar: 'BDT' }, name: 'Bangladeshi Taka', decimals: 2, region: 'Asia', popular: false },
  PKR: { symbol: { en: '₨', ar: 'PKR' }, name: 'Pakistani Rupee', decimals: 2, region: 'Asia', popular: false },
  LKR: { symbol: { en: 'Rs', ar: 'LKR' }, name: 'Sri Lankan Rupee', decimals: 2, region: 'Asia', popular: false },
  NPR: { symbol: { en: 'Rs', ar: 'NPR' }, name: 'Nepalese Rupee', decimals: 2, region: 'Asia', popular: false },
  AFN: { symbol: { en: '؋', ar: '؋' }, name: 'Afghan Afghani', decimals: 2, region: 'Asia', popular: false },
  MMK: { symbol: { en: 'K', ar: 'MMK' }, name: 'Myanmar Kyat', decimals: 2, region: 'Asia', popular: false },
  KHR: { symbol: { en: '៛', ar: 'KHR' }, name: 'Cambodian Riel', decimals: 2, region: 'Asia', popular: false },
  LAK: { symbol: { en: '₭', ar: 'LAK' }, name: 'Lao Kip', decimals: 2, region: 'Asia', popular: false },
  MNT: { symbol: { en: '₮', ar: 'MNT' }, name: 'Mongolian Tugrik', decimals: 2, region: 'Asia', popular: false },

  // Europe
  DKK: { symbol: { en: 'kr', ar: 'DKK' }, name: 'Danish Krone', decimals: 2, region: 'Europe', popular: false },
  PLN: { symbol: { en: 'zł', ar: 'PLN' }, name: 'Polish Zloty', decimals: 2, region: 'Europe', popular: true },
  CZK: { symbol: { en: 'Kč', ar: 'CZK' }, name: 'Czech Koruna', decimals: 2, region: 'Europe', popular: false },
  HUF: { symbol: { en: 'Ft', ar: 'HUF' }, name: 'Hungarian Forint', decimals: 2, region: 'Europe', popular: false },
  RON: { symbol: { en: 'lei', ar: 'RON' }, name: 'Romanian Leu', decimals: 2, region: 'Europe', popular: false },
  BGN: { symbol: { en: 'лв', ar: 'BGN' }, name: 'Bulgarian Lev', decimals: 2, region: 'Europe', popular: false },
  HRK: { symbol: { en: 'kn', ar: 'HRK' }, name: 'Croatian Kuna', decimals: 2, region: 'Europe', popular: false },
  RUB: { symbol: { en: '₽', ar: '₽' }, name: 'Russian Ruble', decimals: 2, region: 'Europe', popular: true },
  UAH: { symbol: { en: '₴', ar: 'UAH' }, name: 'Ukrainian Hryvnia', decimals: 2, region: 'Europe', popular: false },
  TRY: { symbol: { en: '₺', ar: '₺' }, name: 'Turkish Lira', decimals: 2, region: 'Europe', popular: true },
  ISK: { symbol: { en: 'kr', ar: 'ISK' }, name: 'Icelandic Krona', decimals: 0, region: 'Europe', popular: false },

  // Africa
  ZAR: { symbol: { en: 'R', ar: 'ZAR' }, name: 'South African Rand', decimals: 2, region: 'Africa', popular: true },
  NGN: { symbol: { en: '₦', ar: 'NGN' }, name: 'Nigerian Naira', decimals: 2, region: 'Africa', popular: true },
  KES: { symbol: { en: 'KSh', ar: 'KES' }, name: 'Kenyan Shilling', decimals: 2, region: 'Africa', popular: false },
  GHS: { symbol: { en: '₵', ar: 'GHS' }, name: 'Ghanaian Cedi', decimals: 2, region: 'Africa', popular: false },
  UGX: { symbol: { en: 'USh', ar: 'UGX' }, name: 'Ugandan Shilling', decimals: 0, region: 'Africa', popular: false },
  TZS: { symbol: { en: 'TSh', ar: 'TZS' }, name: 'Tanzanian Shilling', decimals: 2, region: 'Africa', popular: false },
  ZMW: { symbol: { en: 'K', ar: 'ZMW' }, name: 'Zambian Kwacha', decimals: 2, region: 'Africa', popular: false },
  BWP: { symbol: { en: 'P', ar: 'BWP' }, name: 'Botswanan Pula', decimals: 2, region: 'Africa', popular: false },
  XOF: { symbol: { en: 'CFA', ar: 'XOF' }, name: 'West African CFA Franc', decimals: 0, region: 'Africa', popular: false },
  XAF: { symbol: { en: 'FCFA', ar: 'XAF' }, name: 'Central African CFA Franc', decimals: 0, region: 'Africa', popular: false },

  // Americas
  BRL: { symbol: { en: 'R$', ar: 'BRL' }, name: 'Brazilian Real', decimals: 2, region: 'South America', popular: true },
  MXN: { symbol: { en: '$', ar: 'MXN' }, name: 'Mexican Peso', decimals: 2, region: 'North America', popular: true },
  ARS: { symbol: { en: '$', ar: 'ARS' }, name: 'Argentine Peso', decimals: 2, region: 'South America', popular: true },
  CLP: { symbol: { en: '$', ar: 'CLP' }, name: 'Chilean Peso', decimals: 0, region: 'South America', popular: false },
  COP: { symbol: { en: '$', ar: 'COP' }, name: 'Colombian Peso', decimals: 2, region: 'South America', popular: false },
  PEN: { symbol: { en: 'S/', ar: 'PEN' }, name: 'Peruvian Sol', decimals: 2, region: 'South America', popular: false },
  UYU: { symbol: { en: '$U', ar: 'UYU' }, name: 'Uruguayan Peso', decimals: 2, region: 'South America', popular: false },
  NZD: { symbol: { en: 'NZ$', ar: 'NZD' }, name: 'New Zealand Dollar', decimals: 2, region: 'Oceania', popular: true },
  
  // Cryptocurrency (Popular ones for freelancers)
  BTC: { symbol: { en: '₿', ar: '₿' }, name: 'Bitcoin', decimals: 8, region: 'Crypto', popular: true },
  ETH: { symbol: { en: 'Ξ', ar: 'Ξ' }, name: 'Ethereum', decimals: 8, region: 'Crypto', popular: true },
  USDC: { symbol: { en: 'USDC', ar: 'USDC' }, name: 'USD Coin', decimals: 6, region: 'Crypto', popular: true },
  USDT: { symbol: { en: 'USDT', ar: 'USDT' }, name: 'Tether', decimals: 6, region: 'Crypto', popular: true },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

export const formatCurrency = (amount: number, currency: CurrencyCode = 'USD', language: 'en' | 'ar' = 'en'): string => {
  // Add safety check for undefined currency
  if (!currency || !CURRENCIES[currency]) {
    currency = 'USD';
  }
  
  const { symbol, decimals } = CURRENCIES[currency];
  const currencySymbol = symbol[language];
  const formattedAmount = amount.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  return `${currencySymbol}${formattedAmount}`;
};

export const getCurrencySymbol = (currency: CurrencyCode = 'USD', language: 'en' | 'ar' = 'en'): string => {
  if (!currency || !CURRENCIES[currency]) {
    currency = 'USD';
  }
  return CURRENCIES[currency].symbol[language];
};

// Country-Currency mapping utilities
export const getCurrencyByCountry = (countryCode: string): CurrencyCode => {
  // Map countries to their primary currencies
  const countryToCurrency: Record<string, CurrencyCode> = {
    'SA': 'SAR', 'JO': 'JOD', 'AE': 'AED', 'EG': 'EGP', 'KW': 'KWD',
    'QA': 'QAR', 'BH': 'BHD', 'OM': 'OMR', 'LB': 'LBP', 'MA': 'MAD',
    'TN': 'TND', 'DZ': 'DZD', 'IL': 'ILS', 'IQ': 'IQD', 'SY': 'SYP',
    'YE': 'YER', 'LY': 'LYD', 'IR': 'IRR', 'US': 'USD', 'GB': 'GBP',
    'CA': 'CAD', 'AU': 'AUD', 'DE': 'EUR', 'FR': 'EUR', 'CH': 'CHF',
    'JP': 'JPY', 'CN': 'CNY', 'IN': 'INR', 'KR': 'KRW', 'SG': 'SGD',
    'HK': 'HKD', 'MY': 'MYR', 'TH': 'THB', 'ID': 'IDR', 'PH': 'PHP',
    'VN': 'VND', 'TW': 'TWD', 'BD': 'BDT', 'PK': 'PKR', 'LK': 'LKR',
    'NP': 'NPR', 'AF': 'AFN', 'MM': 'MMK', 'KH': 'KHR', 'LA': 'LAK',
    'MN': 'MNT', 'DK': 'DKK', 'PL': 'PLN', 'CZ': 'CZK', 'HU': 'HUF',
    'RO': 'RON', 'BG': 'BGN', 'HR': 'HRK', 'RU': 'RUB', 'UA': 'UAH',
    'TR': 'TRY', 'IS': 'ISK', 'ZA': 'ZAR', 'NG': 'NGN', 'KE': 'KES',
    'GH': 'GHS', 'UG': 'UGX', 'TZ': 'TZS', 'ZM': 'ZMW', 'BW': 'BWP',
    'BR': 'BRL', 'MX': 'MXN', 'AR': 'ARS', 'CL': 'CLP', 'CO': 'COP',
    'PE': 'PEN', 'UY': 'UYU', 'NZ': 'NZD', 'SE': 'SEK', 'NO': 'NOK',
  };
  
  return countryToCurrency[countryCode] || 'USD';
};

export const getPossibleCountriesByCurrency = (currency: CurrencyCode): string[] => {
  const currencyToCountries: Record<CurrencyCode, string[]> = {
    'SAR': ['SA'], 'JOD': ['JO'], 'AED': ['AE'], 'EGP': ['EG'], 'KWD': ['KW'],
    'QAR': ['QA'], 'BHD': ['BH'], 'OMR': ['OM'], 'LBP': ['LB'], 'MAD': ['MA'],
    'TND': ['TN'], 'DZD': ['DZ'], 'USD': ['US'], 'GBP': ['GB'], 'CAD': ['CA'],
    'AUD': ['AU'], 'EUR': ['DE', 'FR'], 'CHF': ['CH'], 'JPY': ['JP'],
    'CNY': ['CN'], 'INR': ['IN'], 'KRW': ['KR'], 'SGD': ['SG'], 'HKD': ['HK'],
    'ZAR': ['ZA'], 'NGN': ['NG'], 'BRL': ['BR'], 'MXN': ['MX'], 'ARS': ['AR'],
    'NZD': ['NZ'], 'SEK': ['SE'], 'NOK': ['NO'], 'DKK': ['DK'], 'PLN': ['PL'],
    'RUB': ['RU'], 'TRY': ['TR'], 'ILS': ['IL'], 'CZK': ['CZ'], 'HUF': ['HU'],
    'RON': ['RO'], 'BGN': ['BG'], 'HRK': ['HR'], 'UAH': ['UA'], 'ISK': ['IS'],
    'MYR': ['MY'], 'THB': ['TH'], 'IDR': ['ID'], 'PHP': ['PH'], 'VND': ['VN'],
    'TWD': ['TW'], 'BDT': ['BD'], 'PKR': ['PK'], 'LKR': ['LK'], 'NPR': ['NP'],
    'AFN': ['AF'], 'MMK': ['MM'], 'KHR': ['KH'], 'LAK': ['LA'], 'MNT': ['MN'],
    'KES': ['KE'], 'GHS': ['GH'], 'UGX': ['UG'], 'TZS': ['TZ'], 'ZMW': ['ZM'],
    'BWP': ['BW'], 'CLP': ['CL'], 'COP': ['CO'], 'PEN': ['PE'], 'UYU': ['UY'],
    'IQD': ['IQ'], 'SYP': ['SY'], 'YER': ['YE'], 'LYD': ['LY'], 'IRR': ['IR'],
    'XOF': ['SN', 'CI', 'BF'], 'XAF': ['CM', 'CF', 'TD'],
    'BTC': [], 'ETH': [], 'USDC': [], 'USDT': [], // Crypto has no countries
  };
  
  return currencyToCountries[currency] || [];
};

export const getCountryByCurrency = (currency: CurrencyCode): string | undefined => {
  const countries = getPossibleCountriesByCurrency(currency);
  return countries.length === 1 ? countries[0] : undefined;
};

// Currency search utilities
export const getPopularCurrencies = (): CurrencyCode[] => {
  return Object.entries(CURRENCIES)
    .filter(([_, currency]) => currency.popular)
    .map(([code, _]) => code as CurrencyCode);
};

export const getCurrenciesByRegion = (region: string): CurrencyCode[] => {
  return Object.entries(CURRENCIES)
    .filter(([_, currency]) => currency.region === region)
    .map(([code, _]) => code as CurrencyCode);
};

export const getAllCurrencies = (): CurrencyCode[] => {
  return Object.keys(CURRENCIES) as CurrencyCode[];
};

export const searchCurrencies = (query: string, language: 'en' | 'ar' = 'en'): CurrencyCode[] => {
  if (!query) return getPopularCurrencies();
  
  const searchQuery = query.toLowerCase();
  return Object.entries(CURRENCIES)
    .filter(([code, currency]) => 
      code.toLowerCase().includes(searchQuery) ||
      currency.name.toLowerCase().includes(searchQuery) ||
      currency.symbol[language].toLowerCase().includes(searchQuery) ||
      currency.region.toLowerCase().includes(searchQuery)
    )
    .map(([code, _]) => code as CurrencyCode);
};

export const getCurrencyInfo = (currency: CurrencyCode) => {
  return CURRENCIES[currency];
};

export const isCryptoCurrency = (currency: CurrencyCode): boolean => {
  return CURRENCIES[currency]?.region === 'Crypto';
};

export const isPopularCurrency = (currency: CurrencyCode): boolean => {
  return CURRENCIES[currency]?.popular || false;
};