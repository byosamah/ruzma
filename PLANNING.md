# Ruzma - Freelancer Project Management Platform

## Vision
Ruzma is a comprehensive SaaS platform that empowers freelancers to efficiently manage their projects, clients, invoices, and payments. The platform provides a seamless experience for both freelancers and their clients, with features like multi-language support, dynamic branding, and conversion-focused client portals.

## Core Mission
To simplify freelance project management by providing an all-in-one solution that handles the entire project lifecycle from client onboarding to payment processing, while maintaining professional standards and client satisfaction.

## Architecture Overview

### System Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Supabase      │    │  Third-Party    │
│   React App     │◄──►│   PostgreSQL     │    │   Services      │
│                 │    │   Auth + RLS     │    │                 │
│   - Dashboard   │    │   Edge Functions │    │ - LemonSqueezy  │
│   - Client      │    │   Real-time      │    │ - Resend Email  │
│     Portal      │    │   Storage        │    │ - File Storage  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Database Design Philosophy
- **Row Level Security (RLS)**: Ensures data isolation between users
- **Relational Design**: Normalized schema with proper foreign key relationships  
- **Audit Trail**: Created/updated timestamps on all entities
- **Soft Deletes**: Preserve data integrity for business records
- **Extensible Schema**: Designed for future feature additions

### Frontend Architecture
- **Component-Based**: Reusable components organized by domain
- **State Management**: Multi-layered approach (TanStack Query + Context + Zustand)
- **Route-Based Code Splitting**: Lazy loading for optimal performance
- **Mobile-First Design**: Responsive layouts for all screen sizes
- **Progressive Enhancement**: Works on all modern browsers

## Technology Stack

### Frontend
- **React 18.3.1** - Core UI library with hooks and concurrent features
- **TypeScript 5.5.3** - Static typing for enhanced developer experience
- **Vite 5.4.1** - Lightning-fast build tool and dev server
- **React Router DOM 6.26.2** - Client-side routing with language support
- **Tailwind CSS 3.4.11** - Utility-first CSS framework
- **DaisyUI 5.0.50** - Component library for rapid UI development
- **shadcn/ui** - High-quality, accessible component primitives
- **Framer Motion 12.23.12** - Smooth animations and transitions

### State Management
- **TanStack Query 5.56.2** - Server state management with caching
- **React Context** - Global state for language, currency, branding
- **Zustand 5.0.7** - Lightweight state management for complex client state
- **Immer 10.1.1** - Immutable state updates

### Form & Validation
- **React Hook Form 7.53.0** - Performant forms with minimal re-renders
- **Zod 3.23.8** - TypeScript-first schema validation
- **@hookform/resolvers 3.9.0** - Integration between forms and validation

### UI & UX Libraries
- **Lucide React 0.462.0** - Beautiful, customizable icons
- **React Easy Crop 5.4.2** - Image cropping functionality
- **React Day Picker 8.10.1** - Date selection components
- **Recharts 2.12.7** - Charts and data visualization
- **Sonner 1.5.0** - Toast notifications

### Backend & Database
- **Supabase** - Backend-as-a-Service platform
  - **PostgreSQL** - Relational database with full SQL support
  - **Row Level Security** - Database-level security policies
  - **Real-time subscriptions** - Live data updates
  - **Edge Functions** - Serverless functions (Deno runtime)
  - **Authentication** - Built-in user management
  - **Storage** - File upload and management

### Third-Party Integrations
- **LemonSqueezy** - Payment processing and subscription management
- **Resend** - Transactional email delivery
- **Stripe** - Alternative payment processing (legacy support)

### Development Tools
- **ESLint 9.9.0** - Code linting and style enforcement
- **Prettier** - Code formatting (via ESLint integration)
- **Autoprefixer 10.4.20** - CSS vendor prefixing
- **Terser 5.43.1** - JavaScript minification for production
- **Lovable Tagger 1.1.7** - Development platform integration

### Deployment & Hosting
- **Lovable Platform** - Primary deployment environment
- **Vite Build System** - Optimized production builds
- **Environment Variables** - Configuration management
- **GitHub Integration** - Version control and CI/CD

## Required Tools & Setup

### Development Environment
1. **Node.js 18+** - JavaScript runtime
2. **npm** - Package manager (included with Node.js)
3. **Git** - Version control
4. **VS Code** (recommended) - Code editor with extensions:
   - TypeScript and JavaScript Language Features
   - Tailwind CSS IntelliSense
   - ES7+ React/Redux/React-Native snippets
   - Prettier - Code formatter

### Supabase Setup
1. **Supabase CLI** - Database management and migrations
2. **Database Migrations** - Version-controlled schema changes
3. **Edge Functions** - Serverless backend logic
4. **RLS Policies** - Security rules configuration

### Environment Configuration
```bash
# Required environment variables
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### External Service Accounts
1. **LemonSqueezy Account** - Payment processing
2. **Resend Account** - Email delivery
3. **Supabase Account** - Backend services
4. **GitHub Account** - Code repository

## Key Features & Capabilities

### Core Freelancer Features
- **Project Management** - Create, edit, manage projects with milestones
- **Client Management** - Organize client information and communication
- **Invoice Generation** - Professional invoice creation with PDF export
- **Payment Tracking** - Monitor payment status and proof uploads
- **Analytics Dashboard** - Business insights and performance metrics
- **Project Templates** - Reusable project structures

### Client Portal Features
- **Token-Based Access** - Secure, login-free client access
- **Dynamic Branding** - Freelancer logo and color customization
- **Contract Approval** - Digital contract signing workflow
- **Payment Proof Upload** - Drag-and-drop payment confirmation
- **Milestone Tracking** - Real-time project progress
- **Deliverable Access** - External link-based file sharing
- **Revision Requests** - Structured feedback system

### Advanced Features
- **Multi-Language Support** - English and Arabic localization
- **Currency Conversion** - Multiple currency support with real-time rates
- **Subscription Management** - Tiered plans with usage limits
- **Real-Time Notifications** - Instant updates via WebSocket
- **Mobile Optimization** - Touch-friendly interface with PWA support
- **Error Boundaries** - Graceful error handling and recovery

## Performance & Scalability

### Frontend Optimization
- **Code Splitting** - Route-based lazy loading
- **Tree Shaking** - Eliminate unused code
- **Image Optimization** - Lazy loading and compression
- **Bundle Analysis** - Monitor bundle sizes
- **Caching Strategy** - Efficient API response caching

### Database Performance
- **Indexed Queries** - Optimized database queries
- **Connection Pooling** - Efficient database connections
- **Query Optimization** - Minimize N+1 queries
- **Pagination** - Handle large datasets efficiently

### Security Considerations
- **Row Level Security** - Database-level access control
- **Input Validation** - Client and server-side validation
- **Error Handling** - Secure error messages
- **Token Management** - Secure client access tokens
- **HTTPS Everywhere** - Encrypted data transmission

## Deployment Strategy

### Production Environment
- **Build Optimization** - Minified, optimized production builds
- **Environment Configuration** - Secure environment variable management
- **Error Monitoring** - Client-side error tracking
- **Performance Monitoring** - Real-time performance metrics

### Development Workflow
1. **Local Development** - `npm run dev` for hot reloading
2. **Type Checking** - TypeScript compilation
3. **Code Linting** - ESLint validation
4. **Build Testing** - `npm run build` before deployment
5. **Migration Management** - Supabase CLI for database changes

This planning document serves as the foundation for all development decisions and provides the architectural context needed for implementing new features and maintaining the existing codebase.