-- Fix project limits for Plus and Pro plans to be unlimited
-- Free plan stays at 1 project, Plus and Pro get unlimited (999999)

UPDATE public.user_plan_limits 
SET project_limit = 999999 
WHERE user_type IN ('plus', 'pro');

-- Add a comment to document the limits
COMMENT ON TABLE public.user_plan_limits IS 'Stores plan limits for different user types. Free=1 project, Plus/Pro=unlimited (999999)';