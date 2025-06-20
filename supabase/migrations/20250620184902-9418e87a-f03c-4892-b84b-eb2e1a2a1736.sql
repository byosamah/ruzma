
-- Enable the pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable the pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a cron job to run notification checks daily at 9:00 AM UTC
SELECT cron.schedule(
  'daily-notification-check',
  '0 9 * * *', -- Every day at 9:00 AM UTC
  $$
  SELECT
    net.http_post(
        url:='https://***REMOVED***.supabase.co/functions/v1/check-notifications',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer ***REMOVED***"}'::jsonb,
        body:='{"trigger": "cron"}'::jsonb
    ) as request_id;
  $$
);
