# Claude Projects Instructions for Ruzma

## System Behavior

You are working on **Ruzma**, a production-ready freelancer project management platform with 20 active users and 83 database records. This is a live system with real user data - handle with care.

### Response Style
- **Be concise and technical** - provide direct solutions without lengthy explanations unless asked
- **Show, don't tell** - provide working code examples instead of theoretical descriptions
- **Security-first** - always consider RLS policies and TypeScript safety
- **Mobile-first** - all UI must work on mobile devices (44px minimum touch targets)

## Project Context

**Architecture**: React 18 + TypeScript + Supabase + Tailwind CSS + shadcn/ui  
**Security**: 100/100 score with comprehensive Row Level Security (RLS)  
**Internationalization**: `/:lang/route` structure with custom i18n system  
**State Management**: TanStack Query + React Context (no Redux)  
**Styling**: Tailwind CSS + CSS custom properties (no hardcoded colors)  

## Critical Rules - NEVER BREAK THESE

### 1. Row Level Security (RLS) - MANDATORY
```typescript
// ❌ NEVER bypass RLS policies
const { data } = await supabase.from('projects').select('*');

// ✅ ALWAYS use authenticated client with proper user context
const { data } = await supabase.from('projects').select('*').eq('user_id', user.id);
```

### 2. TypeScript Strict Mode - MANDATORY
```typescript
// ❌ NEVER use 'any' or suppress TypeScript errors
const handleClick = (event: any) => { /* ... */ };

// ✅ ALWAYS use proper types
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => { /* ... */ };
```

### 3. Modern Function Components - MANDATORY
```typescript
// ❌ NEVER use React.FC
const Component: React.FC<Props> = ({ children }) => { /* ... */ };

// ✅ ALWAYS use function declarations
function Component({ children }: Props) { /* ... */ }
```

### 4. Design System - MANDATORY
- **ALWAYS** use shadcn/ui components as the foundation
- **ALWAYS** use CSS custom properties, never hardcoded colors: `bg-primary` not `bg-blue-500`
- **ALWAYS** follow mobile-first responsive design patterns
- **ALWAYS** ensure 44px minimum touch targets for interactive elements
- **ALWAYS** include proper accessibility attributes

### 5. Internationalization - MANDATORY
```typescript
// ❌ NEVER use hardcoded strings
<Button>Create Project</Button>

// ✅ ALWAYS use translations
import { useT } from '@/hooks/core/useT';
const t = useT();
<Button>{t.createProject}</Button>

// ❌ NEVER use React Router navigate directly
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
navigate('/projects');

// ✅ ALWAYS use language-aware navigation
import { useLanguageNavigation } from '@/hooks/core/useLanguageNavigation';
const navigate = useLanguageNavigation();
navigate('/projects');
```

## Required Code Patterns

### Authentication Pattern
```typescript
import { useAuth } from '@/hooks/core/useAuth';

function MyComponent() {
  const { user, loading, authChecked } = useAuth();
  
  if (loading || !authChecked) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  
  return <AuthenticatedContent />;
}
```

### Service Layer Pattern
```typescript
import { ServiceRegistry } from '@/services/core/ServiceRegistry';

function useProjectActions() {
  const { user } = useAuth();
  const projectService = ServiceRegistry.getInstance().getProjectService(user);
  
  return {
    createProject: projectService.createProject.bind(projectService),
    updateProject: projectService.updateProject.bind(projectService),
  };
}
```

### Form Handling Pattern
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';

function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { /* ... */ }
  });
  
  const onSubmit = form.handleSubmit(async (data) => {
    // Handle form submission with proper error handling
  });
  
  return (
    <Form {...form}>
      <form onSubmit={onSubmit}>
        {/* Form content */}
      </form>
    </Form>
  );
}
```

### Component Structure Pattern
```typescript
interface ComponentProps {
  // Always define proper interfaces with JSDoc if complex
}

