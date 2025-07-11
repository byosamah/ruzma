-- Update the valid_client_email constraint to allow NULL values
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS valid_client_email;

-- Add the updated constraint that allows NULL values
ALTER TABLE public.projects ADD CONSTRAINT valid_client_email 
CHECK (client_email IS NULL OR client_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');