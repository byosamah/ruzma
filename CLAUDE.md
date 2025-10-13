# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Ruzma** is a freelancer project management platform built with React 18, TypeScript, Supabase, and Tailwind CSS. The platform enables freelancers to manage clients, projects, invoices, and contracts with internationalization support (English/Arabic RTL).

## Development Commands

### Essential Commands
```bash
npm run dev              # Start Vite dev server on port 8080
npm run build            # Production build with code splitting
npm run lint             # ESLint validation
npm run typecheck        # TypeScript type checking (must pass before commits)
npm test                 # Run Vitest unit tests
npm run test:coverage    # Generate test coverage report
```

### Supabase Commands
```bash
npx supabase start       # Start local Supabase (Docker required)
npx supabase stop        # Stop local Supabase
npx supabase db reset    # Reset database with migrations and seed data
npx supabase functions deploy <function-name>  # Deploy Edge Function
npx supabase migration new <name>              # Create new migration
```

## Architecture & Patterns

### Service-Oriented Architecture

The codebase follows a strict service layer pattern with dependency injection:

```typescript
// All services extend BaseService and are accessed via ServiceRegistry
const { user } = useAuth();
const projectService = ServiceRegistry.getInstance().getProjectService(user);
const result = await projectService.createProject(data);
```

**Critical Rules:**
- ALL business logic must be in service classes (`src/services/`)
- Services MUST extend `BaseService` for authentication and error handling
- Services accessed via `ServiceRegistry.getInstance()` (singleton pattern)
- Use `this.requireAuth()` in services to validate authentication
- Use `this.executeQuery()` for all database operations (provides error handling)

### Internationalization (i18n)

**Route Structure:** All routes follow `/:lang/route` pattern (e.g., `/en/dashboard`, `/ar/projects`)

```typescript
// Always use these hooks for i18n
import { useT } from '@/hooks/useT';                    // For translations
import { useLanguageNavigation } from '@/hooks/useLanguageNavigation'; // For navigation

// Usage
const t = useT();
const navigate = useLanguageNavigation();

<h1>{t('project.title')}</h1>  // Automatically uses current language
navigate('/dashboard');         // Automatically prefixes with /:lang
```

**Translation Files:** Located in `src/lib/translations/` (en.ts, ar.ts)

### Component Guidelines

- Use **shadcn/ui** components exclusively - never create custom base UI components
- Function components only: `function Component() {}` (NOT `React.FC`)
- Mobile-first responsive design (minimum 44px touch targets)
- CSS custom properties only - use `src/lib/colorUtils.ts` for dynamic colors
- Always use `@/` path alias (configured in vite.config.ts and tsconfig.json)

### Database & Security

**Row Level Security (RLS):**
- RLS policies are MANDATORY for all tables
- Services explicitly filter by `user_id` even though RLS enforces it
- Never bypass RLS or use service role keys inappropriately

**Type Safety:**
- TypeScript strict mode enabled (`noImplicitAny`, `strictNullChecks`)
- NO `any` types allowed
- All database types in `src/types/`

### React Query Configuration

Optimized caching strategy in App.tsx:
- `staleTime: 5 minutes` (default)
- `gcTime: 15 minutes` (garbage collection)
- `retry: 1` with exponential backoff
- `refetchOnWindowFocus: false`

## Key Features & Business Logic

### Currency System
Projects use project-specific currency OR freelancer's profile currency:
```typescript
const currency = project.currency || project.freelancer_currency || 'USD';
```
- Dashboard converts all amounts to user's profile currency
- Project pages display amounts in project currency

### Subscription Plans
- **Free:** 1 project, no AI features
- **Plus:** $19/month, 50 projects, AI features
- **Pro:** $349 lifetime, unlimited projects, no AI

**Project Limits Enforcement:**
- Strictly enforced via `userLimitsService.ts`
- Excess projects archived (not deleted) during downgrade
- 3-day trial grace period, 7-day payment grace period

### Email System (Edge Functions)

Email sending is handled server-side via Supabase Edge Functions:

```typescript
// Client-side: Invoke Edge Function
const { data, error } = await supabase.functions.invoke('send-client-link', {
  body: { projectId, clientEmail, language: 'en' }
});
```

**Edge Functions:** (`supabase/functions/`)
- `send-client-link` - Project invitation emails
- `send-contract-approval` - Contract approval notifications
- `send-payment-notification` - Payment status updates

**Email Templates:** Server-side React Email templates in `supabase/functions/_shared/email-templates/`

**Email Logging:** All emails tracked in `email_logs` table for audit compliance

### Client Portal Access

