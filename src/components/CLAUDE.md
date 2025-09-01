# Components Directory Guide

## 📁 Directory Structure
```
src/components/
├── ui/                    # shadcn/ui base components
├── domain/                # Business domain components
│   ├── auth/             # Authentication UI
│   ├── clients/          # Client management UI  
│   ├── projects/         # Project management UI
│   └── invoices/         # Invoice UI
├── shared/               # Reusable components
│   └── dialogs/         # Modal dialogs
├── Layout/              # App layout components
├── [Feature]/           # Feature-specific components
└── ProtectedRoute.tsx   # Route protection component
```

## 🎯 Component Patterns

### ✅ Modern Function Component (REQUIRED)
```typescript
// ✅ DO - Use function declaration
interface MyComponentProps {
  title: string;
  onAction?: () => void;
  children?: React.ReactNode;
}

function MyComponent({ title, onAction, children }: MyComponentProps) {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
      {onAction && (
        <Button onClick={onAction} className="mt-4">
          Action
        </Button>
      )}
    </div>
  );
}

export default MyComponent;
```

### ❌ What NOT to do
```typescript
// ❌ DON'T use React.FC
const MyComponent: React.FC<Props> = ({ title }) => { /* ... */ };

// ❌ DON'T use arrow functions for components
const MyComponent = ({ title }: Props) => { /* ... */ };

// ❌ DON'T use hardcoded styles
<div style={{ color: 'red', padding: '16px' }}>

// ❌ DON'T ignore TypeScript
function MyComponent(props) { /* ... */ }
```

## 🎨 Styling Guidelines

### CSS Custom Properties (REQUIRED)
```typescript
// ✅ DO - Use semantic color tokens
<Card className="bg-card border-border text-card-foreground">
  <CardHeader className="border-b border-border">
    <CardTitle className="text-primary">Title</CardTitle>
  </CardHeader>
</Card>

// ❌ DON'T use hardcoded colors
<div className="bg-white border-gray-200 text-gray-900">
```

### Responsive Design Pattern
```typescript
// ✅ DO - Mobile-first responsive
<div className="
  p-4 sm:p-6 md:p-8           // Progressive padding
  text-sm sm:text-base        // Progressive typography
  grid grid-cols-1 md:grid-cols-2  // Responsive grid
  min-h-[44px] touch-manipulation  // Touch targets
">
```

### Accessibility Requirements
```typescript
// ✅ DO - Proper ARIA labels and keyboard navigation
<Button
  aria-label="Delete project"
  onClick={handleDelete}
  className="min-w-[44px] min-h-[44px]"  // Touch target size
  disabled={isDeleting}
>
  <TrashIcon className="h-4 w-4" />
  <span className="sr-only">Delete</span>
</Button>
```

## 🧩 shadcn/ui Usage Patterns

### Base Components (Always Use These)
```typescript
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
```

### Form Components Pattern
```typescript
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { /* ... */ }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter project title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Saving...' : 'Save Project'}
        </Button>
      </form>
    </Form>
  );
}
```

## 🏢 Domain Component Organization

### Authentication Components (`domain/auth/`)
```typescript
// Components: LoginForm, SignUpForm, ForgotPasswordForm
// Pattern: Form handling with validation + loading states

function LoginForm() {
  const { signIn, loading } = useAuth();
  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema)
  });
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          {/* Form fields */}
        </Form>
      </CardContent>
    </Card>
  );
}
```

### Project Components (`domain/projects/`)
```typescript
// Components: ProjectCard, ProjectForm, MilestoneCard
// Pattern: Business logic integration + CRUD operations

function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const { t } = useT();
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{project.name}</CardTitle>
          <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
            {t(`status.${project.status}`)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {project.brief}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">
            {project.milestones?.length || 0} milestones
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(project.slug)}>
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onDelete(project.id)}>
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

## 🔄 State Management Integration

### Hook Integration Pattern
```typescript
function MyComponent() {
  // ✅ DO - Use custom hooks for business logic
  const { user, loading } = useAuth();
  const { projects, isLoading, refetch } = useProjects();
  const { t } = useT();
  
  // ✅ DO - Handle loading states properly
  if (loading || isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div className="space-y-6">
      {projects.map(project => (
        <ProjectCard 
          key={project.id}
          project={project}
          onEdit={(slug) => navigate(`/edit-project/${slug}`)}
          onDelete={async (id) => {
            await deleteProject(id);
            refetch();
          }}
        />
      ))}
    </div>
  );
}
```

### Service Integration Pattern
```typescript
function ProjectManagement() {
  const { user } = useAuth();
  const projectService = ServiceRegistry.getInstance().getProjectService(user);
  
  const createProject = useMutation({
    mutationFn: projectService.createProject.bind(projectService),
    onSuccess: () => {
      toast.success('Project created successfully');
      queryClient.invalidateQueries(['projects']);
    }
  });
  
  return (
    <div>
      <Button 
        onClick={() => createProject.mutate(projectData)}
        disabled={createProject.isLoading}
      >
        {createProject.isLoading ? 'Creating...' : 'Create Project'}
      </Button>
    </div>
  );
}
```

## 🌐 Internationalization Pattern

### Translation Usage
```typescript
function MyComponent() {
  const { t } = useT();
  
  return (
    <div>
      <h1>{t('dashboard.welcome')}</h1>
      <p>{t('dashboard.description')}</p>
      <Button>{t('common.save')}</Button>
    </div>
  );
}

