# Lib Directory Guide

## 📁 Directory Structure
```
src/lib/
├── i18n.ts                # Translation utilities
├── utils.ts              # General utilities (cn, formatters)
├── authSecurity.ts       # Security event logging
├── validationSchemas.ts  # Zod validation schemas
├── constants.ts          # App constants
└── translations/         # Translation files
    ├── en.json           # English translations
    └── ar.json           # Arabic translations
```

## 🌐 i18n System (CRITICAL)

### Translation Hook
```typescript
// File: i18n.ts - MAIN TRANSLATION UTILITY
export const useT = () => {
  const { t } = useLanguage();
  return t;
};

// ✅ ALWAYS use this hook for text
const t = useT();
return <h1>{t('dashboard.welcome')}</h1>;

// ❌ NEVER hardcode text
return <h1>Welcome to Dashboard</h1>;
```

### Translation Structure
```json
// File: translations/en.json
{
  "common": {
    "loading": "Loading...",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit"
  },
  "dashboard": {
    "title": "Dashboard | Ruzma",
    "welcome": "Welcome to your Dashboard",
    "stats": {
      "totalProjects": "Total Projects",
      "activeProjects": "Active Projects",
      "totalRevenue": "Total Revenue",
      "pendingPayments": "Pending Payments"
    }
  },
  "project": {
    "title": "Projects",
    "create": "Create Project",
    "edit": "Edit Project",
    "status": {
      "draft": "Draft",
      "active": "Active",
      "completed": "Completed",
      "archived": "Archived"
    }
  }
}
```

### RTL Support
```typescript
// ✅ RTL-aware component styling
function MyComponent() {
  const { dir } = useLanguage();
  
  return (
    <div className={cn(
      "flex items-center gap-4",
      dir === 'rtl' && "flex-row-reverse"
    )}>
      <Icon className={cn(
        "ml-2",
        dir === 'rtl' && "ml-0 mr-2"
      )} />
      <span>{t('content')}</span>
    </div>
  );
}
```

## 🛠️ Utility Functions

### Class Name Utility
```typescript
// File: utils.ts - TAILWIND CLASS MERGER
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ✅ ALWAYS use this for conditional classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage examples:
cn("px-4 py-2", isActive && "bg-primary", className)
cn("flex items-center", {
  "justify-between": hasActions,
  "justify-center": !hasActions
})
```

### Formatting Utilities
```typescript
// ✅ Currency formatting
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
}

// ✅ Date formatting
export function formatDate(date: string | Date, locale: string = 'en'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
}

// ✅ File size formatting
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

// ✅ Slug generation
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}
```

## 🔒 Security Utilities

### Security Event Logging
```typescript
// File: authSecurity.ts - SECURITY EVENT SYSTEM
export interface SecurityEvent {
  event_type: string;
  user_id?: string;
  metadata: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  timestamp: Date;
}

export const logSecurityEvent = async (
  eventType: SecurityEventType,
  metadata: Record<string, any> = {}
) => {
  try {
    const { data, error } = await supabase
      .from('security_events')
      .insert({
        event_type: eventType,
        user_id: metadata.userId || null,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          url: window.location.href,
        },
        ip_address: await getClientIP(),
        user_agent: navigator.userAgent,
      });

    if (error) {
      console.error('Failed to log security event:', error);
    }
  } catch (error) {
    // Silent failure to prevent disrupting user experience
    console.error('Security logging error:', error);
  }
};

// ✅ Usage in services
logSecurityEvent('project_created', {
  userId: user.id,
  projectId: project.id,
  projectName: project.name,
});
```

## ✓ Validation Schemas

