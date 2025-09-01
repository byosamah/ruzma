# Ruzma - Claude Code Navigation Hub

## 🚀 Quick Start Guide

**Project**: Ruzma - Freelancer Project Management Platform  
**Architecture**: React 18 + TypeScript + Supabase + Tailwind CSS  
**Security**: RLS-enabled, 100/100 security score verified  
**Status**: Production-ready with 20 users, 83 database records  

## 📂 Directory Documentation Map

Navigate to specific documentation for detailed guidance:

### 🏗️ Core Application Structure
- **[src/components/CLAUDE.md](src/components/CLAUDE.md)** - UI components, shadcn/ui patterns, domain organization
- **[src/hooks/CLAUDE.md](src/hooks/CLAUDE.md)** - Custom React hooks, core vs domain separation
- **[src/services/CLAUDE.md](src/services/CLAUDE.md)** - Service layer, business logic, API integration
- **[src/pages/CLAUDE.md](src/pages/CLAUDE.md)** - Route components, protected routes, i18n routing

### 🔧 Configuration & Types
- **[src/types/CLAUDE.md](src/types/CLAUDE.md)** - TypeScript definitions, interfaces, shared types
- **[src/contexts/CLAUDE.md](src/contexts/CLAUDE.md)** - React Context providers, state management
- **[src/lib/CLAUDE.md](src/lib/CLAUDE.md)** - Utilities, translations, shared libraries
- **[src/integrations/CLAUDE.md](src/integrations/CLAUDE.md)** - Supabase client, external APIs

### 🗄️ Backend & Database
- **[supabase/CLAUDE.md](supabase/CLAUDE.md)** - Database schema, migrations, RLS policies
- **[scripts/CLAUDE.md](scripts/CLAUDE.md)** - Analysis tools, database connections, validation

## ⚠️ Critical Constraints & Rules

### 🔒 NEVER BREAK THESE
```typescript
// 1. Row Level Security - ALL database queries must respect RLS
// ❌ DON'T bypass RLS policies
const { data } = await supabase.from('projects').select('*'); 

// ✅ DO use authenticated client or proper user context
const { data } = await supabase.from('projects').select('*').eq('user_id', user.id);
```

```typescript
// 2. TypeScript Strict Mode - ALL code must be type-safe
// ❌ DON'T use 'any' or suppress errors
const handleClick = (event: any) => { /* ... */ };

// ✅ DO use proper types
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => { /* ... */ };
```

```typescript
// 3. Modern Function Components - NO React.FC
// ❌ DON'T use React.FC
const Component: React.FC<Props> = ({ children }) => { /* ... */ };

// ✅ DO use function declaration
function Component({ children }: Props) { /* ... */ }
```

### 🎨 Design System Rules
- **ALWAYS** use shadcn/ui components as base
- **ALWAYS** use CSS custom properties, never hardcoded colors
- **ALWAYS** follow mobile-first responsive design
- **ALWAYS** maintain 44px minimum touch targets

### 🌐 Routing & i18n Rules
- **ALWAYS** use `/:lang/route` structure
- **ALWAYS** use `useLanguageNavigation()` for navigation
- **ALWAYS** use `useT()` for translations, never hardcoded strings

## 🎯 Common Patterns Quick Reference

### Authentication Check
```typescript
import { useAuth } from '@/hooks/core/useAuth';

function MyComponent() {
  const { user, loading, authChecked } = useAuth();
  
  if (loading || !authChecked) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  
  return <AuthenticatedContent />;
}
```

### Service Layer Usage
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

function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { /* ... */ }
  });
  
  const onSubmit = form.handleSubmit(async (data) => {
    // Handle form submission
  });
  
  return <Form {...form}>{/* form content */}</Form>;
}
```

### Component Pattern
```typescript
interface ComponentProps {
  // Always define proper interfaces
}

function Component({ prop }: ComponentProps) {
  // Use proper TypeScript
  // Follow mobile-first design
  // Use shadcn/ui components
  // Implement accessibility
  
  return (
    <div className="p-4 md:p-6">
      {/* Mobile-first responsive */}
    </div>
  );
}
```

## 🗃️ Database Quick Reference

### Core Tables (with RLS)
```sql
-- All queries automatically filtered by RLS policies
profiles         -- User account data (20 records)
projects         -- Core business entity (7 records)
milestones       -- Project phases (14 records)
clients          -- Customer data (15 records)
invoices         -- Payment tracking (5 records)
```

### Storage Buckets
```javascript
// File storage organization
buckets = {
  'branding-logos': '10 files - Custom logos',
  'payment-proofs': '10 files - Payment confirmations', 
  'deliverables': '6 files - Project deliverables',
  'profile-pictures': '9 files - User avatars'
};
```

## 🔍 Debugging & Analysis Tools

### Live Database Analysis
```bash
# Run live database analysis
node scripts/supabase-direct-query.js

# Security validation
node scripts/security-validation.js
```

### Key Commands
```bash
# Development
npm run dev

# Build & Type Check
npm run build
npm run lint

# Documentation
# Read directory-specific CLAUDE.md files for detailed guidance
```

## 📊 Project Health Dashboard

### Current Status (Live Data)
- **Users**: 20 profiles (35% creating projects)
- **Projects**: 7 active (avg 2 milestones each)
- **Invoices**: 5 generated (71% project coverage)
- **Security**: 100/100 score (perfect RLS implementation)
- **Storage**: 35 files across 4 organized buckets

### Feature Adoption
- ✅ **Template System**: 185% adoption (13 templates)
- ✅ **Custom Branding**: 30% users (6 configurations)
- ✅ **Multi-Client**: 2.1 clients per project
- ⚠️ **Invoice Items**: 0 rows (needs investigation)

## 🚦 Traffic Light System

### 🟢 Safe to Edit
- UI components (following patterns)
- New pages (using existing layouts)
- Additional services (extending BaseService)
- New hooks (following naming conventions)

### 🟡 Edit with Caution
- Database migrations (test thoroughly)
- Authentication flows (maintain security)
- RLS policies (validate access control)
- Routing changes (maintain i18n structure)

### 🔴 High Risk - Review First
- Core services (UserService, AuthService)
- Database schema changes
- Security implementations
- Supabase client configuration

## 🎓 Learning Path for New Features

1. **Read relevant directory CLAUDE.md** for patterns
2. **Check existing similar features** for implementation reference
3. **Follow TypeScript strict patterns** - no shortcuts
4. **Test with live database** using analysis scripts
5. **Validate security** doesn't break RLS policies
6. **Test mobile responsiveness** and accessibility

## 💡 Pro Tips for Working with Ruzma

### Performance
- Use TanStack Query for all data fetching
- Implement proper loading states
- Lazy load route components
- Optimize images and files

### Security
- Never bypass RLS policies
- Always validate user permissions
- Use proper TypeScript types
- Test with security validation script

### User Experience
- Follow mobile-first design
- Implement proper loading states
- Use consistent error handling
- Maintain accessibility standards

---

**Need specific guidance?** Navigate to the appropriate directory CLAUDE.md file for detailed patterns and examples.