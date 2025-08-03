-- Remove storage tracking functionality while keeping file upload capabilities

-- Update get_user_limits function to only return project limits
CREATE OR REPLACE FUNCTION public.get_user_limits(_user_type text)
RETURNS TABLE(project_limit integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  RETURN QUERY
  SELECT upl.project_limit
  FROM public.user_plan_limits upl
  WHERE upl.user_type = COALESCE(_user_type, 'free');
END;
$$;

-- Update check_user_limits function to only check project limits
CREATE OR REPLACE FUNCTION public.check_user_limits(_user_id uuid, _action text, _size bigint DEFAULT 0)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  _user_type text;
  _current_count integer;
  _project_limit integer;
BEGIN
  -- Get user type and current project count
  SELECT user_type, project_count 
  INTO _user_type, _current_count
  FROM public.profiles 
  WHERE id = _user_id;
  
  -- Get dynamic project limit from user_plan_limits table
  SELECT project_limit
  INTO _project_limit
  FROM public.get_user_limits(COALESCE(_user_type, 'free'));
  
  -- Check project limits using dynamic values
  -- For Plus and Pro plans (999999 = unlimited), always allow project creation
  IF _action = 'project' THEN
    IF _project_limit < 999999 AND _current_count >= _project_limit THEN
      RETURN false;
    END IF;
  END IF;
  
  -- Always allow storage actions since we're removing storage tracking
  IF _action = 'storage' THEN
    RETURN true;
  END IF;
  
  RETURN true;
END;
$$;

-- Update check_deadlines_and_limits function to remove storage limit checks
CREATE OR REPLACE FUNCTION public.check_deadlines_and_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  project_record RECORD;
  user_record RECORD;
  days_left INTEGER;
  user_type TEXT;
  project_limit INTEGER;
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
  
  -- Check project limits only (removed storage limit checks)
  FOR user_record IN 
    SELECT id, user_type, project_count, full_name
    FROM profiles
  LOOP
    user_type := COALESCE(user_record.user_type, 'free');
    
    -- Get dynamic project limit from user_plan_limits table
    SELECT upl.project_limit
    INTO project_limit
    FROM public.user_plan_limits upl
    WHERE upl.user_type = user_type;
    
    -- Use fallback limit if not found
    IF project_limit IS NULL THEN
      project_limit := 1;
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
  END LOOP;
END;
$$;