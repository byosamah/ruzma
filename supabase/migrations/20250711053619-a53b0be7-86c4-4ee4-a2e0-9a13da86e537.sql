
-- Add new milestone statuses to support enhanced workflow
DO $$ 
BEGIN
    -- Check if the new statuses already exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'in_progress' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'milestone_status')) THEN
        -- Add new enum values to existing milestone status type
        ALTER TYPE milestone_status ADD VALUE 'in_progress';
        ALTER TYPE milestone_status ADD VALUE 'under_review';
        ALTER TYPE milestone_status ADD VALUE 'revision_requested';
        ALTER TYPE milestone_status ADD VALUE 'completed';
        ALTER TYPE milestone_status ADD VALUE 'on_hold';
        ALTER TYPE milestone_status ADD VALUE 'cancelled';
    END IF;
END $$;

-- Create a status_history table to track status changes
CREATE TABLE IF NOT EXISTS milestone_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Enable RLS on status history
ALTER TABLE milestone_status_history ENABLE ROW LEVEL SECURITY;

-- Create policy for status history - users can view history of their project milestones
CREATE POLICY IF NOT EXISTS "Users can view status history of their milestones"
ON milestone_status_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM milestones m
    JOIN projects p ON m.project_id = p.id
    WHERE m.id = milestone_status_history.milestone_id 
    AND p.user_id = auth.uid()
  )
);

-- Create policy for inserting status history
CREATE POLICY IF NOT EXISTS "Users can create status history for their milestones"
ON milestone_status_history
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM milestones m
    JOIN projects p ON m.project_id = p.id
    WHERE m.id = milestone_status_history.milestone_id 
    AND p.user_id = auth.uid()
  )
);

-- Create function to automatically log status changes
CREATE OR REPLACE FUNCTION log_milestone_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO milestone_status_history (
      milestone_id,
      old_status,
      new_status,
      changed_by,
      notes
    ) VALUES (
      NEW.id,
      OLD.status::text,
      NEW.status::text,
      auth.uid(),
      'Status changed from ' || COALESCE(OLD.status::text, 'null') || ' to ' || NEW.status::text
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically log status changes
DROP TRIGGER IF EXISTS milestone_status_change_trigger ON milestones;
CREATE TRIGGER milestone_status_change_trigger
  AFTER UPDATE ON milestones
  FOR EACH ROW
  EXECUTE FUNCTION log_milestone_status_change();
