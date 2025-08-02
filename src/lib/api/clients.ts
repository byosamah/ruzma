import { BaseAPI } from './base';
import { supabase } from '@/integrations/supabase/client';

interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  projects?: any[];
}

export class ClientAPI extends BaseAPI<Client> {
  constructor() {
    super('clients', '*, projects(*)');
  }

  /**
   * Find client by email
   */
  async findByEmail(userId: string, email: string) {
    return this.executeRaw<Client>(
      (supabase) => supabase
        .from(this.tableName)
        .select(this.selectQuery)
        .eq('user_id', userId)
        .eq('email', email)
        .single()
    );
  }

  /**
   * Create or update client
   */
  async upsert(data: { user_id: string; name: string; email: string }) {
    // Check if client exists
    const existing = await this.findByEmail(data.user_id, data.email);
    
    if (existing.data) {
      // Update existing client
      return this.update(existing.data.id, { name: data.name });
    }
    
    // Create new client
    return this.create(data);
  }

  /**
   * Get clients with project count
   */
  async getWithProjectCount(userId: string) {
    const result = await this.findAll({ user_id: userId });
    
    if (result.error || !result.data) {
      return result;
    }

    const clientsWithCount = result.data.map(client => ({
      ...client,
      projectCount: client.projects?.length || 0,
      totalRevenue: client.projects?.reduce((sum, project) => {
        const projectTotal = project.milestones?.reduce(
          (mSum: number, milestone: any) => mSum + (milestone.price || 0),
          0
        ) || 0;
        return sum + projectTotal;
      }, 0) || 0
    }));

    return { data: clientsWithCount, error: undefined };
  }

  /**
   * Merge duplicate clients
   */
  async merge(primaryClientId: string, duplicateClientId: string) {
    // Get both clients
    const [primary, duplicate] = await Promise.all([
      this.findById(primaryClientId),
      this.findById(duplicateClientId)
    ]);

    if (primary.error || duplicate.error || !primary.data || !duplicate.data) {
      return { error: 'Failed to find clients', data: undefined };
    }

    // Update all projects to point to primary client
    const updateResult = await supabase
      .from('projects')
      .update({ client_id: primaryClientId })
      .eq('client_id', duplicateClientId);

    if (updateResult.error) {
      return { error: 'Failed to update projects', data: undefined };
    }

    // Delete duplicate client
    return this.delete(duplicateClientId);
  }
}