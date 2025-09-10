-- ===================================================================
-- CRITICAL DATABASE MIGRATION - APPLY THIS NOW IN SUPABASE SQL EDITOR
-- This fixes the remaining subscription system issues
-- ===================================================================

-- Step 1: Add grace period columns to subscriptions table
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS grace_period_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_grace_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_retry_at TIMESTAMPTZ;

-- Step 2: Add performance indexes for grace period queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_grace_period_ends_at 
  ON public.subscriptions(grace_period_ends_at) 
  WHERE grace_period_ends_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscriptions_payment_grace_ends_at 
  ON public.subscriptions(payment_grace_ends_at) 
  WHERE payment_grace_ends_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscriptions_grace_expired 
  ON public.subscriptions(status, grace_period_ends_at, payment_grace_ends_at) 
  WHERE status IN ('on_trial', 'unpaid');

-- Step 3: Create grace period calculation functions
CREATE OR REPLACE FUNCTION public.calculate_trial_grace_end(trial_ends_at TIMESTAMPTZ, grace_days INTEGER DEFAULT 3)
RETURNS TIMESTAMPTZ AS $$
BEGIN
  IF trial_ends_at IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN trial_ends_at + (grace_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.calculate_payment_grace_end(payment_failed_at TIMESTAMPTZ, grace_days INTEGER DEFAULT 7)
RETURNS TIMESTAMPTZ AS $$
BEGIN
  IF payment_failed_at IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN payment_failed_at + (grace_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create grace period check function
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

-- Step 5: Create expired subscriptions finder
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

-- Step 6: Grant proper permissions
GRANT EXECUTE ON FUNCTION public.calculate_trial_grace_end(TIMESTAMPTZ, INTEGER) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.calculate_payment_grace_end(TIMESTAMPTZ, INTEGER) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_in_grace_period(public.subscriptions) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.find_expired_grace_periods() TO authenticated, service_role;

-- Step 7: Ensure subscription events and notification queue tables exist
CREATE TABLE IF NOT EXISTS public.subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_subscription_events_user_id ON public.subscription_events(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_created_at ON public.subscription_events(created_at);

-- Enable RLS on subscription events
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

-- Create or replace policies for subscription events
DROP POLICY IF EXISTS "Users can view their own subscription events" ON public.subscription_events;
DROP POLICY IF EXISTS "Service role can manage all subscription events" ON public.subscription_events;

CREATE POLICY "Users can view their own subscription events" 
  ON public.subscription_events FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all subscription events" 
  ON public.subscription_events FOR ALL 
  USING (auth.role() = 'service_role');

-- Grant permissions
GRANT ALL ON public.subscription_events TO service_role;
GRANT SELECT ON public.subscription_events TO authenticated;

-- Step 8: Create notification queue table
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

CREATE INDEX IF NOT EXISTS idx_notification_queue_user_id ON public.notification_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_scheduled ON public.notification_queue(scheduled_for) 
  WHERE sent_at IS NULL AND failed_at IS NULL;

-- Enable RLS on notification queue
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notification_queue;
DROP POLICY IF EXISTS "Service role can manage all notifications" ON public.notification_queue;

CREATE POLICY "Users can view their own notifications" 
  ON public.notification_queue FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all notifications" 
  ON public.notification_queue FOR ALL 
  USING (auth.role() = 'service_role');

GRANT ALL ON public.notification_queue TO service_role;
GRANT SELECT ON public.notification_queue TO authenticated;

-- Step 9: Success verification
SELECT 
  'SUCCESS: Database migration completed!' as status,
  'Grace period columns and functions added' as details,
  'Ready for production use' as message;