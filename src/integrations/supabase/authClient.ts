
// This utility initializes Supabase auth client with appropriate persistence settings for "Remember Me".

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Read Supabase credentials from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that environment variables are set
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
  );
}

// Only one Supabase client instance allowed per persistence type.
let localClient: ReturnType<typeof createClient<Database>> | null = null;
let sessionClient: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseClient(persist: boolean) {
  if (persist) {
    if (!localClient) {
      localClient = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        auth: {
          storage: localStorage,
          persistSession: true,
          autoRefreshToken: true,
          // Set session expiration to 30 days (Supabase default is 30d for persistent)
        }
      });
    }
    return localClient;
  } else {
    if (!sessionClient) {
      sessionClient = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        auth: {
          storage: sessionStorage,
          persistSession: true,
          autoRefreshToken: true,
          // Session will be non-persistent
        }
      });
    }
    return sessionClient;
  }
}
