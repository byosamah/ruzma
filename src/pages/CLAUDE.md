# Pages Directory Guide

## 📁 Directory Structure
```
src/pages/
├── Login.tsx              # Authentication pages
├── SignUp.tsx
├── ForgotPassword.tsx
├── ResetPassword.tsx
├── EmailConfirmation.tsx
├── Dashboard.tsx          # Main dashboard
├── Projects.tsx           # Project management
├── CreateProject.tsx
├── EditProject.tsx
├── ProjectManagement.tsx
├── ProjectTemplates.tsx
├── Clients.tsx            # Client management
├── Invoices.tsx           # Invoice management
├── CreateInvoice.tsx
├── Analytics.tsx          # Business analytics
├── Profile.tsx            # User settings
├── Plans.tsx              # Subscription plans
├── ContactUs.tsx          # Support
├── ContractApproval.tsx   # Client contract approval
├── ClientProject.tsx       # Client portal
└── NotFound.tsx           # 404 page
```

## 🌐 Routing & i18n Pattern

### Language-Based Routing (CRITICAL)
```typescript
// ✅ Routes are structured as /:lang/route
// App.tsx routing configuration:
<Route path="/:lang/dashboard" element={
  <LanguageLayout>
    <ProtectedRoute><Dashboard /></ProtectedRoute>
  </LanguageLayout>
} />

// ✅ Always wrap pages with LanguageLayout for i18n routes
// ❌ DON'T create routes without language prefix for protected pages

// ✅ Client portal routes (public access with token)
<Route path="/client/:token" element={<ClientProject />} />
// Note: Client routes don't use language prefix as they're accessed by clients directly
```

### Protected Route Pattern
```typescript
// ✅ Standard protected page structure
function Dashboard() {
  const { user, loading, authChecked } = useAuth();
  const { t } = useT();
  
  // ✅ Always handle loading and auth states
  if (loading || !authChecked) {
    return (
      <Layout user={user} onSignOut={() => {}}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  // ✅ Layout provides consistent structure
  return (
    <Layout user={user} onSignOut={handleSignOut}>
      <SEOHead 
        title={t('dashboard.title')}
        description={t('dashboard.description')}
        canonical={`${window.location.origin}/dashboard`}
      />
      {/* Page content */}
    </Layout>
  );
}
```

## 📱 Page Layout Patterns

### Standard Layout Structure
```typescript
// ✅ Consistent layout pattern for all pages
function MyPage() {
  const { user, loading } = useAuth();
  const { handleSignOut } = useDashboardHandlers();
  const { t } = useT();

  return (
    <Layout user={user} onSignOut={handleSignOut}>
      <SEOHead 
        title={t('page.title')}
        description={t('page.description')}
        canonical={`${window.location.origin}${window.location.pathname}`}
      />
      
      {/* Page Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {t('page.heading')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('page.subtitle')}
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Content sections */}
      </div>
    </Layout>
  );
}
```

### Client Portal Layout (Different Pattern)
```typescript
// ClientProject.tsx - No authentication required
function ClientProject() {
  const { token } = useParams();
  const { data: project, isLoading, error } = useClientProject(token);

  if (isLoading) return <ClientLoadingState />;
  if (error) return <ClientErrorState />;
  if (!project) return <ClientNotFoundState />;

  return (
    <div className="min-h-screen bg-background">
      {/* Custom branding header */}
      <ClientHeader project={project} />
      
      {/* Client-specific content */}
      <main className="container mx-auto px-4 py-8">
        <ClientProjectContent project={project} />
      </main>
    </div>
  );
}
```

## 🔒 Authentication Pages

### Login Page Pattern
```typescript
// Login.tsx - Public page with redirect logic
function Login() {
  const { user, loading } = useAuth();
  const { navigate } = useLanguageNavigation();
  const { t } = useT();

  // ✅ Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) return <AuthLoadingSpinner />;
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>{t('auth.login.title')}</CardTitle>
          <CardDescription>{t('auth.login.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
```

## 📊 Data-Heavy Pages

### Dashboard Pattern
```typescript
function Dashboard() {
  const {
    user,
    profile,
    projects,
    loading,
    stats,
    userCurrency,
    displayName,
    handleSignOut
  } = useDashboard(); // Custom hook consolidates all data

  const usage = useUsageTracking(profile, projects);
  
  if (loading) return <DashboardLoadingState />;

  return (
    <Layout user={user} onSignOut={handleSignOut}>
      <SEOHead {...seoData} />
      
      {/* Dashboard Header */}
      <DashboardHeader 
        displayName={displayName}
        userType={profile?.user_type}
      />
      
      {/* Stats Overview */}
      <DashboardStats 
        stats={stats}
        currency={userCurrency.currency}
      />
      
      {/* Usage Indicators */}
      <UsageIndicators usage={usage} />
      
      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <ProjectCard 
            key={project.id}
            project={project}
            onEdit={handleEditProject}
            onView={handleViewProject}
          />
        ))}
      </div>
    </Layout>
  );
}
```

