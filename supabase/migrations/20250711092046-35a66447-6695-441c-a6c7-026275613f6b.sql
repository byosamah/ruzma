
-- Update the user_plan_limits table to set unlimited projects for Plus and Pro plans
-- We'll use a high number (999999) to represent "unlimited" since the database expects an integer
UPDATE public.user_plan_limits 
SET project_limit = 999999 
WHERE user_type IN ('plus', 'pro');

-- Update the check_user_limits function to handle unlimited projects
CREATE OR REPLACE FUNCTION public.check_user_limits(_user_id uuid, _action text, _size bigint DEFAULT 0)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  _user_type text;
  _current_count integer;
  _current_storage bigint;
  _project_limit integer;
  _storage_limit bigint;
BEGIN
  -- Get user type and current usage
  SELECT user_type, project_count, storage_used 
  INTO _user_type, _current_count, _current_storage
  FROM public.profiles 
  WHERE id = _user_id;
  
  -- Get dynamic limits from user_plan_limits table
  SELECT project_limit, storage_limit_bytes
  INTO _project_limit, _storage_limit
  FROM public.get_user_limits(COALESCE(_user_type, 'free'));
  
  -- Check project limits using dynamic values
  -- For Plus and Pro plans (999999 = unlimited), always allow project creation
  IF _action = 'project' THEN
    IF _project_limit < 999999 AND _current_count >= _project_limit THEN
      RETURN false;
    END IF;
  END IF;
  
  -- Check storage limits using dynamic values
  IF _action = 'storage' THEN
    IF (_current_storage + _size) > _storage_limit THEN
      RETURN false;
    END IF;
  END IF;
  
  RETURN true;
END;
$function$;

-- Update the check_deadlines_and_limits function to handle unlimited projects  
CREATE OR REPLACE FUNCTION public.check_deadlines_and_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  project_record RECORD;
  user_record RECORD;
  days_left INTEGER;
  user_type TEXT;
  project_limit INTEGER;
  storage_limit BIGINT;
BEGIN
  -- Check project deadlines (2 days and 7 days warnings)
  FOR project_record IN 
    SELECT p.*, pr.user_type, pr.full_name
    FROM projects p
    LEFT JOIN profiles pr ON p.user_id = pr.id
    WHERE p.end_date IS NOT NULL 
      AND p.end_date > now() 
      AND p.end_date <= now() + INTERVAL '7 days'
  LOOP
    days_left := EXTRACT(DAY FROM project_record.end_date - now())::INTEGER;
    
    -- Create notification for 7 days and 2 days warnings
    IF days_left = 7 OR days_left = 2 THEN
      -- Check if notification already exists for this deadline
      IF NOT EXISTS (
        SELECT 1 FROM notifications 
        WHERE user_id = project_record.user_id 
          AND type = 'deadline_warning'
          AND related_project_id = project_record.id
          AND message LIKE '%' || days_left || ' days%'
          AND created_at > now() - INTERVAL '1 day'
      ) THEN
        INSERT INTO notifications (
          user_id,
          type,
          title,
          message,
          related_project_id
        ) VALUES (
          project_record.user_id,
          'deadline_warning',
          'Project Deadline Approaching',
          'Project "' || project_record.name || '" deadline is in ' || days_left || ' days',
          project_record.id
        );
      END IF;
    END IF;
  END LOOP;
  
  -- Check project and storage limits using dynamic values
  FOR user_record IN 
    SELECT id, user_type, project_count, storage_used, full_name
    FROM profiles
  LOOP
    user_type := COALESCE(user_record.user_type, 'free');
    
    -- Get dynamic limits from user_plan_limits table
    SELECT upl.project_limit, upl.storage_limit_bytes
    INTO project_limit, storage_limit
    FROM public.user_plan_limits upl
    WHERE upl.user_type = user_type;
    
    -- Use fallback limits if not found
    IF project_limit IS NULL THEN
      project_limit := 1;
      storage_limit := 524288000;
    END IF;
    
    -- Check project limit (notify when at 100% capacity)
    -- Skip notification for unlimited plans (999999)
    IF project_limit < 999999 AND user_record.project_count >= project_limit THEN
      IF NOT EXISTS (
        SELECT 1 FROM notifications 
        WHERE user_id = user_record.id 
          AND type = 'project_limit'
          AND created_at > now() - INTERVAL '7 days'
      ) THEN
        INSERT INTO notifications (
          user_id,
          type,
          title,
          message,
          related_project_id
        ) VALUES (
          user_record.id,
          'project_limit',
          'Project Limit Reached',
          'You have reached your project limit (' || project_limit || '). Upgrade your plan to create more projects.',
          NULL
        );
      END IF;
    END IF;
    
    -- Check storage limit (notify when at 90% capacity)
    IF user_record.storage_used >= (storage_limit * 0.9) THEN
      IF NOT EXISTS (
        SELECT 1 FROM notifications 
        WHERE user_id = user_record.id 
          AND type = 'storage_limit'
          AND created_at > now() - INTERVAL '7 days'
      ) THEN
        INSERT INTO notifications (
          user_id,
          type,
          title,
          message,
          related_project_id
        ) VALUES (
          user_record.id,
          'storage_limit',
          'Storage Limit Nearly Reached',
          'You are approaching your storage limit. Upgrade your plan for more storage space.',
          NULL
        );
      END IF;
    END IF;
  END LOOP;
END;
$function$;
