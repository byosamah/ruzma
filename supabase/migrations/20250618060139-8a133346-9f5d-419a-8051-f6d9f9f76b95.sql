
-- Add user_type and subscription fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN user_type text DEFAULT 'free' CHECK (user_type IN ('free', 'plus')),
ADD COLUMN storage_used bigint DEFAULT 0,
ADD COLUMN project_count integer DEFAULT 0,
ADD COLUMN subscription_id text,
ADD COLUMN subscription_status text,
ADD COLUMN grace_period_end timestamp with time zone;

-- Create subscriptions table to track subscription history
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lemon_squeezy_id text UNIQUE NOT NULL,
  status text NOT NULL,
  variant_id text NOT NULL,
  product_id text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  cancelled_at timestamp with time zone,
  expires_at timestamp with time zone
);

-- Enable RLS on subscriptions table
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
FOR SELECT USING (user_id = auth.uid());

-- Policy for service role to manage subscriptions (for webhooks)
CREATE POLICY "Service role can manage subscriptions" ON public.subscriptions
FOR ALL USING (true);

-- Create function to check user limits
CREATE OR REPLACE FUNCTION public.check_user_limits(
  _user_id uuid,
  _action text, -- 'project' or 'storage'
  _size bigint DEFAULT 0
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _user_type text;
  _current_count integer;
  _current_storage bigint;
BEGIN
  -- Get user type and current usage
  SELECT user_type, project_count, storage_used 
  INTO _user_type, _current_count, _current_storage
  FROM public.profiles 
  WHERE id = _user_id;
  
  -- Check project limits
  IF _action = 'project' THEN
    IF _user_type = 'free' AND _current_count >= 2 THEN
      RETURN false;
    END IF;
  END IF;
  
  -- Check storage limits
  IF _action = 'storage' THEN
    IF _user_type = 'free' AND (_current_storage + _size) > 524288000 THEN -- 500MB in bytes
      RETURN false;
    END IF;
    IF _user_type = 'plus' AND (_current_storage + _size) > 10737418240 THEN -- 10GB in bytes
      RETURN false;
    END IF;
  END IF;
  
  RETURN true;
END;
$$;

-- Create function to update user storage usage
CREATE OR REPLACE FUNCTION public.update_user_storage(
  _user_id uuid,
  _size_change bigint
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET storage_used = GREATEST(0, storage_used + _size_change),
      updated_at = now()
  WHERE id = _user_id;
END;
$$;

-- Create function to update project count
CREATE OR REPLACE FUNCTION public.update_project_count(
  _user_id uuid,
  _count_change integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET project_count = GREATEST(0, project_count + _count_change),
      updated_at = now()
  WHERE id = _user_id;
END;
$$;
