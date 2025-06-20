
-- Update the handle_new_user function to include currency from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, currency)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name', 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'currency', 'USD')
  );
  RETURN NEW;
END;
$function$;