// ❌ DON'T hardcode strings
<h1>Welcome to Dashboard</h1>
```

### RTL Support Pattern
```typescript
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

## 📱 Mobile-First Component Patterns

### Responsive Dialog Pattern
```typescript
function ResponsiveDialog({ children, ...props }: DialogProps) {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return (
      <Drawer {...props}>
        <DrawerContent className="px-4 pb-4">
          {children}
        </DrawerContent>
      </Drawer>
    );
  }
  
  return (
    <Dialog {...props}>
      <DialogContent className="max-w-md">
        {children}
      </DialogContent>
    </Dialog>
  );
}
```

### Touch-Optimized Components
```typescript
// ✅ DO - Ensure proper touch targets
<Button 
  className="min-h-[44px] min-w-[44px] p-3"
  variant="ghost"
>
  <Icon className="h-5 w-5" />
</Button>

// ✅ DO - Add touch feedback
<Card className="
  transition-colors hover:bg-accent/50 
  active:bg-accent/70 touch-manipulation
  cursor-pointer
">
```

## 🔒 Security in Components

### Protected Component Pattern
```typescript
function ProtectedComponent() {
  const { user, authChecked } = useAuth();
  
  if (!authChecked) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <SecureContent />;
}
```

### Data Display Security
```typescript
// ✅ DO - Sanitize and validate data display
function ProjectDisplay({ project }: { project: Project }) {
  return (
    <div>
      <h2>{project.name}</h2>
      {/* Never render raw HTML from user input */}
      <p>{project.brief}</p>
      {/* Always validate user permissions */}
      {project.user_id === user?.id && (
        <Button onClick={handleEdit}>Edit</Button>
      )}
    </div>
  );
}
```

## 🚨 Common Pitfalls to Avoid

### Performance Issues
```typescript
// ❌ DON'T create objects in render
<Component style={{ padding: 16 }} />

// ✅ DO use CSS classes
<Component className="p-4" />

// ❌ DON'T create functions in render
<Button onClick={() => handleClick(id)}>

// ✅ DO use useCallback or extract functions
const handleClick = useCallback(() => handleClick(id), [id]);
<Button onClick={handleClick}>
```

### Accessibility Issues
```typescript
// ❌ DON'T ignore keyboard navigation
<div onClick={handleClick}>

// ✅ DO make interactive elements accessible
<button 
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  aria-label="Action button"
>

// ❌ DON'T ignore screen readers
<Icon />

// ✅ DO provide context for assistive technology
<Icon aria-label="Warning" />
<span className="sr-only">Warning message</span>
```

## 📋 Component Checklist

Before creating/modifying components:

- [ ] Uses function declaration (not React.FC or arrow function)
- [ ] Proper TypeScript interfaces defined
- [ ] Uses shadcn/ui base components
- [ ] Follows mobile-first responsive design
- [ ] Implements proper accessibility (ARIA, keyboard navigation)
- [ ] Uses semantic CSS custom properties
- [ ] Integrates with translation system
- [ ] Handles loading and error states
- [ ] Follows security best practices
- [ ] Maintains consistency with existing patterns

## 🎯 Quick Reference

### Import Patterns
```typescript
// UI Components
import { Button } from "@/components/ui/button";

// Domain Components  
import { ProjectCard } from "@/components/domain/projects/ProjectCard";

// Shared Components
import { ConfirmDialog } from "@/components/shared/dialogs/ConfirmDialog";

// Hooks
import { useAuth } from "@/hooks/core/useAuth";
import { useT } from "@/lib/i18n";

// Utils
import { cn } from "@/lib/utils";
```

### File Naming Conventions
- **Components**: PascalCase (e.g., `ProjectCard.tsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useProjects.ts`)
- **Types**: PascalCase interfaces (e.g., `ProjectCardProps`)
- **Constants**: SCREAMING_SNAKE_CASE