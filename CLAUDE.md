# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Last Updated**: 2025-10-14

## Project Overview

**Ruzma** (رزمة) is a bilingual (Arabic/English) SaaS platform for freelancers to manage client projects, contracts, milestones, invoices, and payments. It's built as a modern React SPA with Supabase backend.

**Current Version**: 0.0.0 (in active development)

## Technology Stack

- **Frontend Framework**: React 18.3 + TypeScript 5.5 + Vite 5.4
- **UI Components**: ShadcN UI (Radix UI primitives) with Tailwind CSS 3.4
- **Database/Backend**: Supabase 2.50 (PostgreSQL + Authentication + Storage + Edge Functions)
- **State Management**: TanStack Query v5.56 for server state
- **Routing**: React Router v6.26 with language-prefixed routes (`/:lang/...`)
- **Internationalization**: Custom i18n system supporting English (LTR) and Arabic (RTL)
- **Form Handling**: React Hook Form 7.53 + Zod 3.23 validation
- **PDF Generation**: jsPDF 3.0 + html2canvas 1.4 for invoice/contract PDFs
- **Charts**: Recharts 2.12 for analytics visualizations
- **Testing**: Vitest 3.2 + React Testing Library + jsdom

## Development Commands

```bash
# Development server (runs on http://localhost:8080)
npm run dev

# Build for production
npm run build

# Build for development/staging
npm run build:dev

# Type checking (run before commits)
npm run typecheck

# Linting (ESLint)
npm run lint

# Testing
npm test                    # Run tests in watch mode
npm run test:run            # Run tests once
npm run test:ui             # Open Vitest UI
npm run test:coverage       # Generate coverage report

# Performance testing
npm run perf:test           # Run performance tests
npm run perf:profile        # Profile performance

# Bundle analysis
npm run analyze             # Analyze bundle size
npm run size                # Check bundle size limits

# Preview production build
npm run preview

# Deployment (Vercel)
./deploy.sh                 # Deploy to production with proper config
```

## Architecture Highlights

### Service Architecture Pattern

The codebase follows a **service-based architecture** with a clear separation of concerns:

```
src/services/
├── core/
│   ├── BaseService.ts          # Abstract base class for all services
│   ├── ServiceRegistry.ts      # Dependency injection container
│   ├── UserService.ts
│   ├── ClientService.ts
│   ├── CurrencyService.ts
│   ├── EmailService.ts
│   └── RateLimitService.ts
├── projectService.ts
├── invoiceService.ts
├── brandingService.ts
└── userLimitsService.ts
```

**Critical Pattern**: All services extend `BaseService` which provides:
- Authentication validation via `ensureAuthenticated()`
- Centralized error handling via `handleError()`
- Security event logging via `logOperation()`
- Database operation wrappers

**Service Usage**:
```typescript
// Get services via ServiceRegistry
const { user } = useAuth();
const registry = ServiceRegistry.getInstance();
const projectService = registry.getProjectService(user);

// Services automatically handle auth, errors, and logging
const project = await projectService.createProject(projectData);
```

### Context Providers

Three main contexts provide global state:

1. **AuthContext** (via `useAuth()`): User authentication, session management
2. **LanguageContext** (via `useLanguage()`): i18n and RTL/LTR switching
3. **InvoiceContext** (via `useInvoice()`): Invoice creation form state

**Provider hierarchy** (order matters):
```typescript
QueryClientProvider → BrowserRouter → LanguageProvider →
  TooltipProvider → InvoiceProvider → Routes
```

### Internationalization (i18n)

**Bilingual Support**: English (default) and Arabic with full RTL support

```typescript
// Translation hook
const t = useT();
const title = t('dashboard.welcome');

// Language context
const { language, setLanguage } = useLanguage(); // 'en' | 'ar'
const { dir } = useLanguage(); // 'ltr' | 'rtl'

// Route structure: All app routes are prefixed with language
// /:lang/dashboard, /:lang/projects, /:lang/clients, etc.
// Exception: Client portal routes (/client/:token) are language-agnostic
```

