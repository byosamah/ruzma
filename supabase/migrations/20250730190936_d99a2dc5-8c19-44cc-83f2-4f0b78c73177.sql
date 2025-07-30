-- Check the default value for contract_status in projects table
SELECT column_name, column_default, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND column_name = 'contract_status';