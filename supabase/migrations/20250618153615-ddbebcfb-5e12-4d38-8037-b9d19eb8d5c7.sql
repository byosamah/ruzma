
-- SECURITY FIX - Phase 1A: Clean up projects table RLS policies only
DROP POLICY IF EXISTS "User or client token can view a project" ON public.projects;
DROP POLICY IF EXISTS "Users can manage their own projects" ON public.projects;

-- Create a single, secure policy for projects
CREATE POLICY "Secure project access"
ON public.projects
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
