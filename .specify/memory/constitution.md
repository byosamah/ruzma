# Ruzma Constitution
<!-- Freelancer Project Management Platform Development Constitution -->

## Core Principles

### I. Security & Privacy First
Every feature must prioritize user data protection; Row Level Security (RLS) is mandatory for all database operations; TypeScript strict mode enforced - no `any` types; Authentication and authorization checks required for all user-facing features

### II. Design System Consistency
All UI components must use shadcn/ui library; Mobile-first responsive design required; Minimum 44px touch targets for accessibility; CSS custom properties only - no hardcoded values; Follow existing color system utilities in `src/lib/colorUtils.ts`

### III. Internationalization Ready
All routes must follow `/:lang/route` structure; Use `useLanguageNavigation()` for navigation; Use `useT()` hook for all user-facing text; Support Arabic (RTL) and English (LTR) layouts

### IV. Service-Oriented Architecture
Business logic contained in service layer (`src/services/`); Use ServiceRegistry pattern for dependency injection; Function components only - no `React.FC` types; Custom hooks for reusable stateful logic

### V. Performance & Accessibility
WCAG accessibility guidelines compliance; Type safety with proper TypeScript definitions; Component testing required; Mobile performance optimization

## Technology Standards

### Stack Requirements
- React 18 with TypeScript in strict mode
- Supabase for backend services and real-time features
- Tailwind CSS with shadcn/ui component system
- Vite for build tooling and development server
- React Query for server state management

### Database Standards
- All tables must implement Row Level Security policies
- Currency handling: project-specific currency vs user profile currency
- Use proper database migrations for schema changes
- Maintain referential integrity with foreign key constraints

## Development Workflow

### Code Quality Gates
- TypeScript compilation must pass with no errors
- ESLint rules must pass without warnings
- Component tests required for new UI components
- Service layer unit tests for business logic changes

### Feature Development Process
1. Plan feature using ServiceRegistry patterns
2. Implement with proper type definitions
3. Add internationalization support
4. Test across mobile and desktop viewports
5. Verify accessibility compliance
6. Run full test suite before deployment

## Governance

This constitution supersedes all other development practices; All pull requests must demonstrate compliance with these principles; Breaking changes require architectural review and migration planning; Production deployment requires successful CI/CD pipeline completion

**Version**: 1.0.0 | **Ratified**: 2025-09-21 | **Last Amended**: 2025-09-21
