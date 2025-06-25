
-- Create clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, email)
);

-- Enable Row Level Security
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for clients
CREATE POLICY "Users can view their own clients" 
  ON public.clients 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clients" 
  ON public.clients 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients" 
  ON public.clients 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients" 
  ON public.clients 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add client_id column to projects table
ALTER TABLE public.projects ADD COLUMN client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;

-- Create an index for better performance
CREATE INDEX idx_clients_user_id ON public.clients(user_id);
CREATE INDEX idx_projects_client_id ON public.projects(client_id);

-- Migrate existing client data from projects to clients table
INSERT INTO public.clients (user_id, name, email)
SELECT DISTINCT 
  p.user_id,
  COALESCE(SPLIT_PART(p.client_email, '@', 1), 'Unknown Client') as name,
  p.client_email as email
FROM public.projects p
WHERE p.client_email IS NOT NULL 
  AND p.client_email != ''
ON CONFLICT (user_id, email) DO NOTHING;

-- Update projects to reference client_id
UPDATE public.projects p
SET client_id = c.id
FROM public.clients c
WHERE p.client_email = c.email 
  AND p.user_id = c.user_id
  AND p.client_email IS NOT NULL;
