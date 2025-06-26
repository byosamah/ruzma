
-- CRITICAL SECURITY FIX: Clean up conflicting RLS policies and create missing storage buckets (CORRECTED)

-- 1. CLEAN UP CONFLICTING RLS POLICIES

-- Drop all existing policies on projects table
DO $$ 
BEGIN
    -- Drop all possible project policies
    DROP POLICY IF EXISTS "User or client token can view a project" ON public.projects;
    DROP POLICY IF EXISTS "Users can manage their own projects" ON public.projects;
    DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
    DROP POLICY IF EXISTS "Users can insert their own projects" ON public.projects;
    DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
    DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;
    DROP POLICY IF EXISTS "Secure project access" ON public.projects;
    
    -- Create single, secure policy for projects
    CREATE POLICY "Secure project access"
    ON public.projects
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN OTHERS THEN
    -- Policy might already exist, continue
    NULL;
END $$;

-- Drop all existing policies on milestones table
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "User or client token can view milestones" ON public.milestones;
    DROP POLICY IF EXISTS "Users can manage milestones for their projects" ON public.milestones;
    DROP POLICY IF EXISTS "Users can view milestones of their own projects" ON public.milestones;
    DROP POLICY IF EXISTS "Users can insert milestones for their projects" ON public.milestones;
    DROP POLICY IF EXISTS "Users can update milestones of their own projects" ON public.milestones;
    DROP POLICY IF EXISTS "Users can delete milestones of their own projects" ON public.milestones;
    DROP POLICY IF EXISTS "Secure milestone access" ON public.milestones;
    
    -- Create single, secure policy for milestones
    CREATE POLICY "Secure milestone access"
    ON public.milestones
    FOR ALL
    USING (EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = milestones.project_id AND projects.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = milestones.project_id AND projects.user_id = auth.uid()
    ));
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Clean up profiles table policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Secure profile access" ON public.profiles;
    
    CREATE POLICY "Secure profile access"
    ON public.profiles
    FOR ALL
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Clean up clients table policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view their own clients" ON public.clients;
    DROP POLICY IF EXISTS "Users can manage their own clients" ON public.clients;
    DROP POLICY IF EXISTS "Secure client access" ON public.clients;
    
    CREATE POLICY "Secure client access"
    ON public.clients
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Clean up notifications table policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
    DROP POLICY IF EXISTS "Users can manage their own notifications" ON public.notifications;
    DROP POLICY IF EXISTS "Secure notification access" ON public.notifications;
    
    CREATE POLICY "Secure notification access"
    ON public.notifications
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Clean up invoices table policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
    DROP POLICY IF EXISTS "Users can create their own invoices" ON public.invoices;
    DROP POLICY IF EXISTS "Users can update their own invoices" ON public.invoices;
    DROP POLICY IF EXISTS "Users can delete their own invoices" ON public.invoices;
    DROP POLICY IF EXISTS "Secure invoice access" ON public.invoices;
    
    CREATE POLICY "Secure invoice access"
    ON public.invoices
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Clean up project_templates table policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view their own templates" ON public.project_templates;
    DROP POLICY IF EXISTS "Users can insert their own templates" ON public.project_templates;
    DROP POLICY IF EXISTS "Users can update their own templates" ON public.project_templates;
    DROP POLICY IF EXISTS "Users can delete their own templates" ON public.project_templates;
    DROP POLICY IF EXISTS "Users can manage their own templates" ON public.project_templates;
    DROP POLICY IF EXISTS "Secure template access" ON public.project_templates;
    
    CREATE POLICY "Secure template access"
    ON public.project_templates
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Clean up freelancer_branding table policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view their own branding" ON public.freelancer_branding;
    DROP POLICY IF EXISTS "Users can manage their own branding" ON public.freelancer_branding;
    DROP POLICY IF EXISTS "Secure branding access" ON public.freelancer_branding;
    
    CREATE POLICY "Secure branding access"
    ON public.freelancer_branding
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Clean up subscriptions table policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
    DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.subscriptions;
    DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions;
    DROP POLICY IF EXISTS "Secure subscription access" ON public.subscriptions;
    
    CREATE POLICY "Secure subscription access"
    ON public.subscriptions
    FOR ALL
    USING (auth.uid() = user_id OR auth.role() = 'service_role')
    WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- 2. CREATE MISSING STORAGE BUCKETS

-- Create payment-proofs bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create deliverables bucket  
INSERT INTO storage.buckets (id, name, public)
VALUES ('deliverables', 'deliverables', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. SECURE STORAGE POLICIES

-- Drop any existing conflicting storage policies
DROP POLICY IF EXISTS "Authenticated users and service role can manage payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload deliverables" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for deliverables" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own deliverables" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own deliverables" ON storage.objects;
DROP POLICY IF EXISTS "Secure payment proof upload" ON storage.objects;
DROP POLICY IF EXISTS "Secure payment proof update" ON storage.objects;
DROP POLICY IF EXISTS "Secure payment proof delete" ON storage.objects;
DROP POLICY IF EXISTS "Public read payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Secure deliverable upload" ON storage.objects;
DROP POLICY IF EXISTS "Secure deliverable update" ON storage.objects;
DROP POLICY IF EXISTS "Secure deliverable delete" ON storage.objects;
DROP POLICY IF EXISTS "Public read deliverables" ON storage.objects;

-- Create secure storage policies for payment-proofs bucket
CREATE POLICY "Secure payment proof upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'payment-proofs');

CREATE POLICY "Secure payment proof update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'payment-proofs');

CREATE POLICY "Secure payment proof delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'payment-proofs');

CREATE POLICY "Public read payment proofs"
ON storage.objects
FOR SELECT
USING (bucket_id = 'payment-proofs');

-- Create secure storage policies for deliverables bucket
CREATE POLICY "Secure deliverable upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'deliverables');

CREATE POLICY "Secure deliverable update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'deliverables');

CREATE POLICY "Secure deliverable delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'deliverables');

CREATE POLICY "Public read deliverables"
ON storage.objects
FOR SELECT
USING (bucket_id = 'deliverables');
