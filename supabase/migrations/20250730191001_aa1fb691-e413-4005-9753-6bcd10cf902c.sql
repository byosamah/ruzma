-- Remove the default value for contract_status to allow null values when contract approval is disabled
ALTER TABLE public.projects ALTER COLUMN contract_status DROP DEFAULT;