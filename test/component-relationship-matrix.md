# Ruzma Component Relationship Matrix

## Overview
This matrix shows the relationships between different components in the Ruzma system, including dependencies, data flows, and interactions.

## Component Categories
- **P**: Pages (Frontend)
- **S**: Services (Backend)
- **D**: Database Tables
- **H**: Hooks (Custom React Hooks)
- **C**: Context Providers
- **E**: External Services

## Relationship Matrix

### Pages → Dependencies

| Page Component | Services Used | Database Tables | Hooks | External Services |
|----------------|---------------|-----------------|-------|-------------------|
| **Login** | authService | auth.users, profiles | useAuthManager | Supabase Auth |
| **SignUp** | authService | auth.users, profiles | useAuthManager | Supabase Auth |
| **Dashboard** | projectService, profileService | projects, milestones, profiles, notifications | useDashboard, useDashboardAnalytics | - |
| **Projects** | projectService, clientLinkService | projects, clients, milestones | useProjects, useUserProjects | - |
| **CreateProject** | projectService, clientService | projects, clients, milestones, project_templates | useProjectManager | - |
| **EditProject** | projectService | projects, milestones | useProjectManager | - |
| **ProjectManagement** | projectService, emailNotifications | projects, milestones, notifications | useProjectManagement | Storage (deliverables) |
| **Clients** | clientService | clients, projects | useClients | - |
| **ClientProject** | - | projects, milestones, freelancer_branding | useClientProject | Storage (all buckets) |
| **Invoices** | invoiceService | invoices, projects | useInvoices, useInvoiceManager | - |
| **CreateInvoice** | invoiceService | invoices, projects | useInvoiceManager | - |
| **Analytics** | - | projects, milestones, invoices, clients | useAdvancedAnalytics, useProfitabilityAnalytics | - |
| **Profile** | profileService, brandingService | profiles, freelancer_branding | useProfile, useProfileActions | Storage (profile-pictures) |
| **Plans** | subscriptionService | subscriptions, user_plan_limits | useSubscription | LemonSqueezy |

### Services → Dependencies

| Service | Database Tables | Other Services | External Dependencies |
|---------|----------------|----------------|----------------------|
| **authService** | auth.users, profiles | - | Supabase Auth |
| **projectService** | projects, milestones, clients | emailNotifications, userLimitsService | - |
| **invoiceService** | invoices, projects | - | - |
| **clientLinkService** | projects | - | - |
| **emailNotifications** | notifications | - | Email Provider |
| **userLimitsService** | user_plan_limits, profiles | - | - |
| **brandingService** | freelancer_branding | - | Storage (branding-logos) |
| **profileService** | profiles | - | Storage (profile-pictures) |

### Database Table Relationships

| Table | Foreign Keys | Referenced By | Indexes |
|-------|--------------|---------------|---------|
| **projects** | user_id → auth.users, client_id → clients | milestones, invoices, notifications | user_id, slug, client_id, client_access_token |
| **milestones** | project_id → projects | - | project_id |
| **profiles** | id → auth.users | - | id, country |
| **clients** | user_id → auth.users | projects | user_id, email |
| **invoices** | user_id → auth.users | - | user_id, transaction_id |
| **project_templates** | user_id → auth.users | - | - |
| **notifications** | user_id → auth.users, related_project_id → projects | - | - |
| **freelancer_branding** | user_id → auth.users | - | - |
| **subscriptions** | user_id → auth.users | - | user_id, lemon_squeezy_id |

### Hook Dependencies

| Hook | Services Used | Contexts Used | Other Hooks |
|------|---------------|---------------|-------------|
| **useAuth** | authService | - | - |
| **useDashboard** | projectService | LanguageContext | useDashboardData, useDashboardAnalytics |
| **useProjects** | projectService | LanguageContext | useUserProjects |
| **useProjectManager** | projectService, clientService | LanguageContext | useClients |
| **useClients** | clientService | - | - |
| **useInvoices** | invoiceService | InvoiceContext | - |
| **useProfile** | profileService, brandingService | - | useProfileActions |
| **useSubscription** | - | - | - |
| **useNotifications** | - | - | - |

### Context Provider Dependencies

| Context | Used By Components | Provides |
|---------|-------------------|----------|
| **LanguageContext** | All pages | Language state, translations, RTL support |
| **InvoiceContext** | Invoice pages | Invoice state management |
| **QueryClientProvider** | All components | React Query caching and state |

### Storage Bucket Usage

| Bucket | Used By Pages | Used By Services | Access Type |
|--------|---------------|------------------|-------------|
| **deliverables** | ProjectManagement, ClientProject | - | Public |
| **payment-proofs** | ProjectManagement, ClientProject | - | Public |
| **branding-logos** | Profile, ClientProject | brandingService | Public |
| **profile-pictures** | Profile | profileService | Public |

### External Service Integration Points

| External Service | Integration Points | Used For |
|-----------------|-------------------|-----------|
| **Supabase Auth** | Login, SignUp, authService | User authentication |
| **Supabase Database** | All services | Data persistence |
| **Supabase Storage** | Profile, ProjectManagement | File storage |
| **LemonSqueezy** | Plans page, webhook endpoint | Subscription management |
| **Email Provider** | emailNotifications service | Transactional emails |

## Critical Data Flows

### 1. User Registration Flow
```
SignUp → authService → Supabase Auth → profiles (trigger) → welcome email
```

### 2. Project Creation Flow
```
CreateProject → projectService → validate limits → create project → create milestones → generate slug → send notification
```

### 3. Client Access Flow
```
Client Link → token validation → fetch project data → load branding → display project
```

### 4. Payment Processing Flow
```
Payment Proof Upload → storage → milestone update → notification → email
```

### 5. Invoice Generation Flow
```
CreateInvoice → select project → calculate totals → generate PDF → save to database
```

## Performance-Critical Paths

1. **Dashboard Loading**: Parallel fetching of projects, stats, and notifications
2. **Project List**: Pagination and caching with React Query
3. **Analytics**: Aggregation queries with proper indexes
4. **File Uploads**: Direct browser-to-storage uploads
5. **Real-time Updates**: Supabase subscriptions for notifications

## Security Boundaries

1. **User Data Isolation**: RLS policies on all tables
2. **Client Portal**: Token-based access without authentication
3. **File Access**: Public buckets with secure URLs
4. **API Access**: Authenticated requests only
5. **Admin Operations**: Service role for backend tasks

## Optimization Opportunities

1. **Component Lazy Loading**: Already implemented for routes
2. **Data Prefetching**: Implement for predictable navigation
3. **Bundle Splitting**: Further split by feature
4. **Image Optimization**: Implement responsive images
5. **Cache Strategy**: Enhance React Query configuration

This matrix provides a comprehensive view of how components interact within the Ruzma system, helping developers understand dependencies and plan changes effectively.