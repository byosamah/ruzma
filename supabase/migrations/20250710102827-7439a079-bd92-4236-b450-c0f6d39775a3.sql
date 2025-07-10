
-- Add new milestone statuses to support enhanced workflow
ALTER TYPE milestone_status RENAME TO milestone_status_old;

CREATE TYPE milestone_status AS ENUM (
  'pending',
  'in_progress', 
  'under_review',
  'revision_requested',
  'payment_submitted',
  'approved',
  'rejected',
  'completed',
  'on_hold',
  'cancelled'
);

-- Update the milestones table to use the new enum
ALTER TABLE milestones 
ALTER COLUMN status TYPE milestone_status 
USING status::text::milestone_status;

-- Drop the old enum
DROP TYPE milestone_status_old;

-- Create a status_history table to track status changes
CREATE TABLE milestone_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
  old_status milestone_status,
  new_status milestone_status NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Enable RLS on status history
ALTER TABLE milestone_status_history ENABLE ROW LEVEL SECURITY;

-- Create policy for status history - users can view history of their project milestones
CREATE POLICY "Users can view status history of their milestones"
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
CREATE POLICY "Users can create status history for their milestones"
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
      OLD.status,
      NEW.status,
      auth.uid(),
      'Status changed from ' || COALESCE(OLD.status::text, 'null') || ' to ' || NEW.status::text
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically log status changes
CREATE TRIGGER milestone_status_change_trigger
  AFTER UPDATE ON milestones
  FOR EACH ROW
  EXECUTE FUNCTION log_milestone_status_change();
