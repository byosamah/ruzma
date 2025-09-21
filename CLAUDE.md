# Ruzma - Claude Code Navigation Hub

**Project**: Ruzma - Freelancer Project Management Platform
**Architecture**: React 18 + TypeScript + Supabase + Tailwind CSS + Edge Functions
**Status**: Production-ready, lifetime plan system, 20+ users

## 📂 Directory Documentation

### Core Structure
- **[src/components/CLAUDE.md](src/components/CLAUDE.md)** - UI components, shadcn/ui patterns
- **[src/hooks/CLAUDE.md](src/hooks/CLAUDE.md)** - Custom React hooks
- **[src/services/CLAUDE.md](src/services/CLAUDE.md)** - Service layer, business logic
- **[src/types/CLAUDE.md](src/types/CLAUDE.md)** - TypeScript definitions
- **[src/lib/CLAUDE.md](src/lib/CLAUDE.md)** - Utilities, translations
- **[supabase/CLAUDE.md](supabase/CLAUDE.md)** - Database schema, migrations

### New Structure
- **[specs/](specs/)** - Spec Kit feature specifications for spec-driven development
- **[.specify/](./specify/)** - Spec Kit configuration, templates, and project constitution
- **[supabase/functions/](supabase/functions/)** - Edge Functions for email services
- **[cypress/](cypress/)** - E2E testing suite with auth and project tests

## 🔒 Critical Rules

### Security & Type Safety
- **RLS Required**: All database queries must respect Row Level Security
- **TypeScript Strict**: Use proper types, no `any`
- **Function Components**: Use `function Component() {}`, not `React.FC`

### Design System
- Use shadcn/ui components
- CSS custom properties only
- Mobile-first responsive design
- Minimum 44px touch targets

### i18n & Routing
- Use `/:lang/route` structure
- Use `useLanguageNavigation()` for navigation
- Use `useT()` for translations

### Spec-Driven Development
- Follow Spec Kit constitution in `.specify/memory/constitution.md`
- Create specifications before implementation using `/specify` command
- Use `/plan`, `/tasks`, `/implement` for structured development

## ⚙️ Common Patterns

### Authentication
```typescript
const { user, loading, authChecked } = useAuth();
if (loading || !authChecked) return <LoadingSpinner />;
if (!user) return <Navigate to="/login" />;
```

### Service Layer
```typescript
const projectService = ServiceRegistry.getInstance().getProjectService(user);
```

### Forms
```typescript
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: { /* ... */ }
});
```

### Email Services (Edge Functions)
```typescript
// Server-side email rendering with React Email
const { data, error } = await supabase.functions.invoke('send-client-link', {
  body: { projectId, clientEmail, language: 'en' }
});
```

## 🗄️ Database

### Core Tables
- `profiles` - User accounts
- `projects` - Main business entity
- `milestones` - Project phases
- `clients` - Customer data
- `invoices` - Payment tracking
- `email_logs` - Email delivery tracking and audit trail

### Commands
```bash
npm run dev          # Development
npm run build        # Production build
npm run lint         # Code linting
npm test             # Component tests
npm run cypress:record # E2E tests with recording
```

## 📧 Email System Architecture

### Edge Functions (Server-Side)
- **`send-client-link`** - Project invitation emails to clients
- **`send-contract-approval`** - Contract approval notifications
- **`send-payment-notification`** - Payment status updates
- All emails use React Email templates with server-side rendering

### Email Templates
Located in `supabase/functions/_shared/email-templates/`:
- `client-invite.tsx` - Project access invitation
- `contract-approval.tsx` - Contract approval workflow
- `payment-notification.tsx` - Payment status updates
- `base-template.tsx` - Shared email layout

### Email Logging
- All email sends tracked in `email_logs` table
- Status monitoring (pending, sent, failed)
- Language support for multilingual emails

## 🎨 Color System

### Utilities in `src/lib/colorUtils.ts`
- `getBestTextColor(backgroundColor)` - Optimal text color
- `getBestSecondaryTextColor(backgroundColor)` - Semi-transparent text
- `getBadgeColors(backgroundColor)` - Complete badge color scheme
- All functions follow WCAG accessibility guidelines

## 🧪 Testing Architecture

### Cypress E2E Testing
- **Auth tests**: Login, signup, session management
- **Project tests**: CRUD operations, client portal access
- **Recording**: `CYPRESS_RECORD_KEY` for cloud test recording
- **Configuration**: `cypress.config.ts` with custom commands

### Test Commands
```bash
npm run cypress:record                    # Run recorded tests
npx cypress run --spec "cypress/e2e/*"   # Run specific specs
```

## 🚦 Development Guidelines

### 🟢 Safe to Edit
- UI components (following patterns)
- New pages (using existing layouts)
- New hooks (following naming conventions)
- Spec Kit specifications and plans

### 🟡 Edit with Caution
- Database migrations
- Authentication flows
- RLS policies
- Edge Functions (affect email delivery)

### 🔴 High Risk - Review First
- Core services (UserService, AuthService)
- Database schema changes
- Security implementations
- Email template modifications

## 💰 Key Features

### Currency System
- Project-specific currency vs user profile currency
- Pattern: `project.currency || project.freelancer_currency || 'USD'`
- Dashboard converts to user currency, project pages use project currency

### Subscription Plans (Sept 2025)
- **Free**: $0 - 1 project, no AI
- **Plus**: $19/month - 50 projects, AI features
- **Pro**: $349 lifetime - unlimited projects, no AI

### Project Limits & Access Control
- Plan limits strictly enforced
- Excess projects archived during downgrade (not deleted)
- Grace periods: 3-day trial, 7-day payment
- Project access guards prevent unauthorized access

### Email Notifications
- Server-side rendering with React Email templates
- Multilingual support (English/Arabic)
- Delivery tracking and audit logging
- Secure client portal access via email tokens

## 📋 Recent Updates (Updated: 2025-09-21)

### Major Changes
- **Email System Overhaul**: Migrated from client-side React Email to Edge Functions with server-side rendering
- **Spec Kit Integration**: Added spec-driven development workflow with constitution and feature specifications
- **Cypress Testing**: Implemented comprehensive E2E testing suite with auth and project workflows
- **Enhanced Email Logging**: Added `email_logs` table for delivery tracking and audit compliance

### New Features
- Server-side email template rendering for better reliability
- Spec-driven development commands (`/specify`, `/plan`, `/tasks`, `/implement`)
- E2E test recording and monitoring capabilities
- Enhanced accessibility with `visually-hidden` component

### Breaking Changes
- Removed client-side email components (`src/emails/` directory)
- All email functionality now handled by Edge Functions
- Email templates moved to `supabase/functions/_shared/email-templates/`

### Architecture Improvements
- Centralized email service architecture
- Better error handling and logging for email operations
- Improved test coverage with Cypress integration
- Structured development workflow with Spec Kit constitution

## 🔧 Environment Setup

### Required Environment Variables
```bash
# Email service configuration
RESEND_API_KEY=your_resend_key
VITE_APP_URL=your_app_url

# Cypress testing
CYPRESS_RECORD_KEY=your_cypress_key
```

### Development Workflow
1. Create specifications using `/specify` command
2. Generate implementation plans with `/plan`
3. Break down tasks with `/tasks`
4. Implement features with `/implement`
5. Run tests with `npm run cypress:record`
6. Deploy Edge Functions for email services