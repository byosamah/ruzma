-- Create subscriptions table to track user subscription data
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lemon_squeezy_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'on_trial', 'paused', 'unpaid')),
  product_id TEXT,
  variant_id TEXT NOT NULL,
  subscription_plan TEXT NOT NULL CHECK (subscription_plan IN ('free', 'plus', 'pro')),
  trial_ends_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_lemon_squeezy_id ON public.subscriptions(lemon_squeezy_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON public.subscriptions(expires_at);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own subscriptions" 
  ON public.subscriptions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all subscriptions" 
  ON public.subscriptions FOR ALL 
  USING (auth.role() = 'service_role');

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER subscriptions_updated_at_trigger
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_subscriptions_updated_at();

-- Add subscription plan limits table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.subscription_plan_limits (
  plan TEXT PRIMARY KEY CHECK (plan IN ('free', 'plus', 'pro')),
  max_projects INTEGER NOT NULL,
  max_clients INTEGER NOT NULL,
  max_storage_mb INTEGER NOT NULL,
  max_invoices INTEGER NOT NULL,
  features JSONB DEFAULT '{}',
  trial_days INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Insert default plan limits
INSERT INTO public.subscription_plan_limits (plan, max_projects, max_clients, max_storage_mb, max_invoices, features, trial_days)
VALUES 
  ('free', 1, 5, 100, 5, '{"customBranding": false, "advancedAnalytics": false, "prioritySupport": false}', 0),
  ('plus', 50, 100, 5000, 100, '{"customBranding": true, "advancedAnalytics": true, "prioritySupport": false}', 7),
  ('pro', -1, -1, -1, -1, '{"customBranding": true, "advancedAnalytics": true, "prioritySupport": true}', 14)
ON CONFLICT (plan) DO UPDATE SET
  max_projects = EXCLUDED.max_projects,
  max_clients = EXCLUDED.max_clients,
  max_storage_mb = EXCLUDED.max_storage_mb,
  max_invoices = EXCLUDED.max_invoices,
  features = EXCLUDED.features,
  trial_days = EXCLUDED.trial_days;

-- Enable RLS for plan limits (read-only for all authenticated users)
ALTER TABLE public.subscription_plan_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view plan limits" 
  ON public.subscription_plan_limits FOR SELECT 
  USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Create helper function to get user's current subscription
CREATE OR REPLACE FUNCTION public.get_user_active_subscription(user_uuid UUID)
RETURNS public.subscriptions AS $$
DECLARE
  subscription public.subscriptions;
BEGIN
  SELECT * INTO subscription
  FROM public.subscriptions
  WHERE user_id = user_uuid
    AND status IN ('active', 'on_trial')
  ORDER BY created_at DESC
  LIMIT 1;
  
  RETURN subscription;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check subscription validity
CREATE OR REPLACE FUNCTION public.is_subscription_active(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  subscription public.subscriptions;
BEGIN
  SELECT * INTO subscription FROM public.get_user_active_subscription(user_uuid);
  
  IF subscription.id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if subscription is expired
  IF subscription.expires_at IS NOT NULL AND subscription.expires_at < now() THEN
    RETURN false;
  END IF;
  
  -- Check if trial is expired
  IF subscription.trial_ends_at IS NOT NULL AND subscription.trial_ends_at < now() AND subscription.status = 'on_trial' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT ALL ON public.subscriptions TO service_role;
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscription_plan_limits TO service_role;
GRANT SELECT ON public.subscription_plan_limits TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_user_active_subscription(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_subscription_active(UUID) TO authenticated, service_role;