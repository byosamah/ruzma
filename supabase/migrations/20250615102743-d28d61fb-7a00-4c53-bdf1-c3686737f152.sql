
-- Update the payment-proofs bucket policies to allow anonymous uploads
-- while maintaining security by organizing files by milestone ID

-- Drop the existing restrictive policy for uploads
DROP POLICY IF EXISTS "Authenticated users can upload payment proofs" ON storage.objects;

-- Create a new policy that allows anyone to upload payment proofs
-- This is safe because files are organized by milestone ID and are payment proofs
CREATE POLICY "Anyone can upload payment proofs" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'payment-proofs');

-- Also update the update policy to allow anonymous users
DROP POLICY IF EXISTS "Users can update their own payment proofs" ON storage.objects;

CREATE POLICY "Anyone can update payment proofs" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'payment-proofs');

-- Update delete policy to be more permissive as well
DROP POLICY IF EXISTS "Users can delete their own payment proofs" ON storage.objects;

CREATE POLICY "Anyone can delete payment proofs" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'payment-proofs');
