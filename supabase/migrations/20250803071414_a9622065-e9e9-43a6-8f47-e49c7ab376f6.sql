-- Recreate the update_project_count function
CREATE OR REPLACE FUNCTION public.update_project_count(_count_change integer, _user_id uuid)
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