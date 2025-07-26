-- Check and remove all currency-related constraints on profiles table
DO $$ 
DECLARE
    constraint_name text;
BEGIN
    -- Find all check constraints on profiles table that mention currency
    FOR constraint_name IN 
        SELECT tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
        WHERE tc.table_name = 'profiles' 
        AND tc.constraint_type = 'CHECK'
        AND cc.check_clause ILIKE '%currency%'
    LOOP
        EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS %I', constraint_name);
    END LOOP;
END $$;

-- Add the comprehensive currency constraint
ALTER TABLE public.profiles ADD CONSTRAINT valid_currency 
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