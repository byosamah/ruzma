
-- Add the missing updated_at column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Update the subscriptions table to handle duplicates better
-- First, let's add a unique constraint on lemon_squeezy_id if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'subscriptions_lemon_squeezy_id_key'
    ) THEN
        ALTER TABLE public.subscriptions 
        ADD CONSTRAINT subscriptions_lemon_squeezy_id_key UNIQUE (lemon_squeezy_id);
    END IF;
END $$;

-- Create an index on user_id for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_lemon_squeezy_id ON public.subscriptions(lemon_squeezy_id);

-- Ensure all existing profiles have the updated_at column set
UPDATE public.profiles 
SET updated_at = COALESCE(updated_at, now()) 
WHERE updated_at IS NULL;

-- Make updated_at NOT NULL after setting defaults
ALTER TABLE public.profiles ALTER COLUMN updated_at SET NOT NULL;
