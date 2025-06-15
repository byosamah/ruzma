
-- PHASE 1: COMPREHENSIVE SECURITY UPDATE FOR CLIENT PORTAL ACCESS

-- 1. Secure Projects Table: Allow only authorized user or valid client token to view.
DROP POLICY IF EXISTS "Allow public read access to projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;

-- Allow SELECT if user owns the project (existing) OR if a valid client_access_token is supplied (for client portal routes/functions).
-- WARNING: This policy allows access ONLY if a JWT is present OR the query is being executed by the service role (i.e. Edge Function). 
-- For client portal, always go via edge function with the valid client_access_token match only.
CREATE POLICY "User or client token can view a project"
ON public.projects
FOR SELECT
USING (
  (auth.uid() = user_id)
  OR
  (client_access_token::text = current_setting('request.jwt.claims', true)::json->>'client_access_token')
);

-- 2. Secure Milestones Table: Allow only legitimate users or valid client tokens
DROP POLICY IF EXISTS "Allow public read access to milestones" ON public.milestones;
DROP POLICY IF EXISTS "Users can view milestones of their own projects" ON public.milestones;

CREATE POLICY "User or client token can view milestones"
ON public.milestones
FOR SELECT
USING (
  -- If user is owner, allow
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = project_id AND user_id = auth.uid()
  )
  -- Or if client_access_token is set in request claims and matches parent project
  OR EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = project_id
      AND client_access_token::text = current_setting('request.jwt.claims', true)::json->>'client_access_token'
  )
);

-- 3. Secure payment-proofs bucket: Remove anonymous upload policies, allow only authenticated user or edge function service key.
DROP POLICY IF EXISTS "Anyone can upload payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete payment proofs" ON storage.objects;

-- ONLY authenticated users or edge function (service-key) can upload/update/delete, i.e. via approved backend logic.
CREATE POLICY "Authenticated users and service role can manage payment proofs"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'payment-proofs' 
  AND (
    auth.role() = 'authenticated'
    OR auth.role() = 'service_role' -- for edge functions only
  )
);

-- Read should remain public for proof viewing/transparency
DROP POLICY IF EXISTS "Public can view payment proofs" ON storage.objects;
CREATE POLICY "Public read access for payment proofs"
ON storage.objects
FOR SELECT
USING (bucket_id = 'payment-proofs');

-- 4. Harden profiles table view/update policies to only allow authenticated user
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- NOTE: DELIVERABLES bucket is already public "read", uploads restricted to authenticated users

