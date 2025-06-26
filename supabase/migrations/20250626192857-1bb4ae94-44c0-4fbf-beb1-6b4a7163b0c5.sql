
-- Add payment_proof_required field to projects table
ALTER TABLE public.projects 
ADD COLUMN payment_proof_required BOOLEAN NOT NULL DEFAULT false;

-- Update existing projects to have the default value
UPDATE public.projects 
SET payment_proof_required = false 
WHERE payment_proof_required IS NULL;
