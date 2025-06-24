
-- Add slug column to projects table
ALTER TABLE public.projects 
ADD COLUMN slug TEXT;

-- Create index on slug for better performance
CREATE INDEX idx_projects_slug ON public.projects(slug);

-- Create a function to generate URL-friendly slugs
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;

-- Function to ensure unique slugs
CREATE OR REPLACE FUNCTION ensure_unique_slug(base_slug TEXT, user_id_param UUID, project_id_param UUID DEFAULT NULL)
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;

-- Update existing projects to have slugs based on their names
UPDATE public.projects 
SET slug = ensure_unique_slug(generate_slug(name), user_id, id)
WHERE slug IS NULL;

-- Make slug NOT NULL after populating existing records
ALTER TABLE public.projects 
ALTER COLUMN slug SET NOT NULL;

-- Add unique constraint for user_id + slug combination
ALTER TABLE public.projects 
ADD CONSTRAINT unique_user_slug UNIQUE (user_id, slug);

-- Create trigger to auto-generate slugs for new projects
CREATE OR REPLACE FUNCTION auto_generate_project_slug()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_generate_project_slug
  BEFORE INSERT OR UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_project_slug();
