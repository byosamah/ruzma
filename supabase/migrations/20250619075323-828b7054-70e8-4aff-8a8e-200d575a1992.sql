
-- Add start_date and end_date columns to milestones table
ALTER TABLE public.milestones 
ADD COLUMN start_date DATE,
ADD COLUMN end_date DATE;

-- Add start_date and end_date columns to projects table  
ALTER TABLE public.projects
ADD COLUMN start_date DATE,
ADD COLUMN end_date DATE;
