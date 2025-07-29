-- Add contract approval columns to projects table
ALTER TABLE projects 
ADD COLUMN contract_status text DEFAULT 'pending' CHECK (contract_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN contract_sent_at timestamp with time zone,
ADD COLUMN contract_approved_at timestamp with time zone,
ADD COLUMN contract_rejection_reason text,
ADD COLUMN contract_approval_token uuid DEFAULT gen_random_uuid();