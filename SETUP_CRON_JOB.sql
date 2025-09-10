-- ===================================================================
-- AUTOMATED SUBSCRIPTION PROCESSING - RUN THIS IN SUPABASE SQL EDITOR
-- Sets up hourly processing of expired subscriptions
-- ===================================================================

-- Step 1: Enable pg_cron extension (if not already enabled)
-- Note: This might already be enabled, but won't hurt to run again
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Step 2: Schedule the process-expired-subscriptions function to run every hour
-- This will automatically downgrade users whose grace periods have expired
SELECT cron.schedule(
  'process-expired-subscriptions-hourly',  -- Job name
  '0 * * * *',                            -- Cron expression: every hour at minute 0
  $$
    SELECT net.http_post(
      url := 'https://***REMOVED***.supabase.co/functions/v1/process-expired-subscriptions',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rdGFydHdobHJwemlkb2pseXNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxODM5MjI5MSwiZXhwIjoyMDMzOTY4MjkxfQ.PBB_FzLVhFtQZqDfwZdTdKIJy1VzL3sTsWxVF8-Zc-Y"}'::jsonb,
      body := '{}'::jsonb
    );
  $$
);

-- Step 3: Verify the cron job was created successfully
SELECT 
  jobname, 
  schedule, 
  command,
  active
FROM cron.job 
WHERE jobname = 'process-expired-subscriptions-hourly';

-- Expected result: Should show 1 row with your scheduled job

-- Step 4: Check recent cron job runs (after it runs for a while)
-- Run this later to monitor execution:
-- SELECT * FROM cron.job_run_details 
-- WHERE jobname = 'process-expired-subscriptions-hourly' 
-- ORDER BY start_time DESC 
-- LIMIT 5;

-- Success message
SELECT 
  'SUCCESS: Automated subscription processing configured!' as status,
  'Job will run every hour at minute 0' as schedule,
  'Expired subscriptions will be processed automatically' as details;