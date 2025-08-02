# Ruzma - Project Planning Document

## Vision
Ruzma aims to be the leading freelancer project management platform in the MENA region, providing a comprehensive solution for managing projects, clients, invoices, and payments with seamless Arabic language support.

## Core Value Proposition
- **For Freelancers**: Streamline project management, automate invoicing, and track payments
- **For Clients**: Transparent project progress tracking and secure deliverable access
- **Differentiator**: Native Arabic support and region-specific payment methods

## Architecture Overview

### Frontend Architecture
```
┌─────────────────────────────────────────────────────────┐
│                     React Application                    │
├─────────────────────────────────────────────────────────┤
│  Routing Layer (React Router + Language Support)         │
├─────────────────────────────────────────────────────────┤
│  State Management                                        │
│  ├── TanStack Query (Server State)                      │
│  ├── React Context (Language, Invoice)                  │
│  └── Local State (Component-specific)                   │
├─────────────────────────────────────────────────────────┤
│  UI Components                                           │
│  ├── Domain Components (Auth, Projects, Clients)        │
│  ├── Shared UI (shadcn/ui)                             │
│  └── Layout Components                                  │
├─────────────────────────────────────────────────────────┤
│  Services & Utils                                        │
│  ├── API Services (Supabase Integration)               │
│  ├── Translation System (i18n)                         │
│  └── Utilities (Validation, Formatting)                │
└─────────────────────────────────────────────────────────┘
```

### Backend Architecture (Supabase)
```
┌─────────────────────────────────────────────────────────┐
│                    Supabase Platform                     │
├─────────────────────────────────────────────────────────┤
│  Authentication                                          │
│  ├── Email/Password Auth                               │
│  ├── Password Reset Flow                               │
│  └── Session Management                                │
├─────────────────────────────────────────────────────────┤
│  Database (PostgreSQL)                                   │
│  ├── Tables: profiles, projects, milestones, clients   │
│  ├── RLS Policies (Row Level Security)                 │
│  └── Triggers & Functions                              │
├─────────────────────────────────────────────────────────┤
│  Storage                                                 │
│  ├── Profile Pictures                                   │
│  ├── Project Deliverables                              │
│  └── Payment Proofs                                    │
├─────────────────────────────────────────────────────────┤
│  Edge Functions                                          │
│  ├── Email Notifications                               │
│  ├── Client Link Generation                            │
│  ├── Invoice Generation                                │
│  └── Payment Processing                                │
└─────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React 18.3.1
- **Build Tool**: Vite 5.4.1
- **Language**: TypeScript 5.5.3
- **Styling**: Tailwind CSS 3.4.11 + shadcn/ui
- **State Management**: TanStack Query 5.56.2
- **Routing**: React Router DOM 6.26.2
- **Forms**: React Hook Form 7.53.0 + Zod 3.23.8
- **UI Components**: Radix UI (via shadcn/ui)
- **PDF Generation**: jsPDF 3.0.1
- **Image Handling**: html2canvas 1.4.1, react-easy-crop 5.4.2
- **Charts**: Recharts 2.12.7
- **Date Handling**: date-fns 3.6.0

### Backend (Supabase)
- **Database**: PostgreSQL
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Storage**: Supabase Storage
- **Functions**: Supabase Edge Functions (Deno)
- **API**: PostgREST (Auto-generated REST API)

### Development Tools
- **Linting**: ESLint 9.9.0
- **Package Manager**: npm
- **Version Control**: Git
- **IDE**: Any (VSCode recommended)

## Required Tools List

### Development Environment
1. **Node.js** (v18+ recommended) - JavaScript runtime
2. **npm** - Package manager
3. **Git** - Version control
4. **Code Editor** - VSCode or similar

### Accounts & Services
1. **Supabase Account** - Backend services
2. **GitHub Account** - Code repository
3. **Lovable Account** - Deployment platform (optional)

### Browser Extensions (Recommended)
1. **React Developer Tools** - React debugging
2. **Redux DevTools** - State debugging (for Context)

### Testing Tools
1. **Browser DevTools** - General debugging
2. **Postman/Insomnia** - API testing (optional)

## Development Workflow

### Local Setup
```bash
# Clone repository
git clone <repository-url>

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

### Database Setup
1. Create Supabase project
2. Run migrations from `/supabase/migrations/`
3. Set up RLS policies
4. Configure Edge Functions

### Deployment
- Production: Deploy via Lovable platform
- Staging: Use Supabase preview branches

## Security Considerations
1. **Authentication**: All routes except client portal require authentication
2. **Authorization**: RLS policies enforce data access rules
3. **Data Validation**: Input validation on both client and server
4. **CORS**: Configured in Edge Functions
5. **Secrets Management**: Environment variables for sensitive data

## Performance Optimization
1. **Code Splitting**: Lazy loading for routes
2. **Bundle Optimization**: Manual chunks for vendor libraries
3. **Image Optimization**: Lazy loading and proper sizing
4. **Caching**: TanStack Query caching strategy
5. **Database Indexes**: Optimized queries

## Monitoring & Analytics
1. **Error Tracking**: Browser console and Supabase logs
2. **Performance Monitoring**: Lighthouse metrics
3. **User Analytics**: Custom analytics implementation
4. **Database Monitoring**: Supabase dashboard

## Future Considerations
1. **Mobile App**: React Native implementation
2. **API Integration**: Third-party payment gateways
3. **AI Features**: Smart invoice generation
4. **Marketplace**: Template marketplace for projects
5. **Team Features**: Multi-user collaboration