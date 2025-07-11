-- Remove unused watermark_text column from milestones table
ALTER TABLE public.milestones DROP COLUMN IF EXISTS watermark_text;