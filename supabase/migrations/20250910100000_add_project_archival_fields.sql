-- Add archival fields to projects table
-- This enables proper handling of excess projects when users downgrade

ALTER TABLE public.projects 
ADD COLUMN archived_at TIMESTAMPTZ NULL,
ADD COLUMN archive_reason TEXT NULL;

-- Add index for performance on archived projects queries
CREATE INDEX idx_projects_archived_status ON public.projects(status, archived_at) 
WHERE status = 'archived';

-- Add index for user archived projects 
CREATE INDEX idx_projects_user_archived ON public.projects(user_id, status, archived_at) 
WHERE status = 'archived';

-- Add check constraint to ensure archived projects have archived_at timestamp
ALTER TABLE public.projects 
ADD CONSTRAINT chk_archived_projects_have_timestamp 
CHECK (
  (status = 'archived' AND archived_at IS NOT NULL) OR 
  (status != 'archived' AND archived_at IS NULL)
);

-- Update existing 'cancelled' projects to use 'archived' status if needed
-- (This is optional - if you want to migrate existing cancelled projects)
UPDATE public.projects 
SET 
  status = 'archived',
  archived_at = updated_at,
  archive_reason = 'legacy_migration'
WHERE status = 'cancelled';

-- Add comment for documentation
COMMENT ON COLUMN public.projects.archived_at IS 'Timestamp when project was archived due to plan downgrade or user action';
COMMENT ON COLUMN public.projects.archive_reason IS 'Reason for archival: plan_downgrade_to_free, plan_downgrade_to_plus, user_action, etc.';

-- Grant permissions (if needed)
-- ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
-- The existing RLS policies should automatically cover archived projects