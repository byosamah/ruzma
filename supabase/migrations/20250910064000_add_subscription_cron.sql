-- Add cron job for processing expired subscriptions
-- This migration sets up automatic processing of expired subscriptions

-- Enable the pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create function to call the Edge function
CREATE OR REPLACE FUNCTION public.process_expired_subscriptions_job()
RETURNS void AS $$
BEGIN
  -- Call the Edge function via HTTP
  -- Note: In production, you would use the actual Supabase function URL
  PERFORM net.http_post(
    url := 'https://***REMOVED***.supabase.co/functions/v1/process-expired-subscriptions',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key', true)
    ),
    body := jsonb_build_object('scheduled', true)
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the cron job
    RAISE WARNING 'Failed to process expired subscriptions: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule the job to run every hour
SELECT cron.schedule(
  'process-expired-subscriptions',
  '0 * * * *', -- Every hour at minute 0
  'SELECT public.process_expired_subscriptions_job();'
);

-- Create a more frequent job for reminder emails (runs every 6 hours)
CREATE OR REPLACE FUNCTION public.send_subscription_reminders_job()
RETURNS void AS $$
BEGIN
  -- Send reminders for trials ending in 3 days
  INSERT INTO public.notification_queue (
    user_id,
    type,
    metadata,
    scheduled_for
  )
  SELECT 
    s.user_id,
    'trial_ending_soon',
    jsonb_build_object(
      'subscription_id', s.lemon_squeezy_id,
      'plan', s.subscription_plan,
      'days_left', EXTRACT(DAY FROM s.trial_ends_at - now())
    ),
    now()
  FROM public.subscriptions s
  WHERE 
    s.status = 'on_trial'
    AND s.trial_ends_at > now()
    AND s.trial_ends_at <= now() + interval '3 days'
    AND NOT EXISTS (
      SELECT 1 FROM public.notification_queue nq
      WHERE nq.user_id = s.user_id
      AND nq.type = 'trial_ending_soon'
      AND nq.created_at > now() - interval '24 hours'
    );

  -- Send reminders for payment grace periods ending in 2 days
  INSERT INTO public.notification_queue (
    user_id,
    type,
    metadata,
    scheduled_for
  )
  SELECT 
    s.user_id,
    'payment_grace_ending',
    jsonb_build_object(
      'subscription_id', s.lemon_squeezy_id,
      'plan', s.subscription_plan,
      'days_left', EXTRACT(DAY FROM s.payment_grace_ends_at - now())
    ),
    now()
  FROM public.subscriptions s
  WHERE 
    s.status = 'unpaid'
    AND s.payment_grace_ends_at > now()
    AND s.payment_grace_ends_at <= now() + interval '2 days'
    AND NOT EXISTS (
      SELECT 1 FROM public.notification_queue nq
      WHERE nq.user_id = s.user_id
      AND nq.type = 'payment_grace_ending'
      AND nq.created_at > now() - interval '12 hours'
    );
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to schedule subscription reminders: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create notification queue table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  scheduled_for TIMESTAMPTZ DEFAULT now(),
  sent_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add indexes for notification queue
CREATE INDEX IF NOT EXISTS idx_notification_queue_user_id ON public.notification_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_scheduled_for ON public.notification_queue(scheduled_for) 
  WHERE sent_at IS NULL AND failed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notification_queue_type ON public.notification_queue(type);

-- Enable RLS on notification queue
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own notifications" 
  ON public.notification_queue FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all notifications" 
  ON public.notification_queue FOR ALL 
  USING (auth.role() = 'service_role');

-- Schedule reminder job to run every 6 hours
SELECT cron.schedule(
  'send-subscription-reminders',
  '0 */6 * * *', -- Every 6 hours
  'SELECT public.send_subscription_reminders_job();'
);

-- Create function to process notification queue
CREATE OR REPLACE FUNCTION public.process_notification_queue()
RETURNS void AS $$
DECLARE
  notification_record RECORD;
BEGIN
  -- Process pending notifications
  FOR notification_record IN
    SELECT id, user_id, type, metadata
    FROM public.notification_queue
    WHERE scheduled_for <= now()
    AND sent_at IS NULL
    AND (failed_at IS NULL OR retry_count < max_retries)
    ORDER BY scheduled_for
    LIMIT 50
  LOOP
    BEGIN
      -- Call the notification function
      PERFORM net.http_post(
        url := 'https://***REMOVED***.supabase.co/functions/v1/send-payment-notification',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key', true)
        ),
        body := jsonb_build_object(
          'userId', notification_record.user_id,
          'type', notification_record.type
        ) || notification_record.metadata
      );

      -- Mark as sent
      UPDATE public.notification_queue
      SET sent_at = now()
      WHERE id = notification_record.id;

    EXCEPTION
      WHEN OTHERS THEN
        -- Mark as failed and increment retry count
        UPDATE public.notification_queue
        SET 
          failed_at = CASE WHEN retry_count >= max_retries THEN now() ELSE failed_at END,
          retry_count = retry_count + 1
        WHERE id = notification_record.id;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule notification processing every 15 minutes
SELECT cron.schedule(
  'process-notification-queue',
  '*/15 * * * *', -- Every 15 minutes
  'SELECT public.process_notification_queue();'
);

-- Grant permissions
GRANT ALL ON public.notification_queue TO service_role;
GRANT SELECT ON public.notification_queue TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_expired_subscriptions_job() TO postgres, service_role;
GRANT EXECUTE ON FUNCTION public.send_subscription_reminders_job() TO postgres, service_role;
GRANT EXECUTE ON FUNCTION public.process_notification_queue() TO postgres, service_role;

-- Success message
SELECT 'Subscription cron jobs and notification system created successfully!' as message,
       'Jobs scheduled: process-expired-subscriptions (hourly), send-subscription-reminders (every 6h), process-notification-queue (every 15min)' as details;