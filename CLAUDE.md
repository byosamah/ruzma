# Ruzma Project Guidelines for Claude Code

## Project Overview
Ruzma is a comprehensive SaaS platform for freelancers to manage projects, clients, invoices, and payments. The platform supports multi-language (English/Arabic), includes a client portal, and uses Supabase as the backend.

## Important Instructions
Always read PLANNING.md at the start of every new conversation, check TASKS.md before starting your work, mark completed tasks to TASKS.md immediately, and add newly discovered tasks to TASKS.md when found.

## Project Structure
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui + DaisyUI
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **State Management**: TanStack Query + React Context + Zustand
- **Routing**: React Router with language-based routing (/:lang/route)
- **Authentication**: Supabase Auth with RLS policies
- **Styling**: Tailwind CSS + DaisyUI + shadcn/ui components + Framer Motion
- **Payments**: LemonSqueezy integration
- **Email**: Resend integration

## Code Organization
The project follows domain-driven design:
- `/src/components/` - Reusable components organized by feature
- `/src/pages/` - Page components for routing
- `/src/hooks/` - Custom React hooks for business logic
- `/src/services/` - API and business logic services
- `/src/types/` - TypeScript type definitions
- `/src/lib/` - Utility functions and configurations
- `/supabase/` - Database migrations and edge functions

## Development Guidelines

### 1. Code Style
- Use TypeScript strictly - avoid `any` types
- Follow existing component patterns in the codebase
- Use domain imports when possible: `import { Component } from '@/components/domain/auth'`
- Maintain backward compatibility with legacy imports
- Use Tailwind CSS classes, prefer DaisyUI components
- Implement Framer Motion animations sparingly and performantly

### 2. Database Operations
- All database operations go through Supabase client
- Use RLS policies for security
- Create migrations for schema changes in `/supabase/migrations/`
- Follow existing migration naming pattern: `YYYYMMDDHHMMSS-uuid.sql`
- Use Edge Functions for complex server-side logic

### 3. Component Development
- Use shadcn/ui and DaisyUI components from `/src/components/ui/`
- Follow the existing pattern for form validation with react-hook-form and zod
- Implement proper error handling and loading states
- Support both English and Arabic languages using the translation system
- Use BrandedLogo and BrandedProgress components for freelancer branding

### 4. State Management
- Use TanStack Query for server state
- Use React Context for global client state (Language, Currency, Branding)
- Use Zustand for complex client state management
- Follow existing patterns in hooks for data fetching

### 5. Client Portal System
- Token-based authentication for client access
- Support both legacy UUID tokens and hybrid slug-shorttoken format
- Dynamic freelancer branding with CSS custom properties
- Conversion-focused design following Marc Lou principles
- Mobile-first responsive design with floating action buttons

### 6. Security Best Practices
- Never expose sensitive data in client code
- Use environment variables for API keys
- Implement proper input validation
- Follow RLS policies for data access
- Use error boundaries for graceful error handling

### 7. Testing & Deployment
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
6. **Dynamic Branding**: Freelancer logos and colors throughout client portal
7. **Subscription Management**: LemonSqueezy integration for plan management
8. **Project Templates**: Reusable project templates system
9. **Analytics**: Comprehensive dashboard analytics with charts

## Common Tasks

### Adding a New Feature
1. Create domain-specific components in appropriate folders
2. Add necessary types to `/src/types/`
3. Create/update hooks in `/src/hooks/`
4. Add translations to `/src/lib/translations/`
5. Update database schema if needed with migrations
6. Test thoroughly on both languages

### Working with Client Portal
1. Use ClientProjectNew.tsx as the main component
2. Implement dynamic branding with useBrandingSystem hook
3. Follow Marc Lou design principles (minimal, conversion-focused)
4. Ensure all features work without user authentication
5. Support multiple deliverable links (external only)

### Debugging Issues
1. Check browser console for errors
2. Review Supabase logs for backend issues
3. Verify RLS policies for permission errors
4. Check network tab for API failures
5. Use error boundaries for graceful error handling

## Environment Variables
The project uses these key environment variables:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

## Important Files
- `/src/App.tsx` - Main app routing
- `/src/integrations/supabase/client.ts` - Supabase client setup
- `/src/lib/i18n.ts` - Translation system
- `/supabase/config.toml` - Supabase configuration
- `/src/pages/ClientProjectNew.tsx` - Client portal main component
- `/src/components/ui/BrandedLogo.tsx` - Dynamic branding logo component
- `/src/hooks/useBrandingSystem.ts` - Branding system management

## Database Schema Overview
- **profiles** - User profile information and preferences
- **projects** - Main project data with client access tokens
- **milestones** - Project milestones with payment tracking
- **clients** - Client information and management
- **invoices** - Invoice generation and tracking
- **subscriptions** - User subscription plans
- **project_templates** - Reusable project templates
- **user_plan_limits** - Subscription plan limitations
- **freelancer_branding** - Custom branding for freelancers

## Session Summary Placeholder
<!-- Add session summaries here as work progresses -->

## Recent Major Updates
- **Client Portal Redesign**: Complete redesign following Marc Lou principles with dynamic branding
- **Branding System**: Comprehensive freelancer branding with logo fallbacks and color customization
- **Payment System**: Enhanced payment proof uploads with drag-and-drop interface
- **Error Handling**: Added error boundaries and comprehensive error recovery
- **Mobile Optimization**: Floating action buttons and touch-friendly interface
- **Performance**: Optimized builds with lazy loading and code splitting

## Important Reminders
- Do what has been asked; nothing more, nothing less
- NEVER create files unless they're absolutely necessary for achieving your goal
- ALWAYS prefer editing an existing file to creating a new one
- NEVER proactively create documentation files (*.md) or README files unless explicitly requested
- Always use the TodoWrite tool for complex tasks to track progress
- Mark todos as completed immediately when finished
- Use error boundaries to prevent crashes and provide graceful recovery