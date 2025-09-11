-- Create email_logs table for tracking email sends
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_name TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    language TEXT DEFAULT 'en',
    status TEXT DEFAULT 'pending', -- pending, sent, failed
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    email_service TEXT DEFAULT 'resend', -- resend, sendgrid
    subject TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Only service role can insert/read email logs (for system logging)
CREATE POLICY "Service role can manage email logs" 
ON email_logs FOR ALL 
USING (auth.role() = 'service_role');

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_template ON email_logs(template_name);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);