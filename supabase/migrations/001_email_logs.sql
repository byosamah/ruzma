-- Create email_logs table for tracking email sends
CREATE TABLE IF NOT EXISTS email_logs (
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

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient);
CREATE INDEX IF NOT EXISTS idx_email_logs_template ON email_logs(template);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at);