
-- Add email column to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN email text;

-- Update existing profiles with email from auth.users
-- This will populate the email field for existing users
UPDATE public.profiles 
SET email = auth.users.email 
FROM auth.users 
WHERE profiles.id = auth.users.id;

-- Update the handle_new_user function to include email when creating new profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name', 
    NEW.email
  );
  RETURN NEW;
END;
$function$;
