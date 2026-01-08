-- Migration: Drop unused active_subscriptions view
-- Purpose: Fix Security Advisor warning about SECURITY DEFINER view
-- Safety: This view has zero code references and is documented as legacy/unused

-- Drop the view if it exists (safe even if already removed)
DROP VIEW IF EXISTS public.active_subscriptions;

-- Add comment for audit trail
COMMENT ON SCHEMA public IS 'Dropped legacy active_subscriptions view on 2025-10-29 - no code dependencies';
