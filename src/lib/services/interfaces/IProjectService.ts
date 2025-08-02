import { Project, ProjectFormData } from '@/types/project';

export interface ProjectFilters {
  status?: string | null;
  clientId?: string | null;
  search?: string;
  dateRange?: { start?: string; end?: string } | null;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProjectListOptions extends ProjectFilters {
  page?: number;
  limit?: number;
}

export interface ProjectResult {
  data?: Project;
  error?: string;
}

export interface ProjectListResult {
  data?: Project[];
  total?: number;
  error?: string;
}

export interface IProjectService {
  // CRUD operations
  create(data: ProjectFormData): Promise<ProjectResult>;
  get(id: string): Promise<ProjectResult>;
  list(options?: ProjectListOptions): Promise<ProjectListResult>;
  update(id: string, data: Partial<ProjectFormData>): Promise<ProjectResult>;
  delete(id: string): Promise<{ error?: string }>;
  
  // Project-specific operations
  getBySlug(slug: string): Promise<ProjectResult>;
  getByClientId(clientId: string): Promise<ProjectListResult>;
  updateStatus(id: string, status: string): Promise<ProjectResult>;
  
  // Statistics and analytics
  getStats(userId: string): Promise<{
    data?: {
      total: number;
      active: number;
      completed: number;
      revenue: number;
    };
    error?: string;
  }>;
  
  // Template operations
  saveAsTemplate(projectId: string, templateData: any): Promise<{ error?: string }>;
  getTemplates(userId: string): Promise<{ data?: any[]; error?: string }>;
  deleteTemplate(templateId: string): Promise<{ error?: string }>;
  
  // Client project operations (token-based access)
  getClientProject(token: string): Promise<ProjectResult>;
}