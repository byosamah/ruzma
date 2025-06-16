
-- Update any text fields that contain the old project ID in URLs
-- This will update email templates, notification URLs, or any stored links

-- First, let's check if there are any records that need updating
-- (This is just for reference, the actual updates follow)

-- Update any URLs in notification settings or other JSON fields in profiles
UPDATE public.profiles 
SET notification_settings = notification_settings::jsonb || 
    CASE 
        WHEN notification_settings::text LIKE '%***REMOVED***%' 
        THEN jsonb_build_object()  -- We'll handle JSON updates if needed
        ELSE '{}'::jsonb 
    END
WHERE notification_settings::text LIKE '%***REMOVED***%';

-- Update any stored URLs in project templates that might contain the old project ID
UPDATE public.project_templates 
SET milestones = replace(milestones::text, '***REMOVED***', 'ruzma-app')::jsonb
WHERE milestones::text LIKE '%***REMOVED***%';

-- Update any text fields in projects table that might contain URLs
UPDATE public.projects 
SET brief = replace(brief, '***REMOVED***', 'ruzma-app')
WHERE brief LIKE '%***REMOVED***%';

-- Update any text fields in milestones table that might contain URLs
UPDATE public.milestones 
SET description = replace(description, '***REMOVED***', 'ruzma-app'),
    title = replace(title, '***REMOVED***', 'ruzma-app')
WHERE description LIKE '%***REMOVED***%' 
   OR title LIKE '%***REMOVED***%';

-- Update any URLs in profiles table text fields
UPDATE public.profiles 
SET bio = replace(bio, '***REMOVED***', 'ruzma-app'),
    website = replace(website, '***REMOVED***', 'ruzma-app')
WHERE bio LIKE '%***REMOVED***%' 
   OR website LIKE '%***REMOVED***%';
