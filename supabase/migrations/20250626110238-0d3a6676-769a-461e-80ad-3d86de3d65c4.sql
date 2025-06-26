
-- First, let's see what the current constraint allows
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass 
AND conname = 'profiles_currency_check';

-- If the constraint is wrong, we'll update it to match our frontend currencies
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_currency_check;

-- Add the correct constraint that matches our frontend currencies
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_currency_check 
CHECK (currency IN ('SAR', 'JOD', 'USD', 'AED', 'GBP', 'EGP'));

-- Also, let's make sure the default is correct
ALTER TABLE public.profiles 
ALTER COLUMN currency SET DEFAULT 'USD';

-- Update any existing invalid currency values to USD
UPDATE public.profiles 
SET currency = 'USD' 
WHERE currency IS NULL OR currency NOT IN ('SAR', 'JOD', 'USD', 'AED', 'GBP', 'EGP');