### Form Pages Pattern
```typescript
// CreateProject.tsx - Form-heavy page
function CreateProject() {
  const { user, profile } = useAuth();
  const { navigate } = useLanguageNavigation();
  const { t } = useT();
  
  const form = useForm<CreateProjectData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      brief: '',
      currency: profile?.currency || 'USD',
      milestones: [{ title: '', description: '', price: 0 }]
    }
  });

  const createProject = useCreateProject();

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const newProject = await createProject.mutateAsync(data);
      toast.success(t('project.created'));
      navigate(`/project/${newProject.slug}`);
    } catch (error) {
      toast.error(t('project.createError'));
    }
  });

  return (
    <Layout user={user} onSignOut={() => {}}>
      <SEOHead title={t('project.create.title')} />
      
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{t('project.create.heading')}</h1>
        </div>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-8">
            <ProjectBasicInfoSection />
            <ProjectMilestonesSection />
            <ProjectSettingsSection />
            
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => navigate('/projects')}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={createProject.isLoading}>
                {createProject.isLoading ? t('common.creating') : t('project.create.submit')}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
}
```

## 🎨 SEO & Meta Tags Pattern

### SEO Head Usage
```typescript
import SEOHead from '@/components/SEO/SEOHead';

// ✅ Every page should have SEO meta tags
<SEOHead 
  title={`${t('page.title')} | Ruzma`}
  description={t('page.description')}
  canonical={`${window.location.origin}${pathname}`}
  keywords={t('page.keywords')}
  ogImage="/og-image.png"
/>

// ✅ Dynamic SEO for data-driven pages
const seoData = useDashboardSEO(displayName, stats, currency, projects);
<SEOHead {...seoData} />
```

## 📱 Mobile Responsiveness

### Mobile-First Layout
```typescript
// ✅ Mobile-responsive page structure
<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
  {/* Header - stacked on mobile, inline on desktop */}
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
      <p className="text-muted-foreground mt-2">{subtitle}</p>
    </div>
    <div className="mt-4 sm:mt-0">
      <Button size="sm" className="w-full sm:w-auto">
        {t('common.action')}
      </Button>
    </div>
  </div>

  {/* Content grid - responsive columns */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
    {items.map(item => (
      <ItemCard key={item.id} item={item} />
    ))}
  </div>
</div>
```

## 🚨 Error Handling in Pages

### Error Boundary Pattern
```typescript
function MyPage() {
  const { data, error, isLoading } = usePageData();

  // ✅ Handle different states
  if (isLoading) return <PageLoadingState />;
  
  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-destructive mb-4">
            {t('error.title')}
          </h2>
          <p className="text-muted-foreground mb-6">
            {t('error.description')}
          </p>
          <Button onClick={() => window.location.reload()}>
            {t('error.retry')}
          </Button>
        </div>
      </Layout>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Layout>
        <EmptyState 
          title={t('empty.title')}
          description={t('empty.description')}
          action={<Button>{t('empty.action')}</Button>}
        />
      </Layout>
    );
  }

  return <PageContent data={data} />;
}
```

## 🔄 Navigation Patterns

### Language-Aware Navigation
```typescript
// ✅ ALWAYS use useLanguageNavigation
const { navigate } = useLanguageNavigation();

// ✅ Navigation maintains language prefix
const handleNavigate = () => {
  navigate('/projects'); // Goes to /{currentLang}/projects
};

// ✅ Programmatic navigation with data
const handleEditProject = (slug: string) => {
  navigate(`/edit-project/${slug}`);
};

// ❌ DON'T use React Router navigate directly
const navigate = useNavigate(); // Breaks i18n
```

## 📋 Page Development Checklist

- [ ] Uses LanguageLayout for i18n routes
- [ ] Implements proper loading and error states
- [ ] Includes SEO meta tags with SEOHead
- [ ] Handles authentication appropriately
- [ ] Uses useT() for all text content
- [ ] Follows mobile-first responsive design
- [ ] Implements proper navigation with useLanguageNavigation
- [ ] Uses Layout component consistently
- [ ] Handles empty states gracefully
- [ ] Includes proper TypeScript types

## 🎯 Quick Reference

### Page Structure Template
```typescript
function MyPage() {
  // 1. Authentication & user data
  const { user, loading, authChecked } = useAuth();
  
  // 2. Page-specific data
  const { data, isLoading, error } = usePageData();
  
  // 3. i18n and navigation
  const { t } = useT();
  const { navigate } = useLanguageNavigation();
  
  // 4. Handlers
  const handleAction = () => { /* ... */ };
  
  // 5. Loading states
  if (loading || !authChecked) return <LoadingState />;
  
  // 6. Authentication check (if needed)
  if (!user) return <Navigate to="/login" />;
  
  // 7. Error handling
  if (error) return <ErrorState />;
  
  // 8. Render
  return (
    <Layout user={user} onSignOut={handleSignOut}>
      <SEOHead title={t('page.title')} />
      <PageContent />
    </Layout>
  );
}
```

### Common Imports
```typescript
import { useAuth } from '@/hooks/core/useAuth';
import { useT } from '@/lib/i18n';
import { useLanguageNavigation } from '@/hooks/useLanguageNavigation';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEO/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
```