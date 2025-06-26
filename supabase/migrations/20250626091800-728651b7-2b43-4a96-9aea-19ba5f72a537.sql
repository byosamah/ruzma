
-- Fix the security warning by setting a secure search_path for the auto_generate_project_slug function
CREATE OR REPLACE FUNCTION public.auto_generate_project_slug()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Generate slug on INSERT
  IF TG_OP = 'INSERT' THEN
    NEW.slug := ensure_unique_slug(generate_slug(NEW.name), NEW.user_id);
  END IF;
  
  -- Update slug on UPDATE if name changed
  IF TG_OP = 'UPDATE' AND OLD.name != NEW.name THEN
    NEW.slug := ensure_unique_slug(generate_slug(NEW.name), NEW.user_id, NEW.id);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Also fix the related functions to ensure they have secure search_path
CREATE OR REPLACE FUNCTION public.generate_slug(input_text text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  slug_text TEXT;
BEGIN
  -- Convert to lowercase and replace spaces/special chars with hyphens
  slug_text := LOWER(TRIM(input_text));
  slug_text := REGEXP_REPLACE(slug_text, '[^a-z0-9\s-]', '', 'g');
  slug_text := REGEXP_REPLACE(slug_text, '\s+', '-', 'g');
  slug_text := REGEXP_REPLACE(slug_text, '-+', '-', 'g');
  slug_text := TRIM(slug_text, '-');
  
  -- Ensure it's not empty
  IF LENGTH(slug_text) = 0 THEN
    slug_text := 'project';
  END IF;
  
  RETURN slug_text;
END;
$function$;

CREATE OR REPLACE FUNCTION public.ensure_unique_slug(base_slug text, user_id_param uuid, project_id_param uuid DEFAULT NULL::uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  final_slug := base_slug;
  
  -- Check if slug already exists for this user (excluding current project if updating)
  WHILE EXISTS (
    SELECT 1 FROM public.projects 
    WHERE slug = final_slug 
      AND user_id = user_id_param 
      AND (project_id_param IS NULL OR id != project_id_param)
  ) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_slug;
END;
$function$;
