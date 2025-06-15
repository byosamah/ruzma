
-- Update the profiles table to support the new currencies
ALTER TABLE public.profiles 
ALTER COLUMN currency 
SET DEFAULT 'USD';

-- Add a check constraint to ensure only valid currencies are allowed
ALTER TABLE public.profiles 
ADD CONSTRAINT valid_currency 
CHECK (currency IN ('SAR', 'JOD', 'USD', 'AED', 'GBP', 'EGP'));

-- Update any existing profiles that might have invalid currency values
UPDATE public.profiles 
SET currency = 'USD' 
WHERE currency IS NULL OR currency NOT IN ('SAR', 'JOD', 'USD', 'AED', 'GBP', 'EGP');
