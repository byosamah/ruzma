
-- Enable RLS on projects table if not already enabled
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Enable RLS on milestones table if not already enabled  
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read projects (for client portal access)
CREATE POLICY "Allow public read access to projects" 
ON public.projects 
FOR SELECT 
USING (true);

-- Allow anyone to read milestones (for client portal access)
CREATE POLICY "Allow public read access to milestones" 
ON public.milestones 
FOR SELECT 
USING (true);

-- Allow authenticated users to manage their own projects
CREATE POLICY "Users can manage their own projects" 
ON public.projects 
FOR ALL 
USING (auth.uid() = user_id);

-- Allow authenticated users to manage milestones for their projects
CREATE POLICY "Users can manage milestones for their projects" 
ON public.milestones 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = milestones.project_id 
    AND projects.user_id = auth.uid()
  )
);
