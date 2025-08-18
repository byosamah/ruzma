-- Further restrict user_plan_limits access to only show user's own plan
-- Drop the current policy that still allows all authenticated users to see all plans
DROP POLICY IF EXISTS "Authenticated users can view plan limits" ON public.user_plan_limits;

-- Create a highly restrictive policy that only shows the user's current plan limits
-- Users can only see the plan limits that match their current subscription tier
CREATE POLICY "Users can only view their own plan limits" 
ON public.user_plan_limits 
FOR SELECT 
TO authenticated
USING (
  user_type = (
    SELECT COALESCE(p.user_type, 'free')
    FROM public.profiles p
    WHERE p.id = auth.uid()
  )
);

-- Update the existing function to be more secure
-- This ensures even function calls don't expose other plan data
CREATE OR REPLACE FUNCTION public.get_user_limits(_user_type text DEFAULT NULL)
RETURNS TABLE(project_limit integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  current_user_type text;
BEGIN
  -- Get the current user's actual plan type from their profile
  SELECT COALESCE(p.user_type, 'free')
  INTO current_user_type
  FROM public.profiles p
  WHERE p.id = auth.uid();
  
  -- Only allow querying the user's own plan type
  -- Ignore any different _user_type parameter for security
  RETURN QUERY
  SELECT upl.project_limit
  FROM public.user_plan_limits upl
  WHERE upl.user_type = current_user_type;
END;
$$;