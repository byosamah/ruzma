-- Enable Row Level Security for all tables to secure user data
-- This fixes the critical security vulnerabilities identified in the security review

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only access their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Enable RLS on clients table
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Clients: Users can only access their own clients
CREATE POLICY "Users can view their own clients" 
ON public.clients 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clients" 
ON public.clients 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients" 
ON public.clients 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients" 
ON public.clients 
FOR DELETE 
USING (auth.uid() = user_id);

-- Enable RLS on projects table
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Projects: Users can only access their own projects
CREATE POLICY "Users can view their own projects" 
ON public.projects 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" 
ON public.projects 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" 
ON public.projects 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" 
ON public.projects 
FOR DELETE 
USING (auth.uid() = user_id);

-- Enable RLS on milestones table
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

-- Milestones: Users can only access milestones for their own projects
CREATE POLICY "Users can view milestones for their own projects" 
ON public.milestones 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = milestones.project_id 
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create milestones for their own projects" 
ON public.milestones 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = milestones.project_id 
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update milestones for their own projects" 
ON public.milestones 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = milestones.project_id 
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete milestones for their own projects" 
ON public.milestones 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = milestones.project_id 
    AND projects.user_id = auth.uid()
  )
);

-- Enable RLS on invoices table
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Invoices: Users can only access their own invoices
CREATE POLICY "Users can view their own invoices" 
ON public.invoices 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own invoices" 
ON public.invoices 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoices" 
ON public.invoices 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoices" 
ON public.invoices 
FOR DELETE 
USING (auth.uid() = user_id);

-- Enable RLS on notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Notifications: Users can only access their own notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" 
ON public.notifications 
FOR DELETE 
USING (auth.uid() = user_id);

-- Enable RLS on freelancer_branding table
ALTER TABLE public.freelancer_branding ENABLE ROW LEVEL SECURITY;

-- Freelancer branding: Users can only access their own branding
CREATE POLICY "Users can view their own branding" 
ON public.freelancer_branding 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own branding" 
ON public.freelancer_branding 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own branding" 
ON public.freelancer_branding 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own branding" 
ON public.freelancer_branding 
FOR DELETE 
USING (auth.uid() = user_id);

-- Enable RLS on project_templates table
ALTER TABLE public.project_templates ENABLE ROW LEVEL SECURITY;

-- Project templates: Users can only access their own templates
CREATE POLICY "Users can view their own templates" 
ON public.project_templates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own templates" 
ON public.project_templates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" 
ON public.project_templates 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" 
ON public.project_templates 
FOR DELETE 
USING (auth.uid() = user_id);

-- Enable RLS on subscriptions table
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Subscriptions: Users can only access their own subscriptions
CREATE POLICY "Users can view their own subscriptions" 
ON public.subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions" 
ON public.subscriptions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" 
ON public.subscriptions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Enable RLS on user_plan_limits table
ALTER TABLE public.user_plan_limits ENABLE ROW LEVEL SECURITY;

-- User plan limits: Allow read access to all authenticated users for plan information
CREATE POLICY "Authenticated users can view plan limits" 
ON public.user_plan_limits 
FOR SELECT 
TO authenticated 
USING (true);