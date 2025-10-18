-- Check if subscriptions table exists and show its structure
SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_name = 'subscriptions'
) AS subscriptions_table_exists;

-- If it exists, show the columns
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'subscriptions'
ORDER BY ordinal_position;

-- Show any data in the table
SELECT COUNT(*) as total_subscriptions FROM subscriptions;

-- Show recent subscriptions if any
SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 5;
