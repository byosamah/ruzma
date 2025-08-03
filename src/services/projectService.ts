import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { CreateProjectFormData } from '@/lib/validators/project';
import { DatabaseProject, DatabaseMilestone } from '@/hooks/projectTypes';
import { ProjectTemplate } from '@/types/projectTemplate';
import { generateSlug, ensureUniqueSlug } from '@/lib/slugUtils';
import * as analytics from '@/lib/analytics';
import { securityMonitor } from '@/lib/securityMonitoring';
import { sendPaymentNotification } from '@/services/emailNotifications';
import { trackProjectCreated, trackMilestoneApproved, trackPaymentProofUploaded, trackDeliverableUploaded, trackMilestoneCreated } from '@/lib/analytics';
import { toast } from 'sonner';
import { ServiceRegistry } from './core/ServiceRegistry';
import { UserService } from './core/UserService';
import { EmailService } from './core/EmailService';
import { ClientService } from './core/ClientService';

export interface ProjectOperationData extends CreateProjectFormData {
  id?: string; // For edit operations
  slug?: string; // For edit operations
}

// Sanitize filename to remove invalid characters for Supabase Storage
const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace invalid characters with underscores
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
    .substring(0, 100); // Limit length
};

export class ProjectService {
  private user: User | null;
  private userService: UserService;
  private emailService: EmailService;
  private clientService: ClientService;

