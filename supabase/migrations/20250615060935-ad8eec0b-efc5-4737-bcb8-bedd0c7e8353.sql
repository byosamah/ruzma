
-- Create storage bucket for deliverables
INSERT INTO storage.buckets (id, name, public)
VALUES ('deliverables', 'deliverables', false);

-- Create policy to allow authenticated users to upload their own deliverables
CREATE POLICY "Users can upload deliverables" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'deliverables' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy to allow users to view their own deliverables
CREATE POLICY "Users can view their own deliverables" ON storage.objects
FOR SELECT USING (
  bucket_id = 'deliverables' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy to allow users to update their own deliverables
CREATE POLICY "Users can update their own deliverables" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'deliverables' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy to allow users to delete their own deliverables
CREATE POLICY "Users can delete their own deliverables" ON storage.objects
FOR DELETE USING (
  bucket_id = 'deliverables' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