function Component({ prop }: ComponentProps) {
  // 1. Hooks first
  const { user } = useAuth();
  const t = useT();
  
  // 2. State and effects
  const [state, setState] = useState<Type>({});
  
  // 3. Event handlers
  const handleAction = useCallback(() => {
    // Implementation
  }, [dependencies]);
  
  // 4. Early returns for loading/error states
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage />;
  
  // 5. Render with mobile-first responsive design
  return (
    <div className="p-4 md:p-6">
      <h2 className="text-lg font-semibold mb-4">
        {t.componentTitle}
      </h2>
      {/* Content */}
    </div>
  );
}
```

## Database Operations

### Core Tables (All have RLS)
```sql
profiles         -- User accounts (20 records)
projects         -- Main business entity (7 records)
milestones       -- Project phases (14 records) 
clients          -- Customer relationships (15 records)
invoices         -- Payment tracking (5 records)
project_templates -- Reusable templates (13 records)
```

### Storage Buckets
```javascript
'branding-logos'    // Custom logos (10 files)
'payment-proofs'    // Payment confirmations (10 files)
'deliverables'      // Project deliverables (6 files)  
'profile-pictures'  // User avatars (9 files)
```

## Common Task Instructions

### Adding New Features
1. **Check existing patterns** - Look for similar features first
2. **Follow domain organization** - Place components in appropriate domain folders
3. **Extend services properly** - Use BaseService pattern and ServiceRegistry
4. **Add proper TypeScript types** - Define interfaces in `/src/types`
5. **Include translations** - Add to appropriate language files
6. **Test RLS policies** - Ensure data isolation works correctly

### UI Component Development
1. **Start with shadcn/ui** - Use existing components as foundation
2. **Follow mobile-first** - Design for mobile, enhance for desktop
3. **Use CSS custom properties** - Never hardcode colors or spacing
4. **Include loading states** - Handle async operations properly
5. **Add accessibility** - ARIA labels, keyboard navigation, focus management
6. **Test responsive behavior** - Verify all breakpoints work correctly

### Database Changes
1. **Never bypass RLS** - All queries must respect user isolation
2. **Test with live data** - Use `node scripts/supabase-direct-query.js`
3. **Validate security** - Run `node scripts/security-validation.js`
4. **Update TypeScript types** - Keep `/src/types` in sync with schema
5. **Document changes** - Update relevant CLAUDE.md files

### Form Implementation
1. **Use react-hook-form + Zod** - Standard validation pattern
2. **Include proper error handling** - User-friendly error messages
3. **Add loading states** - Show progress during submissions
4. **Follow design system** - Use shadcn/ui form components
5. **Include accessibility** - Proper labels and ARIA attributes

## File Organization Rules

### Component Placement
```
src/components/
├── core/           # Shared, reusable components (Layout, UI elements)
├── projects/       # Project-specific components
├── clients/        # Client management components  
├── invoices/       # Invoicing components
├── branding/       # Custom branding components
└── [domain]/       # Other business domain components
```

### Service Layer
```
src/services/
├── core/           # BaseService, ServiceRegistry, utilities
└── domain/         # ProjectService, ClientService, etc.
```

### Hook Organization
```
src/hooks/
├── core/           # useAuth, useT, useLanguageNavigation
└── domain/         # useProjects, useClients, etc.
```

## Testing & Validation

### Before Committing Code
1. **Run type checking**: `npm run lint`
2. **Test RLS policies**: Ensure user data isolation
3. **Validate mobile responsiveness**: Test on mobile viewport
4. **Check accessibility**: Verify keyboard navigation and screen readers
5. **Test with real data**: Use existing 20 user accounts

### Debugging Tools
```bash
# Live database analysis
node scripts/supabase-direct-query.js

# Security validation  
node scripts/security-validation.js

# Development server
npm run dev

# Production build test
npm run build
```

## Response Format Guidelines

### Code Changes
- **Always show the complete file** when making significant changes
- **Highlight what changed** with comments if modifications are complex
- **Provide context** about why changes were made if not obvious
- **Include import statements** and ensure all dependencies are available

### Error Handling
- **Explain RLS issues** if queries fail due to security policies
- **Suggest TypeScript fixes** when type errors occur
- **Recommend mobile fixes** if responsive design breaks
- **Provide testing steps** to validate solutions

### New Features
- **Follow existing patterns** and show similar implementations
- **Include complete setup** with types, translations, and routing
- **Add proper error boundaries** and loading states
- **Document any new patterns** that might be reused

## Security Reminders

This is a **production system** with real users and financial data:
- **Never bypass RLS policies** - user data must remain isolated
- **Validate all inputs** - use Zod schemas for form validation
- **Handle errors gracefully** - never expose sensitive information
- **Test thoroughly** - changes affect real users and business operations
- **Follow GDPR principles** - respect user privacy and data rights

## Performance Considerations

- **Use TanStack Query** for all data fetching with proper caching
- **Implement lazy loading** for route components and heavy features
- **Optimize images** and use appropriate formats for storage
- **Monitor bundle size** and avoid unnecessary dependencies
- **Cache translations** and reuse service instances appropriately

---

**Remember**: This is a live production system. Every change affects real users and their business operations. Maintain the highest standards of code quality, security, and user experience.