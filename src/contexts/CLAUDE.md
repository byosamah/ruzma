# Contexts Directory Guide

## 📁 Directory Structure
```
src/contexts/
├── AuthContext.tsx         # Authentication state (CRITICAL)
├── LanguageContext.tsx     # i18n language management
└── InvoiceContext.tsx      # Invoice creation state
```

## 🎯 Context Patterns

### AuthContext (CRITICAL - DON'T MODIFY)
```typescript
// File: AuthContext.tsx - CORE AUTHENTICATION
interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  authChecked: boolean;
}

interface AuthActions {
  signUp: (formData: SignUpFormData) => Promise<AuthResult>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
}

// ✅ Used via useAuth hook - DON'T use context directly
const { user, session, loading, authChecked } = useAuth();
```

### LanguageContext (i18n Management)
```typescript
// File: LanguageContext.tsx - LANGUAGE MANAGEMENT
interface LanguageState {
  currentLanguage: string;
  supportedLanguages: string[];
  translations: Record<string, string>;
  isLoading: boolean;
  dir: 'ltr' | 'rtl';
}

interface LanguageActions {
  setLanguage: (language: string) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

// ✅ Usage pattern
const { currentLanguage, t, dir, setLanguage } = useLanguage();

// ✅ Translation with parameters
const message = t('welcome.message', { name: user.name });

// ✅ RTL support
const className = cn('flex items-center', dir === 'rtl' && 'flex-row-reverse');
```

### InvoiceContext (Form State)
```typescript
// File: InvoiceContext.tsx - INVOICE CREATION
interface InvoiceState {
  currentInvoice: Invoice | null;
  invoiceItems: InvoiceItem[];
  isEditing: boolean;
  isDraft: boolean;
}

interface InvoiceActions {
  createInvoice: (projectId?: string) => void;
  updateInvoice: (updates: Partial<Invoice>) => void;
  addInvoiceItem: (item: Omit<InvoiceItem, 'id'>) => void;
  removeInvoiceItem: (itemId: string) => void;
  calculateTotals: () => InvoiceTotals;
  saveInvoice: () => Promise<void>;
  resetInvoice: () => void;
}

// ✅ Usage in invoice forms
const {
  currentInvoice,
  invoiceItems,
  addInvoiceItem,
  saveInvoice,
  isEditing
} = useInvoice();
```

## 🔄 Context Provider Hierarchy

### App.tsx Provider Order (CRITICAL)
```typescript
// ✅ CORRECT provider nesting order - DON'T CHANGE
function App() {
  return (
    <QueryClientProvider client={queryClient}>      {/* 1. Data fetching */}
      <BrowserRouter>                                 {/* 2. Routing */}
        <LanguageProvider>                            {/* 3. i18n */}
          <TooltipProvider>                           {/* 4. UI tooltips */}
            <Toaster />                               {/* 5. Notifications */}
            <InvoiceProvider>                         {/* 6. Invoice state */}
              <Routes>                                {/* 7. Route components */}
                {/* Routes use AuthContext via hooks */}
              </Routes>
            </InvoiceProvider>
          </TooltipProvider>
        </LanguageProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
```

## ⚠️ Context Usage Rules

### ✅ DO
- **Use hooks instead of context directly**: `useAuth()`, `useLanguage()`, `useInvoice()`
- **Check loading states**: Always check `authChecked` before rendering
- **Handle context errors**: Provide fallbacks if context is missing
- **Use TypeScript**: Properly type context values and actions
- **Keep contexts focused**: Each context has single responsibility

### ❌ DON'T
- **Use context directly**: Don't import and use React context
- **Create too many contexts**: Prefer composition over multiple contexts
- **Put all state in context**: Use local state when appropriate
- **Ignore loading states**: Always handle async context operations
- **Mix contexts**: Keep authentication, i18n, and form state separate

## 🔒 Authentication Context Security

### Session Management
```typescript
// ✅ AuthContext handles session cleanup automatically
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Security event logging
      if (event === 'SIGNED_IN' && session?.user) {
        logSecurityEvent('auth_signin', { userId: session.user.id });
      } else if (event === 'SIGNED_OUT') {
        logSecurityEvent('auth_signout', { userId: user?.id });
        // Clear user services on logout
        ServiceRegistry.getInstance().clearUserServices(user?.id || '');
      }
    }
  );

  return () => subscription.unsubscribe();
}, []);
```

### Protected Component Pattern
```typescript
// ✅ Standard pattern for protected components
function ProtectedComponent() {
  const { user, loading, authChecked } = useAuth();
  
  // ✅ Always check these states
  if (loading || !authChecked) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <SecureContent />;
}
```

## 🌐 Language Context Implementation

### Dynamic Translation Loading
```typescript
// ✅ LanguageContext loads translations dynamically
const loadTranslations = async (language: string) => {
  setIsLoading(true);
  try {
    const translationsModule = await import(`@/translations/${language}.json`);
    setTranslations(translationsModule.default);
    
    // Update document direction for RTL languages
    const isRTL = ['ar', 'he', 'fa'].includes(language);
    document.dir = isRTL ? 'rtl' : 'ltr';
    setDir(isRTL ? 'rtl' : 'ltr');
    
  } catch (error) {
    console.warn(`Failed to load translations for ${language}`);
    // Fallback to English
    const fallbackModule = await import('@/translations/en.json');
    setTranslations(fallbackModule.default);
  } finally {
    setIsLoading(false);
  }
};
```

### Translation Function
```typescript
// ✅ Translation with parameter interpolation
const t = (key: string, params?: Record<string, string>): string => {
  let translation = translations[key] || key;
  
  if (params) {
    Object.entries(params).forEach(([param, value]) => {
      translation = translation.replace(
        new RegExp(`{{${param}}}`, 'g'), 
        value
      );
    });
  }
  
  return translation;
};

// Usage examples:
t('dashboard.welcome')                           // "Welcome to Dashboard"
t('project.count', { count: '5' })              // "You have 5 projects"
t('user.greeting', { name: user.name })         // "Hello, John!"
```

## 📋 Context Development Checklist

- [ ] Proper TypeScript interfaces for state and actions
- [ ] Error boundaries and fallbacks implemented
- [ ] Loading states handled appropriately
- [ ] Cleanup functions for subscriptions/effects
- [ ] Security considerations (auth context)
- [ ] Performance optimization (memo, useMemo)
- [ ] Custom hooks provided for context access
- [ ] Provider placed at correct level in component tree
- [ ] Context value memoized to prevent unnecessary re-renders
- [ ] Proper error handling and user feedback

## 🎯 Quick Reference

### Hook Usage
```typescript
// Authentication
const { user, loading, authChecked } = useAuth();

// Language/i18n
const { t, currentLanguage, dir } = useLanguage();
const { navigate } = useLanguageNavigation();

// Invoice form state
const { currentInvoice, addInvoiceItem, saveInvoice } = useInvoice();
```

### Common Patterns
```typescript
// ✅ Component with all contexts
function MyComponent() {
  const { user, loading } = useAuth();
  const { t } = useT();
  const { navigate } = useLanguageNavigation();
  
  if (loading) return <div>{t('common.loading')}</div>;
  
  return (
    <div className="p-4">
      <h1>{t('page.title')}</h1>
      <Button onClick={() => navigate('/dashboard')}>
        {t('navigation.dashboard')}
      </Button>
    </div>
  );
}
```