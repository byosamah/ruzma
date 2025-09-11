import { User } from '@supabase/supabase-js';
import { BaseService } from './BaseService';
import { EnhancedEmailService } from './EnhancedEmailService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DatabaseProject } from '@/types/shared';

export interface ContractUpdateData {
  contractTerms?: string;
  paymentTerms?: string;
  projectScope?: string;
  revisionPolicy?: string;
}

export class ContractService extends BaseService {
  private emailService: EnhancedEmailService;

  constructor(user: User | null) {
    super(user);
    this.emailService = new EnhancedEmailService(user, {
      useReactEmailTemplates: false, // ❌ DISABLED: Using legacy Edge Functions
      fallbackToEdgeFunctions: true,
      defaultLanguage: 'en'
    });
  }

  /**
   * Send initial contract approval email when project is created
   */
  async sendContractApprovalEmail(projectId: string): Promise<void> {
    if (!this.user) {
      throw new Error('User not authenticated');
    }

    // Fetch project to verify it exists and has client email
    const { data: project, error } = await supabase
      .from('projects')
      .select('client_email, contract_required, contract_status')
      .eq('id', projectId)
      .eq('user_id', this.user.id)
      .single();

    if (error || !project) {
      throw new Error('Project not found');
    }

    if (!project.client_email) {
      throw new Error('Project does not have a client email');
    }

    if (!project.contract_required) {
      throw new Error('Contract approval not required for this project');
    }

    // Update contract_sent_at before sending email
    const { error: updateError } = await supabase
      .from('projects')
      .update({ 
        contract_sent_at: new Date().toISOString(),
        contract_status: 'pending' 
      })
      .eq('id', projectId);

    if (updateError) {
      throw new Error('Failed to update contract timestamp');
    }

    // Send email using EnhancedEmailService with React Email templates
    try {
      await this.emailService.sendContractApproval({
        projectId,
        clientEmail: project.client_email,
        language: 'en' // TODO: Get from user profile or project settings
      });
    } catch (emailError) {
      throw new Error(emailError instanceof Error ? emailError.message : 'Failed to send contract approval email');
    }
  }

  /**
   * Resend contract approval email for existing project
   */
  async resendContractApprovalEmail(projectId: string): Promise<void> {
    if (!this.user) {
      throw new Error('User not authenticated');
    }

    try {
      // Verify project ownership and status
      const { data: project, error } = await supabase
        .from('projects')
        .select('contract_required, contract_status, client_email')
        .eq('id', projectId)
        .eq('user_id', this.user.id)
        .single();

      if (error || !project) {
        throw new Error('Project not found');
      }

      if (!project.contract_required) {
        throw new Error('Contract approval not required for this project');
      }

      if (!project.client_email) {
        throw new Error('Project does not have a client email');
      }

      if (project.contract_status === 'approved') {
        throw new Error('Contract has already been approved');
      }

      // Use the same email sending function as initial send
      await this.sendContractApprovalEmail(projectId);
      
      toast.success('Contract approval email resent successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to resend contract email');
      throw error;
    }
  }

  /**
   * Update contract details and optionally resend for approval
   */
  async updateContractAndResend(projectId: string, contractData: ContractUpdateData): Promise<void> {
    if (!this.user) {
      throw new Error('User not authenticated');
    }

    try {
      // Verify project ownership
      const { data: project, error: fetchError } = await supabase
        .from('projects')
        .select('user_id, contract_required, client_email')
        .eq('id', projectId)
        .single();

      if (fetchError || !project) {
        throw new Error('Project not found');
      }

      if (project.user_id !== this.user.id) {
        throw new Error('You do not have permission to update this project');
      }

      // Update contract details
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          contract_terms: contractData.contractTerms,
          payment_terms: contractData.paymentTerms,
          project_scope: contractData.projectScope,
          revision_policy: contractData.revisionPolicy,
          contract_status: 'pending', // Reset to pending after update
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (updateError) {
        throw new Error('Failed to update contract details');
      }

      // Resend contract approval email if required and client email exists
      if (project.contract_required && project.client_email) {
        await this.resendContractApprovalEmail(projectId);
      }

      toast.success('Contract updated and email sent successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update contract');
      throw error;
    }
  }

  /**
   * Check if a project needs contract approval from client perspective
   */
  async checkContractApprovalStatus(token: string): Promise<{
    needsApproval: boolean;
    contractStatus?: 'pending' | 'approved' | 'rejected';
    project?: DatabaseProject;
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('get-client-project', {
        body: { token }
      });

      if (error) {
        throw new Error(error.message || 'Failed to fetch project');
      }

      if (!data?.project) {
        throw new Error('Project not found');
      }

      const project = data.project;
      const needsApproval = project.contract_required && 
                          project.contract_status === 'pending' &&
                          project.contract_sent_at;

      return {
        needsApproval,
        contractStatus: project.contract_status,
        project
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get contract status for freelancer dashboard
   */
  async getContractStatus(projectId: string): Promise<{
    status: 'pending' | 'approved' | 'rejected' | null;
    sentAt?: string;
    approvedAt?: string;
    rejectionReason?: string;
  }> {
    if (!this.user) {
      throw new Error('User not authenticated');
    }

    try {
      const { data: project, error } = await supabase
        .from('projects')
        .select('contract_status, contract_sent_at, contract_approved_at, contract_rejection_reason')
        .eq('id', projectId)
        .eq('user_id', this.user.id)
        .single();

      if (error || !project) {
        throw new Error('Project not found');
      }

      return {
        status: project.contract_status as 'pending' | 'approved' | 'rejected' | null,
        sentAt: project.contract_sent_at,
        approvedAt: project.contract_approved_at,
        rejectionReason: project.contract_rejection_reason
      };
    } catch (error) {
      throw error;
    }
  }
}