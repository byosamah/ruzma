-- Update email_logs table to match Edge Function expectations
-- This migration handles both cases: table exists or doesn't exist

-- Drop the old table if it exists (safe since this is a new feature)
DROP TABLE IF EXISTS email_logs CASCADE;

-- Create email_logs table with correct schema
CREATE TABLE email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template TEXT NOT NULL,
    recipient TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, sent, failed
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Only service role can insert/read email logs (for system logging)
CREATE POLICY "Service role can manage email logs"
ON email_logs FOR ALL
USING (auth.role() = 'service_role');

-- Add indexes for performance
CREATE INDEX idx_email_logs_recipient ON email_logs(recipient);
CREATE INDEX idx_email_logs_template ON email_logs(template);
CREATE INDEX idx_email_logs_created_at ON email_logs(created_at);
