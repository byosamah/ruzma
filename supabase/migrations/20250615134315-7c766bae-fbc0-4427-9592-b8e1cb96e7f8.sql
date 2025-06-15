
-- This migration adds a secure access token to each project. This token will
-- be used in the client-facing URL to grant access to a specific project
-- without requiring the client to log in.

-- Add a column to store the client access token, with a random UUID as default.
ALTER TABLE public.projects
ADD COLUMN client_access_token UUID NOT NULL DEFAULT gen_random_uuid();

-- Add an index on the new column for efficient lookups.
CREATE INDEX idx_projects_client_access_token ON public.projects(client_access_token);
