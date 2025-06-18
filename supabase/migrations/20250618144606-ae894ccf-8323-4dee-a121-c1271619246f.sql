
-- Update the check_user_limits function to reflect the new plan limitations
CREATE OR REPLACE FUNCTION public.check_user_limits(_user_id uuid, _action text, _size bigint DEFAULT 0)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  _user_type text;
  _current_count integer;
  _current_storage bigint;
BEGIN
  -- Get user type and current usage
  SELECT user_type, project_count, storage_used 
  INTO _user_type, _current_count, _current_storage
  FROM public.profiles 
  WHERE id = _user_id;
  
  -- Check project limits based on new plan structure
  IF _action = 'project' THEN
    IF _user_type = 'free' AND _current_count >= 1 THEN -- Free: Max 1 project
      RETURN false;
    END IF;
    IF _user_type = 'plus' AND _current_count >= 3 THEN -- Plus: Max 3 projects
      RETURN false;
    END IF;
    IF _user_type = 'pro' AND _current_count >= 10 THEN -- Pro: Max 10 projects
      RETURN false;
    END IF;
  END IF;
  
  -- Check storage limits based on new plan structure
  IF _action = 'storage' THEN
    IF _user_type = 'free' AND (_current_storage + _size) > 524288000 THEN -- 500MB in bytes
      RETURN false;
    END IF;
    IF _user_type = 'plus' AND (_current_storage + _size) > 10737418240 THEN -- 10GB in bytes
      RETURN false;
    END IF;
    IF _user_type = 'pro' AND (_current_storage + _size) > 53687091200 THEN -- 50GB in bytes
      RETURN false;
    END IF;
  END IF;
  
  RETURN true;
END;
$function$
