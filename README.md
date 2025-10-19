# Ruzma - رزمة

<div align="center">

**A Modern Freelancer Management Platform**

*Bilingual SaaS application for managing client projects, contracts, milestones, invoices, and payments*

[English](#) | [العربية](#)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.50-3ECF8E.svg)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Key Concepts](#key-concepts)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 About

**Ruzma** (رزمة - meaning "package" in Arabic) is a comprehensive SaaS platform designed specifically for freelancers and independent contractors to manage their business operations efficiently. The platform provides a complete suite of tools for:

- **Client Management**: Track client information, communication history, and project relationships
- **Project Tracking**: Create and manage projects with detailed milestones and deliverables
- **Contract Management**: Generate, send, and track client contracts with digital approval
- **Invoice Generation**: Create professional invoices with PDF export capabilities
- **Client Portal**: Secure, branded portal for clients to view project progress and approve contracts
- **Analytics Dashboard**: Visual insights into revenue, project status, and business metrics

### 🌍 Bilingual & RTL Support

Ruzma is fully bilingual with native support for:
- **English** (LTR - Left to Right)
- **Arabic** (RTL - Right to Left) - العربية

All UI components, layouts, and user interactions are optimized for both language directions.

---

## ✨ Features

### Core Functionality

- 🔐 **Secure Authentication**: Email/password authentication with email verification
- 👥 **Client Management**: Comprehensive client database with contact details and project history
- 📊 **Project Management**:
  - Create projects with multiple milestones
  - Track progress and status updates
  - Set deadlines and deliverables
  - Attach files and documents
- 📝 **Contract System**:
  - Digital contract generation
  - Client approval workflow
  - PDF contract export
  - Version tracking
- 💰 **Invoice Generation**:
  - Professional invoice templates
  - Multi-currency support (USD, EUR, GBP, CAD, AUD, SAR)
  - Tax calculation
  - PDF export
- 🎨 **Custom Branding**:
  - Upload logo and brand colors
  - Customize client portal appearance
  - White-label options (Enterprise plan)
- 📈 **Analytics & Reporting**:
  - Revenue tracking
  - Project status overview
  - Client engagement metrics
  - Payment history
- 🔔 **Notifications System**: Real-time updates for project events
- 🌓 **Dark Mode**: System-wide dark theme support

### Client Portal Features

Clients can access a secure, token-based portal to:
- View project details and progress
- Review and approve contracts digitally
- Track milestone completion
- Download invoices and contracts
- Submit feedback and approvals

### Subscription Tiers

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| Projects | 1 | 50 | Unlimited |
| Clients | 5 | 100 | Unlimited |
| Invoices | 5 | 500 | Unlimited |
| Storage | 100MB | 10GB | Unlimited |
| Custom Branding | ❌ | ✅ | ✅ |
| Advanced Analytics | ❌ | ✅ | ✅ |
| Priority Support | ❌ | ✅ | ✅ |
| White Label | ❌ | ❌ | ✅ |

---

## 🛠️ Tech Stack

### Frontend
- **React 18.3** - UI library with modern hooks and concurrent features
- **TypeScript 5.5** - Static type checking for enhanced code quality
- **Vite 5.4** - Lightning-fast build tool and dev server
- **React Router 6** - Declarative routing with nested routes
- **TanStack Query v5** - Powerful data synchronization and caching
- **React Hook Form** - Performant form validation with Zod schemas
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **ShadcN UI** - High-quality React components built on Radix UI
- **Lucide React** - Beautiful icon library
- **Recharts** - Composable charting library

### Backend & Infrastructure
- **Supabase** - Backend-as-a-Service platform
  - PostgreSQL database with Row Level Security (RLS)
  - Authentication and user management
  - File storage
  - Edge Functions for serverless operations
  - Real-time subscriptions
- **Vercel** - Deployment and hosting platform

### Development Tools
- **Vitest** - Fast unit testing framework
- **React Testing Library** - Component testing utilities
- **ESLint** - Code linting and static analysis
- **TypeScript Compiler** - Type checking
- **Vite Bundle Analyzer** - Bundle size analysis

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download](https://git-scm.com/)
- **Supabase Account** - [Sign up](https://supabase.com/) (free tier available)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ruzma.git
cd ruzma
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including React, Supabase client, UI components, and development tools.

---

## ⚙️ Configuration

### 1. Supabase Setup

#### Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click "New Project"
3. Fill in project details and create

#### Get Your Project Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)

#### Update Configuration Files

⚠️ **SECURITY WARNING**: Never commit credentials directly to your code. Always use environment variables.

**✅ RECOMMENDED: Use Environment Variables**

Create a `.env` file in the project root (this file is git ignored):

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxx...
```

**Update `src/integrations/supabase/client.ts` to use environment variables:**

```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing required Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
```

**For Vercel deployment**, set environment variables in:
**Vercel Dashboard** → **Settings** → **Environment Variables**:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

### 2. Database Schema Setup

#### Option A: Using Supabase Dashboard

1. In Supabase dashboard, go to **SQL Editor**
2. Run the migration files located in `supabase/migrations/`
3. Execute them in order (001, 002, etc.)

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Push database changes
supabase db push
```

### 3. Storage Buckets Setup

In Supabase Dashboard → Storage, create the following buckets:

- `profile-pictures` (Public)
- `project-attachments` (Public)
- `contract-pdfs` (Public)
- `invoice-pdfs` (Public)
- `branding-logos` (Public)

Set appropriate RLS policies for each bucket based on your security requirements.

### 4. Edge Functions (Optional)

If you want to use email notifications:

```bash
# Deploy Edge Functions
cd supabase/functions
supabase functions deploy send-contract-approval
supabase functions deploy send-payment-notification
supabase functions deploy send-client-link
```

---

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

The application will start at `http://localhost:8080`

**Features in development mode:**
- Hot Module Replacement (HMR)
- React Query DevTools
- Detailed error messages
- Source maps

### Production Build

```bash
# Build the application
npm run build

# Preview production build locally
npm run preview
```

The build output will be in the `dist/` directory.

---

## 📜 Available Scripts

### Development

```bash
npm run dev              # Start development server on port 8080
npm run build            # Build for production
npm run build:dev        # Build for development/staging
npm run preview          # Preview production build locally
```

### Code Quality

```bash
npm run typecheck        # Run TypeScript type checking
npm run lint             # Run ESLint for code linting
```

### Testing

**Unit Tests** (Vitest):
```bash
npm test                 # Run tests in watch mode
npm run test:run         # Run tests once (CI mode)
npm run test:ui          # Open Vitest UI for interactive testing
npm run test:coverage    # Generate test coverage report
```

**Manual E2E Testing**:
```bash
npm run test:manual      # Opens manual testing checklist (TESTING.md)
```

See **[TESTING.md](TESTING.md)** for comprehensive manual testing procedures.

### Performance

```bash
npm run perf:test        # Run performance tests
npm run perf:profile     # Profile performance with verbose output
npm run analyze          # Analyze bundle size with visualizer
npm run size             # Check bundle size against limits
```

### Deployment

```bash
./deploy.sh              # Deploy to Vercel with proper configuration
```

---

## 📁 Project Structure

```
ruzma/
├── public/                      # Static assets
│   ├── assets/                  # Images, icons
│   └── favicon.ico
├── src/
│   ├── api/                     # API service layers
│   ├── components/              # React components
│   │   ├── ui/                  # ShadcN UI components
│   │   ├── Clients/             # Client management components
│   │   ├── CreateProject/       # Project creation wizard
│   │   ├── EditProject/         # Project editing
│   │   ├── Invoices/            # Invoice components
│   │   ├── MilestoneCard/       # Milestone display
│   │   ├── Profile/             # User profile components
│   │   ├── ProjectCard/         # Project card display
│   │   ├── ProjectClient/       # Client portal views
│   │   ├── dashboard/           # Dashboard components
│   │   ├── notifications/       # Notification system
│   │   └── shared/              # Reusable components
│   ├── contexts/                # React contexts
│   │   ├── LanguageContext.tsx  # i18n language state
│   │   └── InvoiceContext.tsx   # Invoice form state
│   ├── hooks/                   # Custom React hooks
│   │   ├── clients/             # Client-related hooks
│   │   ├── projects/            # Project-related hooks
│   │   ├── dashboard/           # Dashboard hooks
│   │   ├── subscription/        # Subscription hooks
│   │   └── core/                # Core hooks
│   ├── integrations/            # Third-party integrations
│   │   └── supabase/            # Supabase client & types
│   ├── lib/                     # Utilities & helpers
│   │   ├── translations/        # Translation files
│   │   ├── i18n.ts              # Translation utilities
│   │   ├── utils.ts             # General utilities
│   │   └── authSecurity.ts      # Security utilities
│   ├── pages/                   # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Projects.tsx
│   │   ├── Clients.tsx
│   │   ├── CreateProject.tsx
│   │   ├── ProjectManagement.tsx
│   │   ├── ClientProject.tsx    # Client portal
│   │   ├── Profile.tsx
│   │   ├── Analytics.tsx
│   │   └── ...
│   ├── services/                # Business logic services
│   │   ├── core/                # Core service classes
│   │   │   ├── BaseService.ts   # Abstract base service
│   │   │   ├── ServiceRegistry.ts # DI container
│   │   │   ├── UserService.ts
│   │   │   ├── ClientService.ts
│   │   │   └── ...
│   │   ├── projectService.ts
│   │   ├── invoiceService.ts
│   │   └── brandingService.ts
│   ├── types/                   # TypeScript type definitions
│   ├── App.tsx                  # Main app component
│   ├── main.tsx                 # Application entry point
│   └── index.css                # Global styles
├── supabase/                    # Supabase configuration
│   ├── functions/               # Edge Functions
│   │   ├── send-contract-approval/
│   │   ├── send-payment-notification/
│   │   └── send-client-link/
│   ├── migrations/              # Database migrations
│   └── config.toml              # Supabase config
├── .claude/                     # Claude Code configuration
├── CLAUDE.md                    # AI assistant guidelines
├── README.md                    # This file
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.ts           # Tailwind CSS config
├── vite.config.ts               # Vite configuration
├── vercel.json                  # Vercel deployment config
└── deploy.sh                    # Deployment script
```

---

## 🧠 Key Concepts

### Service Architecture

Ruzma uses a service-based architecture pattern for business logic:

```typescript
// Services encapsulate business logic and database operations
const { user } = useAuth();
const registry = ServiceRegistry.getInstance();
const projectService = registry.getProjectService(user);

// All services extend BaseService for consistent error handling
const project = await projectService.createProject(projectData);
```

**Benefits:**
- Centralized business logic
- Consistent error handling
- Security event logging
- Easy testing and maintenance

### Internationalization (i18n)

All user-facing text uses the translation system:

```typescript
const t = useT();

// Simple translation
<h1>{t('dashboard.welcome')}</h1>

// Translation with variables
<p>{t('project.count', { count: '5' })}</p>
```

**Language switching** automatically updates:
- Text content
- Text direction (LTR/RTL)
- Route URLs (`/en/dashboard` ↔ `/ar/dashboard`)
- Date/number formatting

### Row Level Security (RLS)

Supabase RLS policies ensure data isolation:
- Users can only access their own data
- Client portal tokens provide secure, time-limited access
- All database queries are automatically filtered by user

### State Management Strategy

1. **Server State**: TanStack Query for all API/database data
2. **Global Client State**: React Context (Auth, Language, Invoice form)
3. **Local Component State**: React `useState` for UI state
4. **Form State**: React Hook Form for form management

---

## 🚀 Deployment

Ruzma has **two environments** for safe development and testing:

| Environment | Branch | URL | Deployment Script |
|------------|--------|-----|-------------------|
| **Test** | `test` | https://test-ruzma.vercel.app | `./deploy-test.sh` |
| **Production** | `main` | https://app.ruzma.co | `./deploy.sh` |

### 🧪 Test Environment Workflow

**For testing features before production:**

```bash
# 1. Switch to test branch
git checkout test

# 2. Make changes and commit
git add .
git commit -m "feat: your feature"

# 3. Push to test (auto-deploys to https://test-ruzma.vercel.app)
git push origin test

# 4. Test your changes, if good:
git checkout main
git merge test
git push origin main  # Deploys to production
```

📖 **See [TEST_ENVIRONMENT.md](TEST_ENVIRONMENT.md) for complete guide**

### 🚀 Deploying to Vercel

#### Using the Deploy Scripts (Recommended)

**Test Environment:**
```bash
./deploy-test.sh
```

**Production Environment:**
```bash
./deploy.sh
```

Both scripts:
1. Verify you're on the correct branch
2. Build the application
3. Deploy to the correct Vercel project

#### Manual Deployment

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel --prod
```

#### Environment Variables

Set the following in Vercel Dashboard → Settings → Environment Variables:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

### Deploying Supabase Edge Functions

```bash
cd supabase/functions
supabase functions deploy send-contract-approval
supabase functions deploy send-payment-notification
supabase functions deploy send-client-link
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- **TypeScript**: Use strict typing, avoid `any`
- **Translations**: Add keys to both English and Arabic translation files
- **Components**: Use ShadcN UI components when possible
- **Styling**: Use Tailwind CSS utility classes
- **Testing**: Add tests for new features
- **Type Checking**: Run `npm run typecheck` before committing
- **RTL Support**: Test components in both LTR and RTL modes

### Code Style

```bash
# Run linter
npm run lint

# Run type checker
npm run typecheck

# Run tests
npm run test:run
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

### Documentation

- [CLAUDE.md](CLAUDE.md) - AI assistant development guidelines
- Detailed component docs in `src/*/CLAUDE.md` files

### Issues

Found a bug or have a feature request? [Open an issue](https://github.com/yourusername/ruzma/issues)

### Contact

- **Email**: support@ruzma.com
- **Website**: https://ruzma.com

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) - Backend infrastructure
- [ShadcN UI](https://ui.shadcn.com/) - UI component library
- [Vercel](https://vercel.com/) - Hosting and deployment
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
- [Lucide](https://lucide.dev/) - Beautiful icon set

---

<div align="center">

**Built with ❤️ for freelancers everywhere**

*Empowering independent professionals to manage their business efficiently*

</div>
