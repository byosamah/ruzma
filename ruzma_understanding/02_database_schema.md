# Ruzma Database Schema Analysis

## Overview
Ruzma uses PostgreSQL via Supabase with a comprehensive schema supporting freelancer project management, client relationships, invoicing, and subscription management. The database has evolved through 71+ migrations with robust Row Level Security (RLS) policies.

## Core Business Tables

### Projects Table
**Purpose**: Central entity for freelancer projects
```sql
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  brief TEXT NOT NULL,
  slug TEXT UNIQUE,
  status TEXT DEFAULT 'active',
  client_id UUID REFERENCES public.clients(id),
  currency TEXT DEFAULT 'USD',
  total_amount DECIMAL(10,2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  contract_pdf_url TEXT,
  contract_signed BOOLEAN DEFAULT false,
  payment_terms TEXT,
  visibility_settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Key Features**:
- Unique slug for SEO-friendly URLs
- Client relationship for B2B workflows
- Contract management with PDF storage
- Flexible visibility settings (JSONB)
- Currency support for international clients
- Payment terms configuration

### Milestones Table
**Purpose**: Project deliverables and payment tracking
```sql
CREATE TABLE public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'review', 'approved', 'payment_submitted', 'paid', 'rejected')),
  deliverable_link TEXT,
  payment_proof_url TEXT,
  start_date DATE,
  end_date DATE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Key Features**:
- Cascading deletion with projects
- Rich status workflow for project phases
- Deliverable link for client review
- Payment proof upload capability
- Order indexing for milestone sequence
- Date tracking for project timeline

### Clients Table
**Purpose**: Client relationship management
```sql
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  address TEXT,
  country TEXT,
  currency TEXT DEFAULT 'USD',
  notes TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Key Features**:
- Complete contact information management
- Company and personal client support
- Country and currency preferences
- Client status management
- Internal notes for relationship tracking

## Financial Management Tables

### Invoices Table
**Purpose**: Invoice generation and tracking
```sql
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  client_id UUID REFERENCES public.clients(id),
  project_id UUID REFERENCES public.projects(id),
  invoice_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_terms TEXT,
  notes TEXT,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Invoice Items Table
**Purpose**: Line items for detailed invoicing
```sql
CREATE TABLE public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Key Features**:
- Flexible invoice item structure
- Quantity and unit pricing support
- Automatic total calculation
- PDF generation capability
- Tax calculation support

## User Management Tables

### Profiles Table
**Purpose**: Extended user information beyond auth.users
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  company TEXT,
  website TEXT,
  bio TEXT,
  avatar_url TEXT,
  currency TEXT DEFAULT 'USD',
  country TEXT,
  language TEXT DEFAULT 'en',
  user_type TEXT DEFAULT 'free' CHECK (user_type IN ('free', 'pro', 'enterprise')),
  project_count INTEGER DEFAULT 0,
  storage_used BIGINT DEFAULT 0,
  onboarding_completed BOOLEAN DEFAULT false,
  email_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### User Plan Limits Table
**Purpose**: Configurable subscription plan restrictions
```sql
CREATE TABLE public.user_plan_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  plan_type TEXT NOT NULL DEFAULT 'free',
  max_projects INTEGER NOT NULL DEFAULT 1,
  max_clients INTEGER NOT NULL DEFAULT 5,
  max_storage_mb BIGINT NOT NULL DEFAULT 100,
  max_invoices INTEGER NOT NULL DEFAULT 5,
  features JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Key Features**:
- Tiered subscription support (free, pro, enterprise)
- Configurable limits per plan
- Feature flags in JSONB format
- Storage quota management
- User onboarding tracking

## Template & Branding System

### Project Templates Table
**Purpose**: Reusable project blueprints
```sql
CREATE TABLE public.project_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  milestones JSONB NOT NULL DEFAULT '[]',
  total_amount DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Freelancer Branding Table
**Purpose**: Custom branding for client portals
```sql
CREATE TABLE public.freelancer_branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#000000',
  secondary_color TEXT DEFAULT '#666666',
  font_family TEXT DEFAULT 'Inter',
  company_name TEXT,
  tagline TEXT,
  website_url TEXT,
  social_links JSONB DEFAULT '{}',
  custom_css TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Key Features**:
- Custom logo and color schemes
- Typography preferences
- Social media integration
- Custom CSS support
- White-label client experience

## Communication & Tracking

### Notifications Table
**Purpose**: System messaging and alerts
```sql
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  action_url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Activity Logs Table
**Purpose**: Audit trail and user activity tracking
```sql
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## Security Implementation

### Row Level Security (RLS) Policies

**Projects Policies**:
```sql
-- Users can only access their own projects
CREATE POLICY "Users can view their own projects" 
  ON public.projects FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" 
  ON public.projects FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" 
  ON public.projects FOR UPDATE 
  USING (auth.uid() = user_id);
```

**Client Access Policies**:
```sql
-- Clients can view projects they're assigned to
CREATE POLICY "Clients can view assigned projects"
  ON public.projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = projects.client_id
      AND clients.email = auth.jwt() ->> 'email'
    )
  );
```

**Milestone Security**:
```sql
-- Milestones inherit project permissions
CREATE POLICY "Users can view milestones of their own projects" 
  ON public.milestones FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = milestones.project_id 
    AND projects.user_id = auth.uid()
  ));
```

## Storage Buckets & File Management

### Storage Configuration
```sql
-- Project attachments bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-attachments', 'project-attachments', false);

-- Profile avatars bucket  
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Invoice PDFs bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoices', 'invoices', false);
```

### Storage Policies
```sql
-- Users can upload to their own folders
CREATE POLICY "Users can upload their own files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'project-attachments' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

## Database Functions & Triggers

### Automated Updates
```sql
-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables
CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON public.projects 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Business Logic Functions
```sql
-- Calculate project total from milestones
CREATE OR REPLACE FUNCTION calculate_project_total(project_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
  total DECIMAL(10,2);
BEGIN
  SELECT COALESCE(SUM(price), 0) INTO total
  FROM public.milestones
  WHERE project_id = project_uuid;
  
  UPDATE public.projects 
  SET total_amount = total
  WHERE id = project_uuid;
  
  RETURN total;
END;
$$ LANGUAGE plpgsql;
```

## Schema Evolution & Migration Strategy

### Migration Timeline
- **Phase 1 (Migrations 1-20)**: Core project and milestone structure
- **Phase 2 (Migrations 21-40)**: Client management and relationships  
- **Phase 3 (Migrations 41-60)**: Invoicing and financial features
- **Phase 4 (Migrations 61-71+)**: Templates, branding, and advanced features

### Database Optimization
- **Indexes**: Strategic indexing on foreign keys and query patterns
- **Constraints**: Data integrity through CHECK constraints and foreign keys  
- **Performance**: Query optimization and connection pooling
- **Backup**: Automated daily backups with point-in-time recovery

### Future Schema Considerations
- **Audit Tables**: Complete change tracking for compliance
- **Partitioning**: Table partitioning for large datasets
- **Read Replicas**: Geographic distribution for global users
- **Archival Strategy**: Data lifecycle management for old projects