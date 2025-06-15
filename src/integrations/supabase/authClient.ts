
// This utility initializes Supabase auth client with appropriate persistence settings for "Remember Me".

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://***REMOVED***.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "***REMOVED***";

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
