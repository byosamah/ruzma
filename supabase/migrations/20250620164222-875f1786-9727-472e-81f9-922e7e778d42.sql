
-- Allow public read access to freelancer branding data since client pages are public
CREATE POLICY "Public can view freelancer branding" 
  ON public.freelancer_branding 
  FOR SELECT 
  USING (true);
