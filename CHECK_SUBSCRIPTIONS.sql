-- Check Subscriptions Table Structure and Data
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/***REMOVED***/sql/new

-- ========================================
-- STEP 1: Verify table exists
-- ========================================
SELECT 'Table exists!' as status
FROM information_schema.tables
WHERE table_name = 'subscriptions';

-- ========================================
-- STEP 2: Show table structure
-- ========================================
SELECT
    column_name as "Column",
    data_type as "Type",
    is_nullable as "Nullable",
    column_default as "Default"
FROM information_schema.columns
WHERE table_name = 'subscriptions'
ORDER BY ordinal_position;

-- ========================================
-- STEP 3: Count total subscriptions
-- ========================================
SELECT COUNT(*) as "Total Subscriptions" FROM subscriptions;

-- ========================================
-- STEP 4: Show all subscriptions (if any)
-- ========================================
SELECT
    id,
    user_id,
    lemon_squeezy_id,
    status,
    variant_id,
    created_at,
    updated_at,
    expires_at
FROM subscriptions
ORDER BY created_at DESC;

-- ========================================
-- STEP 5: Check for designbattlefield@gmail.com user
-- ========================================
SELECT
    p.id as user_id,
    p.email,
    p.user_type as "Current Plan",
    p.subscription_status as "Status",
    p.subscription_id as "Subscription ID",
    s.lemon_squeezy_id,
    s.variant_id,
    s.expires_at
FROM profiles p
LEFT JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'designbattlefield@gmail.com';

-- Expected columns in subscriptions table:
-- - id (uuid)
-- - user_id (uuid)
-- - lemon_squeezy_id (text)
-- - status (text)
-- - variant_id (text)
-- - created_at (timestamptz)
-- - updated_at (timestamptz)
-- - expires_at (timestamptz)
