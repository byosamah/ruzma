-- Add currency column to projects table for project-specific currency
-- This separates project currency (chosen per project) from freelancer_currency (user's profile currency)

ALTER TABLE public.projects 
ADD COLUMN currency text DEFAULT 'USD';

-- Update existing projects to use their freelancer_currency as project currency
-- This ensures backward compatibility
UPDATE public.projects 
SET currency = freelancer_currency 
WHERE freelancer_currency IS NOT NULL;

-- Set default USD for any projects with NULL freelancer_currency
UPDATE public.projects 
SET currency = 'USD' 
WHERE currency IS NULL;