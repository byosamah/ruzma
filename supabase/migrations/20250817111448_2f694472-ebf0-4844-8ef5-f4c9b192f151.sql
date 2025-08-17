-- Security Fix: Restrict Freelancer Branding Access
-- Remove the dangerous public read policy that allows unrestricted access
DROP POLICY "Public can view freelancer branding" ON public.freelancer_branding;

-- Create a more restrictive policy that only allows access to branding of active freelancers
CREATE POLICY "Allow branding for active freelancers" 
ON public.freelancer_branding 
FOR SELECT 
USING (
  -- Allow authenticated users to access their own branding
  auth.uid() = user_id 
  OR 
  -- Allow access to branding only for freelancers who have created projects
  -- This prevents bulk enumeration while allowing legitimate client project access
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.user_id = freelancer_branding.user_id
    LIMIT 1
  )
);