  constructor(user: User | null) {
    console.log('ProjectService constructor called with user:', !!user);
    this.user = user;
    const registry = ServiceRegistry.getInstance();
    this.userService = registry.getUserService(user);
    this.emailService = registry.getEmailService(user);
    this.clientService = registry.getClientService(user);
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

    if (data.milestones.length === 0) {
      throw new Error('At least one milestone is required');
    }

    // Rate limiting check
    const rateLimitKey = `project_creation_${this.user!.id}`;
    const isRateLimited = await securityMonitor.checkRateLimit(
      rateLimitKey,
      5, // max 5 attempts
      3600 // per hour
    );

    if (isRateLimited) {
      throw new Error('Too many project creation attempts. Please try again later.');
    }

    // Check user limits using the centralized UserService
    const userLimits = await this.userService.getUserLimits();

    if (!userLimits.canCreateProject) {
      throw new Error('Project limit reached. Please upgrade your plan to create more projects.');
    }

    // Handle client lookup/creation
    let clientId = null;
    if (sanitizedClientEmail) {
      try {
        clientId = await this.handleClientLookup(sanitizedClientEmail);
      } catch (error) {
        console.error('Client lookup failed:', error);
        // Continue without client if lookup fails
      }
    }

    // Calculate project dates
    const { startDate, endDate } = this.calculateProjectDates(data.milestones);

    // Generate unique slug
    const baseSlug = generateSlug(sanitizedName);
    const uniqueSlug = await ensureUniqueSlug(baseSlug, this.user!.id);

    // Create project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: this.user!.id,
        name: sanitizedName,
        brief: sanitizedBrief,
        client_email: sanitizedClientEmail || null,
        client_id: clientId,
        slug: uniqueSlug,
        start_date: startDate,
        end_date: endDate,
        payment_proof_required: data.paymentProofRequired || false,
        contract_required: data.contractRequired || false,
        contract_terms: data.contractTerms || null,
        payment_terms: data.paymentTerms || null,
        project_scope: data.projectScope || null,
        revision_policy: data.revisionPolicy || null,
        freelancer_currency: 'USD'
      })
      .select()
      .single();

    if (projectError) {
      console.error('Error creating project:', projectError);
      throw new Error('Failed to create project');
    }

    // Create milestones
    const milestones = await this.createMilestones(project.id, data.milestones);

    // Update project count using centralized UserService
    await this.userService.updateProjectCount(1);

    // Track project creation
    trackProjectCreated(project.id, data.milestones.length === 0);
    if (data.milestones.length > 0) {
      trackMilestoneCreated(project.id, data.milestones.length);
    }

    // Send contract approval email if required
    if (data.contractRequired && sanitizedClientEmail) {
      try {
        await this.sendContractApprovalEmail(project.id);
      } catch (emailError) {
        console.error('Failed to send contract approval email:', emailError);
        // Don't fail project creation if email fails
      }
    }

    return {
      ...project,
      milestones,
      contract_status: project.contract_status as 'pending' | 'approved' | 'rejected' | undefined
    } as DatabaseProject;
  }

  async updateProject(data: ProjectOperationData): Promise<DatabaseProject | null> {
    if (!data.id) {
      throw new Error('Project ID is required for updates');
    }

    // Validation
    const sanitizedName = data.name.trim();
    const sanitizedBrief = data.brief.trim();
    const sanitizedClientEmail = data.clientEmail?.trim() || '';

    if (!sanitizedName || !sanitizedBrief) {
      throw new Error('Project name and brief are required');
    }

    if (data.milestones.length === 0) {
      throw new Error('At least one milestone is required');
    }

    // Verify ownership
    const { data: existingProject, error: fetchError } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', data.id)
      .single();

    if (fetchError || !existingProject) {
      throw new Error('Project not found');
    }

    if (existingProject.user_id !== this.user!.id) {
      throw new Error('You do not have permission to update this project');
    }

    // Handle client lookup/creation
    let clientId = null;
    if (sanitizedClientEmail) {
      try {
        clientId = await this.handleClientLookup(sanitizedClientEmail);
      } catch (error) {
        console.error('Client lookup failed:', error);
        // Continue without client if lookup fails
      }
    }

    // Calculate project dates
    const { startDate, endDate } = this.calculateProjectDates(data.milestones);

    // Update project
    const { data: project, error: updateError } = await supabase
      .from('projects')
      .update({
        name: sanitizedName,
        brief: sanitizedBrief,
        client_email: sanitizedClientEmail || null,
        client_id: clientId,
        start_date: startDate,
        end_date: endDate,
        payment_proof_required: data.paymentProofRequired || false,
        contract_required: data.contractRequired || false,
        contract_terms: data.contractTerms || null,
        payment_terms: data.paymentTerms || null,
        project_scope: data.projectScope || null,
        revision_policy: data.revisionPolicy || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', data.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating project:', updateError);
      throw new Error('Failed to update project');
    }

    // Update milestones
    await this.updateMilestones(data.id, data.milestones);

    // Fetch updated project with milestones
    const { data: updatedProject, error: fetchUpdatedError } = await supabase
      .from('projects')
      .select(`
        *,
        milestones (*)
      `)
      .eq('id', data.id)
      .single();

    if (fetchUpdatedError) {
      console.error('Error fetching updated project:', fetchUpdatedError);
      throw new Error('Failed to fetch updated project');
    }

    // Track project update (using project created event for consistency)
    trackProjectCreated(data.id, false);

    return {
      ...updatedProject,
      contract_status: updatedProject.contract_status as 'pending' | 'approved' | 'rejected' | undefined
    } as DatabaseProject;
  }

  async deleteProject(projectId: string): Promise<boolean> {
    if (!this.user) {
      throw new Error('User not authenticated');
    }

    try {
      // Verify ownership
      const { data: project, error: fetchError } = await supabase
        .from('projects')
        .select('user_id, name')
        .eq('id', projectId)
        .single();

      if (fetchError || !project) {
        throw new Error('Project not found');
      }

      if (project.user_id !== this.user.id) {
        throw new Error('You do not have permission to delete this project');
      }

      // First delete all milestones associated with this project
      const { error: milestonesDeleteError } = await supabase
        .from('milestones')
        .delete()
        .eq('project_id', projectId);

      if (milestonesDeleteError) {
        console.error('Error deleting milestones:', milestonesDeleteError);
        throw new Error('Failed to delete project milestones');
      }

      // Now delete the project
      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (deleteError) {
        console.error('Error deleting project:', deleteError);
        throw new Error('Failed to delete project');
      }

      // Update project count using centralized UserService
      await this.userService.updateProjectCount(-1);

      // Track project deletion (using project created event for consistency)
      trackProjectCreated(projectId, false);

      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  private async handleClientLookup(email: string): Promise<any> {
    // Check if client already exists
    const { data: existingClient, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('email', email)
      .eq('user_id', this.user!.id)
      .maybeSingle();

    if (clientError) {
      throw clientError;
    }

    if (existingClient) {
      return existingClient.id;
    }

    // Create new client
    const { data: newClient, error: createError } = await supabase
      .from('clients')
      .insert({
        user_id: this.user!.id,
        email: email,
        name: email.split('@')[0] // Use email prefix as default name
      })
      .select('id')
      .single();

    if (createError) {
      throw createError;
    }

    return newClient.id;
  }

  private calculateProjectDates(milestones: any[]): { startDate: string | null; endDate: string | null } {
    const validDates = milestones
      .flatMap(m => [m.start_date, m.end_date])
      .filter(date => date && date.trim() !== '')
      .map(date => new Date(date))
      .filter(date => !isNaN(date.getTime()));

    if (validDates.length === 0) {
      return { startDate: null, endDate: null };
    }

    const startDate = new Date(Math.min(...validDates.map(d => d.getTime())));
    const endDate = new Date(Math.max(...validDates.map(d => d.getTime())));

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  }

  private async createMilestones(projectId: string, milestones: any[]): Promise<DatabaseMilestone[]> {
    const milestonesToCreate = milestones.map(milestone => ({
      project_id: projectId,
      title: milestone.title.trim(),
      description: milestone.description.trim(),
      price: milestone.price || 0,
      start_date: milestone.start_date || null,
      end_date: milestone.end_date || null,
      status: 'pending' as const
    }));

    const { data: createdMilestones, error } = await supabase
      .from('milestones')
      .insert(milestonesToCreate)
      .select();

    if (error) {
      throw error;
    }

    return createdMilestones.map(m => ({
      ...m,
      status: m.status as 'pending' | 'payment_submitted' | 'approved' | 'rejected'
    })) as DatabaseMilestone[];
  }

  private async updateMilestones(projectId: string, milestones: any[]): Promise<void> {
    // Delete existing milestones
    const { error: deleteError } = await supabase
      .from('milestones')
      .delete()
      .eq('project_id', projectId);

    if (deleteError) {
      throw deleteError;
    }

    // Create new milestones
    await this.createMilestones(projectId, milestones);
  }

  private async sendContractApprovalEmail(projectId: string): Promise<void> {
    await this.emailService.sendContractApproval({
      projectId,
      clientEmail: '' // Email service will fetch this internally
    });
  }

  // Template operations
  async saveAsTemplate(templateData: ProjectTemplate): Promise<void> {
    if (!this.user) {
      throw new Error('You must be logged in to save a template');
    }

    const { error } = await supabase
      .from('project_templates')
      .insert({
        user_id: this.user.id,
        name: templateData.name,
        brief: templateData.brief,
        contract_required: templateData.contract_required || false,
        payment_proof_required: templateData.payment_proof_required || false,
        contract_terms: templateData.contract_terms,
        payment_terms: templateData.payment_terms,
        project_scope: templateData.project_scope,
        revision_policy: templateData.revision_policy,
        milestones: templateData.milestones,
      });

    if (error) {
      throw error;
    }
  }

  async getTemplates(): Promise<ProjectTemplate[]> {
    if (!this.user) {
      throw new Error('You must be logged in to fetch templates');
    }

    const { data, error } = await supabase
      .from('project_templates')
      .select('*')
      .eq('user_id', this.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Parse milestones jsonb field
    return (data || []).map((t: any) => ({
      ...t,
      milestones: Array.isArray(t.milestones) ? t.milestones : [],
    }));
  }

  async deleteTemplate(templateId: string): Promise<void> {
    if (!this.user) {
      throw new Error('You must be logged in to delete a template');
    }

    const { error } = await supabase
      .from('project_templates')
      .delete()
      .eq('id', templateId)
      .eq('user_id', this.user.id);

    if (error) {
      throw error;
    }
  }

  // ==================== MILESTONE OPERATIONS ====================
  
  // Status Management
  async updateMilestoneStatus(
    projects: DatabaseProject[],
    milestoneId: string,
    status: 'approved' | 'rejected'
  ): Promise<boolean> {
    if (!this.user) {
      toast.error('You must be logged in to update milestone status');
      return false;
    }

    try {
      // First, get the milestone and project details
      const { data: milestone, error: milestoneError } = await supabase
        .from('milestones')
        .select(`
          *,
          projects!inner (
            id,
            name,
            client_email,
            client_access_token,
            user_id
          )
        `)
        .eq('id', milestoneId)
        .single();

      if (milestoneError || !milestone) {
        console.error('Error fetching milestone:', milestoneError);
        toast.error('Failed to fetch milestone details');
        return false;
      }

      // Verify user owns this project
      if (milestone.projects.user_id !== this.user.id) {
        toast.error('You do not have permission to update this milestone');
        return false;
      }

      // Update the milestone status
      const { error: updateError } = await supabase
        .from('milestones')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', milestoneId);

      if (updateError) {
        console.error('Error updating milestone status:', updateError);
        toast.error('Failed to update milestone status');
        return false;
      }

      // Track milestone approval
      if (status === 'approved') {
        trackMilestoneApproved(milestoneId, milestone.projects.id, milestone.price);
      }

      // Send email notification if client email exists
      if (milestone.projects.client_email) {
        try {
          await sendPaymentNotification({
            clientEmail: milestone.projects.client_email,
            projectName: milestone.projects.name,
            projectId: milestone.projects.id,
            clientToken: milestone.projects.client_access_token,
            isApproved: status === 'approved',
            milestoneName: milestone.title,
          });
          
          console.log('Email notification sent successfully');
        } catch (emailError) {
          console.error('Failed to send email notification:', emailError);
          // Don't fail the status update if email fails
          toast.error('Status updated but failed to send email notification');
        }
      }

      const statusText = status === 'approved' ? 'approved' : 'rejected';
      toast.success(`Payment proof ${statusText} successfully`);
      return true;
    } catch (error) {
      console.error('Error updating milestone status:', error);
      toast.error('Failed to update milestone status');
      return false;
    }
  }

  async updateMilestoneStatusGeneral(
    milestoneId: string,
    status: 'pending' | 'payment_submitted' | 'approved' | 'rejected'
  ): Promise<boolean> {
    if (!this.user) {
      toast.error('You must be logged in to update milestone status');
      return false;
    }

    try {
      console.log('Updating milestone status:', milestoneId, 'to', status);

      // First verify the user owns this milestone
      const { data: milestone, error: fetchError } = await supabase
        .from('milestones')
        .select(`
          *,
          projects!inner (
            user_id
          )
        `)
        .eq('id', milestoneId)
        .single();

      if (fetchError || !milestone) {
        console.error('Error fetching milestone:', fetchError);
        toast.error('Failed to fetch milestone details');
        return false;
      }

      // Verify user owns this project
      if (milestone.projects.user_id !== this.user.id) {
        toast.error('You do not have permission to update this milestone');
        return false;
      }

      // Update the milestone status
      const { error: updateError } = await supabase
        .from('milestones')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', milestoneId);

      if (updateError) {
        console.error('Error updating milestone status:', updateError);
        toast.error('Failed to update milestone status');
        return false;
      }

      console.log('Milestone status updated successfully');
      toast.success('Status updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating milestone status:', error);
      toast.error('Failed to update milestone status');
      return false;
    }
  }

  // File Operations
  async uploadPaymentProof(milestoneId: string, file: File): Promise<boolean> {
    try {
      console.log('Starting payment proof upload (via edge function):', {
        milestoneId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      if (!this.user) {
        toast.error('You must be logged in to upload payment proof');
        return false;
      }

      // Check storage limits before uploading
      const { data: limitCheck, error: limitError } = await supabase
        .rpc('check_user_limits', {
          _user_id: this.user.id,
          _action: 'storage',
          _size: file.size
        });

      if (limitError) {
        console.error('Error checking storage limits:', limitError);
        toast.error('Failed to check storage limits');
        return false;
      }

      if (!limitCheck) {
        toast.error('Storage limit reached. Please upgrade your plan or delete some files to free up space.');
        return false;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${milestoneId}-${Date.now()}.${fileExt}`;
      const filePath = `${milestoneId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        toast.error(`Failed to upload file: ${uploadError.message}`);
        return false;
      }

      const { data: urlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        console.error('Failed to get public URL');
        toast.error('Failed to get file URL');
        return false;
      }

      const publicUrl = urlData.publicUrl;
      console.log('Generated public URL:', publicUrl);

      const { data: edgeData, error: edgeError } = await supabase.functions.invoke('submit-payment-proof', {
        body: {
          milestoneId,
          paymentProofUrl: publicUrl,
        },
      });

      if (edgeError || (edgeData && edgeData.error)) {
        console.error("Edge Function error:", edgeError, edgeData?.error || "");
        await supabase.storage.from('payment-proofs').remove([filePath]);
        toast.error(edgeData?.error || edgeError?.message || 'Payment proof submission failed.');
        return false;
      }

      // Get project ID for tracking
      const { data: milestone } = await supabase
        .from('milestones')
        .select('project_id')
        .eq('id', milestoneId)
        .single();

      if (milestone) {
        trackPaymentProofUploaded(milestoneId, milestone.project_id);
      }

      // Storage tracking removed - files can be uploaded without tracking usage

      toast.success('Payment proof submitted successfully!');
      return true;

    } catch (error) {
      console.error('Unexpected error during payment proof upload:', error);
      toast.error('Failed to upload payment proof');
      return false;
    }
  }

  async uploadDeliverable(milestoneId: string, file: File): Promise<boolean> {
    if (!this.user) {
      toast.error('You must be logged in to upload deliverables');
      return false;
    }

    try {
      console.log('Starting deliverable upload for milestone:', milestoneId);

      // Check storage limits before uploading
      const { data: limitCheck, error: limitError } = await supabase
        .rpc('check_user_limits', {
          _user_id: this.user.id,
          _action: 'storage',
          _size: file.size
        });

      if (limitError) {
        console.error('Error checking storage limits:', limitError);
        toast.error('Failed to check storage limits');
        return false;
      }

      if (!limitCheck) {
        toast.error('Storage limit reached. Please upgrade your plan or delete some files to free up space.');
        return false;
      }

      // Sanitize the filename to avoid invalid key errors
      const sanitizedFileName = sanitizeFilename(file.name);
      const fileName = `${Date.now()}-${sanitizedFileName}`;
      const filePath = `${this.user.id}/${milestoneId}/${fileName}`;

      console.log('Sanitized file path:', filePath);

      const { error: uploadError } = await supabase.storage
        .from('deliverables')
        .upload(filePath, file, {
          upsert: false,
          contentType: file.type
        });

      if (uploadError) {
        console.error('Error uploading file to storage:', uploadError);
        toast.error('Failed to upload file');
        return false;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('deliverables')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('milestones')
        .update({
          deliverable_url: publicUrl,
          deliverable_name: file.name, // Keep original filename for display
          deliverable_size: file.size,
          updated_at: new Date().toISOString()
        })
        .eq('id', milestoneId);

      if (updateError) {
        console.error('Error updating milestone with deliverable:', updateError);
        await supabase.storage.from('deliverables').remove([filePath]);
        toast.error('Failed to save deliverable information');
        return false;
      }

      // Get project ID for tracking
      const { data: milestone } = await supabase
        .from('milestones')
        .select('project_id')
        .eq('id', milestoneId)
        .single();

      if (milestone) {
        trackDeliverableUploaded(milestoneId, milestone.project_id, file.size);
      }

      // Storage tracking removed - files can be uploaded without tracking usage
      
      toast.success('Deliverable uploaded successfully!');
      return true;
    } catch (error) {
      console.error('Error uploading deliverable:', error);
      toast.error('Failed to upload deliverable');
      return false;
    }
  }

  async downloadDeliverable(
    projects: DatabaseProject[],
    milestoneId: string,
    paymentProofRequired: boolean = true
  ): Promise<boolean> {
    try {
      const milestone = projects
        .flatMap(p => p.milestones)
        .find(m => m.id === milestoneId);

      if (!milestone || !milestone.deliverable_name || !milestone.deliverable_url) {
        toast.error('Deliverable not found');
        return false;
      }

      // Only check payment approval if payment proof is required
      if (paymentProofRequired && milestone.status !== 'approved') {
        toast.error('Payment must be approved before downloading');
        return false;
      }
      
      let filePath = '';
      try {
        if (milestone.deliverable_url.includes('/object/public/deliverables/')) {
          filePath = milestone.deliverable_url.split('/object/public/deliverables/')[1];
        } else if (milestone.deliverable_url.includes('/storage/v1/object/public/deliverables/')) {
          const urlParts = milestone.deliverable_url.split('/storage/v1/object/public/deliverables/');
          if (urlParts.length > 1) {
            filePath = decodeURIComponent(urlParts[1]);
          }
        } else {
          filePath = milestone.deliverable_url;
        }
      } catch (e) {
        console.error('Error extracting file path:', e);
        toast.error('Could not locate file path for download');
        return false;
      }

      if (!filePath) {
        toast.error('Invalid file path');
        return false;
      }

      const { data, error } = await supabase
        .storage
        .from('deliverables')
        .createSignedUrl(filePath, 60);

      if (error) {
        console.error('Error generating signed URL:', error);
        toast.error(`Download failed: ${error.message}`);
        return false;
      }

      if (!data?.signedUrl) {
        toast.error('Could not generate download link');
        return false;
      }

      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = milestone.deliverable_name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Downloaded ${milestone.deliverable_name}`);
      return true;
    } catch (error) {
      console.error('Error downloading deliverable:', error);
      toast.error('Failed to download deliverable');
      return false;
    }
  }

  // Link Management
  async updateDeliverableLink(milestoneId: string, link: string): Promise<boolean> {
    if (!this.user) {
      toast.error('You must be logged in to update deliverable links');
      return false;
    }

    try {
      console.log('Updating deliverable link for milestone:', milestoneId);

      const { error: updateError } = await supabase
        .from('milestones')
        .update({
          deliverable_link: link || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', milestoneId);

      if (updateError) {
        console.error('Error updating milestone with deliverable link:', updateError);
        toast.error('Failed to update deliverable link');
        return false;
      }

      console.log('Deliverable link updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating deliverable link:', error);
      toast.error('Failed to update deliverable link');
      return false;
    }
  }

  // Revision Management
  async updateRevisionData(milestoneId: string, newDeliverableLink: string): Promise<boolean> {
    if (!this.user) {
      toast.error('You must be logged in to update revision data');
      return false;
    }

    try {
      console.log('Updating revision data for milestone:', milestoneId);

      const { error: updateError } = await supabase
        .from('milestones')
        .update({
          deliverable_link: newDeliverableLink,
          updated_at: new Date().toISOString()
        })
        .eq('id', milestoneId);

      if (updateError) {
        console.error('Error updating milestone with revision data:', updateError);
        toast.error('Failed to update revision data');
        return false;
      }

      console.log('Revision data updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating revision data:', error);
      toast.error('Failed to update revision data');
      return false;
    }
  }

  async addRevisionRequest(milestoneId: string, newDeliverableLink: string): Promise<boolean> {
    if (!this.user) {
      toast.error('You must be logged in to add revision requests');
      return false;
    }

    try {
      console.log('Adding revision request for milestone:', milestoneId);

      const { error: updateError } = await supabase
        .from('milestones')
        .update({
          deliverable_link: newDeliverableLink,
          updated_at: new Date().toISOString()
        })
        .eq('id', milestoneId);

      if (updateError) {
        console.error('Error updating milestone with revision request:', updateError);
        toast.error('Failed to add revision request');
        return false;
      }

      console.log('Revision request added successfully');
      return true;
    } catch (error) {
      console.error('Error adding revision request:', error);
      toast.error('Failed to add revision request');
      return false;
    }
  }

  // ==================== CLIENT PROJECT OPERATIONS ====================
  
  async getClientProject(token: string, isHybrid?: boolean): Promise<DatabaseProject> {
    try {
      const { data, error } = await supabase.functions.invoke('get-client-project', {
        body: { token, isHybrid }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to fetch project');
      }

      if (!data?.project) {
        throw new Error('Project not found');
      }

      return data.project;
    } catch (error: any) {
      console.error('Error fetching client project:', error);
      throw error;
    }
  }

  async uploadClientPaymentProof(projectId: string, token: string, milestoneId: string, file: File): Promise<boolean> {
    try {
      const formData = new FormData();
      formData.append('milestoneId', milestoneId);
      formData.append('file', file);
      formData.append('token', token);

      const { data, error } = await supabase.functions.invoke('upload-client-payment-proof', {
        body: formData
      });

      if (error) {
        console.error('Error uploading payment proof:', error);
        throw new Error('Failed to upload payment proof');
      }

      return true;
    } catch (error: any) {
      console.error('Error uploading client payment proof:', error);
      throw error;
    }
  }

  async submitRevisionRequest(token: string, milestoneId: string, feedback: string, images: string[]): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('submit-revision-request', {
        body: {
          token,
          milestoneId,
          feedback,
          images
        }
      });

      if (error) {
        console.error('Error submitting revision request:', error);
        throw new Error('Failed to submit revision request');
      }

      return data;
    } catch (error: any) {
      console.error('Error submitting revision request:', error);
      throw error;
    }
  }
}