**Translation files**: Located in `src/lib/translations/`
- Split by domain: `auth.ts`, `dashboard.ts`, `projects.ts`, `clients.ts`, `profile.ts`, `analytics.ts`, `plans.ts`
- Combined in `src/lib/i18n.ts`

**RTL Styling**: Use conditional classes based on `dir`:
```typescript
const className = cn(
  "flex items-center gap-4",
  dir === 'rtl' && "flex-row-reverse"
);
```

### Data Fetching with TanStack Query

**Query configuration** (in `App.tsx`):
- `staleTime: 5 minutes`
- `gcTime: 15 minutes`
- `refetchOnWindowFocus: false`
- `refetchOnMount: false`
- `retry: 1` with exponential backoff

**Common pattern**:
```typescript
const { data: projects, isLoading } = useQuery({
  queryKey: ['projects', user?.id],
  queryFn: () => projectService.getProjects(),
  enabled: !!user,
});
```

### Database Integration (Supabase)

**Client**: Single instance exported from `src/integrations/supabase/client.ts`

**Types**: Auto-generated in `src/integrations/supabase/types.ts` - **DO NOT edit manually**

**RLS Security**: Row Level Security policies enforce data isolation per user. Always include `user_id` in queries even though RLS enforces it.

**Common tables**:
- `profiles` - User profile data (with currency, branding preferences)
- `projects` - Project information with milestones
- `clients` - Client contacts and relationships
- `milestones` - Project milestones/deliverables
- `invoices` - Invoice records
- `freelancer_branding` - Custom branding per user
- `client_project_tokens` - Secure tokens for client portal access
- `email_logs` - Email delivery tracking (new in recent migration)

**Query pattern with relations**:
```typescript
const { data, error } = await supabase
  .from('projects')
  .select(`
    *,
    client:clients(*),
    milestones(*),
    invoices(*)
  `)
  .eq('user_id', user.id)
  .order('created_at', { ascending: false });
```

### Routing & Navigation

**Language-aware routes**: Most routes are prefixed with `/:lang` (en/ar)

**Protected routes**: Wrapped with `<ProtectedRoute>` component which:
- Checks authentication state
- Shows loading spinner during auth check
- Redirects to `/:lang/login` if not authenticated
- Passes `user` and `profile` to children

**Lazy loading**: All page components (except Login) are lazy-loaded via `React.lazy()` with `Suspense` fallback

**Available pages**:
- Dashboard, Projects, Clients, Invoices, Analytics
- CreateProject, EditProject, ProjectManagement, ProjectTemplates
- CreateInvoice, ClientProject (portal)
- Profile, Plans, ContactUs
- Auth pages: Login, SignUp, ForgotPassword, ResetPassword, EmailConfirmation, AuthCallback

**Navigation helpers**:
- `useLanguageNavigation()` - Language-aware navigation with automatic route prefixing
- Standard `useNavigate()` for language-agnostic routes (client portal, contract approval)

### Component Structure

**UI Components**: ShadcN UI components in `src/components/ui/`
- Radix UI primitives with custom styling
- Configured via `components.json`
- Use Tailwind for all styling
- Includes: Button, Dialog, Form, Input, Select, Tabs, Toast, and more

**Domain components**: Organized by feature:
```
src/components/
├── Clients/              # Client management (table, filters, stats)
├── CreateProject/        # Project creation wizard
├── EditProject/          # Project editing
├── Invoices/             # Invoice listing and actions
├── CreateInvoice/        # Invoice creation with calculations
├── ProjectCard/          # Project card display
├── ProjectClient/        # Client portal views (branded)
├── MilestoneCard/        # Milestone display/management
├── Profile/              # User profile management
├── dashboard/            # Dashboard stats and components
├── notifications/        # Notification bell and list
├── auth/                 # Auth-related components
├── shared/               # Reusable components (EmptyState, StatCard, dialogs)
└── domain/               # Domain exports (auth, clients, invoices, projects)
```

