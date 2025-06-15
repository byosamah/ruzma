
-- Add a field to store custom watermark text per milestone/deliverable
ALTER TABLE public.milestones
  ADD COLUMN IF NOT EXISTS watermark_text TEXT;

-- (Optional) Set default watermark if needed, for example:
-- UPDATE milestones SET watermark_text = 'Pending Payment' WHERE watermark_text IS NULL;
