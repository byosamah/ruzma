import { BaseAPI } from './base';
import { supabase } from '@/integrations/supabase/client';

interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description: string;
  price: number;
  status: 'pending' | 'payment_submitted' | 'approved' | 'rejected';
  deliverable_name?: string;
  deliverable_url?: string;
  deliverable_size?: number;
  deliverable_link?: string;
  payment_proof_url?: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export class MilestoneAPI extends BaseAPI<Milestone> {
  constructor() {
    super('milestones', '*');
  }

  /**
   * Find milestones by project
   */
  async findByProject(projectId: string) {
    return this.findAll({ project_id: projectId });
  }

  /**
   * Update milestone status
   */
  async updateStatus(id: string, status: Milestone['status']) {
    const update: any = { status };
    
    // Add timestamp based on status
    switch (status) {
      case 'payment_submitted':
        update.payment_submitted_at = new Date().toISOString();
        break;
      case 'approved':
        update.approved_at = new Date().toISOString();
        break;
      case 'rejected':
        update.rejected_at = new Date().toISOString();
        break;
    }
    
    return this.update(id, update);
  }

  /**
   * Upload deliverable
   */
  async uploadDeliverable(id: string, deliverable: {
    name: string;
    url: string;
    size: number;
    link?: string;
  }) {
    return this.update(id, {
      deliverable_name: deliverable.name,
      deliverable_url: deliverable.url,
      deliverable_size: deliverable.size,
      deliverable_link: deliverable.link
    });
  }

  /**
   * Upload payment proof
   */
  async uploadPaymentProof(id: string, proofUrl: string) {
    return this.update(id, {
      payment_proof_url: proofUrl,
      status: 'payment_submitted' as const
    });
  }

  /**
   * Get upcoming deadlines
   */
  async getUpcomingDeadlines(userId: string, daysAhead: number = 7) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    
    return this.executeRaw<Milestone[]>(
      (supabase) => supabase
        .from(this.tableName)
        .select(`
          *,
          projects!inner(
            id,
            name,
            user_id
          )
        `)
        .eq('projects.user_id', userId)
        .eq('status', 'pending')
        .gte('end_date', new Date().toISOString())
        .lte('end_date', futureDate.toISOString())
        .order('end_date', { ascending: true })
    );
  }

  /**
   * Get overdue milestones
   */
  async getOverdue(userId: string) {
    return this.executeRaw<Milestone[]>(
      (supabase) => supabase
        .from(this.tableName)
        .select(`
          *,
          projects!inner(
            id,
            name,
            user_id
          )
        `)
        .eq('projects.user_id', userId)
        .eq('status', 'pending')
        .lt('end_date', new Date().toISOString())
        .order('end_date', { ascending: true })
    );
  }

  /**
   * Calculate project progress
   */
  async calculateProjectProgress(projectId: string): Promise<number> {
    const milestones = await this.findByProject(projectId);
    
    if (milestones.error || !milestones.data || milestones.data.length === 0) {
      return 0;
    }

    const completed = milestones.data.filter(m => m.status === 'approved').length;
    return Math.round((completed / milestones.data.length) * 100);
  }

  /**
   * Bulk update milestones
   */
  async bulkUpdate(projectId: string, updates: Array<{ id: string; data: Partial<Milestone> }>) {
    const promises = updates.map(({ id, data }) => 
      this.update(id, data)
    );
    
    const results = await Promise.all(promises);
    const errors = results.filter(r => r.error);
    
    if (errors.length > 0) {
      return { 
        error: `Failed to update ${errors.length} milestone(s)`, 
        data: undefined 
      };
    }
    
    return this.findByProject(projectId);
  }
}