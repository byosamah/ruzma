
-- Create the project_templates table
CREATE TABLE public.project_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL, -- reference to the user's ID
  name text NOT NULL,
  brief text,
  milestones jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.project_templates ENABLE ROW LEVEL SECURITY;

-- Allow users to SELECT their own templates
CREATE POLICY "Users can view their own templates" ON public.project_templates
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to INSERT their own templates
CREATE POLICY "Users can insert their own templates" ON public.project_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to UPDATE their own templates
CREATE POLICY "Users can update their own templates" ON public.project_templates
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to DELETE their own templates
CREATE POLICY "Users can delete their own templates" ON public.project_templates
  FOR DELETE USING (auth.uid() = user_id);