**Lazy loading pattern** for heavy components:
```typescript
const EditContractDialogLazy = lazy(() =>
  import('./EditContractDialog').then(m => ({ default: m.EditContractDialog }))
);

// Usage with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <EditContractDialogLazy />
</Suspense>
```

### Custom Hooks

Organized by domain in `src/hooks/`:
```
hooks/
├── clients/              # Client operations (useClients, useClientService)
├── projects/             # Project operations (useProjects, useProjectMilestones)
├── invoices/             # Invoice operations (useInvoices, useInvoiceManager)
├── profile/              # User profile (useProfile, authUtils)
├── dashboard/            # Dashboard data (useDashboardActions, useDashboardSEO)
├── subscription/         # Subscription management
├── templates/            # Project templates (useTemplates, useTemplateOperations)
├── navigation/           # Navigation helpers (useNavigation, useLanguageNavigation)
├── analytics/            # Analytics data (useSimpleAnalytics)
├── common/               # Reusable hooks (useToggleState, useAsyncOperation, useFormState)
└── core/                 # Core hooks (useOptimizedProfile, useProfileQuery)
```

**Hook naming convention**:
- `use[Domain]` - Main data fetching hook (e.g., `useProjects()`)
- `use[Domain]Manager` - CRUD operations hook (e.g., `useProjectManager()`)
- `use[Domain]Actions` - Action-specific hook (e.g., `useDashboardActions()`)

### Security Patterns

**Authentication**: Always use `useAuth()` hook to get current user
```typescript
const { user, loading, authChecked } = useAuth();

// Wait for auth check before rendering
if (loading || !authChecked) return <LoadingSpinner />;
if (!user) return <Navigate to="/login" />;
```

**Client Portal Security**: Token-based access for clients (no login required)
- Tokens stored in `client_project_tokens` table
- 90-day expiry by default
- Route: `/client/:token` or `/client/project/:token`
- Token validation happens server-side

**Security Event Logging**: Use `logSecurityEvent()` from `@/lib/authSecurity` for:
- Authentication events (signin, signout, signup)
- Data access (project views, client access)
- Security-relevant operations (password resets, token generation)

**Input Validation**: All forms use Zod schemas for validation
```typescript
// Example from validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  brief: z.string().min(10).max(2000),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'SAR']),
  // ... more fields
});
```

### State Management Approach

1. **Server state**: TanStack Query for all API/database operations
2. **Global client state**: React Context (Auth, Language, Invoice)
3. **Local component state**: React `useState`/`useReducer`
4. **Form state**: React Hook Form with Zod validation

**Don't** put derived data in state - compute it from queries/props

**Query invalidation pattern**:
```typescript
const queryClient = useQueryClient();

// After mutation, invalidate related queries
await queryClient.invalidateQueries({ queryKey: ['projects'] });
```

### Styling Guidelines

- **Tailwind CSS** for all styling (v3.4)
- **cn() utility** from `@/lib/utils` for conditional classes (uses `clsx` + `tailwind-merge`)
- **ShadcN components** for UI primitives
- **Responsive design**: mobile-first approach with `sm:`, `md:`, `lg:` breakpoints
- **Dark mode**: Supported via `next-themes` package
- **RTL support**: Conditional classes based on `dir` from `useLanguage()`
- **Font**: IBM Plex Sans Arabic for both English and Arabic

**Color system**:
- Uses CSS variables defined in `index.css`
- Primary colors: `--primary`, `--primary-foreground`
- Secondary colors: `--secondary`, `--secondary-foreground`
- Muted, accent, destructive variants available

### PDF Generation

**Invoice/Contract PDFs** use `jsPDF` + `html2canvas`:

