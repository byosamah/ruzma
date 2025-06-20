
-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('payment_proof', 'deadline_warning', 'project_limit', 'storage_limit')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (true);

-- Create function to add payment proof notification
CREATE OR REPLACE FUNCTION public.create_payment_proof_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  project_record RECORD;
BEGIN
  -- Only trigger when payment_proof_url is added and status changes to payment_submitted
  IF NEW.payment_proof_url IS NOT NULL 
     AND OLD.payment_proof_url IS NULL 
     AND NEW.status = 'payment_submitted' THEN
    
    -- Get project details
    SELECT p.*, pr.full_name as freelancer_name
    INTO project_record
    FROM projects p
    LEFT JOIN profiles pr ON p.user_id = pr.id
    WHERE p.id = NEW.project_id;
    
    -- Insert notification for the freelancer
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      related_project_id
    ) VALUES (
      project_record.user_id,
      'payment_proof',
      'Payment Proof Submitted',
      'Payment proof has been submitted for milestone "' || NEW.title || '" in project "' || project_record.name || '"',
      project_record.id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for payment proof notifications
CREATE TRIGGER trigger_payment_proof_notification
  AFTER UPDATE ON public.milestones
  FOR EACH ROW
  EXECUTE FUNCTION public.create_payment_proof_notification();

-- Create function to check project deadlines and limits
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
  
  -- Check project and storage limits
  FOR user_record IN 
    SELECT id, user_type, project_count, storage_used, full_name
    FROM profiles
  LOOP
    user_type := COALESCE(user_record.user_type, 'free');
    
    -- Set limits based on user type
    IF user_type = 'free' THEN
      project_limit := 1;
      storage_limit := 524288000; -- 500MB
    ELSIF user_type = 'plus' THEN
      project_limit := 3;
      storage_limit := 10737418240; -- 10GB
    ELSE -- pro
      project_limit := 10;
      storage_limit := 53687091200; -- 50GB
    END IF;
    
    -- Check project limit (notify when at 100% capacity)
    IF user_record.project_count >= project_limit THEN
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
$$;
