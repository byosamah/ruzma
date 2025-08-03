-- Update existing projects with hardcoded USD to use user's preferred currency
UPDATE projects 
SET freelancer_currency = profiles.currency
FROM profiles 
WHERE projects.user_id = profiles.id 
  AND projects.freelancer_currency = 'USD' 
  AND profiles.currency IS NOT NULL 
  AND profiles.currency != 'USD';