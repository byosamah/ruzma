-- Fix business pricing strategy exposure by restricting plan limits access
-- Drop the overly permissive policy that allows anyone to view plan limits
DROP POLICY IF EXISTS "Anyone can view plan limits" ON public.user_plan_limits;

-- Create a new policy that only allows authenticated users to view plan limits
-- This prevents competitors from seeing your pricing structure
CREATE POLICY "Authenticated users can view plan limits" 
ON public.user_plan_limits 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Optional: Create a function to get only the current user's plan limits
-- This further restricts data exposure by only returning relevant information
CREATE OR REPLACE FUNCTION public.get_current_user_plan_limits()
RETURNS TABLE(project_limit integer, storage_limit_bytes bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  user_type_val text;
BEGIN
  -- Get the current user's plan type
  SELECT COALESCE(p.user_type, 'free')
  INTO user_type_val
  FROM public.profiles p
  WHERE p.id = auth.uid();
  
  -- Return only the limits for this user's plan type
  RETURN QUERY
  SELECT upl.project_limit, upl.storage_limit_bytes
  FROM public.user_plan_limits upl
  WHERE upl.user_type = user_type_val;
END;
$$;