1. Render hidden HTML template with invoice/contract data
2. Convert to canvas via `html2canvas` with proper scaling
3. Generate PDF via `jsPDF` with A4 dimensions
4. Upload to Supabase Storage (`invoice-pdfs` or `contract-pdfs` bucket)
5. Store public URL in database
6. Handle Arabic text with `arabic-reshaper` and `bidi-js`

**Critical notes**:
- PDF generation happens **client-side** for maximum customization
- Arabic text requires special handling for proper rendering
- PDFs are stored in public Supabase Storage buckets

**Implementation location**: `src/lib/pdfGenerator.ts`

### Testing

**Test framework**: Vitest with React Testing Library

**Test files**: Co-located with source files or in `src/test/`

**Setup**: `src/test/setup.ts` configures jsdom and testing-library

**Performance tests**: `src/test/performance/` for bundle size and render performance

**Test utilities**:
- `@testing-library/react` - Component testing
- `@testing-library/user-event` - User interaction simulation
- `@testing-library/jest-dom` - Custom matchers

**Run single test**:
```bash
npm test -- path/to/test.test.ts
```

**Coverage**: Generate with `npm run test:coverage`

## Email System

**Email delivery**: Supabase Edge Functions with email logging

**Edge Functions** (in `supabase/functions/`):
- `send-contract-approval/` - Send contract approval emails
- `send-payment-notification/` - Send payment notifications
- `send-client-link/` - Send client portal access links
- `send-react-email/` - Generic React Email template sender

**Email templates**: Located in `supabase/functions/_shared/email-templates/`
- `base-template.tsx` - Base email layout
- `contract-approval.tsx` - Contract approval notification
- `payment-notification.tsx` - Payment received notification
- `client-invite.tsx` - Client portal invite

**Email logging**: All email sends are logged to `email_logs` table
- Tracks template, recipient, status, timestamp
- Stores error messages for failed sends
- RLS restricted to service role only

**Deployment**:
```bash
cd supabase/functions
supabase functions deploy send-contract-approval
supabase functions deploy send-payment-notification
supabase functions deploy send-client-link
```

## Project Subscription System

**User Types**:
- `free` - 1 project, 5 clients, 5 invoices, 100MB storage
- `pro` - 50 projects, 100 clients, 500 invoices, 10GB storage
- `enterprise` - Unlimited everything + white-label

**Limits enforcement**:
- `userLimitsService.ts` checks limits before operations
- `useUserLimits()` hook provides current usage/limits
- Database triggers update usage counters automatically
- `useUsageTracking()` hook monitors usage changes

**Features by tier**:
```typescript
{
  free: { customBranding: false, advancedAnalytics: false, prioritySupport: false },
  pro: { customBranding: true, advancedAnalytics: true, prioritySupport: true },
  enterprise: { customBranding: true, advancedAnalytics: true, prioritySupport: true, whiteLabel: true }
}
```

## Deployment

**Platform**: Vercel

**Deploy script**: `./deploy.sh` handles:
1. Cleaning up existing Vercel config
2. Creating correct project configuration (`.vercel/project.json`)
3. Building the project with `npm run build`
4. Deploying to production with `vercel deploy --prod --yes`

**Configuration**: `vercel.json` includes:
- Build settings (Vite framework)
- SPA rewrites (all routes → `index.html`)
- Cache headers for static assets (1 year max-age)
- Environment variables (Supabase URL/keys)

**Environment variables** (set in Vercel dashboard):
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

**Supabase Edge Functions**: Located in `supabase/functions/`
- Deployed separately via Supabase CLI
- Use `supabase functions deploy <function-name>`

**Build output**: `dist/` directory (gitignored)

## Important Files

