
-- Create policy that allows users to INSERT their own profile.
-- This complements the existing trigger-based profile creation and adheres to security best practices.
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);
