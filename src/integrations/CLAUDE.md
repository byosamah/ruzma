# Integrations Directory Guide

## 📁 Directory Structure
```
src/integrations/
└── supabase/
    ├── client.ts          # Supabase client configuration
    └── types.ts           # Auto-generated database types
```

## 🔌 Supabase Integration (CRITICAL)

### Client Configuration
```typescript
// File: supabase/client.ts - MAIN DATABASE CLIENT
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://YOUR-PROJECT-ID.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

// ✅ ALWAYS use this client for database operations
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// ✅ Usage pattern in services
import { supabase } from '@/integrations/supabase/client';

// ❌ DON'T create multiple client instances
// ❌ DON'T use service role key in frontend
```

### Database Types
```typescript
// File: supabase/types.ts - AUTO-GENERATED TYPES
// ⚠️ WARNING: This file is auto-generated - DON'T EDIT MANUALLY

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          company: string | null;
          currency: string;
          user_type: string;
          // ... all profile fields
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          // ... insert-specific types
        };
        Update: {
          id?: string;
          email?: string;
          // ... update-specific types
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          brief: string;
          slug: string;
          status: string;
          // ... all project fields
        };
        Insert: { /* ... */ };
        Update: { /* ... */ };
      };
      // ... all other tables
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
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// ✅ Type utilities for application use
export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Row: infer R;
    }
      ? R
      : never)
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"])
  ? (Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Row: infer R;
    }
      ? R
      : never)
  : never;
```

## 🛠️ Database Operations Patterns

### Query Patterns (READ)
```typescript
// ✅ Basic select
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .eq('user_id', user.id);

// ✅ Select with relations
const { data, error } = await supabase
  .from('projects')
  .select(`
    *,
    client:clients(*),
    milestones(*),
    invoices(*)
  `)
  .eq('user_id', user.id);

// ✅ Filtered queries
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .eq('user_id', user.id)
  .eq('status', 'active')
  .order('created_at', { ascending: false })
  .limit(10);

// ✅ Count queries
const { count, error } = await supabase
  .from('projects')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', user.id);
```

### Mutation Patterns (WRITE)
```typescript
// ✅ Insert
const { data, error } = await supabase
  .from('projects')
  .insert({
    user_id: user.id,
    name: 'New Project',
    brief: 'Project description',
    slug: 'new-project-123',
    status: 'active'
  })
  .select()
  .single();

// ✅ Update
const { data, error } = await supabase
  .from('projects')
  .update({
    name: 'Updated Name',
    updated_at: new Date().toISOString()
  })
  .eq('id', projectId)
  .eq('user_id', user.id) // ✅ Always include user check
  .select()
  .single();

// ✅ Delete
const { error } = await supabase
  .from('projects')
  .delete()
  .eq('id', projectId)
  .eq('user_id', user.id); // ✅ Always include user check

// ✅ Upsert (update or insert)
const { data, error } = await supabase
  .from('profiles')
  .upsert({
    id: user.id,
    full_name: 'John Doe',
    updated_at: new Date().toISOString()
  })
  .select()
  .single();
```

## 💾 Storage Operations

### File Upload Patterns
```typescript
// ✅ Secure file upload
const uploadFile = async (file: File, bucket: string, userId: string) => {
  // Generate secure filename
  const fileExtension = file.name.split('.').pop();
  const fileName = `${userId}/${crypto.randomUUID()}.${fileExtension}`;
  
  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false, // Don't overwrite existing files
    });
  
  if (error) throw error;
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);
  
  return urlData.publicUrl;
};

// ✅ File deletion
const deleteFile = async (bucket: string, filePath: string) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);
  
  if (error) throw error;
};

// ✅ List files in user folder
const { data, error } = await supabase.storage
  .from('project-attachments')
  .list(user.id, {
    limit: 100,
    offset: 0,
  });
```

## 🔒 Security & RLS Integration

