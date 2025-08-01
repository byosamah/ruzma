import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { CreateProjectFormData } from '@/lib/validators/project';
import { DatabaseProject, DatabaseMilestone } from '@/hooks/projectTypes';
import { ProjectTemplate } from '@/types/projectTemplate';
import { generateSlug, ensureUniqueSlug } from '@/lib/slugUtils';
import * as analytics from '@/lib/analytics';
import { securityMonitor } from '@/lib/securityMonitoring';
import { toast } from 'sonner';

export interface ProjectOperationData extends CreateProjectFormData {
  id?: string; // For edit operations
  slug?: string; // For edit operations
}

export class ProjectService {
  private user: User | null;

  constructor(user: User | null) {
    this.user = user;
  }

  // Unified method for create, edit, and template operations
  async saveProject(data: ProjectOperationData, mode: 'create' | 'edit' = 'create'): Promise<DatabaseProject | null> {
    if (!this.user) {
      throw new Error('User not authenticated');
    }

    try {
      if (mode === 'create') {
        return await this.createProject(data);
      } else {
        return await this.updateProject(data);
      }
    } catch (error) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} project:`, error);
      throw error;
    }
  }

  async createProject(data: ProjectOperationData): Promise<DatabaseProject | null> {
    // Validation and sanitization
    const sanitizedName = data.name.trim();
    const sanitizedBrief = data.brief.trim();
    const sanitizedClientEmail = data.clientEmail?.trim() || '';

    if (!sanitizedName || !sanitizedBrief) {
      throw new Error('Project name and brief are required');
    }

    // Rate limiting check
    const rateLimitKey = `project_creation_${this.user.id}`;
    if (!securityMonitor.checkRateLimit(rateLimitKey, 10, 3600000)) {
      throw new Error('Too many project creation attempts. Please try again later.');
    }

    // Check project count vs limit
    const { count: projectCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', this.user.id);

    const limit = 3; // Default project limit
    if (projectCount !== null && projectCount >= limit) {
      throw new Error(`You have reached your project limit of ${limit}. Please upgrade your plan to create more projects.`);
    }

    // Handle client lookup/creation
    let clientData = null;
    if (sanitizedClientEmail) {
      clientData = await this.handleClientLookup(sanitizedClientEmail);
    }

    // Calculate project dates
    const projectDates = this.calculateProjectDates(data.milestones);
    
    // Generate unique slug
    const baseSlug = generateSlug(sanitizedName);
    const slug = await ensureUniqueSlug(baseSlug, this.user.id);

    // Create project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: this.user.id,
        name: sanitizedName,
        brief: sanitizedBrief,
        client_email: sanitizedClientEmail || null,
        slug,
        start_date: projectDates.startDate,
        end_date: projectDates.endDate,
        payment_proof_required: data.paymentProofRequired || false,
        contract_required: data.contractRequired || false,
        contract_terms: data.contractTerms || null,
        payment_terms: data.paymentTerms || null,
        project_scope: data.projectScope || null,
        revision_policy: data.revisionPolicy || null,
      })
      .select()
      .single();

    if (projectError) {
      throw new Error(`Failed to create project: ${projectError.message}`);
    }

    // Create milestones
    const milestones = await this.createMilestones(project.id, data.milestones);

    // Update project count
    await supabase.rpc('update_project_count', { _user_id: this.user.id, _count_change: 1 });

    // Analytics tracking
    analytics.trackProjectCreated(project.id, projectCount === 0);

    // Send contract approval email if needed
    if (data.contractRequired && sanitizedClientEmail) {
      await this.sendContractApprovalEmail(project.id);
    }

    return { ...project, milestones } as DatabaseProject;
  }

  async updateProject(data: ProjectOperationData): Promise<DatabaseProject | null> {
    if (!data.id) {
      throw new Error('Project ID is required for updates');
    }

    // Update project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .update({
        name: data.name.trim(),
        brief: data.brief.trim(),
        client_email: data.clientEmail?.trim() || null,
        payment_proof_required: data.paymentProofRequired || false,
        contract_terms: data.contractTerms || null,
        payment_terms: data.paymentTerms || null,
        project_scope: data.projectScope || null,
        revision_policy: data.revisionPolicy || null,
      })
      .eq('id', data.id)
      .eq('user_id', this.user!.id)
      .select()
      .single();

    if (projectError) {
      throw new Error(`Failed to update project: ${projectError.message}`);
    }

    // Update milestones
    await this.updateMilestones(data.id, data.milestones);

    // Get updated project with milestones
    const { data: updatedProject } = await supabase
      .from('projects')
      .select(`
        *,
        milestones (*)
      `)
      .eq('id', data.id)
      .single();

    analytics.trackProjectCreated(data.id!, false);

    return updatedProject as DatabaseProject;
  }

  async deleteProject(projectId: string): Promise<boolean> {
    if (!this.user) {
      throw new Error('User not authenticated');
    }

    try {
      // Delete project and its milestones (cascade delete should handle milestones)
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', this.user.id);

      if (error) {
        throw new Error(`Failed to delete project: ${error.message}`);
      }

      // Update project count
      await supabase.rpc('update_project_count', { _user_id: this.user.id, _count_change: -1 });

      analytics.trackProjectCreated(projectId, false);
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    }
  }

  private async handleClientLookup(email: string) {
    const { data: existingClient } = await supabase
      .from('clients')
      .select('*')
      .eq('email', email)
      .eq('user_id', this.user!.id)
      .single();

    if (!existingClient) {
      const { data: newClient, error } = await supabase
        .from('clients')
        .insert({
          user_id: this.user!.id,
          email: email,
          name: email.split('@')[0],
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating client:', error);
        return null;
      }
      return newClient;
    }
    return existingClient;
  }

  private calculateProjectDates(milestones: any[]) {
    const validDates = milestones
      .flatMap(m => [m.start_date, m.end_date])
      .filter(date => date && date.trim() !== '')
      .map(date => new Date(date))
      .filter(date => !isNaN(date.getTime()));

    const startDate = validDates.length > 0 ? 
      validDates.reduce((min, date) => date < min ? date : min).toISOString().split('T')[0] : 
      null;
    
    const endDate = validDates.length > 0 ? 
      validDates.reduce((max, date) => date > max ? date : max).toISOString().split('T')[0] : 
      null;

    return { startDate, endDate };
  }

  private async createMilestones(projectId: string, milestones: any[]): Promise<DatabaseMilestone[]> {
    const milestoneInserts = milestones.map(milestone => ({
      project_id: projectId,
      title: milestone.title.trim(),
      description: milestone.description.trim(),
      price: Number(milestone.price) || 0,
      start_date: milestone.start_date || null,
      end_date: milestone.end_date || null,
    }));

    const { data: createdMilestones, error } = await supabase
      .from('milestones')
      .insert(milestoneInserts)
      .select();

    if (error) {
      throw new Error(`Failed to create milestones: ${error.message}`);
    }

    // Track milestone creation
    createdMilestones.forEach(milestone => {
      analytics.trackMilestoneCreated(projectId, createdMilestones.length);
    });

    return createdMilestones as DatabaseMilestone[];
  }

  private async updateMilestones(projectId: string, milestones: any[]): Promise<void> {
    // Delete existing milestones
    await supabase
      .from('milestones')
      .delete()
      .eq('project_id', projectId);

    // Create new milestones
    if (milestones.length > 0) {
      await this.createMilestones(projectId, milestones);
    }
  }

  private async sendContractApprovalEmail(projectId: string): Promise<void> {
    try {
      await supabase.functions.invoke('send-contract-approval', {
        body: { projectId }
      });
    } catch (error) {
      console.error('Error sending contract approval email:', error);
    }
  }

  // Template operations
  async saveAsTemplate(templateData: ProjectTemplate): Promise<void> {
    if (!this.user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('project_templates')
      .insert({
        user_id: this.user.id,
        name: templateData.name,
        brief: templateData.brief,
        contract_required: templateData.contract_required,
        payment_proof_required: templateData.payment_proof_required,
        contract_terms: templateData.contract_terms,
        payment_terms: templateData.payment_terms,
        project_scope: templateData.project_scope,
        revision_policy: templateData.revision_policy,
        milestones: templateData.milestones,
      });

    if (error) {
      throw new Error(`Failed to save template: ${error.message}`);
    }

    analytics.trackTemplateUsed('', templateData.name);
  }

  async getTemplates(): Promise<ProjectTemplate[]> {
    if (!this.user) return [];

    const { data, error } = await supabase
      .from('project_templates')
      .select('*')
      .eq('user_id', this.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching templates:', error);
      return [];
    }

    return (data || []) as ProjectTemplate[];
  }

  async deleteTemplate(templateId: string): Promise<void> {
    if (!this.user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('project_templates')
      .delete()
      .eq('id', templateId)
      .eq('user_id', this.user.id);

    if (error) {
      throw new Error(`Failed to delete template: ${error.message}`);
    }

    analytics.trackTemplateUsed(templateId, '');
  }
}