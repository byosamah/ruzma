-- Add support for lifetime plans (one-time payment)
-- This enables Pro plan to be a true lifetime purchase instead of monthly subscription

-- Add payment type to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN payment_type TEXT DEFAULT 'recurring' CHECK (payment_type IN ('recurring', 'lifetime')),
ADD COLUMN lifetime_purchased_at TIMESTAMPTZ NULL;

-- Add constraint to ensure lifetime plans have purchase timestamp
ALTER TABLE public.subscriptions 
ADD CONSTRAINT chk_lifetime_plans_have_purchase_date 
CHECK (
  (payment_type = 'lifetime' AND lifetime_purchased_at IS NOT NULL) OR 
  (payment_type = 'recurring')
);

-- Create index for lifetime plan queries
CREATE INDEX idx_subscriptions_payment_type ON public.subscriptions(payment_type);
CREATE INDEX idx_subscriptions_lifetime_purchased ON public.subscriptions(lifetime_purchased_at) 
WHERE payment_type = 'lifetime';

-- Update subscription plan limits to reflect new Pro plan structure
UPDATE public.subscription_plan_limits 
SET 
  trial_days = 0,  -- No trial for lifetime plan
  features = jsonb_set(
    features, 
    '{ai_features}', 
    'false'::jsonb  -- Disable AI features for Pro plan
  )
WHERE plan = 'pro';

-- Add AI features flag to Plus plan (enabled)
UPDATE public.subscription_plan_limits 
SET features = jsonb_set(
  features, 
  '{ai_features}', 
  'true'::jsonb
)
WHERE plan = 'plus';

-- Add AI features flag to Free plan (disabled)
UPDATE public.subscription_plan_limits 
SET features = jsonb_set(
  features, 
  '{ai_features}', 
  'false'::jsonb
)
WHERE plan = 'free';

-- Create function to check if subscription is lifetime and valid
CREATE OR REPLACE FUNCTION public.is_lifetime_subscription_valid(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  lifetime_sub public.subscriptions;
BEGIN
  SELECT * INTO lifetime_sub
  FROM public.subscriptions
  WHERE user_id = user_uuid
    AND payment_type = 'lifetime'
    AND status = 'active'
    AND lifetime_purchased_at IS NOT NULL
  ORDER BY created_at DESC
  LIMIT 1;
  
  RETURN (lifetime_sub.id IS NOT NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing subscription validity check to include lifetime plans
CREATE OR REPLACE FUNCTION public.is_subscription_active(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  subscription public.subscriptions;
BEGIN
  -- First check for lifetime subscription
  IF public.is_lifetime_subscription_valid(user_uuid) THEN
    RETURN true;
  END IF;
  
  -- Check regular subscription
  SELECT * INTO subscription FROM public.get_user_active_subscription(user_uuid);
  
  IF subscription.id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Skip expiration checks for lifetime plans
  IF subscription.payment_type = 'lifetime' THEN
    RETURN true;
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_lifetime_subscription_valid(UUID) TO authenticated, service_role;

-- Add helpful view for active subscriptions including lifetime
CREATE OR REPLACE VIEW public.active_subscriptions AS
SELECT 
  s.*,
  p.full_name,
  p.email,
  CASE 
    WHEN s.payment_type = 'lifetime' THEN 'Lifetime Access'
    WHEN s.status = 'on_trial' THEN 'Trial Period'
    WHEN s.status = 'active' THEN 'Active Subscription'
    ELSE s.status
  END as subscription_description
FROM public.subscriptions s
JOIN public.profiles p ON p.id = s.user_id
WHERE s.status IN ('active', 'on_trial')
  OR (s.payment_type = 'lifetime' AND s.lifetime_purchased_at IS NOT NULL);

-- Grant access to the view
GRANT SELECT ON public.active_subscriptions TO authenticated, service_role;

-- Add comment for documentation
COMMENT ON COLUMN public.subscriptions.payment_type IS 'Type of payment: recurring (monthly) or lifetime (one-time)';
COMMENT ON COLUMN public.subscriptions.lifetime_purchased_at IS 'Timestamp when lifetime plan was purchased (one-time payment completed)';
COMMENT ON FUNCTION public.is_lifetime_subscription_valid(UUID) IS 'Check if user has a valid lifetime subscription';

-- Update trigger description
COMMENT ON TRIGGER subscriptions_updated_at_trigger ON public.subscriptions IS 'Automatically update updated_at timestamp on row changes';