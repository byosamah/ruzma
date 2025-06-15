
-- Ensure the deliverables bucket is properly configured
UPDATE storage.buckets 
SET public = true 
WHERE id = 'deliverables';

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Public read access for deliverables" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload deliverables" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own deliverables" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own deliverables" ON storage.objects;

-- Create a policy to allow public access to deliverables (since bucket is public)
CREATE POLICY "Public read access for deliverables" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'deliverables');

-- Create a policy to allow authenticated users to upload deliverables
CREATE POLICY "Authenticated users can upload deliverables" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'deliverables' 
  AND auth.role() = 'authenticated'
);

-- Create a policy to allow users to update their own deliverables
CREATE POLICY "Users can update their own deliverables" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'deliverables' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create a policy to allow users to delete their own deliverables
CREATE POLICY "Users can delete their own deliverables" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'deliverables' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
