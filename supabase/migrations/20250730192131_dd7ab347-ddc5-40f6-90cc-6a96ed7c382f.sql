-- Fix existing projects where contract_required is false but contract_status is still set
UPDATE public.projects 
SET contract_status = NULL 
WHERE contract_required = false AND contract_status IS NOT NULL;