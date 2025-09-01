# Services Directory Guide

## 📁 Directory Structure
```
src/services/
├── core/                     # Core service classes
│   ├── BaseService.ts       # Abstract base class
│   ├── ServiceRegistry.ts   # Dependency injection
│   ├── UserService.ts       # User operations
│   ├── ClientService.ts     # Client management
│   ├── CurrencyService.ts   # Currency operations
│   ├── ContractService.ts   # Contract handling
│   ├── EmailService.ts      # Email notifications
│   └── RateLimitService.ts  # Rate limiting
├── api/                     # API service implementations
│   └── authService.ts       # Authentication API
├── brandingService.ts       # Custom branding
├── clientLinkService.ts     # Client portal links
├── projectService.ts        # Project operations
├── invoiceService.ts        # Invoice management
├── userLimitsService.ts     # Usage limits
└── profileService.ts        # Profile management
```

## 🏗️ Service Architecture Pattern

### ServiceRegistry (Dependency Injection)
```typescript
// File: core/ServiceRegistry.ts - CENTRAL HUB
export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private services: Map<string, any> = new Map();

  static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  // ✅ Always use these methods to get services
  getUserService(user: User | null): UserService {
    const key = `userService_${user?.id || 'anonymous'}`;
    if (!this.services.has(key)) {
      this.services.set(key, new UserService(user));
    }
    return this.services.get(key);
  }

  getProjectService(user: User | null): ProjectService {
    const key = `projectService_${user?.id || 'anonymous'}`;
    if (!this.services.has(key)) {
      this.services.set(key, new ProjectService(user));
    }
    return this.services.get(key);
  }

  // Clear services when user logs out
  clearUserServices(userId: string): void {
    const keys = Array.from(this.services.keys()).filter(key => key.includes(userId));
    keys.forEach(key => this.services.delete(key));
  }
}

// ✅ Usage pattern in hooks
const { user } = useAuth();
const projectService = ServiceRegistry.getInstance().getProjectService(user);
```

### BaseService Pattern (ALWAYS EXTEND)
```typescript
// File: core/BaseService.ts - CRITICAL BASE CLASS
export abstract class BaseService {
  protected user: User | null;
  protected supabase = supabase;

  constructor(user: User | null) {
    this.user = user;
  }

  // ✅ Always use this for auth validation
  protected requireAuth(): User {
    if (!this.user) {
      throw new AppError('Authentication required', 'AUTH_REQUIRED');
    }
    return this.user;
  }

  // ✅ Always use this for database operations
  protected async executeQuery<T>(
    operation: () => Promise<PostgrestSingleResponse<T>>,
    operationName: string
  ): Promise<T> {
    try {
      const { data, error } = await operation();
      
      if (error) {
        await this.handleDatabaseError(error, operationName);
      }
      
      return data as T;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      await this.handleDatabaseError(error, operationName);
    }
  }

  // ✅ Centralized error handling
  protected async handleDatabaseError(error: any, operation: string): Promise<never> {
    console.error(`Database error in ${operation}:`, error);
    
    // Log security event
    logSecurityEvent('database_error', {
      operation,
      error: error.message,
      code: error.code,
      userId: this.user?.id,
    });

    // Handle specific errors
    if (error.code === 'PGRST301') {
      throw new AppError('Access denied', 'ACCESS_DENIED');
    } else if (error.code === '23505') {
      throw new AppError('Duplicate entry', 'DUPLICATE_ENTRY');
    } else if (error.code === '23503') {
      throw new AppError('Referenced item not found', 'REFERENCE_ERROR');
    } else {
      throw new AppError(`Failed to ${operation}`, 'DATABASE_ERROR');
    }
  }
}
```

## 🎯 Domain Service Implementation