### Zod Schema Patterns
```typescript
// File: validationSchemas.ts - FORM VALIDATION
import { z } from 'zod';

// ✅ Project validation
export const createProjectSchema = z.object({
  name: z.string()
    .min(1, 'Project name is required')
    .max(100, 'Project name too long')
    .regex(/^[a-zA-Z0-9\s\-_.,!?]+$/, 'Invalid characters'),
  
  brief: z.string()
    .min(10, 'Brief must be at least 10 characters')
    .max(2000, 'Brief too long'),
  
  client_id: z.string().uuid('Invalid client ID').optional(),
  
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'SAR']),
  
  milestones: z.array(z.object({
    title: z.string().min(1).max(100),
    description: z.string().min(1).max(500),
    price: z.number().min(0).max(1000000),
  })).min(1, 'At least one milestone required'),
});

export type CreateProjectData = z.infer<typeof createProjectSchema>;

// ✅ Client validation
export const createClientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  company: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  country: z.string().length(2, 'Invalid country code').optional(),
});

// ✅ Invoice validation
export const createInvoiceSchema = z.object({
  client_id: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
  issue_date: z.string().datetime(),
  due_date: z.string().datetime(),
  currency: z.string().length(3),
  tax_rate: z.number().min(0).max(100),
  items: z.array(z.object({
    description: z.string().min(1).max(200),
    quantity: z.number().min(0.01).max(10000),
    unit_price: z.number().min(0).max(1000000),
  })).min(1, 'At least one item required'),
});
```

## 📋 Constants & Configuration

### App Constants
```typescript
// File: constants.ts - APPLICATION CONSTANTS
export const APP_CONFIG = {
  name: 'Ruzma',
  version: '1.0.0',
  supportEmail: 'support@ruzma.com',
  maxFileSize: 50 * 1024 * 1024, // 50MB
  supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  supportedDocTypes: ['application/pdf', 'text/plain'],
} as const;

export const USER_PLAN_LIMITS = {
  free: {
    maxProjects: 1,
    maxClients: 5,
    maxStorageMB: 100,
    maxInvoices: 5,
    features: {
      customBranding: false,
      advancedAnalytics: false,
      prioritySupport: false,
      whiteLabel: false,
    }
  },
  pro: {
    maxProjects: 50,
    maxClients: 100,
    maxStorageMB: 10000,
    maxInvoices: 500,
    features: {
      customBranding: true,
      advancedAnalytics: true,
      prioritySupport: true,
      whiteLabel: false,
    }
  },
  enterprise: {
    maxProjects: -1, // Unlimited
    maxClients: -1,
    maxStorageMB: -1,
    maxInvoices: -1,
    features: {
      customBranding: true,
      advancedAnalytics: true,
      prioritySupport: true,
      whiteLabel: true,
    }
  }
} as const;

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'SAR', symbol: '‏ر.س', name: 'Saudi Riyal' },
] as const;

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', direction: 'ltr', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية', direction: 'rtl', flag: '🇸🇦' },
] as const;
```

## ⚠️ Utility Development Rules

### ✅ DO
- **Use TypeScript strict types** for all utilities
- **Provide JSDoc comments** for complex functions
- **Handle edge cases** and validate inputs
- **Use const assertions** for configuration objects
- **Export named functions** rather than default exports
- **Follow single responsibility** principle
- **Include proper error handling**

### ❌ DON'T
- **Create overly complex utilities** - keep them focused
- **Ignore internationalization** in formatters
- **Hardcode values** - use constants
- **Forget error handling** in async utilities
- **Use any types** - always provide proper typing
- **Create side effects** in pure utility functions

## 🎯 Quick Reference

### Common Imports
```typescript
// Translation
import { useT } from '@/lib/i18n';

// Utilities
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate } from '@/lib/utils';

// Validation
import { createProjectSchema } from '@/lib/validationSchemas';

// Constants
import { USER_PLAN_LIMITS, CURRENCIES } from '@/lib/constants';

// Security
import { logSecurityEvent } from '@/lib/authSecurity';
```

### Usage Patterns
```typescript
// ✅ Translation
const t = useT();
const title = t('dashboard.title');
const message = t('welcome.message', { name: user.name });

// ✅ Styling
const className = cn('base-class', {
  'active-class': isActive,
  'error-class': hasError
}, additionalClasses);

// ✅ Formatting
const price = formatCurrency(1234.56, 'USD'); // "$1,234.56"
const date = formatDate(new Date(), 'en'); // "January 15, 2024"

// ✅ Validation
const { data, success } = createProjectSchema.safeParse(formData);
if (!success) {
  // Handle validation errors
}
```