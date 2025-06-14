
-- Add deliverable fields to the milestones table
ALTER TABLE public.milestones 
ADD COLUMN deliverable_name TEXT,
ADD COLUMN deliverable_url TEXT,
ADD COLUMN deliverable_size INTEGER,
ADD COLUMN payment_proof_url TEXT;

-- Update the milestone status check constraint to ensure proper flow
ALTER TABLE public.milestones 
DROP CONSTRAINT IF EXISTS milestones_status_check;

ALTER TABLE public.milestones 
ADD CONSTRAINT milestones_status_check 
CHECK (status IN ('pending', 'payment_submitted', 'approved', 'rejected'));
