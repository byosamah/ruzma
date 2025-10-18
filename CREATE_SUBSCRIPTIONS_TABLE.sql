-- Create Subscriptions Table for Lemon Squeezy Integration
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/***REMOVED***/sql

-- Step 1: Check if table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_name = 'subscriptions'
) AS table_exists;

-- Step 2: Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lemon_squeezy_id TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL,
    variant_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- Step 3: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_lemon_squeezy_id ON subscriptions(lemon_squeezy_id);

-- Step 4: Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON subscriptions;

-- Step 6: Create RLS policies
CREATE POLICY "Users can view own subscriptions"
    ON subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions"
    ON subscriptions FOR ALL
    USING (auth.role() = 'service_role');

-- Step 7: Verify table creation
SELECT
    table_name,
    (SELECT COUNT(*) FROM subscriptions) as row_count
FROM information_schema.tables
WHERE table_name = 'subscriptions';

-- Expected Output:
-- table_name: subscriptions
-- row_count: 0 (or more if data exists)