### RLS Policy Compliance
```typescript
// ✅ RLS automatically filters by user_id
// These queries are secure because RLS policies enforce user isolation
const { data: userProjects } = await supabase
  .from('projects')
  .select('*'); // RLS filters to user's projects only

const { data: userClients } = await supabase
  .from('clients')
  .select('*'); // RLS filters to user's clients only

// ✅ Explicit user filtering (recommended for clarity)
const { data: explicitProjects } = await supabase
  .from('projects')
  .select('*')
  .eq('user_id', user.id); // Explicit + RLS = double protection

// ❌ DON'T try to access other users' data
// This will return empty results due to RLS
const { data: otherUserData } = await supabase
  .from('projects')
  .select('*')
  .eq('user_id', 'other-user-id'); // Returns empty due to RLS
```

### Authentication State
```typescript
// ✅ Get current user
const { data: { user }, error } = await supabase.auth.getUser();

// ✅ Get current session
const { data: { session }, error } = await supabase.auth.getSession();

// ✅ Auth state changes
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  (event, session) => {
    if (event === 'SIGNED_IN') {
      // User signed in
    } else if (event === 'SIGNED_OUT') {
      // User signed out
    }
  }
);

// ✅ Cleanup subscription
return () => subscription.unsubscribe();
```

## 📊 Real-time Features

### Supabase Realtime
```typescript
// ✅ Subscribe to table changes
const channel = supabase
  .channel('public:projects')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'projects',
      filter: `user_id=eq.${user.id}` // Filter by user
    },
    (payload) => {
      console.log('Project changed:', payload);
      // Update local state
    }
  )
  .subscribe();

// ✅ Cleanup
return () => {
  supabase.removeChannel(channel);
};

// ✅ Presence for collaborative features
const presence = supabase.channel('project-collaboration')
  .on('presence', { event: 'sync' }, () => {
    const newState = presence.presenceState();
    // Handle presence updates
  })
  .on('presence', { event: 'join' }, ({ key, newPresences }) => {
    // User joined
  })
  .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
    // User left
  })
  .subscribe();
```

## ⚠️ Integration Rules

### ✅ DO
- **Always use the shared client** from `@/integrations/supabase/client`
- **Include user checks** in queries even with RLS
- **Handle errors properly** from all Supabase operations
- **Use TypeScript types** from generated types file
- **Clean up subscriptions** to prevent memory leaks
- **Validate data** before database operations
- **Use transactions** for multi-table operations

### ❌ DON'T
- **Create multiple client instances**
- **Edit the types.ts file manually** (it's auto-generated)
- **Bypass RLS policies** or try to access other users' data
- **Ignore error handling** in database operations
- **Use service role key** in frontend code
- **Forget to unsubscribe** from real-time channels
- **Store sensitive data** in public tables

## 📋 Type Generation

### Regenerating Types
```bash
# ✅ Generate types from Supabase CLI
supabase gen types typescript --project-id YOUR-PROJECT-ID > src/integrations/supabase/types.ts

# ✅ Or using npx
npx supabase gen types typescript --project-id YOUR-PROJECT-ID > src/integrations/supabase/types.ts
```

### Using Generated Types
```typescript
import type { Database } from '@/integrations/supabase/types';

// ✅ Table row types
type Project = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

// ✅ Use in functions
const createProject = async (project: ProjectInsert): Promise<Project> => {
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};
```

## 🎯 Quick Reference

### Common Operations
```typescript
// Import client
import { supabase } from '@/integrations/supabase/client';

// Basic CRUD
const { data, error } = await supabase.from('table').select('*');
const { data, error } = await supabase.from('table').insert(data);
const { data, error } = await supabase.from('table').update(data).eq('id', id);
const { error } = await supabase.from('table').delete().eq('id', id);

// Authentication
const { data: { user } } = await supabase.auth.getUser();
const { data: { session } } = await supabase.auth.getSession();

// Storage
const { data, error } = await supabase.storage.from('bucket').upload(path, file);
const { data } = supabase.storage.from('bucket').getPublicUrl(path);
```

### Error Handling Pattern
```typescript
try {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id);
    
  if (error) throw error;
  
  return data;
} catch (error) {
  console.error('Database operation failed:', error);
  throw new AppError('Failed to fetch projects', 'DATABASE_ERROR');
}
```