- **`App.tsx`**: Main app component with provider hierarchy, routes, and query client config
- **`src/integrations/supabase/client.ts`**: Supabase client singleton (use this everywhere)
- **`src/integrations/supabase/types.ts`**: Auto-generated database types (DO NOT EDIT)
- **`src/services/core/BaseService.ts`**: Abstract base class for all services
- **`src/services/core/ServiceRegistry.ts`**: Dependency injection container
- **`src/lib/i18n.ts`**: Translation system and `useT()` hook
- **`src/contexts/LanguageContext.tsx`**: Language switching and RTL handling
- **`src/lib/utils.ts`**: Utility functions (cn, formatters)
- **`vite.config.ts`**: Build configuration with manual chunk splitting
- **`tailwind.config.ts`**: Tailwind and theme configuration
- **`components.json`**: ShadcN UI configuration
- **`deploy.sh`**: Production deployment script
- **`vercel.json`**: Vercel deployment configuration

## Common Tasks

### Adding a new page

1. Create page component in `src/pages/YourPage.tsx`
2. Lazy load it in `App.tsx`:
   ```typescript
   const YourPage = lazy(() => import('./pages/YourPage'));
   ```
3. Add route with language prefix:
   ```typescript
   <Route path="/:lang/your-page" element={
     <LanguageLayout>
       <ProtectedRoute><YourPage /></ProtectedRoute>
     </LanguageLayout>
   } />
   ```
4. Add translations in `src/lib/translations/` (create new file if needed)
5. Add backward compatibility redirect:
   ```typescript
   <Route path="/your-page" element={<Navigate to="/en/your-page" replace />} />
   ```

### Adding a new service

1. Create service class extending `BaseService` in `src/services/`
2. Implement required methods with proper error handling
3. Add to `ServiceRegistry` if it needs DI
4. Create corresponding hook in `src/hooks/`
5. Use TanStack Query for data fetching in the hook

### Adding translations

1. Identify the domain (auth, dashboard, projects, etc.)
2. Add keys to relevant file in `src/lib/translations/`
3. Update **both** `en` and `ar` objects
4. Import and combine in `src/lib/i18n.ts`
5. Use `useT()` hook to access: `const t = useT(); t('your.key')`

### Modifying database schema

1. Create migration file in `supabase/migrations/`
2. Update schema in Supabase dashboard or via Supabase CLI
3. Regenerate types:
   ```bash
   npx supabase gen types typescript --project-id ***REMOVED*** > src/integrations/supabase/types.ts
   ```
4. Update services/hooks using affected tables
5. Update any affected queries with new columns/relations
6. Test with type checking: `npm run typecheck`

### Working with client portal

Client portal routes (`/client/:token`) are:
- **Public** (no authentication required)
- **Token-based** access (validated server-side)
- **Branded** using `freelancer_branding` table data
- **Language-agnostic** (can be viewed in any language)

**Key components**:
- `src/pages/ClientProject.tsx` - Main portal page
- `src/components/ProjectClient/` - Portal-specific components
- `src/api/clientProject.ts` - Token validation and data fetching

### Creating a new Edge Function

1. Create function directory in `supabase/functions/`
2. Add `index.ts` with handler:
   ```typescript
   import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

   serve(async (req) => {
     // Your logic here
     return new Response(JSON.stringify({ success: true }))
   })
   ```
3. Add email template if needed in `_shared/email-templates/`
4. Test locally with Supabase CLI
5. Deploy: `supabase functions deploy your-function-name`

## Code Conventions

- **TypeScript**: Strict mode enabled, no `any` types allowed
- **Imports**: Use `@/` alias for absolute imports from `src/`
- **Component naming**: PascalCase for components (e.g., `ProjectCard.tsx`)
- **Hook naming**: camelCase with `use` prefix (e.g., `useProjects.ts`)
- **File naming**: Match component/hook name exactly
- **Comments**: JSDoc for public APIs, inline comments for complex logic
- **Error handling**: Always handle errors from async operations
- **Loading states**: Always show loading UI during async operations
- **Translations**: Never hardcode user-facing text - always use `useT()`

