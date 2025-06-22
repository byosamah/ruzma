
-- Move pg_net extension from public schema to extensions schema
DROP EXTENSION IF EXISTS pg_net CASCADE;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Update the cron job to use the correct schema reference
SELECT cron.unschedule('daily-notification-check');

SELECT cron.schedule(
  'daily-notification-check',
  '0 9 * * *', -- Every day at 9:00 AM UTC
  $$
  SELECT
    extensions.http_post(
        url:='https://***REMOVED***.supabase.co/functions/v1/check-notifications',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer ***REMOVED***"}'::jsonb,
        body:='{"trigger": "cron"}'::jsonb
    ) as request_id;
  $$
);
