# Ruzma API Routes & Services Architecture

## Overview
Ruzma implements a service-oriented architecture that abstracts business logic from UI components, providing clean separation of concerns and testable code. The API layer combines Supabase's built-in features with custom business services.

## Service Architecture

### Service Layer Hierarchy
```
API Layer
├── Supabase Client (Database Operations)
├── Service Registry (Dependency Injection)
├── Base Service (Common Functionality)
├── Domain Services (Business Logic)
│   ├── UserService
│   ├── ProjectService
│   ├── ClientService
│   ├── InvoiceService
│   └── EmailService
└── API Services (External Integrations)
    ├── AuthService
    ├── EmailService
    └── PaymentService
```

## Base Service Implementation

### Abstract Base Service
```typescript
export abstract class BaseService {
  protected user: User | null;
  protected supabase = supabase;

  constructor(user: User | null) {
    this.user = user;
  }

  protected requireAuth(): User {
    if (!this.user) {
      throw new AppError('Authentication required', 'AUTH_REQUIRED');
    }
    return this.user;
  }

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

  protected async executeCommand(
    operation: () => Promise<PostgrestResponse<any>>,
    operationName: string
  ): Promise<void> {
    try {
      const { error } = await operation();
      
      if (error) {
        await this.handleDatabaseError(error, operationName);
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      await this.handleDatabaseError(error, operationName);
    }
  }

  protected async handleDatabaseError(error: any, operation: string): Promise<never> {
    console.error(`Database error in ${operation}:`, error);
    
    // Log security event for database errors
    logSecurityEvent('database_error', {
      operation,
      error: error.message,
      code: error.code,
      userId: this.user?.id,
    });

    // Handle specific error types
    if (error.code === 'PGRST301') {
      throw new AppError('Access denied', 'ACCESS_DENIED');
    } else if (error.code === '23505') {
      throw new AppError('Duplicate entry', 'DUPLICATE_ENTRY');
    } else if (error.code === '23503') {
      throw new AppError('Referenced item not found', 'REFERENCE_ERROR');
    } else if (error.code === '42501') {
      throw new AppError('Insufficient permissions', 'PERMISSION_DENIED');
    } else {
      throw new AppError(`Failed to ${operation}`, 'DATABASE_ERROR');
    }
  }
}
```

## Domain Services

### Project Service
Handles all project-related business logic and database operations.

```typescript
export class ProjectService extends BaseService {
  async createProject(projectData: CreateProjectData): Promise<Project> {
    const user = this.requireAuth();

    // Validate user can create more projects
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

    // Create initial milestones if provided
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
        .eq('user_id', user.id)
        .single(),
      'get project'
    );
  }

  async getClientProject(token: string): Promise<ClientProjectView | null> {
    // Validate token and get project data
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

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const user = this.requireAuth();

    const project = await this.executeQuery(
      () => this.supabase
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select(`
          *,
          client:clients(*),
          milestones(*)
        `)
        .single(),
      'update project'
    );

    logSecurityEvent('project_updated', {
      userId: user.id,
      projectId: id,
      updatedFields: Object.keys(updates),
    });

    return project;
  }

  async deleteProject(id: string): Promise<void> {
    const user = this.requireAuth();

    await this.executeCommand(
      () => this.supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id),
      'delete project'
    );

    // Update user's project count
    await this.updateUserProjectCount(-1);

    logSecurityEvent('project_deleted', {
      userId: user.id,
      projectId: id,
    });
  }

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

    // Check if slug exists
    const { data: existing } = await this.supabase
      .from('projects')
      .select('slug')
      .eq('slug', baseSlug)
      .single();

    if (!existing) {
      return baseSlug;
    }

    // Generate unique slug with timestamp
    return `${baseSlug}-${Date.now()}`;
  }

  private async createMilestones(projectId: string, milestones: CreateMilestoneData[]): Promise<void> {
    const milestonesWithProjectId = milestones.map((milestone, index) => ({
      ...milestone,
      project_id: projectId,
      order_index: index,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    await this.executeCommand(
      () => this.supabase
        .from('milestones')
        .insert(milestonesWithProjectId),
      'create milestones'
    );
  }

  private async updateUserProjectCount(delta: number): Promise<void> {
    const user = this.requireAuth();

    await this.executeCommand(
      () => this.supabase.rpc('update_user_project_count', {
        user_id: user.id,
        delta,
      }),
      'update project count'
    );
  }
}
```