Clients access projects via secure tokenized URLs:
```
/client/:token  or  /client/project/:token
```
- Tokens generated via `ClientService.generateClientProjectToken()`
- 90-day expiry, single-use validation
- No authentication required (token-based security)

## Directory Structure

```
src/
├── components/       # UI components (shadcn/ui based)
├── hooks/           # Custom React hooks (useAuth, useT, useLanguageNavigation, etc.)
├── services/        # Business logic layer
│   ├── core/       # BaseService, ServiceRegistry, UserService, ClientService, etc.
│   └── ...         # Domain services (projectService, invoiceService, etc.)
├── lib/            # Utilities (colorUtils, currency, translations, validators)
├── pages/          # Route components (lazy loaded in App.tsx)
├── types/          # TypeScript type definitions
├── contexts/       # React contexts (LanguageContext, InvoiceContext)
└── integrations/   # External API integrations (Supabase client)

supabase/
├── migrations/     # Database schema migrations (sequential)
├── functions/      # Edge Functions for server-side operations
│   ├── _shared/   # Shared utilities and email templates
│   └── send-*/    # Individual function deployments
└── config.toml    # Local Supabase configuration

.specify/          # Spec Kit configuration (spec-driven development)
├── memory/        # Project constitution and development principles
└── templates/     # Feature specification templates
```

## Critical Files

- **src/App.tsx** - Route definitions, lazy loading, React Query setup
- **src/services/core/ServiceRegistry.ts** - Service dependency injection
- **src/services/core/BaseService.ts** - Base class for all services
- **src/lib/colorUtils.ts** - WCAG-compliant color utilities
- **src/integrations/supabase/client.ts** - Supabase client configuration
- **.specify/memory/constitution.md** - Development principles and coding standards

## Testing

### Unit Tests
- Component tests with Vitest and React Testing Library
- Test setup in `src/test/setup.ts`
- Run with `npm test` or `npm run test:coverage`

## Development Workflow

### Feature Development (Spec-Driven)
1. Create specification: `/specify` command
2. Generate plan: `/plan` command
3. Break into tasks: `/tasks` command
4. Implement: `/implement` command
5. Test: `npm run typecheck && npm run lint && npm test`

### Database Migrations
```bash
npx supabase migration new add_table_name
# Edit migration file in supabase/migrations/
npx supabase db reset  # Test migration locally
```

### Deploying Edge Functions
```bash
npx supabase functions deploy send-client-link
# Requires RESEND_API_KEY environment variable
```

## Common Patterns

### Authentication Pattern
```typescript
const { user, loading, authChecked } = useAuth();

if (loading || !authChecked) return <LoadingSpinner />;
if (!user) return <Navigate to="/login" />;
```

### Form Pattern
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: { /* ... */ }
});
```

### Service Usage Pattern
```typescript
try {
  const result = await projectService.createProject(data);
  toast.success(t('project.created'));
} catch (error) {
  if (error instanceof AppError) {
    toast.error(error.message);
  } else {
    toast.error(t('error.unexpected'));
  }
}
```

## Environment Variables

Required in `.env.local`:
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_APP_URL=http://localhost:8080
RESEND_API_KEY=your_resend_key  # For Edge Functions
```

## Build Optimization

Vite is configured with manual code splitting:
- **vendor:** React, React Router
- **ui:** Radix UI components
- **supabase:** Supabase client
- **charts:** Recharts
- **query:** React Query
- **forms:** React Hook Form, Zod

Bundle analysis: `npm run analyze` (generates `dist/stats.html`)

## Constitution & Standards

The project follows strict development principles in `.specify/memory/constitution.md`:

1. **Security First:** RLS mandatory, no `any` types, auth validation required
2. **Design Consistency:** shadcn/ui only, mobile-first, 44px touch targets
3. **i18n Ready:** `/:lang/route` structure, useT() for all text, RTL support
4. **Service-Oriented:** Business logic in services, ServiceRegistry for DI
5. **Accessibility:** WCAG compliance, proper semantic HTML, keyboard navigation

**Breaking Changes:** Require architectural review and migration planning

## Notes for AI Assistants

- ALWAYS use ServiceRegistry pattern - never instantiate services directly
- NEVER bypass authentication with `this.requireAuth()` in services
- ALWAYS use `useT()` hook for user-facing text (never hardcode strings)
- ALWAYS use `useLanguageNavigation()` for navigation (never `useNavigate()` directly)
- TypeScript compilation MUST pass before considering work complete
- Test edge cases: Arabic RTL, mobile viewports, subscription limits
- When modifying database schema, create a migration file
- When modifying email logic, test via Edge Functions (not client-side)
