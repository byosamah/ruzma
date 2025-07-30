-- Add contract_required column to projects table
ALTER TABLE public.projects 
ADD COLUMN contract_required boolean NOT NULL DEFAULT true;

-- Add comment for documentation
COMMENT ON COLUMN public.projects.contract_required IS 'Whether contract approval is required for this project. If false, clients can access the project immediately without contract approval.';