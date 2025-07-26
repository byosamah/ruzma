-- Update the profiles table currency check constraint to allow new currencies
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_currency_check;

-- Add updated constraint that includes all currencies from our currency system
ALTER TABLE public.profiles ADD CONSTRAINT profiles_currency_check 
CHECK (currency IN (
  'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 'NZD',
  'MXN', 'SGD', 'HKD', 'NOK', 'TRY', 'ZAR', 'BRL', 'INR', 'RUB', 'KRW',
  'PLN', 'THB', 'MYR', 'CZK', 'HUF', 'ILS', 'CLP', 'PHP', 'AED', 'SAR',
  'QAR', 'KWD', 'BHD', 'OMR', 'JOD', 'LBP', 'EGP', 'MAD', 'TND', 'DZD',
  'LYD', 'SUD', 'SYP', 'IQD', 'YER', 'SOS', 'DJF', 'KMF', 'MRU', 'CDF',
  'XOF', 'XAF', 'NGN', 'GHS', 'KES', 'UGX', 'TZS', 'RWF', 'ETB', 'MZN',
  'ZMW', 'BWP', 'SZL', 'LSL', 'NAD', 'MGA', 'MUR', 'SCR', 'CVE', 'GMD',
  'GNF', 'LRD', 'SLL', 'STN'
));