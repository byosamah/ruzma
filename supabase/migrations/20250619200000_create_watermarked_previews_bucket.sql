
-- Create storage bucket for watermarked previews
INSERT INTO storage.buckets (id, name, public)
VALUES ('watermarked-previews', 'watermarked-previews', true);

-- Create policy to allow authenticated users to upload watermarked previews
CREATE POLICY "Allow authenticated users to upload watermarked previews"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'watermarked-previews');

-- Create policy to allow public read access to watermarked previews
CREATE POLICY "Allow public read access to watermarked previews"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'watermarked-previews');

-- Create policy to allow authenticated users to delete their watermarked previews
CREATE POLICY "Allow authenticated users to delete watermarked previews"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'watermarked-previews');
