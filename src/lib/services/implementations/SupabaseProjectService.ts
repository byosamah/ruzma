import { SupabaseClient } from '@supabase/supabase-js';
import {
  IProjectService,
  ProjectListOptions,
  ProjectResult,
  ProjectListResult,
} from '../interfaces/IProjectService';
import { Project, ProjectFormData } from '@/types/project';

export class SupabaseProjectService implements IProjectService {
  constructor(private supabase: SupabaseClient) {}

  async create(data: ProjectFormData): Promise<ProjectResult> {
    try {
      const { data: project, error } = await this.supabase
        .from('projects')
        .insert([data])
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data: project };
    } catch (error: any) {
      return { error: error.message || 'Project creation failed' };
    }
  }

  async get(id: string): Promise<ProjectResult> {
    try {
      const { data, error } = await this.supabase
        .from('projects')
        .select(`
          *,
          client:clients(*),
          milestones(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error: any) {
      return { error: error.message || 'Project fetch failed' };
    }
  }

  async list(options: ProjectListOptions = {}): Promise<ProjectListResult> {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        clientId,
        search,
        dateRange,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = options;

      let query = this.supabase
        .from('projects')
        .select(`
          *,
          client:clients(*),
          milestones(*)
        `, { count: 'exact' });

      // Apply filters
      if (status) {
        query = query.eq('status', status);
      }
      
      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      if (dateRange?.start) {
        query = query.gte('created_at', dateRange.start);
      }

      if (dateRange?.end) {
        query = query.lte('created_at', dateRange.end);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        return { error: error.message };
      }

      return { data, total: count || 0 };
    } catch (error: any) {
      return { error: error.message || 'Projects list fetch failed' };
    }
  }

  async update(id: string, data: Partial<ProjectFormData>): Promise<ProjectResult> {
    try {
      const { data: project, error } = await this.supabase
        .from('projects')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data: project };
    } catch (error: any) {
      return { error: error.message || 'Project update failed' };
    }
  }

  async delete(id: string): Promise<{ error?: string }> {
    try {
      const { error } = await this.supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error: any) {
      return { error: error.message || 'Project deletion failed' };
    }
  }

  async getBySlug(slug: string): Promise<ProjectResult> {
    try {
      const { data, error } = await this.supabase
        .from('projects')
        .select(`
          *,
          client:clients(*),
          milestones(*)
        `)
        .eq('slug', slug)
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error: any) {
      return { error: error.message || 'Project fetch by slug failed' };
    }
  }

  async getByClientId(clientId: string): Promise<ProjectListResult> {
    try {
      const { data, error } = await this.supabase
        .from('projects')
        .select(`
          *,
          client:clients(*),
          milestones(*)
        `)
        .eq('client_id', clientId);

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error: any) {
      return { error: error.message || 'Projects fetch by client failed' };
    }
  }

  async updateStatus(id: string, status: string): Promise<ProjectResult> {
    return this.update(id, { status });
  }

  async getStats(userId: string): Promise<{
    data?: {
      total: number;
      active: number;
      completed: number;
      revenue: number;
    };
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('projects')
        .select('status, budget')
        .eq('user_id', userId);

      if (error) {
        return { error: error.message };
      }

      const stats = {
        total: data.length,
        active: data.filter(p => p.status === 'active').length,
        completed: data.filter(p => p.status === 'completed').length,
        revenue: data.reduce((sum, p) => sum + (p.budget || 0), 0),
      };

      return { data: stats };
    } catch (error: any) {
      return { error: error.message || 'Project stats fetch failed' };
    }
  }

  async saveAsTemplate(projectId: string, templateData: any): Promise<{ error?: string }> {
    try {
      const { error } = await this.supabase
        .from('project_templates')
        .insert([{ project_id: projectId, ...templateData }]);

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error: any) {
      return { error: error.message || 'Template save failed' };
    }
  }

  async getTemplates(userId: string): Promise<{ data?: any[]; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('project_templates')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error: any) {
      return { error: error.message || 'Templates fetch failed' };
    }
  }

  async deleteTemplate(templateId: string): Promise<{ error?: string }> {
    try {
      const { error } = await this.supabase
        .from('project_templates')
        .delete()
        .eq('id', templateId);

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error: any) {
      return { error: error.message || 'Template deletion failed' };
    }
  }

  async getClientProject(token: string): Promise<ProjectResult> {
    try {
      const { data, error } = await this.supabase.functions.invoke('get-client-project', {
        body: { token }
      });

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error: any) {
      return { error: error.message || 'Client project fetch failed' };
    }
  }
}