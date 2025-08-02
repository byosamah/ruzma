import { BaseAPI } from './base';
import { supabase } from '@/integrations/supabase/client';
import { handleApiResponse } from '@/lib/utils/api';
import { generateUUID, generateSecureToken } from '@/lib/utils/security';
import { slugify } from '@/lib/utils/formatting';

interface Project {
  id: string;
  user_id: string;
  name: string;
  brief: string;
  client_access_token: string;
  client_email?: string;
  client_id?: string;
  slug: string;
  start_date?: string;
  end_date?: string;
  payment_proof_required: boolean;
  contract_required: boolean;
  contract_status?: string;
  contract_sent_at?: string;
  contract_approved_at?: string;
  contract_rejection_reason?: string;
  contract_approval_token?: string;
  contract_terms?: string;
  payment_terms?: string;
  project_scope?: string;
  revision_policy?: string;
  freelancer_currency?: string;
  created_at: string;
  updated_at: string;
  milestones?: any[];
  clients?: any;
}

export class ProjectAPI extends BaseAPI<Project> {
  constructor() {
    super('projects', '*, milestones(*), clients(*)');
  }

  /**
   * Find project by slug
   */
  async findBySlug(userId: string, slug: string) {
    return this.executeRaw<Project>(
      (supabase) => supabase
        .from(this.tableName)
        .select(this.selectQuery)
        .eq('user_id', userId)
        .eq('slug', slug)
        .single()
    );
  }

  /**
   * Find project by client access token
   */
  async findByClientToken(token: string) {
    return this.executeRaw<Project>(
      (supabase) => supabase
        .from(this.tableName)
        .select(`
          *,
          milestones(*),
          freelancer_branding!user_id(*)
        `)
        .eq('client_access_token', token)
        .single()
    );
  }

  /**
   * Create project with milestones
   */
  async createWithMilestones(projectData: {
    name: string;
    brief: string;
    client_email?: string;
    client_id?: string;
    start_date?: string;
    end_date?: string;
    payment_proof_required?: boolean;
    contract_required?: boolean;
    contract_terms?: string;
    payment_terms?: string;
    project_scope?: string;
    revision_policy?: string;
    freelancer_currency?: string;
    milestones: Array<{
      title: string;
      description: string;
      price: number;
      start_date?: string;
      end_date?: string;
    }>;
  }) {
    const { milestones, ...project } = projectData;
    
    // Generate unique slug
    const baseSlug = slugify(project.name);
    let slug = baseSlug;
    let counter = 1;
    
    // Check for existing slugs
    while (await this.exists({ user_id: project.user_id, slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create project
    const projectResult = await this.create({
      ...project,
      slug,
      client_access_token: generateUUID(),
      contract_approval_token: project.contract_required ? generateUUID() : null
    });

    if (projectResult.error || !projectResult.data) {
      return projectResult;
    }

    // Create milestones
    if (milestones.length > 0) {
      const milestonesData = milestones.map(milestone => ({
        ...milestone,
        project_id: projectResult.data.id
      }));

      const milestonesResult = await supabase
        .from('milestones')
        .insert(milestonesData)
        .select();

      if (milestonesResult.error) {
        // Rollback project creation
        await this.delete(projectResult.data.id);
        return { error: 'Failed to create milestones', data: undefined };
      }

      projectResult.data.milestones = milestonesResult.data;
    }

    return projectResult;
  }

  /**
   * Update project status
   */
  async updateStatus(id: string, status: 'active' | 'completed' | 'on_hold' | 'cancelled') {
    return this.update(id, { status } as any);
  }

  /**
   * Approve contract
   */
  async approveContract(token: string) {
    return this.executeRaw<Project>(
      (supabase) => supabase
        .from(this.tableName)
        .update({
          contract_status: 'approved',
          contract_approved_at: new Date().toISOString()
        })
        .eq('contract_approval_token', token)
        .select()
        .single()
    );
  }

  /**
   * Reject contract
   */
  async rejectContract(token: string, reason: string) {
    return this.executeRaw<Project>(
      (supabase) => supabase
        .from(this.tableName)
        .update({
          contract_status: 'rejected',
          contract_rejection_reason: reason
        })
        .eq('contract_approval_token', token)
        .select()
        .single()
    );
  }

  /**
   * Get user projects with stats
   */
  async getUserProjectsWithStats(userId: string) {
    const result = await this.findAll({ user_id: userId });
    
    if (result.error || !result.data) {
      return result;
    }

    // Calculate stats for each project
    const projectsWithStats = result.data.map(project => {
      const totalAmount = project.milestones?.reduce(
        (sum, milestone) => sum + (milestone.price || 0), 
        0
      ) || 0;

      const completedMilestones = project.milestones?.filter(
        m => m.status === 'approved'
      ).length || 0;

      const totalMilestones = project.milestones?.length || 0;
      
      const progress = totalMilestones > 0 
        ? Math.round((completedMilestones / totalMilestones) * 100)
        : 0;

      return {
        ...project,
        totalAmount,
        progress,
        completedMilestones,
        totalMilestones
      };
    });

    return { data: projectsWithStats, error: undefined };
  }

  /**
   * Duplicate project as template
   */
  async duplicateAsTemplate(projectId: string, newName: string) {
    const original = await this.findById(projectId);
    
    if (original.error || !original.data) {
      return original;
    }

    const { id, slug, client_access_token, contract_approval_token, created_at, updated_at, milestones, ...projectData } = original.data;

    return this.createWithMilestones({
      ...projectData,
      name: newName,
      milestones: milestones?.map(({ id, project_id, created_at, updated_at, ...m }) => m) || []
    });
  }
}