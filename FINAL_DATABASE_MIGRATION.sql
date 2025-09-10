-- ===================================================================
-- FINAL SUBSCRIPTION SYSTEM DATABASE MIGRATION
-- Run this script in Supabase Dashboard → SQL Editor
-- ===================================================================

-- Step 1: Add grace period columns to subscriptions table
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS grace_period_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_grace_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_retry_at TIMESTAMPTZ;

-- Step 2: Add performance indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_grace_period_ends_at 
  ON public.subscriptions(grace_period_ends_at) 
  WHERE grace_period_ends_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscriptions_payment_grace_ends_at 
  ON public.subscriptions(payment_grace_ends_at) 
  WHERE payment_grace_ends_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscriptions_grace_period_expired 
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

-- Step 5: Create expired grace periods finder
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

-- Step 7: Verify migration success
SELECT 
  'SUCCESS: All grace period columns and functions created!' as status,
  'grace_period_ends_at' as column1,
  'payment_grace_ends_at' as column2,
  'retry_count' as column3,
  'last_retry_at' as column4;