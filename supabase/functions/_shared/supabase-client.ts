import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Database types for better type safety
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          company: string | null;
          website: string | null;
          bio: string | null;
          avatar_url: string | null;
          currency: string;
          country: string | null;
          language: string;
          user_type: 'free' | 'plus' | 'pro' | 'enterprise';
          subscription_status: string | null;
          subscription_id: string | null;
          project_count: number;
          storage_used: number;
          onboarding_completed: boolean;
          email_notifications: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          company?: string | null;
          website?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          currency?: string;
          country?: string | null;
          language?: string;
          user_type?: 'free' | 'plus' | 'pro' | 'enterprise';
          subscription_status?: string | null;
          subscription_id?: string | null;
          project_count?: number;
          storage_used?: number;
          onboarding_completed?: boolean;
          email_notifications?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          company?: string | null;
          website?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          currency?: string;
          country?: string | null;
          language?: string;
          user_type?: 'free' | 'plus' | 'pro' | 'enterprise';
          subscription_status?: string | null;
          subscription_id?: string | null;
          project_count?: number;
          storage_used?: number;
          onboarding_completed?: boolean;
          email_notifications?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          lemon_squeezy_id: string;
          status: string;
          product_id: string | null;
          variant_id: string | null;
          expires_at: string | null;
          cancelled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lemon_squeezy_id: string;
          status: string;
          product_id?: string | null;
          variant_id?: string | null;
          expires_at?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          lemon_squeezy_id?: string;
          status?: string;
          product_id?: string | null;
          variant_id?: string | null;
          expires_at?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          brief: string;
          slug: string;
          status: 'draft' | 'active' | 'completed' | 'archived' | 'cancelled';
          client_id: string | null;
          currency: string;
          total_amount: number;
          start_date: string | null;
          end_date: string | null;
          contract_pdf_url: string | null;
          contract_signed: boolean;
          payment_terms: string | null;
          visibility_settings: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          brief: string;
          slug: string;
          status?: 'draft' | 'active' | 'completed' | 'archived' | 'cancelled';
          client_id?: string | null;
          currency?: string;
          total_amount?: number;
          start_date?: string | null;
          end_date?: string | null;
          contract_pdf_url?: string | null;
          contract_signed?: boolean;
          payment_terms?: string | null;
          visibility_settings?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          brief?: string;
          slug?: string;
          status?: 'draft' | 'active' | 'completed' | 'archived' | 'cancelled';
          client_id?: string | null;
          currency?: string;
          total_amount?: number;
          start_date?: string | null;
          end_date?: string | null;
          contract_pdf_url?: string | null;
          contract_signed?: boolean;
          payment_terms?: string | null;
          visibility_settings?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string;
          address: string | null;
          country: string | null;
          currency: string;
          notes: string | null;
          status: 'active' | 'inactive' | 'blocked';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          email: string;
          address?: string | null;
          country?: string | null;
          currency?: string;
          notes?: string | null;
          status?: 'active' | 'inactive' | 'blocked';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          email?: string;
          address?: string | null;
          country?: string | null;
          currency?: string;
          notes?: string | null;
          status?: 'active' | 'inactive' | 'blocked';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Type-safe Supabase client
export type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Creates a typed Supabase client for use in Edge Functions
 * @param serviceRoleKey - Optional service role key for admin operations
 * @returns Typed Supabase client instance
 */
export function createTypedSupabaseClient(serviceRoleKey?: string): TypedSupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = serviceRoleKey || Deno.env.get('SUPABASE_ANON_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing required Supabase environment variables');
  }

  return createClient<Database>(supabaseUrl, supabaseKey);
}

/**
 * Creates a service role Supabase client with full admin access
 * @returns Typed Supabase client with service role permissions
 */
export function createServiceRoleSupabaseClient(): TypedSupabaseClient {
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  }

  return createTypedSupabaseClient(serviceRoleKey);
}

/**
 * Creates an authenticated Supabase client using a JWT token
 * @param accessToken - JWT access token from the user
 * @returns Typed Supabase client with user authentication
 */
export function createAuthenticatedSupabaseClient(accessToken: string): TypedSupabaseClient {
  const client = createTypedSupabaseClient();
  client.auth.setSession({
    access_token: accessToken,
    refresh_token: '', // Not needed for server-side operations
  });
  
  return client;
}

/**
 * Validates that a user exists and has proper permissions
 * @param client - Typed Supabase client
 * @param userId - User ID to validate
 * @returns Promise resolving to user profile or null if not found
 */
export async function validateUser(
  client: TypedSupabaseClient, 
  userId: string
): Promise<Database['public']['Tables']['profiles']['Row'] | null> {
  try {
    const { data: profile, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return null;
    }

    return profile;
  } catch {
    return null;
  }
}

/**
 * Type guard to check if an error is a Supabase error
 * @param error - Error to check
 * @returns True if it's a Supabase error
 */
export function isSupabaseError(error: unknown): error is { code: string; message: string; details: string | null } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as any).code === 'string' &&
    typeof (error as any).message === 'string'
  );
}

/**
 * Safely handles Supabase operations with proper error handling
 * @param operation - Async operation to execute
 * @param errorContext - Context information for logging
 * @returns Promise with result or error
 */
export async function safeSupabaseOperation<T>(
  operation: () => Promise<{ data: T | null; error: unknown }>,
  errorContext: string
): Promise<{ data: T | null; error: string | null }> {
  try {
    const result = await operation();
    
    if (result.error) {
      const errorMessage = isSupabaseError(result.error)
        ? `${errorContext}: ${result.error.message} (${result.error.code})`
        : `${errorContext}: Unknown error`;
      
      return { data: null, error: errorMessage };
    }

    return { data: result.data, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error
      ? `${errorContext}: ${error.message}`
      : `${errorContext}: Unknown error occurred`;
    
    return { data: null, error: errorMessage };
  }
}