-- Fix freelancer branding data exposure by restricting SELECT policy
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Allow branding for active freelancers" ON public.freelancer_branding;

-- Create a new, more secure policy that only allows:
-- 1. Freelancers to view their own branding
-- 2. Clients who have projects with that freelancer to view the branding
CREATE POLICY "Secure branding for clients and freelancers" 
ON public.freelancer_branding 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 
    FROM projects p
    INNER JOIN clients c ON p.client_id = c.id
    WHERE p.user_id = freelancer_branding.user_id 
    AND c.user_id = auth.uid()
  )
);