-- Run this SQL in Supabase Dashboard > SQL Editor
-- This will create/update the email_logs table to match the Edge Functions

-- Drop the old table if it exists
DROP TABLE IF EXISTS email_logs CASCADE;

-- Create email_logs table with correct schema
CREATE TABLE email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template TEXT NOT NULL,
    recipient TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for service role only
CREATE POLICY "Service role can manage email logs"
ON email_logs FOR ALL
USING (auth.role() = 'service_role');

-- Add indexes
CREATE INDEX idx_email_logs_recipient ON email_logs(recipient);
CREATE INDEX idx_email_logs_template ON email_logs(template);
CREATE INDEX idx_email_logs_created_at ON email_logs(created_at);