### Client Service
Manages client relationships and communication.

```typescript
export class ClientService extends BaseService {
  async createClient(clientData: CreateClientData): Promise<Client> {
    const user = this.requireAuth();

    // Validate client creation limits
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

  async getClients(filters?: ClientFilters): Promise<Client[]> {
    const user = this.requireAuth();

    let query = this.supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.country) {
      query = query.eq('country', filters.country);
    }

    return this.executeQuery(
      () => query,
      'get clients'
    );
  }

  async updateClient(id: string, updates: Partial<Client>): Promise<Client> {
    const user = this.requireAuth();

    const client = await this.executeQuery(
      () => this.supabase
        .from('clients')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single(),
      'update client'
    );

    logSecurityEvent('client_updated', {
      userId: user.id,
      clientId: id,
      updatedFields: Object.keys(updates),
    });

    return client;
  }

  async deleteClient(id: string): Promise<void> {
    const user = this.requireAuth();

    // Check if client has active projects
    const { data: projects } = await this.supabase
      .from('projects')
      .select('id')
      .eq('client_id', id)
      .eq('status', 'active');

    if (projects && projects.length > 0) {
      throw new AppError(
        'Cannot delete client with active projects',
        'CLIENT_HAS_ACTIVE_PROJECTS'
      );
    }

    await this.executeCommand(
      () => this.supabase
        .from('clients')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id),
      'delete client'
    );

    logSecurityEvent('client_deleted', {
      userId: user.id,
      clientId: id,
    });
  }

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

  private async validateClientCreationLimits(): Promise<void> {
    const user = this.requireAuth();
    
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (!profile) throw new AppError('User profile not found', 'PROFILE_NOT_FOUND');

    const { data: clientCount } = await this.supabase
      .from('clients')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id);

    const limits = getUserPlanLimits(profile.user_type || 'free');
    const currentCount = clientCount?.length || 0;

    if (currentCount >= limits.maxClients) {
      throw new AppError(
        `Client limit reached. Upgrade your plan to add more clients.`,
        'CLIENT_LIMIT_REACHED'
      );
    }
  }
}
```

### Invoice Service
Handles invoice generation, PDF creation, and payment tracking.

