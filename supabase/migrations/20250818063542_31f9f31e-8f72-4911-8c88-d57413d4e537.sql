-- Analyze and fix client data security by improving RLS policies
-- Remove potentially conflicting policies and create more specific, secure ones

-- First, drop all existing policies to start fresh
DROP POLICY IF EXISTS "Secure client access" ON public.clients;
DROP POLICY IF EXISTS "Users can create their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON public.clients;

-- Create specific, secure policies for each operation
-- SELECT: Users can only view their own clients
CREATE POLICY "Users can view their own clients"
ON public.clients
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- INSERT: Users can only create clients for themselves
CREATE POLICY "Users can create their own clients"
ON public.clients
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own clients
CREATE POLICY "Users can update their own clients"
ON public.clients
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only delete their own clients
CREATE POLICY "Users can delete their own clients"
ON public.clients
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Ensure RLS is enabled (should already be enabled but making sure)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;