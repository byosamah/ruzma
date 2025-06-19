
-- Ensure the watermarked-previews bucket exists
DO $$
BEGIN
    -- Check if bucket exists, if not create it
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'watermarked-previews') THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('watermarked-previews', 'watermarked-previews', true);
    END IF;
END $$;

-- Ensure policies exist
DO $$
BEGIN
    -- Drop existing policies if they exist to avoid conflicts
    DROP POLICY IF EXISTS "Allow authenticated users to upload watermarked previews" ON storage.objects;
    DROP POLICY IF EXISTS "Allow public read access to watermarked previews" ON storage.objects;
    DROP POLICY IF EXISTS "Allow authenticated users to delete watermarked previews" ON storage.objects;
    
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
END $$;