```typescript
export class InvoiceService extends BaseService {
  async createInvoice(invoiceData: CreateInvoiceData): Promise<Invoice> {
    const user = this.requireAuth();

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber();

    const invoice = await this.executeQuery(
      () => this.supabase
        .from('invoices')
        .insert({
          ...invoiceData,
          user_id: user.id,
          invoice_number: invoiceNumber,
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select(`
          *,
          client:clients(*),
          project:projects(*),
          items:invoice_items(*)
        `)
        .single(),
      'create invoice'
    );

    logSecurityEvent('invoice_created', {
      userId: user.id,
      invoiceId: invoice.id,
      invoiceNumber,
      amount: invoice.total_amount,
    });

    return invoice;
  }

  async updateInvoiceStatus(id: string, status: InvoiceStatus): Promise<Invoice> {
    const user = this.requireAuth();

    const invoice = await this.executeQuery(
      () => this.supabase
        .from('invoices')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single(),
      'update invoice status'
    );

    logSecurityEvent('invoice_status_updated', {
      userId: user.id,
      invoiceId: id,
      newStatus: status,
    });

    return invoice;
  }

  async generateInvoicePDF(invoiceId: string): Promise<string> {
    const user = this.requireAuth();

    // Get invoice data with all relations
    const invoice = await this.executeQuery(
      () => this.supabase
        .from('invoices')
        .select(`
          *,
          client:clients(*),
          project:projects(*),
          items:invoice_items(*),
          freelancer:profiles!user_id(*),
          branding:freelancer_branding!user_id(*)
        `)
        .eq('id', invoiceId)
        .eq('user_id', user.id)
        .single(),
      'get invoice for PDF'
    );

    // Generate PDF using html2canvas and jsPDF
    const pdfBuffer = await this.generatePDFFromTemplate(invoice);

    // Upload PDF to storage
    const filename = `invoices/${user.id}/${invoiceId}.pdf`;
    const { data: uploadData } = await this.supabase.storage
      .from('invoices')
      .upload(filename, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (!uploadData) {
      throw new AppError('Failed to upload PDF', 'PDF_UPLOAD_FAILED');
    }

    // Update invoice with PDF URL
    const { data: urlData } = this.supabase.storage
      .from('invoices')
      .getPublicUrl(filename);

    await this.executeCommand(
      () => this.supabase
        .from('invoices')
        .update({ pdf_url: urlData.publicUrl })
        .eq('id', invoiceId),
      'update invoice PDF URL'
    );

    logSecurityEvent('invoice_pdf_generated', {
      userId: user.id,
      invoiceId,
    });

    return urlData.publicUrl;
  }

  private async generateInvoiceNumber(): Promise<string> {
    const user = this.requireAuth();
    
    // Get current year
    const year = new Date().getFullYear();
    
    // Get count of invoices for current year
    const { count } = await this.supabase
      .from('invoices')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .gte('created_at', `${year}-01-01`)
      .lt('created_at', `${year + 1}-01-01`);

    const invoiceNumber = `INV-${year}-${String((count || 0) + 1).padStart(3, '0')}`;
    
    return invoiceNumber;
  }

  private async generatePDFFromTemplate(invoice: InvoiceWithDetails): Promise<Buffer> {
    // Implementation would use html2canvas and jsPDF to generate PDF
    // This is a simplified version - actual implementation would be more complex
    
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF();

    // Add company branding
    if (invoice.branding?.logo_url) {
      // Add logo
    }

    // Add invoice header
    doc.setFontSize(20);
    doc.text('INVOICE', 20, 30);
    
    doc.setFontSize(12);
    doc.text(`Invoice #: ${invoice.invoice_number}`, 20, 50);
    doc.text(`Date: ${format(new Date(invoice.issue_date), 'MMM dd, yyyy')}`, 20, 60);
    doc.text(`Due Date: ${format(new Date(invoice.due_date), 'MMM dd, yyyy')}`, 20, 70);

    // Add client information
    doc.text('Bill To:', 20, 90);
    doc.text(invoice.client.name, 20, 100);
    if (invoice.client.company) {
      doc.text(invoice.client.company, 20, 110);
    }
    doc.text(invoice.client.email, 20, 120);

    // Add items table
    let yPosition = 150;
    doc.text('Description', 20, yPosition);
    doc.text('Quantity', 100, yPosition);
    doc.text('Unit Price', 130, yPosition);
    doc.text('Total', 160, yPosition);

    yPosition += 10;
    invoice.items.forEach((item) => {
      doc.text(item.description, 20, yPosition);
      doc.text(item.quantity.toString(), 100, yPosition);
      doc.text(`${invoice.currency} ${item.unit_price}`, 130, yPosition);
      doc.text(`${invoice.currency} ${item.total_price}`, 160, yPosition);
      yPosition += 10;
    });

    // Add totals
    yPosition += 20;
    doc.text(`Subtotal: ${invoice.currency} ${invoice.subtotal}`, 130, yPosition);
    if (invoice.tax_amount > 0) {
      yPosition += 10;
      doc.text(`Tax (${invoice.tax_rate}%): ${invoice.currency} ${invoice.tax_amount}`, 130, yPosition);
    }
    yPosition += 15;
    doc.setFont(undefined, 'bold');
    doc.text(`Total: ${invoice.currency} ${invoice.total_amount}`, 130, yPosition);

    // Convert to buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    return pdfBuffer;
  }
}
```

## External API Services

### Email Service
Handles transactional emails and notifications.

```typescript
export class EmailService extends BaseService {
  private emailProvider: 'sendgrid' | 'resend' = 'resend'; // Configure based on environment

