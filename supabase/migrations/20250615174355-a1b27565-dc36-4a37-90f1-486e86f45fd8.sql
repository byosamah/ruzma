
-- MIGRATION: Comprehensive Security Hardening (Phase 1)
-- This migration hardens the security of the application by:
-- 1. Ensuring Row Level Security (RLS) is enabled on all critical tables.
-- 2. Removing any legacy, overly permissive policies.
-- 3. Establishing a secure baseline for data access for projects, milestones, and profiles.

-- Drop any legacy public read policies to ensure they are gone.
DROP POLICY IF EXISTS "Allow public read access to projects" ON public.projects;
DROP POLICY IF EXISTS "Allow public read access to milestones" ON public.milestones;

-- --- PROFILES TABLE SECURITY ---
-- Enable RLS on the profiles table.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop any potentially existing permissive policies on profiles before applying new ones.
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;


-- Create secure policies for the 'profiles' table.
-- 1. Users can view their own profile.
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- 2. Users can update their own profile.
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- --- PROJECTS TABLE SECURITY (RE-ASSERT) ---
-- Re-assert the correct policies for projects to override any previous insecure ones.
DROP POLICY IF EXISTS "Users can manage their own projects" ON public.projects;
CREATE POLICY "Users can manage their own projects"
ON public.projects FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- --- MILESTONES TABLE SECURITY (RE-ASSERT) ---
-- Re-assert the correct policies for milestones.
DROP POLICY IF EXISTS "Users can manage milestones for their projects" ON public.milestones;
CREATE POLICY "Users can manage milestones for their projects"
ON public.milestones FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.projects
  WHERE projects.id = milestones.project_id AND projects.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.projects
  WHERE projects.id = milestones.project_id AND projects.user_id = auth.uid()
));
