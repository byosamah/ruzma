-- Add country column to profiles table
ALTER TABLE public.profiles ADD COLUMN country TEXT;
CREATE INDEX idx_profiles_country ON public.profiles(country);

-- Update handle_new_user function to support country from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, currency, country)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name', 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'currency', 'USD'),
    NEW.raw_user_meta_data->>'country'
  );
  RETURN NEW;
END;
$function$;