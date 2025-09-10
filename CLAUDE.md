# Ruzma - Claude Code Navigation Hub

**Project**: Ruzma - Freelancer Project Management Platform  
**Architecture**: React 18 + TypeScript + Supabase + Tailwind CSS  
**Status**: Production-ready, lifetime plan system, 20+ users  

## 📂 Directory Documentation

### Core Structure
- **[src/components/CLAUDE.md](src/components/CLAUDE.md)** - UI components, shadcn/ui patterns
- **[src/hooks/CLAUDE.md](src/hooks/CLAUDE.md)** - Custom React hooks
- **[src/services/CLAUDE.md](src/services/CLAUDE.md)** - Service layer, business logic
- **[src/types/CLAUDE.md](src/types/CLAUDE.md)** - TypeScript definitions
- **[src/lib/CLAUDE.md](src/lib/CLAUDE.md)** - Utilities, translations
- **[supabase/CLAUDE.md](supabase/CLAUDE.md)** - Database schema, migrations

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

## 🗄️ Database

### Core Tables
- `profiles` - User accounts
- `projects` - Main business entity  
- `milestones` - Project phases
- `clients` - Customer data
- `invoices` - Payment tracking

### Commands
```bash
npm run dev          # Development
npm run build        # Production build
npm run lint         # Code linting
npm test             # Component tests
```

## 🎨 Color System

### Utilities in `src/lib/colorUtils.ts`
- `getBestTextColor(backgroundColor)` - Optimal text color  
- `getBestSecondaryTextColor(backgroundColor)` - Semi-transparent text
- `getBadgeColors(backgroundColor)` - Complete badge color scheme
- All functions follow WCAG accessibility guidelines

## 🚦 Development Guidelines

### 🟢 Safe to Edit
- UI components (following patterns)
- New pages (using existing layouts)  
- New hooks (following naming conventions)

### 🟡 Edit with Caution
- Database migrations
- Authentication flows
- RLS policies

### 🔴 High Risk - Review First
- Core services (UserService, AuthService)
- Database schema changes
- Security implementations

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