  async sendProjectInvite(projectId: string, clientEmail: string): Promise<void> {
    const user = this.requireAuth();

    // Get project and client data
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

    // Generate client access token
    const clientService = new ClientService(this.user);
    const token = await clientService.generateClientProjectToken(projectId, clientEmail);

    // Send email
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

  async sendInvoiceEmail(invoiceId: string): Promise<void> {
    const user = this.requireAuth();

    // Get invoice data
    const invoice = await this.supabase
      .from('invoices')
      .select(`
        *,
        client:clients(*),
        freelancer:profiles!user_id(*),
        items:invoice_items(*)
      `)
      .eq('id', invoiceId)
      .eq('user_id', user.id)
      .single();

    if (!invoice.data) {
      throw new AppError('Invoice not found', 'INVOICE_NOT_FOUND');
    }

    // Generate PDF if not exists
    if (!invoice.data.pdf_url) {
      const invoiceService = new InvoiceService(this.user);
      await invoiceService.generateInvoicePDF(invoiceId);
    }

    // Send email with invoice attachment
    await this.sendTemplatedEmail({
      to: invoice.data.client.email,
      template: 'invoice',
      data: {
        invoiceNumber: invoice.data.invoice_number,
        amount: `${invoice.data.currency} ${invoice.data.total_amount}`,
        dueDate: format(new Date(invoice.data.due_date), 'MMMM dd, yyyy'),
        freelancerName: invoice.data.freelancer.full_name,
        invoiceUrl: invoice.data.pdf_url,
      },
      attachments: [
        {
          filename: `Invoice-${invoice.data.invoice_number}.pdf`,
          content: invoice.data.pdf_url,
        }
      ],
    });

    // Update invoice status
    await this.supabase
      .from('invoices')
      .update({ status: 'sent' })
      .eq('id', invoiceId);

    logSecurityEvent('invoice_email_sent', {
      userId: user.id,
      invoiceId,
      clientEmail: invoice.data.client.email,
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

  private async sendResendEmail(params: EmailParams): Promise<void> {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const template = await this.getEmailTemplate(params.template, params.data);

    await resend.emails.send({
      from: 'noreply@ruzma.com',
      to: params.to,
      subject: template.subject,
      html: template.html,
      attachments: params.attachments,
    });
  }

  private async getEmailTemplate(templateName: string, data: Record<string, any>) {
    // Load email template and replace variables
    const templates: Record<string, EmailTemplate> = {
      'project-invite': {
        subject: `You've been invited to view ${data.projectName}`,
        html: `
          <h2>Project Invitation</h2>
          <p>Hello,</p>
          <p>${data.freelancerName} has invited you to view the project "${data.projectName}".</p>
          <p><a href="${data.projectUrl}">Click here to view your project</a></p>
          <p>Best regards,<br>${data.companyName}</p>
        `,
      },
      'invoice': {
        subject: `Invoice ${data.invoiceNumber} - ${data.amount}`,
        html: `
          <h2>Invoice</h2>
          <p>Dear valued client,</p>
          <p>Please find attached your invoice ${data.invoiceNumber} for ${data.amount}.</p>
          <p>Due Date: ${data.dueDate}</p>
          <p><a href="${data.invoiceUrl}">View Invoice Online</a></p>
          <p>Best regards,<br>${data.freelancerName}</p>
        `,
      },
    };

    return templates[templateName];
  }
}
```

## Rate Limiting Service

### Request Rate Limiting
```typescript
export class RateLimitService {
  private static instance: RateLimitService;
  private limits: Map<string, RateLimitConfig> = new Map();
  private attempts: Map<string, AttemptRecord> = new Map();

  static getInstance(): RateLimitService {
    if (!RateLimitService.instance) {
      RateLimitService.instance = new RateLimitService();
    }
    return RateLimitService.instance;
  }

  constructor() {
    this.configureLimits();
    this.startCleanupTimer();
  }

  private configureLimits() {
    this.limits.set('auth:login', {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5,
      blockDuration: 60 * 60 * 1000, // 1 hour
    });

    this.limits.set('auth:signup', {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 3,
      blockDuration: 24 * 60 * 60 * 1000, // 24 hours
    });

    this.limits.set('api:project:create', {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 5,
      blockDuration: 5 * 60 * 1000, // 5 minutes
    });

    this.limits.set('api:email:send', {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 10,
      blockDuration: 60 * 60 * 1000, // 1 hour
    });
  }

  async checkRateLimit(key: string, identifier: string): Promise<RateLimitResult> {
    const limitConfig = this.limits.get(key);
    if (!limitConfig) {
      return { allowed: true, remainingRequests: Infinity };
    }

    const attemptKey = `${key}:${identifier}`;
    const now = Date.now();
    const attempt = this.attempts.get(attemptKey);

    // Check if currently blocked
    if (attempt?.blockedUntil && now < attempt.blockedUntil) {
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: attempt.blockedUntil,
        blocked: true,
      };
    }

    // Reset if window expired
    if (!attempt || now > attempt.resetTime) {
      this.attempts.set(attemptKey, {
        count: 1,
        resetTime: now + limitConfig.windowMs,
        firstAttempt: now,
      });
      return {
        allowed: true,
        remainingRequests: limitConfig.maxRequests - 1,
        resetTime: now + limitConfig.windowMs,
      };
    }

    // Check if limit exceeded
    if (attempt.count >= limitConfig.maxRequests) {
      // Block the identifier
      attempt.blockedUntil = now + limitConfig.blockDuration;
      
      logSecurityEvent('rate_limit_exceeded', {
        key,
        identifier,
        count: attempt.count,
        limit: limitConfig.maxRequests,
        blockDuration: limitConfig.blockDuration,
      });

      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: attempt.resetTime,
        blocked: true,
      };
    }

    // Increment counter
    attempt.count++;
    return {
      allowed: true,
      remainingRequests: limitConfig.maxRequests - attempt.count,
      resetTime: attempt.resetTime,
    };
  }

  private startCleanupTimer() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, attempt] of this.attempts.entries()) {
        if (now > attempt.resetTime && (!attempt.blockedUntil || now > attempt.blockedUntil)) {
          this.attempts.delete(key);
        }
      }
    }, 60 * 1000); // Cleanup every minute
  }
}
```

## Error Handling & Validation

### API Error Handler
```typescript
export class APIErrorHandler {
  static handle(error: any, context: string): never {
    console.error(`API Error in ${context}:`, error);

    if (error instanceof AppError) {
      throw error;
    }

    // Handle Supabase errors
    if (error.code) {
      switch (error.code) {
        case 'PGRST301':
          throw new AppError('Access denied', 'ACCESS_DENIED');
        case '23505':
          throw new AppError('Duplicate entry', 'DUPLICATE_ENTRY');
        case '23503':
          throw new AppError('Referenced item not found', 'REFERENCE_ERROR');
        case '42501':
          throw new AppError('Insufficient permissions', 'PERMISSION_DENIED');
        default:
          throw new AppError(`Database error: ${error.message}`, 'DATABASE_ERROR');
      }
    }

    // Handle network errors
    if (error.name === 'NetworkError') {
      throw new AppError('Network connection error', 'NETWORK_ERROR');
    }

    // Generic error fallback
    throw new AppError('An unexpected error occurred', 'UNKNOWN_ERROR');
  }
}
```

This comprehensive API and services architecture provides a robust foundation for Ruzma's business logic while maintaining security, scalability, and maintainability.