### ProjectService (Core Business Logic)
```typescript
// File: projectService.ts
export class ProjectService extends BaseService {
  
  // ✅ Create project with full validation
  async createProject(projectData: CreateProjectData): Promise<Project> {
    const user = this.requireAuth();

    // Business logic validations
    await this.validateProjectCreationLimits();

    const slug = await this.generateUniqueSlug(projectData.name);

    const project = await this.executeQuery(
      () => this.supabase
        .from('projects')
        .insert({
          ...projectData,
          user_id: user.id,
          slug,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select(`
          *,
          client:clients(*)
        `)
        .single(),
      'create project'
    );

    // Create initial milestones
    if (projectData.milestones?.length > 0) {
      await this.createMilestones(project.id, projectData.milestones);
    }

    // Update user's project count
    await this.updateUserProjectCount(1);

    logSecurityEvent('project_created', {
      userId: user.id,
      projectId: project.id,
      projectName: project.name,
    });

    return project;
  }

  // ✅ Get project with security validation
  async getProject(slug: string): Promise<Project | null> {
    const user = this.requireAuth();

    return this.executeQuery(
      () => this.supabase
        .from('projects')
        .select(`
          *,
          client:clients(*),
          milestones(*),
          invoices(*)
        `)
        .eq('slug', slug)
        .eq('user_id', user.id) // RLS will enforce this but explicit is better
        .single(),
      'get project'
    );
  }

  // ✅ Client project access (different security model)
  async getClientProject(token: string): Promise<ClientProjectView | null> {
    // Validate token first (no user required)
    const tokenData = await this.validateClientToken(token);
    
    return this.executeQuery(
      () => this.supabase
        .from('projects')
        .select(`
          id, name, brief, status, currency, total_amount,
          start_date, end_date, contract_pdf_url,
          client:clients(name, email, company),
          milestones(
            id, title, description, price, status,
            deliverable_link, start_date, end_date
          ),
          freelancer:profiles!user_id(
            full_name, company, website, avatar_url
          ),
          branding:freelancer_branding!user_id(*)
        `)
        .eq('id', tokenData.project_id)
        .single(),
      'get client project'
    );
  }

  // ✅ Private helper methods
  private async validateProjectCreationLimits(): Promise<void> {
    const user = this.requireAuth();
    
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('user_type, project_count')
      .eq('id', user.id)
      .single();

    if (!profile) throw new AppError('User profile not found', 'PROFILE_NOT_FOUND');

    const limits = getUserPlanLimits(profile.user_type || 'free');
    const currentCount = profile.project_count || 0;

    if (currentCount >= limits.maxProjects) {
      throw new AppError(
        `Project limit reached. Upgrade your plan to create more projects.`,
        'PROJECT_LIMIT_REACHED'
      );
    }
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();

    const { data: existing } = await this.supabase
      .from('projects')
      .select('slug')
      .eq('slug', baseSlug)
      .single();

    if (!existing) {
      return baseSlug;
    }

    return `${baseSlug}-${Date.now()}`;
  }
}
```

### ClientService (Relationship Management)
```typescript
// File: core/ClientService.ts
export class ClientService extends BaseService {

  async createClient(clientData: CreateClientData): Promise<Client> {
    const user = this.requireAuth();

    await this.validateClientCreationLimits();

    const client = await this.executeQuery(
      () => this.supabase
        .from('clients')
        .insert({
          ...clientData,
          user_id: user.id,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single(),
      'create client'
    );

    logSecurityEvent('client_created', {
      userId: user.id,
      clientId: client.id,
      clientEmail: client.email,
    });

    return client;
  }

  // ✅ Client token generation for secure access
  async generateClientProjectToken(projectId: string, clientEmail: string): Promise<string> {
    const user = this.requireAuth();

    // Verify user owns the project
    const { data: project } = await this.supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (!project) {
      throw new AppError('Project not found', 'PROJECT_NOT_FOUND');
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90); // 90-day expiry

    await this.executeCommand(
      () => this.supabase
        .from('client_project_tokens')
        .insert({
          project_id: projectId,
          token,
          client_email: clientEmail,
          expires_at: expiresAt.toISOString(),
          is_active: true,
        }),
      'generate client token'
    );

    logSecurityEvent('client_token_generated', {
      userId: user.id,
      projectId,
      clientEmail,
    });

    return token;
  }
}
```

### EmailService (External Integration)
```typescript
// File: core/EmailService.ts
export class EmailService extends BaseService {
  private emailProvider: 'sendgrid' | 'resend' = 'resend';

  async sendProjectInvite(projectId: string, clientEmail: string): Promise<void> {
    const user = this.requireAuth();

    // Get project data with relations
    const project = await this.supabase
      .from('projects')
      .select(`
        *,
        client:clients(*),
        freelancer:profiles!user_id(full_name, company)
      `)
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (!project.data) {
      throw new AppError('Project not found', 'PROJECT_NOT_FOUND');
    }

    // Generate secure access token
    const clientService = new ClientService(this.user);
    const token = await clientService.generateClientProjectToken(projectId, clientEmail);

    // Send templated email
    await this.sendTemplatedEmail({
      to: clientEmail,
      template: 'project-invite',
      data: {
        projectName: project.data.name,
        freelancerName: project.data.freelancer.full_name,
        projectUrl: `${process.env.VITE_APP_URL}/client/${token}`,
        companyName: project.data.freelancer.company || 'Ruzma',
      },
    });

    logSecurityEvent('project_invite_sent', {
      userId: user.id,
      projectId,
      clientEmail,
    });
  }

  private async sendTemplatedEmail(params: EmailParams): Promise<void> {
    try {
      if (this.emailProvider === 'resend') {
        await this.sendResendEmail(params);
      } else {
        await this.sendSendGridEmail(params);
      }
    } catch (error) {
      logSecurityEvent('email_send_failed', {
        userId: this.user?.id,
        template: params.template,
        recipient: params.to,
        error: String(error),
      });
      throw new AppError('Failed to send email', 'EMAIL_SEND_FAILED');
    }
  }
}
```

