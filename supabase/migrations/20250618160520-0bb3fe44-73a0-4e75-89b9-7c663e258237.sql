
-- First, let's try to create policies that might be missing, using IF NOT EXISTS where possible
-- For policies that don't support IF NOT EXISTS, we'll handle them individually

-- Check and create missing policies for projects table
DO $$
BEGIN
  -- Try to create each policy, ignore if it already exists
  BEGIN
    EXECUTE 'CREATE POLICY "Users can view their own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id)';
  EXCEPTION WHEN duplicate_object THEN
    -- Policy already exists, do nothing
  END;
  
  BEGIN
    EXECUTE 'CREATE POLICY "Users can insert their own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id)';
  EXCEPTION WHEN duplicate_object THEN
    -- Policy already exists, do nothing
  END;
  
  BEGIN
    EXECUTE 'CREATE POLICY "Users can update their own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
  EXCEPTION WHEN duplicate_object THEN
    -- Policy already exists, do nothing
  END;
  
  BEGIN
    EXECUTE 'CREATE POLICY "Users can delete their own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id)';
  EXCEPTION WHEN duplicate_object THEN
    -- Policy already exists, do nothing
  END;
END
$$;

-- Check and create missing policies for milestones table
DO $$
BEGIN
  BEGIN
    EXECUTE 'CREATE POLICY "Users can view milestones of their projects" ON public.milestones FOR SELECT USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = milestones.project_id AND projects.user_id = auth.uid()))';
  EXCEPTION WHEN duplicate_object THEN
    -- Policy already exists, do nothing
  END;
  
  BEGIN
    EXECUTE 'CREATE POLICY "Users can insert milestones for their projects" ON public.milestones FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = milestones.project_id AND projects.user_id = auth.uid()))';
  EXCEPTION WHEN duplicate_object THEN
    -- Policy already exists, do nothing
  END;
  
  BEGIN
    EXECUTE 'CREATE POLICY "Users can update milestones of their projects" ON public.milestones FOR UPDATE USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = milestones.project_id AND projects.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = milestones.project_id AND projects.user_id = auth.uid()))';
  EXCEPTION WHEN duplicate_object THEN
    -- Policy already exists, do nothing
  END;
  
  BEGIN
    EXECUTE 'CREATE POLICY "Users can delete milestones of their projects" ON public.milestones FOR DELETE USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = milestones.project_id AND projects.user_id = auth.uid()))';
  EXCEPTION WHEN duplicate_object THEN
    -- Policy already exists, do nothing
  END;
END
$$;

-- Check and create missing policies for profiles table
DO $$
BEGIN
  BEGIN
    EXECUTE 'CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id)';
  EXCEPTION WHEN duplicate_object THEN
    -- Policy already exists, do nothing
  END;
  
  BEGIN
    EXECUTE 'CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id)';
  EXCEPTION WHEN duplicate_object THEN
    -- Policy already exists, do nothing
  END;
END
$$;

-- Check and create missing policies for project_templates table
DO $$
BEGIN
  BEGIN
    EXECUTE 'CREATE POLICY "Users can view their own templates" ON public.project_templates FOR SELECT USING (auth.uid() = user_id)';
  EXCEPTION WHEN duplicate_object THEN
    -- Policy already exists, do nothing
  END;
  
  BEGIN
    EXECUTE 'CREATE POLICY "Users can insert their own templates" ON public.project_templates FOR INSERT WITH CHECK (auth.uid() = user_id)';
  EXCEPTION WHEN duplicate_object THEN
    -- Policy already exists, do nothing
  END;
  
  BEGIN
    EXECUTE 'CREATE POLICY "Users can update their own templates" ON public.project_templates FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
  EXCEPTION WHEN duplicate_object THEN
    -- Policy already exists, do nothing
  END;
  
  BEGIN
    EXECUTE 'CREATE POLICY "Users can delete their own templates" ON public.project_templates FOR DELETE USING (auth.uid() = user_id)';
  EXCEPTION WHEN duplicate_object THEN
    -- Policy already exists, do nothing
  END;
END
$$;

-- Check and create missing policies for subscriptions table
DO $$
BEGIN
  BEGIN
    EXECUTE 'CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id)';
  EXCEPTION WHEN duplicate_object THEN
    -- Policy already exists, do nothing
  END;
  
  BEGIN
    EXECUTE 'CREATE POLICY "Users can update their own subscriptions" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
  EXCEPTION WHEN duplicate_object THEN
    -- Policy already exists, do nothing
  END;
END
$$;

-- Enable RLS on all tables if not already enabled
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