**Naming patterns**:
- Pages: `Dashboard.tsx`, `CreateProject.tsx`
- Components: `ProjectCard.tsx`, `MilestoneCard/index.tsx`
- Hooks: `useProjects.ts`, `useProjectManager.ts`
- Services: `projectService.ts`, `ClientService.ts`
- Types: `types/project.ts`, `types/client.ts`
- Utils: `lib/pdfGenerator.ts`, `lib/authSecurity.ts`

## Performance Optimizations

- **Code splitting**: Manual chunks in `vite.config.ts`:
  - `vendor` - React, React DOM, React Router
  - `ui` - Radix UI components
  - `supabase` - Supabase client
  - `charts` - Recharts
  - `utils` - Date-fns, clsx, tailwind-merge
  - `query` - TanStack Query
  - `forms` - React Hook Form, Zod
- **Lazy loading**: All pages except Login use `React.lazy()`
- **Query caching**: TanStack Query with 5-minute stale time, 15-minute gc time
- **Image optimization**: WebP format preferred, Supabase storage with CDN
- **Bundle analysis**: `npm run analyze` generates visualization in `dist/stats.html`
- **Size limits**: Enforced via `size-limit` package (check with `npm run size`)

**Bundle targets**:
- Target: `esnext` for modern browsers
- Minify: `esbuild` for fast builds
- CSS: Code splitting enabled, minified
- Tree shaking: Automatic with Vite

## Debugging

**Development tools**:
- **React Query Devtools**: Available in development mode (bottom left corner)
- **React DevTools**: Browser extension for component inspection
- **Supabase logs**: Check dashboard for database/function errors
- **Browser DevTools**: Network tab for API calls, Console for errors

**Type errors**: Run `npm run typecheck` for full TypeScript diagnostics

**Common issues**:
- **Auth errors**: Check `useAuth()` hook and Supabase auth logs
- **Query errors**: Check TanStack Query DevTools for failed queries
- **Translation errors**: Verify keys exist in both `en` and `ar` translation files
- **Routing errors**: Check language prefix is correct (`/:lang/`)
- **RLS errors**: Verify `user_id` is included in queries

**Logging**:
- Security events: `logSecurityEvent()` in `@/lib/authSecurity`
- Service operations: `logOperation()` in `BaseService`
- Email sends: Logged to `email_logs` table

## Recent Updates (Updated: 2025-10-14)

### Major Changes

**Testing Framework Migration**:
- **Removed**: Cypress E2E testing framework completely
- Deleted 10+ test files, fixtures, screenshots
- Removed `cypress.config.ts` and all Cypress dependencies
- Reduced bundle size significantly

**Spec Kit Integration**:
- **Added**: Comprehensive feature specification system in `.specify/`
- New commands: `/specify`, `/plan`, `/tasks`, `/implement`, `/constitution`
- Templates for specs, plans, tasks, and agent interactions
- Bash scripts for feature management workflow
- Constitution-based development guidance

**Documentation Improvements**:
- Created comprehensive `README.md` with setup instructions
- Updated `CLAUDE.md` with current architecture and patterns
- Cleaned up legacy documentation files (20+ deleted)

**Email System Enhancement**:
- New migration: `001_email_logs.sql` for email tracking
- Email logs table with RLS policies
- Tracks template, recipient, status, errors
- Service role-only access for security

### Breaking Changes

None - This update primarily removes unused testing framework and adds development tooling.

### Configuration Changes

**Dependencies removed**:
- `cypress` (13.16.1)
- `@badeball/cypress-cucumber-preprocessor`
- `@bahmutov/cypress-esbuild-preprocessor`

**New structure**:
- `.specify/` - Feature specification system
- `.claude/commands/` - Custom slash commands

### Migration Notes

