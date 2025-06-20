
-- Create freelancer_branding table to store branding information
CREATE TABLE public.freelancer_branding (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  logo_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#4B72E5',
  secondary_color TEXT NOT NULL DEFAULT '#1D3770',
  freelancer_name TEXT NOT NULL DEFAULT '',
  freelancer_title TEXT NOT NULL DEFAULT '',
  freelancer_bio TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only manage their own branding
ALTER TABLE public.freelancer_branding ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT their own branding
CREATE POLICY "Users can view their own branding" 
  ON public.freelancer_branding 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to INSERT their own branding
CREATE POLICY "Users can create their own branding" 
  ON public.freelancer_branding 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to UPDATE their own branding
CREATE POLICY "Users can update their own branding" 
  ON public.freelancer_branding 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to DELETE their own branding
CREATE POLICY "Users can delete their own branding" 
  ON public.freelancer_branding 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create a storage bucket for branding logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('branding-logos', 'branding-logos', true);

-- Create storage policies for branding logos
CREATE POLICY "Users can upload their own branding logos" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'branding-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view branding logos" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'branding-logos');

CREATE POLICY "Users can update their own branding logos" 
  ON storage.objects 
  FOR UPDATE 
  USING (bucket_id = 'branding-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own branding logos" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'branding-logos' AND auth.uid()::text = (storage.foldername(name))[1]);
