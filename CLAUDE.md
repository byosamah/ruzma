# Ruzma Project Guidelines for Claude Code

## Project Overview
Ruzma is a comprehensive SaaS platform for freelancers to manage projects, clients, invoices, and payments. The platform supports multi-language (English/Arabic), includes a client portal, and uses Supabase as the backend.

## Important Instructions
Always read PLANNING.md at the start of every new conversation, check TASKS.md before starting your work, mark completed tasks to TASKS.md immediately, and add newly discovered tasks to TASKS.md when found.

## Project Structure
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **State Management**: TanStack Query + React Context
- **Routing**: React Router with language-based routing (/:lang/route)
- **Authentication**: Supabase Auth with RLS policies

## Code Organization
The project follows domain-driven design:
- `/src/components/domain/` - Domain-specific components (auth, projects, clients, invoices)
- `/src/hooks/domain/` - Domain-specific hooks
- `/src/services/` - API and business logic services
- `/src/types/` - TypeScript type definitions
- `/supabase/` - Database migrations and edge functions

## Development Guidelines

### 1. Code Style
- Use TypeScript strictly - avoid `any` types
- Follow existing component patterns in the codebase
- Use domain imports when possible: `import { Component } from '@/components/domain/auth'`
- Maintain backward compatibility with legacy imports

### 2. Database Operations
- All database operations go through Supabase client
- Use RLS policies for security
- Create migrations for schema changes in `/supabase/migrations/`
- Follow existing migration naming pattern: `YYYYMMDDHHMMSS-uuid.sql`

### 3. Component Development
- Use shadcn/ui components from `/src/components/ui/`
- Follow the existing pattern for form validation with react-hook-form and zod
- Implement proper error handling and loading states
- Support both English and Arabic languages using the translation system

### 4. State Management
- Use TanStack Query for server state
- Use React Context for global client state (Language, Invoice)
- Follow existing patterns in hooks for data fetching

### 5. Security Best Practices
- Never expose sensitive data in client code
- Use environment variables for API keys
- Implement proper input validation
- Follow RLS policies for data access

### 6. Testing & Deployment
- Run `npm run dev` for local development
- Run `npm run build` to build for production
- Run `npm run lint` to check code quality
- The app is deployed via Lovable platform

## Key Features to Maintain
1. **Multi-language Support**: All user-facing text must support English/Arabic
2. **Client Portal**: Maintain secure token-based access for clients
3. **Real-time Updates**: Use Supabase subscriptions where applicable
4. **Responsive Design**: Ensure all features work on mobile
5. **Payment Processing**: Handle payment proofs and notifications correctly

## Common Tasks

### Adding a New Feature
1. Create domain-specific components in appropriate folders
2. Add necessary types to `/src/types/`
3. Create/update hooks in `/src/hooks/domain/`
4. Add translations to `/src/lib/translations/`
5. Update database schema if needed with migrations
6. Test thoroughly on both languages

### Debugging Issues
1. Check browser console for errors
2. Review Supabase logs for backend issues
3. Verify RLS policies for permission errors
4. Check network tab for API failures

## Environment Variables
The project uses these key environment variables:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

## Important Files
- `/src/App.tsx` - Main app routing
- `/src/integrations/supabase/client.ts` - Supabase client setup
- `/src/lib/i18n.ts` - Translation system
- `/supabase/config.toml` - Supabase configuration

## Session Summary Placeholder
<!-- Add session summaries here as work progresses -->
# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.