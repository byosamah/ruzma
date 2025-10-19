-- Manual upgrade for designbattlefield@gmail.com to Pro
-- Run this in Supabase SQL Editor

-- Step 1: Check current state
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

-- Step 2: Upgrade to Pro
UPDATE profiles
SET
    user_type = 'pro',
    subscription_status = 'active',
    updated_at = NOW()
WHERE email = 'designbattlefield@gmail.com';

-- Step 3: Verify the upgrade
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

-- Step 4: Log security event
INSERT INTO security_events (user_id, event_type, details, created_at)
SELECT
    id,
    'manual_upgrade',
    jsonb_build_object(
        'from_plan', 'plus',
        'to_plan', 'pro',
        'reason', 'Manual upgrade - Pro purchase webhook not processed (order_created event missing)',
        'upgraded_by', 'admin',
        'timestamp', NOW()
    ),
    NOW()
FROM profiles
WHERE email = 'designbattlefield@gmail.com';
