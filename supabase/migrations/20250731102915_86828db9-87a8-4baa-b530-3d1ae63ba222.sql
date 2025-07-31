-- Add freelancer_currency column to projects table
ALTER TABLE public.projects 
ADD COLUMN freelancer_currency text DEFAULT 'USD';