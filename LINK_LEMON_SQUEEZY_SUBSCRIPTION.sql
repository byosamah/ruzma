-- Link existing Lemon Squeezy subscription to user account
-- Run this in Supabase SQL Editor ONLY if you have the subscription ID from Lemon Squeezy

-- ========================================
-- INSTRUCTIONS:
-- 1. Go to: https://app.lemonsqueezy.com/subscriptions
-- 2. Find your subscription for designbattlefield@gmail.com
-- 3. Copy the Subscription ID (it's a number like "123456")
-- 4. Replace "YOUR_SUBSCRIPTION_ID" below with that number
-- 5. Run this query
-- ========================================

-- Example: If subscription ID is 123456 from Lemon Squeezy
-- Replace the values below with your actual data:

INSERT INTO subscriptions (
    user_id,
    lemon_squeezy_id,
    status,
    variant_id,
    created_at,
    updated_at,
    expires_at
) VALUES (
    '9a7aa147-04ee-4f06-b75f-44f151e0f7a7',  -- designbattlefield@gmail.com user ID
    'YOUR_SUBSCRIPTION_ID',  -- Replace with actual subscription ID from Lemon Squeezy
    'active',
    '697231',  -- Plus plan variant ID
    NOW(),
    NOW(),
    NOW() + INTERVAL '1 month'  -- Adjust based on when it actually renews
);

-- Update profile to link the subscription
UPDATE profiles
SET subscription_id = 'YOUR_SUBSCRIPTION_ID'  -- Same ID as above
WHERE id = '9a7aa147-04ee-4f06-b75f-44f151e0f7a7';

-- Verify the link
SELECT
    p.email,
    p.user_type,
    p.subscription_status,
    p.subscription_id,
    s.lemon_squeezy_id,
    s.variant_id,
    s.expires_at
FROM profiles p
LEFT JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'designbattlefield@gmail.com';
