# Ruzma Technology Stack & Architecture

## Overview
Ruzma is a modern freelancer project management platform built with a full-stack TypeScript architecture, leveraging React for the frontend and Supabase for the backend infrastructure.

## Frontend Architecture

### Core Framework
- **React 18.3.1** - Latest stable version with concurrent features
- **TypeScript 5.5.3** - Strict type safety throughout the application
- **Vite 5.4.1** - Fast development server and build tool with SWC
- **React Router DOM 6.26.2** - Client-side routing with language support

### State Management
- **TanStack Query 5.56.2** - Server state management with caching
- **React Context API** - Global state for auth, invoice, and language
- **Custom Hooks** - Business logic encapsulation and reusability

### UI Framework & Styling
- **Tailwind CSS 3.4.11** - Utility-first CSS framework
- **shadcn/ui** - High-quality component library built on Radix UI
- **Radix UI Primitives** - Unstyled, accessible UI components
- **Lucide React** - Modern icon library
- **next-themes** - Dark/light mode support

### Forms & Validation
- **React Hook Form 7.53.0** - Performant forms with minimal re-renders
- **Zod 3.23.8** - TypeScript-first schema validation
- **@hookform/resolvers** - Integration between RHF and Zod

### Specialized Libraries
- **date-fns 3.6.0** - Modern date utility library
- **recharts 2.12.7** - Charts and data visualization
- **jspdf 3.0.1** + **html2canvas 1.4.1** - PDF generation
- **react-easy-crop 5.4.2** - Image cropping functionality
- **sonner 1.5.0** - Toast notifications
- **react-helmet-async 2.0.5** - SEO and meta tag management

## Backend Architecture

### Database & Backend-as-a-Service
- **Supabase** - PostgreSQL database with real-time capabilities
- **PostgreSQL** - Primary database with JSONB support
- **Row Level Security (RLS)** - Database-level security policies
- **Edge Functions** - Serverless functions for complex operations

### Authentication
- **Supabase Auth** - Built-in authentication with multiple providers
- **JWT Tokens** - Secure session management
- **Email Confirmation** - Account verification system
- **Password Reset** - Secure password recovery flow

### Storage
- **Supabase Storage** - File upload and management
- **Bucket Policies** - Fine-grained access control
- **CDN Integration** - Fast global content delivery

## Architecture Patterns

### Service Layer Architecture
```typescript
ServiceRegistry (Singleton)
├── UserService
├── EmailService  
├── ClientService
├── CurrencyService
├── ProjectService
└── ContractService
```

### Component Architecture
```
src/
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── domain/       # Business domain components
│   ├── shared/       # Reusable components
│   └── [feature]/    # Feature-specific components
├── pages/            # Route components
├── hooks/            # Custom React hooks
├── services/         # Business logic services
├── contexts/         # React Context providers
├── types/            # TypeScript definitions
└── utils/            # Utility functions
```

### Data Flow Architecture
1. **UI Layer** - React components with hooks
2. **Business Logic Layer** - Custom hooks + Services
3. **Data Access Layer** - TanStack Query + Supabase client
4. **Database Layer** - PostgreSQL with RLS policies

## Development Tools

### Code Quality
- **ESLint 9.9.0** - Code linting with modern config
- **TypeScript ESLint** - TypeScript-specific linting rules
- **Prettier** (implicit) - Code formatting
- **Bun** - Fast package manager and runtime

### Build & Deployment
- **Vite** - Development server and build tool
- **SWC** - Fast JavaScript/TypeScript compiler
- **PostCSS** - CSS processing with Tailwind
- **Autoprefixer** - Automatic vendor prefix addition

### Development Experience
- **Fast Refresh** - Hot module replacement
- **TypeScript Strict Mode** - Maximum type safety
- **Path Aliases** - Clean import paths with @ prefix
- **Environment Variables** - Configuration management

## Performance Optimizations

### Frontend Optimizations
- **Lazy Loading** - Code splitting for routes
- **TanStack Query Caching** - Intelligent data caching
- **Image Optimization** - Responsive images with proper formats
- **Bundle Splitting** - Optimized chunk sizes
- **Tree Shaking** - Dead code elimination

### Database Optimizations
- **Database Indexing** - Optimized query performance
- **RLS Policies** - Security without performance overhead
- **Connection Pooling** - Efficient database connections
- **Prepared Statements** - SQL injection prevention

## Security Features

### Authentication Security
- **JWT Validation** - Secure token verification
- **Session Management** - Automatic token refresh
- **Rate Limiting** - Brute force protection
- **Security Event Logging** - Audit trail maintenance

### Data Security
- **Row Level Security** - Database-level access control
- **Input Validation** - Zod schema validation
- **XSS Prevention** - React's built-in protection
- **CSRF Protection** - SameSite cookie attributes

### API Security
- **HTTPS Only** - Encrypted data transmission
- **CORS Configuration** - Controlled cross-origin access
- **API Key Management** - Secure credential handling
- **Error Sanitization** - No sensitive data exposure

## Scalability Considerations

### Horizontal Scaling
- **Stateless Architecture** - Easy horizontal scaling
- **CDN Integration** - Global content distribution
- **Database Read Replicas** - Distributed read operations
- **Caching Strategies** - Multiple caching layers

### Vertical Scaling
- **Optimized Queries** - Efficient database operations
- **Connection Pooling** - Resource optimization
- **Memory Management** - Efficient React patterns
- **Bundle Optimization** - Minimal payload sizes

## Internationalization (i18n)

### Multi-language Support
- **Language Context** - React context for language state
- **Route-based Language** - URL structure: `/:lang/route`
- **Custom Translation Hook** - `useT()` for translations
- **Language Navigation** - Automatic language routing
- **Fallback Support** - Default language handling

### SEO Optimization
- **Language-specific Meta Tags** - Proper hreflang attributes
- **Canonical URLs** - SEO-friendly URL structure
- **Dynamic Meta Generation** - Context-aware SEO data
- **Sitemap Generation** - Multi-language sitemap support