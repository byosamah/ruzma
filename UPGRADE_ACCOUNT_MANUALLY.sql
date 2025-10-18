-- Manual Account Upgrade for designbattlefield@gmail.com
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/***REMOVED***/sql

-- Step 1: Check current status
SELECT
    id,
    email,
    user_type,
    subscription_status,
    subscription_id,
    created_at,
    updated_at
FROM profiles
WHERE email = 'designbattlefield@gmail.com';

-- Step 2: Upgrade to Plus plan
UPDATE profiles
SET
    user_type = 'plus',
    subscription_status = 'active',
    updated_at = NOW()
WHERE email = 'designbattlefield@gmail.com';

-- Step 3: Verify the upgrade
SELECT
    id,
    email,
    user_type as "Current Plan",
    subscription_status as "Status",
    updated_at as "Last Updated"
FROM profiles
WHERE email = 'designbattlefield@gmail.com';

-- Expected Result:
-- Current Plan: plus
-- Status: active
-- Last Updated: [current timestamp]
