-- Add contract-related fields to project_templates table
ALTER TABLE public.project_templates 
ADD COLUMN contract_required boolean NOT NULL DEFAULT false,
ADD COLUMN payment_proof_required boolean NOT NULL DEFAULT false,
ADD COLUMN contract_terms text,
ADD COLUMN payment_terms text,
ADD COLUMN project_scope text,
ADD COLUMN revision_policy text;