## 🔒 Security Patterns in Services

### Authentication Validation
```typescript
// ✅ ALWAYS validate authentication first
async someOperation(): Promise<Result> {
  const user = this.requireAuth(); // Throws if not authenticated
  
  // Proceed with operation
  const result = await this.executeQuery(
    () => this.supabase
      .from('table')
      .select('*')
      .eq('user_id', user.id), // Explicit user filtering
    'operation name'
  );
  
  return result;
}
```

### RLS Compliance
```typescript
// ✅ DO - Let RLS handle security, but be explicit
async getUserData(userId: string): Promise<UserData> {
  const user = this.requireAuth();
  
  // Even though RLS will filter, be explicit about intent
  return this.executeQuery(
    () => this.supabase
      .from('user_data')
      .select('*')
      .eq('user_id', user.id), // Will be enforced by RLS anyway
    'get user data'
  );
}

// ❌ DON'T bypass RLS or use service role inappropriately
```

### Input Validation
```typescript
// ✅ DO validate inputs before database operations
async createProject(projectData: CreateProjectData): Promise<Project> {
  const user = this.requireAuth();

  // Validate input data
  const validatedData = createProjectSchema.parse(projectData);
  
  // Sanitize HTML content
  const sanitizedData = {
    ...validatedData,
    brief: DOMPurify.sanitize(validatedData.brief),
  };

  return this.executeQuery(
    () => this.supabase
      .from('projects')
      .insert({
        ...sanitizedData,
        user_id: user.id,
      })
      .select()
      .single(),
    'create project'
  );
}
```

## 📊 Error Handling Patterns

### Service-Level Error Handling
```typescript
// ✅ Comprehensive error handling in services
export class ProjectService extends BaseService {
  
  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const user = this.requireAuth();

    try {
      const result = await this.executeQuery(
        () => this.supabase
          .from('projects')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .eq('user_id', user.id)
          .select()
          .single(),
        'update project'
      );

      logSecurityEvent('project_updated', {
        userId: user.id,
        projectId: id,
        updatedFields: Object.keys(updates),
      });

      return result;
    } catch (error) {
      // Service-specific error handling
      if (error instanceof AppError && error.code === 'PGRST301') {
        throw new AppError('Project not found or access denied', 'PROJECT_ACCESS_DENIED');
      }
      throw error; // Re-throw other errors
    }
  }
}
```

## 🚨 Service Development Rules

### ✅ DO
- **Always extend BaseService** for database operations
- **Use ServiceRegistry** for dependency injection
- **Validate authentication** with `requireAuth()`
- **Use executeQuery/executeCommand** for database operations
- **Log security events** for important operations
- **Handle errors gracefully** with proper error types
- **Validate inputs** before processing
- **Use proper TypeScript types** throughout

### ❌ DON'T
- **Direct Supabase calls** without BaseService methods
- **Bypass authentication** validation
- **Ignore error handling** or use generic errors
- **Store sensitive data** in service instances
- **Create services without user context** (except system operations)
- **Use any types** or suppress TypeScript errors
- **Hardcode configuration** values

## 📋 Service Integration Checklist

When creating/modifying services:

- [ ] Extends BaseService properly
- [ ] Registered in ServiceRegistry
- [ ] Proper authentication validation
- [ ] Comprehensive error handling
- [ ] Security event logging
- [ ] Input validation and sanitization
- [ ] Proper TypeScript interfaces
- [ ] Database operations use executeQuery/executeCommand
- [ ] Respects RLS policies
- [ ] Includes JSDoc comments for public methods

## 🎯 Quick Service Usage Reference

### Getting Service Instances
```typescript
// In hooks or components
const { user } = useAuth();
const registry = ServiceRegistry.getInstance();

const projectService = registry.getProjectService(user);
const clientService = registry.getClientService(user);
const userService = registry.getUserService(user);
```

### Service Method Patterns
```typescript
// Create operations
const newProject = await projectService.createProject(projectData);

// Read operations  
const project = await projectService.getProject(slug);
const projects = await projectService.getProjects();

// Update operations
const updatedProject = await projectService.updateProject(id, updates);

// Delete operations
await projectService.deleteProject(id);
```

### Error Handling with Services
```typescript
try {
  const result = await projectService.createProject(data);
  toast.success('Project created successfully');
} catch (error) {
  if (error instanceof AppError) {
    toast.error(error.message);
  } else {
    toast.error('An unexpected error occurred');
  }
}
```

### Service Cleanup
```typescript
// On user logout
const registry = ServiceRegistry.getInstance();
registry.clearUserServices(userId);
```