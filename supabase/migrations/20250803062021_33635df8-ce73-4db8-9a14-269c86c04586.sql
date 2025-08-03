-- First, let's make sure we have the correct data in user_plan_limits table
INSERT INTO user_plan_limits (user_type, project_limit, storage_limit_bytes) VALUES
('free', 1, 524288000),
('plus', 999999, 10737418240),
('pro', 999999, 21474836480)
ON CONFLICT (user_type) 
DO UPDATE SET 
  project_limit = EXCLUDED.project_limit,
  storage_limit_bytes = EXCLUDED.storage_limit_bytes;

-- Create the get_user_limits function that's missing
CREATE OR REPLACE FUNCTION public.get_user_limits(_user_type text)
RETURNS TABLE(project_limit integer, storage_limit_bytes bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  RETURN QUERY
  SELECT upl.project_limit, upl.storage_limit_bytes
  FROM public.user_plan_limits upl
  WHERE upl.user_type = COALESCE(_user_type, 'free');
END;
$$;