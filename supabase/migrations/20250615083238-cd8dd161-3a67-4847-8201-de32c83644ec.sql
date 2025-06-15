
-- First, let's ensure the payment-proofs bucket exists and is properly configured
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies and recreate them properly
DROP POLICY IF EXISTS "Authenticated users can upload payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own payment proofs" ON storage.objects;

-- Create policy to allow authenticated users to upload payment proofs
CREATE POLICY "Authenticated users can upload payment proofs" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'payment-proofs' 
  AND auth.role() = 'authenticated'
);

-- Create policy to allow public read access to payment proofs
CREATE POLICY "Public read access for payment proofs" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'payment-proofs');

-- Create policy to allow users to update their own payment proofs
CREATE POLICY "Users can update their own payment proofs" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'payment-proofs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy to allow users to delete their own payment proofs
CREATE POLICY "Users can delete their own payment proofs" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'payment-proofs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
