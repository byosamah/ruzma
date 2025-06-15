
-- MIGRATION 1: Secure Database Tables by Removing Public Access

-- This migration revokes public read access from the 'projects' and 'milestones' 
-- tables. This is a critical security measure to prevent unauthorized users from 
-- viewing sensitive project data.

-- Drop the policy that allows anyone to read from the projects table.
DROP POLICY IF EXISTS "Allow public read access to projects" ON public.projects;

-- Drop the policy that allows anyone to read from the milestones table.
DROP POLICY IF EXISTS "Allow public read access to milestones" ON public.milestones;


-- MIGRATION 2: Secure Storage Bucket by Removing Anonymous Uploads

-- This migration secures the 'payment-proofs' storage bucket by removing policies
-- that allow anonymous users to upload, update, or delete files. This prevents
-- potential abuse of your file storage.

-- Drop insecure policies that allow anyone to manage files.
DROP POLICY IF EXISTS "Anyone can upload payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for payment proofs" ON storage.objects; -- Drop old read policy just in case

-- Add a new policy that only allows authenticated users to upload files.
CREATE POLICY "Authenticated users can upload payment proofs"
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'payment-proofs');

-- Re-add public read access for payment proofs so they can be viewed by freelancers.
CREATE POLICY "Public can view payment proofs"
ON storage.objects
FOR SELECT
USING (bucket_id = 'payment-proofs');
