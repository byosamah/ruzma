# Ruzma System Architecture Documentation

## Executive Summary

Ruzma is a comprehensive SaaS platform designed for freelancers to manage projects, clients, invoices, and payments. Built with modern web technologies, it features multi-language support (English/Arabic), a secure client portal, and leverages Supabase as the backend infrastructure.

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: TanStack Query + React Context
- **Routing**: React Router v6 with language-based routing
- **Internationalization**: Custom i18n solution with RTL support

### Backend
- **Platform**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Database**: PostgreSQL with Row Level Security (RLS)
- **File Storage**: Supabase Storage buckets
- **Authentication**: Supabase Auth with email/password
- **Background Jobs**: pg_cron for scheduled tasks

### External Services
- **Payment Processing**: LemonSqueezy for subscriptions
- **Email Delivery**: SMTP/Email provider for notifications

## System Architecture Overview

### 1. Authentication & Authorization

#### Authentication Flow
- Email/password authentication via Supabase Auth
- Magic link support for password reset
- Session-based authentication with JWT tokens
- Protected routes using `ProtectedRoute` component

#### Authorization Layers
1. **Row Level Security (RLS)**: Database-level access control
2. **Token-based Access**: Client portal and contract approval
3. **Plan-based Restrictions**: Feature access based on subscription

### 2. Data Architecture

#### Core Entities

**Projects**
- Central entity linking users, clients, and milestones
- Unique slug generation for URL-friendly access
- Contract management with approval workflow
- Client access via secure UUID tokens

**Milestones**
- Project deliverables with status tracking
- File upload support for deliverables
- Payment proof submission
- Date tracking for deadlines

**Profiles**
- Extended user information
- Multi-currency support (75+ currencies)
- Notification preferences
- Usage tracking (projects, storage)

**Clients**
- Linked to user accounts
- Email-based identification
- Project association

#### Data Relationships
```
auth.users
    ├── profiles (1:1)
    ├── projects (1:N)
    ├── clients (1:N)
    ├── invoices (1:N)
    ├── freelancer_branding (1:1)
    ├── notifications (1:N)
    └── subscriptions (1:1)

projects
    ├── milestones (1:N)
    ├── clients (N:1)
    └── invoices (1:N)
```

### 3. User Workflows

#### Project Creation Flow
1. User creates project with basic info
2. Optionally selects client or creates new
3. Defines milestones with pricing
4. Sets contract requirements
5. Generates unique project slug
6. Creates client access token

#### Client Portal Flow
1. Client receives secure link with token
2. Token validates against project
3. Client views project progress
4. Can upload payment proofs
5. Can approve contracts

#### Invoice Generation Flow
1. User creates invoice from project data
2. Multi-currency support with conversion
3. PDF generation with branding
4. Storage in database with JSONB

### 4. Security Architecture

#### Database Security
- Row Level Security on all tables
- User isolation by `user_id`
- Service role for backend operations
- Secure function execution

#### Client Access Security
- UUID token generation
- No authentication required for clients
- Token-based project access
- Separate contract approval tokens

#### File Storage Security
- Public buckets with path-based access
- File size limits per plan
- Storage tracking per user
- Organized bucket structure

### 5. Performance Optimization

#### Frontend Optimization
- Lazy loading of route components
- React Query caching (5min stale, 10min gc)
- Optimistic updates for better UX
- Image optimization with cropping

#### Backend Optimization
- Database indexes on frequently queried columns
- JSONB for flexible data storage
- Efficient RLS policies
- Connection pooling via Supabase

### 6. Scalability Considerations

#### Multi-tenancy
- Complete user isolation via RLS
- Tenant-specific data access
- No cross-tenant data leakage
- Scalable to thousands of users

#### Storage Management
- Plan-based storage limits
- Automatic usage tracking
- File organization by type
- CDN delivery via Supabase

#### Background Processing
- Daily cron jobs for notifications
- Async email delivery
- Webhook processing for payments
- Event-driven architecture

## API Architecture

### Service Layer

#### Core Services
1. **authService**: Authentication operations
2. **projectService**: Project CRUD and management
3. **invoiceService**: Invoice generation
4. **clientLinkService**: Secure link generation
5. **emailNotifications**: Notification delivery
6. **userLimitsService**: Plan enforcement
7. **brandingService**: Customization management
8. **profileService**: User profile operations

### Data Flow Patterns

#### Request Flow
```
Frontend Component
    → Custom Hook
    → Service Function
    → Supabase Client
    → PostgreSQL (with RLS)
    → Response transformation
    → State update
```

#### Real-time Updates
- Supabase subscriptions for live data
- Notification system for alerts
- Optimistic UI updates
- Cache invalidation strategies

## Deployment Architecture

### Environment Configuration
- Environment variables for API keys
- Separate dev/staging/prod environments
- Secure secret management
- Configuration validation

### Monitoring & Logging
- Error tracking and reporting
- Performance monitoring
- User activity tracking
- Security audit logs

## Development Guidelines

### Code Organization
- Domain-driven design structure
- Feature-based folder organization
- Shared component library
- Type-safe development

### Testing Strategy
- Component testing with React Testing Library
- Integration tests for critical flows
- E2E testing for user journeys
- Database migration testing

### CI/CD Pipeline
- Automated builds on push
- Type checking and linting
- Test execution
- Deployment via Lovable platform

## Future Considerations

### Planned Enhancements
1. Team collaboration features
2. Advanced analytics dashboard
3. Mobile application
4. API for third-party integrations
5. AI-powered insights

### Technical Debt
1. Migration to server components
2. Enhanced caching strategies
3. Microservices architecture
4. GraphQL API layer
5. Enhanced security measures

## Conclusion

Ruzma's architecture is designed for scalability, security, and maintainability. The use of modern technologies and best practices ensures a robust platform that can grow with user needs while maintaining performance and reliability.