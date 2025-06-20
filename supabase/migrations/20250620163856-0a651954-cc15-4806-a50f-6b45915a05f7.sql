
-- Add unique constraint on user_id to allow upsert operations
ALTER TABLE public.freelancer_branding 
ADD CONSTRAINT freelancer_branding_user_id_unique UNIQUE (user_id);
