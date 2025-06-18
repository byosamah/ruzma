
-- Check if there's a constraint preventing 'pro' as a valid user_type
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass 
AND contype = 'c';

-- Check current user_type values in the database
SELECT DISTINCT user_type, COUNT(*) 
FROM public.profiles 
GROUP BY user_type;

-- Check if there are any failed subscription updates for pro plans
SELECT 
    user_id,
    variant_id,
    status,
    created_at,
    updated_at
FROM public.subscriptions 
WHERE variant_id = '697237'  -- Pro plan variant ID
ORDER BY created_at DESC;

-- Add 'pro' to the user_type constraint if it's missing
DO $$ 
BEGIN
    -- First, check if there's a constraint that doesn't include 'pro'
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'public.profiles'::regclass 
        AND contype = 'c' 
        AND conname LIKE '%user_type%'
        AND pg_get_constraintdef(oid) NOT LIKE '%pro%'
    ) THEN
        -- Drop the existing constraint
        ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_type_check;
        
        -- Add the correct constraint that includes 'pro'
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_user_type_check 
        CHECK (user_type IN ('free', 'plus', 'pro'));
        
        RAISE NOTICE 'Updated user_type constraint to include pro tier';
    ELSIF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'public.profiles'::regclass 
        AND contype = 'c' 
        AND conname LIKE '%user_type%'
    ) THEN
        -- No constraint exists, create one
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_user_type_check 
        CHECK (user_type IN ('free', 'plus', 'pro'));
        
        RAISE NOTICE 'Created user_type constraint with pro tier included';
    ELSE
        RAISE NOTICE 'user_type constraint already includes pro tier';
    END IF;
END $$;
