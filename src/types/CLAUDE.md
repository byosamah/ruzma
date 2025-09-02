# Types Directory Guide

## 📁 Directory Structure
```
src/types/
├── shared.ts              # Core application types
├── common.ts              # Common interfaces & utilities
├── client.ts              # Client-related types
├── profile.ts             # User profile types
├── branding.ts            # Branding customization types
├── projectTemplate.ts     # Project template types
├── notifications.ts       # Notification system types
└── advancedAnalytics.ts   # Analytics & reporting types
```

## 🎯 Type Definition Patterns

### ✅ Core Interface Pattern
```typescript
// File: shared.ts - MAIN TYPE DEFINITIONS
export interface Project {
  id: string;
  user_id: string;
  name: string;
  brief: string;
  slug: string;
  status: ProjectStatus;
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
  
  // Relations (populated by joins)
  client?: Client;
  milestones?: Milestone[];
  invoices?: Invoice[];
}

// ✅ Use string literal unions for constrained values
export type ProjectStatus = 'draft' | 'active' | 'completed' | 'archived' | 'cancelled';
export type UserType = 'free' | 'pro' | 'enterprise';
export type MilestoneStatus = 'pending' | 'in_progress' | 'review' | 'approved' | 'payment_submitted' | 'paid' | 'rejected';
```

### Database Type Integration
```typescript
// ✅ Extend Supabase generated types when needed
import { Database } from '@/integrations/supabase/types';

// Use Supabase types as base
export type ProjectRow = Database['public']['Tables']['projects']['Row'];
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

// ✅ Create enhanced types for application use
export interface ProjectWithRelations extends ProjectRow {
  client?: Client;
  milestones: Milestone[];
  invoices: Invoice[];
  user_profile?: UserProfile;
}
```

### Form & API Types
```typescript
// ✅ Separate types for different contexts
export interface CreateProjectData {
  name: string;
  brief: string;
  client_id?: string;
  currency?: string;
  start_date?: string;
  end_date?: string;
  payment_terms?: string;
  milestones: CreateMilestoneData[];
}

export interface UpdateProjectData {
  name?: string;
  brief?: string;
  status?: ProjectStatus;
  client_id?: string;
  end_date?: string;
  contract_signed?: boolean;
}

// ✅ API Response types
export interface ProjectAPIResponse {
  data: Project;
  success: boolean;
  message?: string;
}

export interface ProjectListResponse {
  data: Project[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  success: boolean;
}
```

## 🏢 Business Domain Types

### User & Profile Types
```typescript
// File: profile.ts
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  company?: string;
  website?: string;
  bio?: string;
  avatar_url?: string;
  currency: string;
  country?: string;
  language: string;
  user_type: UserType;
  project_count: number;
  storage_used: number;
  onboarding_completed: boolean;
  email_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  full_name?: string;
  company?: string;
  website?: string;
  bio?: string;
  currency?: string;
  country?: string;
  language?: string;
  email_notifications?: boolean;
}

// ✅ Usage limits type
export interface UserPlanLimits {
  maxProjects: number;
  maxClients: number;
  maxStorageMB: number;
  maxInvoices: number;
  features: {
    customBranding: boolean;
    advancedAnalytics: boolean;
    prioritySupport: boolean;
    whiteLabel: boolean;
  };
}
```

### Client Management Types
```typescript
// File: client.ts
export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string;
  notes?: string;
  status: ClientStatus;
  created_at: string;
  updated_at: string;
}

export type ClientStatus = 'active' | 'inactive' | 'blocked';

export interface CreateClientData {
  name: string;
  email: string;
  notes?: string;
}

// Note: Company and phone fields were removed in recent optimization
// to simplify client management forms and reduce form complexity

// ✅ Client portal access types
export interface ClientProjectToken {
  id: string;
  project_id: string;
  token: string;
  client_email: string;
  expires_at: string;
  is_active: boolean;
  access_count: number;
  last_accessed_at?: string;
  created_at: string;
}

export interface ClientProjectView {
  id: string;
  name: string;
  brief: string;
  status: ProjectStatus;
  currency: string;
  total_amount: number;
  start_date?: string;
  end_date?: string;
  contract_pdf_url?: string;
  client: {
    name: string;
    email: string;
    company?: string;
  };
  milestones: ClientMilestone[];
  freelancer: {
    full_name: string;
    company?: string;
    website?: string;
    avatar_url?: string;
  };
  branding?: FreelancerBranding;
}
```

### Invoice System Types
```typescript
// File: common.ts (invoice section)
export interface Invoice {
  id: string;
  user_id: string;
  client_id?: string;
  project_id?: string;
  invoice_number: string;
  status: InvoiceStatus;
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
  
  // Relations
  client?: Client;
  project?: Project;
  items: InvoiceItem[];
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface CreateInvoiceData {
  client_id?: string;
  project_id?: string;
  issue_date: string;
  due_date: string;
  currency: string;
  tax_rate?: number;
  payment_terms?: string;
  notes?: string;
  items: CreateInvoiceItemData[];
}

export interface CreateInvoiceItemData {
  description: string;
  quantity: number;
  unit_price: number;
}
```

## 🎨 UI & Component Types

