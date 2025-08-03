-- Drop and recreate the update_project_count function to fix schema cache issue
DROP FUNCTION IF EXISTS public.update_project_count(uuid, integer);
DROP FUNCTION IF EXISTS public.update_project_count(integer, uuid);

-- Recreate the function with proper parameter order
CREATE OR REPLACE FUNCTION public.update_project_count(_user_id uuid, _count_change integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  UPDATE public.profiles 
  SET project_count = GREATEST(0, project_count + _count_change),
      updated_at = now()
  WHERE id = _user_id;
END;
$function$;