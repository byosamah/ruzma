-- Apply Subscription System Fixes
-- Run this script in your Supabase SQL Editor to enable all subscription improvements

-- Step 1: Apply grace period fields migration
-- From: /supabase/migrations/20250910063000_add_grace_period_fields.sql

-- Add grace period fields to subscriptions table
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS grace_period_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_grace_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_retry_at TIMESTAMPTZ;

-- Add indexes for better performance on grace period queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_grace_period_ends_at 
  ON public.subscriptions(grace_period_ends_at) 
  WHERE grace_period_ends_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscriptions_payment_grace_ends_at 
  ON public.subscriptions(payment_grace_ends_at) 
  WHERE payment_grace_ends_at IS NOT NULL;

-- Add composite index for finding expired grace periods
CREATE INDEX IF NOT EXISTS idx_subscriptions_grace_period_expired 
  ON public.subscriptions(status, grace_period_ends_at, payment_grace_ends_at) 
  WHERE status IN ('on_trial', 'unpaid');

-- Create function to calculate trial grace period end date
CREATE OR REPLACE FUNCTION public.calculate_trial_grace_end(trial_ends_at TIMESTAMPTZ, grace_days INTEGER DEFAULT 3)
RETURNS TIMESTAMPTZ AS $$
BEGIN
  IF trial_ends_at IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN trial_ends_at + (grace_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to calculate payment grace period end date
CREATE OR REPLACE FUNCTION public.calculate_payment_grace_end(payment_failed_at TIMESTAMPTZ, grace_days INTEGER DEFAULT 7)
RETURNS TIMESTAMPTZ AS $$
BEGIN
  IF payment_failed_at IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN payment_failed_at + (grace_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if subscription is in grace period
CREATE OR REPLACE FUNCTION public.is_in_grace_period(subscription_row public.subscriptions)
RETURNS BOOLEAN AS $$
DECLARE
  now_ts TIMESTAMPTZ := now();
BEGIN
  -- Check trial grace period
  IF subscription_row.status = 'on_trial' AND subscription_row.grace_period_ends_at IS NOT NULL THEN
    RETURN now_ts <= subscription_row.grace_period_ends_at;
  END IF;
  
  -- Check payment grace period
  IF subscription_row.status = 'unpaid' AND subscription_row.payment_grace_ends_at IS NOT NULL THEN
    RETURN now_ts <= subscription_row.payment_grace_ends_at;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to find subscriptions that need to be downgraded
CREATE OR REPLACE FUNCTION public.find_expired_grace_periods()
RETURNS SETOF public.subscriptions AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.subscriptions
  WHERE 
    -- Trial grace period expired
    (status = 'on_trial' 
     AND grace_period_ends_at IS NOT NULL 
     AND grace_period_ends_at < now())
  OR
    -- Payment grace period expired  
    (status = 'unpaid' 
     AND payment_grace_ends_at IS NOT NULL 
     AND payment_grace_ends_at < now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create subscription events table for audit trail
CREATE TABLE IF NOT EXISTS public.subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add indexes for subscription events
CREATE INDEX IF NOT EXISTS idx_subscription_events_subscription_id 
  ON public.subscription_events(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_user_id 
  ON public.subscription_events(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_event_type 
  ON public.subscription_events(event_type);
CREATE INDEX IF NOT EXISTS idx_subscription_events_created_at 
  ON public.subscription_events(created_at);

-- Enable RLS on subscription events
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subscription events
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can view their own subscription events" ON public.subscription_events;
  DROP POLICY IF EXISTS "Service role can manage all subscription events" ON public.subscription_events;
  
  -- Create new policies
  CREATE POLICY "Users can view their own subscription events" 
    ON public.subscription_events FOR SELECT 
    USING (auth.uid() = user_id);

  CREATE POLICY "Service role can manage all subscription events" 
    ON public.subscription_events FOR ALL 
    USING (auth.role() = 'service_role');
END $$;

-- Create function to log subscription events
CREATE OR REPLACE FUNCTION public.log_subscription_event(
  p_subscription_id UUID,
  p_user_id UUID,
  p_event_type TEXT,
  p_old_status TEXT DEFAULT NULL,
  p_new_status TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO public.subscription_events (
    subscription_id,
    user_id,
    event_type,
    old_status,
    new_status,
    metadata
  )
  VALUES (
    p_subscription_id,
    p_user_id,
    p_event_type,
    p_old_status,
    p_new_status,
    p_metadata
  )
  RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT ALL ON public.subscription_events TO service_role;
GRANT SELECT ON public.subscription_events TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_trial_grace_end(TIMESTAMPTZ, INTEGER) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.calculate_payment_grace_end(TIMESTAMPTZ, INTEGER) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_in_grace_period(public.subscriptions) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.find_expired_grace_periods() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.log_subscription_event(UUID, UUID, TEXT, TEXT, TEXT, JSONB) TO authenticated, service_role;

-- Step 2: Notification queue table (simplified version without cron dependencies)
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

-- Create RLS policies for notification queue
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notification_queue;
  DROP POLICY IF EXISTS "Service role can manage all notifications" ON public.notification_queue;
  
  CREATE POLICY "Users can view their own notifications" 
    ON public.notification_queue FOR SELECT 
    USING (auth.uid() = user_id);

  CREATE POLICY "Service role can manage all notifications" 
    ON public.notification_queue FOR ALL 
    USING (auth.role() = 'service_role');
END $$;

-- Grant permissions for notification queue
GRANT ALL ON public.notification_queue TO service_role;
GRANT SELECT ON public.notification_queue TO authenticated;

-- Final success message
SELECT 'Subscription system fixes applied successfully!' as status,
       'Grace periods, event logging, and notification queue are now enabled.' as details;