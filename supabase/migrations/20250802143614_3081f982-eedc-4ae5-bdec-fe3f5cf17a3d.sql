-- Create a function to automatically create user profiles when they sign up
-- This will solve the profile fetch error that's causing the infinite loading loop

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, user_type, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    'free',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert a profile for the existing user to fix the current error
INSERT INTO public.profiles (id, full_name, email, user_type, created_at, updated_at, project_count, storage_used)
VALUES (
  '7cca4fec-769b-49a1-8f0c-1059492456a3',
  'Test User',
  'test@example.com',
  'free',
  NOW(),
  NOW(),
  0,
  0
) 
ON CONFLICT (id) DO NOTHING;