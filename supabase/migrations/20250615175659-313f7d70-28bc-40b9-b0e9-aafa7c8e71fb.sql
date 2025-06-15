
-- Add client_email field to projects table
ALTER TABLE public.projects ADD COLUMN client_email TEXT;

-- Add a check constraint to ensure email format is valid (optional but recommended)
ALTER TABLE public.projects ADD CONSTRAINT valid_client_email 
CHECK (client_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