### Component Props Patterns
```typescript
// ✅ Component props with proper interfaces
export interface ProjectCardProps {
  project: Project;
  onEdit: (slug: string) => void;
  onDelete: (id: string) => void;
  onView: (slug: string) => void;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
}

export interface FormFieldProps<T = any> {
  name: keyof T;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

// ✅ Generic component types
export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  pagination?: PaginationState;
  onPaginationChange?: (pagination: PaginationState) => void;
  onRowClick?: (row: T) => void;
}
```

### Hook Return Types
```typescript
// ✅ Define return types for custom hooks
export interface UseAuthReturn {
  user: User | null;
  session: Session | null;
  loading: boolean;
  authChecked: boolean;
}

export interface UseProjectsReturn {
  projects: Project[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  createProject: (data: CreateProjectData) => Promise<Project>;
  updateProject: (id: string, data: UpdateProjectData) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
}

export interface UseDashboardReturn {
  user: User | null;
  profile: UserProfile | null;
  projects: Project[];
  stats: DashboardStats;
  userCurrency: UserCurrency;
  loading: boolean;
  displayName: string;
  handleSignOut: () => void;
  handleEditProject: (slug: string) => void;
  handleDeleteProject: (id: string) => Promise<void>;
}
```

## 🌐 i18n & Language Types

### Translation Types
```typescript
// ✅ Type-safe translations
export interface TranslationKeys {
  common: {
    loading: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    create: string;
    submit: string;
    back: string;
  };
  dashboard: {
    title: string;
    welcome: string;
    stats: {
      totalProjects: string;
      activeProjects: string;
      totalRevenue: string;
      pendingPayments: string;
    };
  };
  project: {
    title: string;
    create: string;
    edit: string;
    delete: string;
    status: {
      draft: string;
      active: string;
      completed: string;
      archived: string;
    };
  };
}

export interface LanguageConfig {
  code: string;
  name: string;
  direction: 'ltr' | 'rtl';
  flag: string;
}
```

## 🔒 Security & Validation Types

### Error Handling Types
```typescript
// File: common.ts
export interface AppError {
  message: string;
  code?: string;
  stack?: string;
  cause?: unknown;
}

export type ErrorCode = 
  | 'AUTH_REQUIRED'
  | 'ACCESS_DENIED'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'DATABASE_ERROR'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INSUFFICIENT_PERMISSIONS';

export interface APIResponse<T = any> {
  data?: T;
  error?: AppError;
  success: boolean;
  message?: string;
}
```

### Validation Schema Types
```typescript
// ✅ Zod schema types for validation
import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  brief: z.string().min(10, 'Brief must be at least 10 characters').max(2000),
  client_id: z.string().uuid().optional(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'SAR']),
  milestones: z.array(z.object({
    title: z.string().min(1).max(100),
    description: z.string().min(1).max(500),
    price: z.number().min(0).max(1000000),
  })).min(1, 'At least one milestone required'),
});

export type CreateProjectData = z.infer<typeof createProjectSchema>;
```

## 🚨 Type Definition Rules

### ✅ DO
- **Use string literal unions** for constrained values
- **Define separate types** for create, update, and read operations
- **Extend Supabase types** when adding application-specific fields
- **Create generic interfaces** for reusable patterns
- **Use proper TypeScript utilities** (Pick, Omit, Partial)
- **Document complex types** with JSDoc comments
- **Export all public interfaces**
- **Use consistent naming conventions**

### ❌ DON'T
- **Use `any` type** - always define proper interfaces
- **Create overly complex nested types** - break them down
- **Ignore null/undefined** - handle optional fields properly
- **Mix database and API types** - keep them separate
- **Use enums** - prefer string literal unions
- **Export internal types** that aren't used elsewhere
- **Create duplicate interfaces** - use shared types

## 📋 Type Development Checklist

- [ ] Proper interface naming (PascalCase)
- [ ] All properties properly typed (no any)
- [ ] Optional fields marked with `?`
- [ ] String literal unions for constrained values
- [ ] Separate types for different operations (CRUD)
- [ ] JSDoc comments for complex interfaces
- [ ] Extends appropriate base types when needed
- [ ] Exported for use in other files
- [ ] Compatible with existing codebase patterns
- [ ] Validation schemas match TypeScript types

## 🎯 Quick Reference

### Import Patterns
```typescript
// Core types
import type { Project, Milestone, Client, Invoice } from '@/types/shared';

// Component props
import type { ProjectCardProps, DataTableProps } from '@/types/components';

// API types
import type { APIResponse, CreateProjectData } from '@/types/api';

// Supabase types
import type { Database } from '@/integrations/supabase/types';
```

### Common Type Utilities
```typescript
// ✅ Use TypeScript utilities effectively
type ProjectUpdate = Partial<Pick<Project, 'name' | 'brief' | 'status'>>;
type ProjectCreate = Omit<Project, 'id' | 'created_at' | 'updated_at'>;
type ProjectPublic = Omit<Project, 'user_id' | 'payment_terms'>;

// ✅ Create conditional types when needed
type ProjectWithClient<T extends boolean> = T extends true 
  ? Project & { client: Client } 
  : Project;
```

### Type Guards
```typescript
// ✅ Type guards for runtime type checking
export function isProject(obj: any): obj is Project {
  return obj && typeof obj === 'object' && 
         typeof obj.id === 'string' &&
         typeof obj.name === 'string';
}

export function hasClient(project: Project): project is Project & { client: Client } {
  return project.client !== null && project.client !== undefined;
}
```