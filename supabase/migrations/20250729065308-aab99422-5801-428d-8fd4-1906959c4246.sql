-- Add contract terms fields to projects table
ALTER TABLE public.projects 
ADD COLUMN contract_terms TEXT,
ADD COLUMN payment_terms TEXT,
ADD COLUMN project_scope TEXT,
ADD COLUMN revision_policy TEXT;