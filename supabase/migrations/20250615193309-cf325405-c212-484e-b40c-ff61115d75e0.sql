
-- Add notification_settings column to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN notification_settings JSONB DEFAULT '{
  "projectUpdates": true,
  "paymentReminders": true,
  "milestoneUpdates": true,
  "marketing": false
}'::jsonb;