**For developers**:
1. Run `npm install` to update dependencies
2. Review new `/specify`, `/plan`, `/tasks` commands for feature development
3. Continue using Vitest for unit/integration tests
4. Use new email logging system for email debugging

**For CI/CD**:
- Remove any Cypress-related CI jobs
- No other pipeline changes needed

**Upgrading from earlier versions?** See **[MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)** for detailed migration instructions and file replacement mappings.

## Development Workflow

### Feature Development with Spec Kit

1. **Specify**: Create feature specification
   ```bash
   /specify "Add export functionality to projects"
   ```

2. **Plan**: Generate implementation plan
   ```bash
   /plan
   ```

3. **Tasks**: Break down into actionable tasks
   ```bash
   /tasks
   ```

4. **Implement**: Execute the implementation
   ```bash
   /implement
   ```

5. **Constitution**: Review against project principles
   ```bash
   /constitution
   ```

### Standard Development Flow

1. **Branch**: Create feature branch from `main`
2. **Develop**: Write code following conventions
3. **Test**: Run `npm run typecheck` and `npm test`
4. **Lint**: Run `npm run lint` and fix issues
5. **Commit**: Use conventional commit messages
6. **Deploy**: Merge to main for automatic Vercel deployment

### Git Commit Conventions

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
refactor: Refactor code
test: Add tests
chore: Maintenance tasks
```

## Notes for AI Assistants

**Critical rules**:
- **Authentication**: Always check `user` from `useAuth()` before protected operations
- **Translations**: Never hardcode user-facing text - always use `useT()`
- **Services**: Use service methods via `ServiceRegistry` instead of direct Supabase calls
- **RLS**: Supabase RLS policies protect data, but explicit `user_id` filters are still recommended
- **Types**: Prefer generated Supabase types over custom types for database entities
- **Lazy loading**: Consider lazy loading for new heavy components/pages
- **RTL**: Always test Arabic/RTL layout when modifying UI components

**When making changes**:
1. Run type checker before committing
2. Add translations for both English and Arabic
3. Update tests if behavior changes
4. Consider RTL layout implications
5. Follow existing naming conventions
6. Use existing services/hooks when available
7. Add JSDoc comments for new public APIs

**Architecture principles**:
- Services handle business logic
- Hooks handle React integration
- Components are presentational
- Context for global state only
- TanStack Query for server state
- Zod for validation schemas
- Tailwind for all styling

## Troubleshooting

**Problem: TypeScript errors after schema change**
- Solution: Regenerate Supabase types and run `npm run typecheck`

**Problem: Translation key not found**
- Solution: Check key exists in both `en` and `ar` in `src/lib/translations/`

**Problem: Query not updating after mutation**
- Solution: Invalidate queries with `queryClient.invalidateQueries()`

**Problem: Auth redirect loop**
- Solution: Check `authChecked` state before redirecting

**Problem: RTL layout broken**
- Solution: Add conditional classes based on `dir` from `useLanguage()`

**Problem: PDF generation fails for Arabic**
- Solution: Ensure `arabic-reshaper` and `bidi-js` are applied to text

**Problem: Build fails with "Cannot find module"**
- Solution: Check import paths use `@/` alias correctly

**Problem: Supabase RLS blocking query**
- Solution: Verify `user_id` matches authenticated user

## Additional Resources

- **ShadcN UI Docs**: https://ui.shadcn.com/
- **Radix UI Docs**: https://www.radix-ui.com/
- **TanStack Query Docs**: https://tanstack.com/query/latest
- **Supabase Docs**: https://supabase.com/docs
- **Vite Docs**: https://vitejs.dev/
- **Tailwind Docs**: https://tailwindcss.com/

## Project-Specific Documentation

Additional documentation files in the repository:
- `README.md` - User-facing project documentation
- `src/*/CLAUDE.md` - Component/directory-specific guidelines
- `.specify/` - Feature specifications and development workflow
- `supabase/functions/README.md` - Edge Functions documentation
