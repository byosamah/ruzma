-- ============================================================================
-- Fix Pro Account: Clear subscription_id for osama.k@meemain.org
-- ============================================================================
-- Date: 2025-10-19
-- Purpose: Ensure Pro (lifetime) account has no subscription_id
-- Pro users should NOT have subscription_id because they don't have subscriptions
-- ============================================================================

-- Step 1: Check current state BEFORE fix
SELECT
  id,
  email,
  user_type,
  subscription_status,
  subscription_id,
  updated_at
FROM profiles
WHERE email = 'osama.k@meemain.org';

-- Expected BEFORE fix:
-- user_type: 'pro'
-- subscription_status: 'active'
-- subscription_id: '<some-value>' or NULL
-- ============================================================================

-- Step 2: Fix the Pro account (clear subscription_id)
UPDATE profiles
SET
  subscription_id = NULL,            -- Clear subscription ID (Pro is not a subscription!)
  subscription_status = 'active',    -- Ensure lifetime active status
  updated_at = NOW()
WHERE email = 'osama.k@meemain.org'
  AND user_type = 'pro';

-- ============================================================================

-- Step 3: Verify the fix
SELECT
  id,
  email,
  user_type,
  subscription_status,
  subscription_id,
  updated_at
FROM profiles
WHERE email = 'osama.k@meemain.org';

-- Expected AFTER fix:
-- user_type: 'pro' ✅
-- subscription_status: 'active' ✅
-- subscription_id: NULL ✅ (This is the key change!)
-- ============================================================================

-- Step 4: Check subscriptions table (should have NO active Pro subscriptions)
SELECT
  id,
  user_id,
  lemon_squeezy_id,
  status,
  variant_id,
  expires_at,
  created_at
FROM subscriptions
WHERE user_id = (SELECT id FROM profiles WHERE email = 'osama.k@meemain.org')
  AND status IN ('active', 'on_trial');

-- Expected:
-- - Either NO rows (Pro users don't have subscriptions)
-- - Or rows with status 'cancelled' (if they upgraded from Plus)
-- ============================================================================

-- Step 5: If there are lingering Plus subscriptions, mark them as cancelled
-- (This only runs if there ARE active subscriptions from old Plus plan)
UPDATE subscriptions
SET
  status = 'cancelled',
  updated_at = NOW()
WHERE user_id = (SELECT id FROM profiles WHERE email = 'osama.k@meemain.org')
  AND status IN ('active', 'on_trial')
  AND variant_id = '697231';  -- Only cancel old Plus subscriptions

-- ============================================================================

-- Step 6: Final verification - check everything is clean
SELECT
  'Profile' as table_name,
  id::text,
  email as identifier,
  user_type,
  subscription_status,
  subscription_id::text,
  updated_at
FROM profiles
WHERE email = 'osama.k@meemain.org'

UNION ALL

SELECT
  'Subscriptions' as table_name,
  id::text,
  lemon_squeezy_id as identifier,
  variant_id as user_type,
  status as subscription_status,
  expires_at::text as subscription_id,
  updated_at
FROM subscriptions
WHERE user_id = (SELECT id FROM profiles WHERE email = 'osama.k@meemain.org');

-- Expected final state:
-- Profile row: user_type='pro', subscription_id=NULL, subscription_status='active'
-- Subscriptions rows: Either empty OR all status='cancelled'
-- ============================================================================
