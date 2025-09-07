// Shared type definitions for Supabase Edge Functions

export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

export interface DatabaseResponse<T = unknown> {
  data: T | null;
  error: SupabaseError | null;
}

// Email service types
export interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export interface EmailResponse {
  id: string;
  from: string;
  to: string[];
  created_at: string;
}

// Webhook payload types
export interface LemonSqueezyWebhookPayload {
  meta: {
    event_name: string;
    webhook_id: string;
    custom_data?: Record<string, unknown>;
  };
  data: {
    type: string;
    id: string;
    attributes: {
      store_id: number;
      customer_id: number;
      order_id: number;
      product_id: number;
      product_name: string;
      variant_id: number;
      variant_name: string;
      price: number;
      status: string;
      created_at: string;
      updated_at: string;
      test_mode: boolean;
      user_email: string;
      user_name: string;
      tax_name?: string;
      tax_rate?: string;
      tax_formatted?: string;
    };
    relationships?: {
      store: {
        links: {
          related: string;
          self: string;
        };
      };
      customer: {
        links: {
          related: string;
          self: string;
        };
      };
    };
  };
}

// Database record types
export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  company?: string;
  website?: string;
  bio?: string;
  avatar_url?: string;
  currency?: string;
  country?: string;
  language?: string;
  user_type?: 'free' | 'pro' | 'enterprise';
  project_count?: number;
  storage_used?: number;
  onboarding_completed?: boolean;
  email_notifications?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  brief: string;
  slug: string;
  status: 'draft' | 'active' | 'completed' | 'archived' | 'cancelled';
  client_id?: string;
  currency: string;
  total_amount: number;
  start_date?: string;
  end_date?: string;
  contract_pdf_url?: string;
  contract_signed: boolean;
  payment_terms?: string;
  visibility_settings?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  address?: string;
  country?: string;
  currency: string;
  notes?: string;
  status: 'active' | 'inactive' | 'blocked';
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  client_id?: string;
  project_id?: string;
  invoice_number: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issue_date: string;
  due_date: string;
  currency: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  payment_terms?: string;
  notes?: string;
  pdf_url?: string;
  created_at: string;
  updated_at: string;
}

// API request/response types
export interface ContactFormData {
  name: string;
  email: string;
  message: string;
  company?: string;
}

export interface InvoicePDFData {
  invoiceId: string;
  pdfBuffer: ArrayBuffer;
  fileName: string;
}

export interface RevisionRequestData {
  projectId: string;
  milestoneId: string;
  message: string;
  imageUrl?: string;
}

export interface ContractApprovalData {
  projectId: string;
  clientName: string;
  projectName: string;
  approvalToken: string;
}

// Utility types
export type RequestHandler<T = unknown> = (
  req: Request
) => Promise<Response | T>;

import type { TypedSupabaseClient } from './supabase-client.ts';

export interface FunctionContext {
  req: Request;
  supabaseClient: TypedSupabaseClient;
  corsHeaders: Record<string, string>;
}

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
} as const;

// Helper functions for consistent error handling
export function createErrorResponse(
  message: string,
  status: number = 400,
  details?: unknown
): Response {
  return new Response(
    JSON.stringify({
      error: {
        message,
        details,
        timestamp: new Date().toISOString(),
      },
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS,
      },
    }
  );
}

export function createSuccessResponse<T>(
  data: T,
  status: number = 200
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}