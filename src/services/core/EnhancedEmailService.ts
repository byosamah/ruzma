import { User } from '@supabase/supabase-js';
import { BaseService } from './BaseService';
import { UserService } from './UserService';
import { EmailRenderService } from './EmailRenderService';
import { 
  ContractApprovalEmailParams, 
  PaymentNotificationParams, 
  ClientLinkParams 
} from './EmailService';

export interface EmailServiceConfig {
  useReactEmailTemplates?: boolean;
  fallbackToEdgeFunctions?: boolean;
  defaultLanguage?: 'en' | 'ar';
}

export class EnhancedEmailService extends BaseService {
  private userService: UserService;
  private emailRenderService: EmailRenderService;
  private config: EmailServiceConfig;

  constructor(user: User | null, config: EmailServiceConfig = {}) {
    super(user);
    this.userService = new UserService(user);
    this.emailRenderService = new EmailRenderService(user);
    this.config = {
      useReactEmailTemplates: true,
      fallbackToEdgeFunctions: true,
      defaultLanguage: 'en',
      ...config
    };
  }

  /**
   * Send contract approval email using React Email templates
   */
  async sendContractApproval(params: ContractApprovalEmailParams & {
    language?: 'en' | 'ar';
    brandingColor?: string;
  }): Promise<void> {
    try {
      if (this.config.useReactEmailTemplates) {
        await this.sendContractApprovalWithTemplate(params);
      } else {
        await this.sendContractApprovalWithEdgeFunction(params);
      }
    } catch (error) {
      if (this.config.fallbackToEdgeFunctions && this.config.useReactEmailTemplates) {
        console.warn('React Email template failed, falling back to Edge Function:', error);
        await this.sendContractApprovalWithEdgeFunction(params);
      } else {
        throw error;
      }
    }
  }

  /**
   * Send contract approval using React Email template
   */
  private async sendContractApprovalWithTemplate(params: ContractApprovalEmailParams & {
    language?: 'en' | 'ar';
    brandingColor?: string;
  }): Promise<void> {
    try {
      // Fetch project data with all required information
      const projectData = await this.fetchProjectDataForEmail(params.projectId);
      
      if (!projectData) {
        throw new Error('Project not found');
      }

      // Render the email template
      const renderedEmail = await this.emailRenderService.renderContractApprovalEmail({
        projectName: projectData.name,
        projectBrief: projectData.brief,
        clientName: projectData.client?.name || 'Client',
        clientEmail: params.clientEmail,
        freelancerName: projectData.freelancer.full_name,
        freelancerCompany: projectData.freelancer.company,
        contractUrl: projectData.contractUrl,
        approvalToken: projectData.contract_approval_token,
        totalAmount: projectData.total_amount || 0,
        currency: projectData.currency || 'USD',
        milestones: projectData.milestones || [],
        language: params.language || this.config.defaultLanguage,
        brandingColor: params.brandingColor
      });

      // Send via Edge Function with rendered HTML
      await this.sendRenderedEmail(renderedEmail, 'contract-approval');

      this.logOperation('contract_approval_email_sent_react', { 
        projectId: params.projectId,
        language: params.language || this.config.defaultLanguage
      });

    } catch (error) {
      return this.handleError(error, 'sendContractApprovalWithTemplate');
    }
  }

  /**
   * Send contract approval using Edge Function (legacy)
   */
  private async sendContractApprovalWithEdgeFunction(params: ContractApprovalEmailParams): Promise<void> {
    try {
      const { error } = await this.supabase.functions.invoke('send-contract-approval', {
        body: { projectId: params.projectId }
      });

      if (error) {
        throw new Error(error.message);
      }

      this.logOperation('contract_approval_email_sent_edge', { projectId: params.projectId });
    } catch (error) {
      return this.handleError(error, 'sendContractApprovalWithEdgeFunction');
    }
  }

  /**
   * Send payment notification email using React Email templates
   */
  async sendPaymentNotification(params: PaymentNotificationParams & {
    language?: 'en' | 'ar';
    brandingColor?: string;
  }): Promise<void> {
    try {
      if (this.config.useReactEmailTemplates) {
        await this.sendPaymentNotificationWithTemplate(params);
      } else {
        await this.sendPaymentNotificationWithEdgeFunction(params);
      }
    } catch (error) {
      if (this.config.fallbackToEdgeFunctions && this.config.useReactEmailTemplates) {
        console.warn('React Email template failed, falling back to Edge Function:', error);
        await this.sendPaymentNotificationWithEdgeFunction(params);
      } else {
        throw error;
      }
    }
  }

  /**
   * Send payment notification using React Email template
   */
  private async sendPaymentNotificationWithTemplate(params: PaymentNotificationParams & {
    language?: 'en' | 'ar';
    brandingColor?: string;
  }): Promise<void> {
    try {
      // Fetch additional project data if needed
      const projectData = await this.fetchProjectDataForEmail(params.projectId);
      
      if (!projectData) {
        throw new Error('Project not found');
      }

      // Render the email template
      const renderedEmail = await this.emailRenderService.renderPaymentNotificationEmail({
        projectName: params.projectName,
        clientName: projectData.client?.name || 'Client',
        clientEmail: params.clientEmail,
        freelancerName: projectData.freelancer.full_name,
        freelancerCompany: projectData.freelancer.company,
        milestoneName: params.milestoneName,
        amount: projectData.milestones?.find(m => m.title === params.milestoneName)?.price || 0,
        currency: projectData.currency || 'USD',
        isApproved: params.isApproved,
        projectUrl: `${process.env.VITE_APP_URL}/client/${params.clientToken}`,
        language: params.language || this.config.defaultLanguage,
        brandingColor: params.brandingColor
      });

      // Send via Edge Function with rendered HTML
      await this.sendRenderedEmail(renderedEmail, 'payment-notification');

      this.logOperation('payment_notification_sent_react', { 
        projectId: params.projectId,
        isApproved: params.isApproved,
        language: params.language || this.config.defaultLanguage
      });

    } catch (error) {
      return this.handleError(error, 'sendPaymentNotificationWithTemplate');
    }
  }

  /**
   * Send payment notification using Edge Function (legacy)
   */
  private async sendPaymentNotificationWithEdgeFunction(params: PaymentNotificationParams): Promise<void> {
    try {
      const { error } = await this.supabase.functions.invoke('send-payment-notification', {
        body: params
      });

      if (error) {
        throw new Error(error.message);
      }

      this.logOperation('payment_notification_sent_edge', { projectId: params.projectId });
    } catch (error) {
      return this.handleError(error, 'sendPaymentNotificationWithEdgeFunction');
    }
  }

  /**
   * Send client invite email using React Email templates
   */
  async sendClientLink(params: ClientLinkParams & {
    language?: 'en' | 'ar';
    brandingColor?: string;
    inviteMessage?: string;
  }): Promise<void> {
    try {
      if (this.config.useReactEmailTemplates) {
        await this.sendClientLinkWithTemplate(params);
      } else {
        await this.sendClientLinkWithEdgeFunction(params);
      }
    } catch (error) {
      if (this.config.fallbackToEdgeFunctions && this.config.useReactEmailTemplates) {
        console.warn('React Email template failed, falling back to Edge Function:', error);
        await this.sendClientLinkWithEdgeFunction(params);
      } else {
        throw error;
      }
    }
  }

  /**
   * Send client invite using React Email template
   */
  private async sendClientLinkWithTemplate(params: ClientLinkParams & {
    language?: 'en' | 'ar';
    brandingColor?: string;
    inviteMessage?: string;
  }): Promise<void> {
    try {
      // Render the email template
      const renderedEmail = await this.emailRenderService.renderClientInviteEmail({
        projectName: params.projectName,
        clientName: params.clientEmail.split('@')[0], // Fallback to email prefix
        clientEmail: params.clientEmail,
        freelancerName: params.freelancerName,
        projectUrl: `${process.env.VITE_APP_URL}/client/${params.clientToken}`,
        language: params.language || this.config.defaultLanguage,
        inviteMessage: params.inviteMessage,
        brandingColor: params.brandingColor
      });

      // Send via Edge Function with rendered HTML
      await this.sendRenderedEmail(renderedEmail, 'client-invite');

      this.logOperation('client_link_sent_react', { 
        clientEmail: params.clientEmail,
        language: params.language || this.config.defaultLanguage
      });

    } catch (error) {
      return this.handleError(error, 'sendClientLinkWithTemplate');
    }
  }

  /**
   * Send client invite using Edge Function (legacy)
   */
  private async sendClientLinkWithEdgeFunction(params: ClientLinkParams): Promise<void> {
    try {
      const { error } = await this.supabase.functions.invoke('send-client-link', {
        body: params
      });

      if (error) {
        throw new Error(error.message);
      }

      this.logOperation('client_link_sent_edge', { clientEmail: params.clientEmail });
    } catch (error) {
      return this.handleError(error, 'sendClientLinkWithEdgeFunction');
    }
  }

  /**
   * Send rendered email via Edge Function
   */
  private async sendRenderedEmail(
    renderedEmail: { to: string; subject: string; html: string; text: string; preview: string },
    emailType: string
  ): Promise<void> {
    try {
      const { error } = await this.supabase.functions.invoke('send-rendered-email', {
        body: {
          to: renderedEmail.to,
          subject: renderedEmail.subject,
          html: renderedEmail.html,
          text: renderedEmail.text,
          emailType
        }
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      throw new Error(`Failed to send rendered email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch project data for email templates
   */
  private async fetchProjectDataForEmail(projectId: string): Promise<any> {
    try {
      const { data: project, error } = await this.supabase
        .from('projects')
        .select(`
          *,
          client:clients(*),
          freelancer:profiles!user_id(*),
          milestones(*)
        `)
        .eq('id', projectId)
        .single();

      if (error) {
        throw error;
      }

      return {
        ...project,
        contractUrl: `${process.env.VITE_APP_URL}/contract/${project.contract_approval_token}`,
      };
    } catch (error) {
      console.error('Error fetching project data for email:', error);
      return null;
    }
  }

  /**
   * Switch to React Email templates
   */
  enableReactEmailTemplates(): void {
    this.config.useReactEmailTemplates = true;
  }

  /**
   * Switch to Edge Function templates
   */
  enableEdgeFunctionTemplates(): void {
    this.config.useReactEmailTemplates = false;
  }

  /**
   * Get current configuration
   */
  getConfig(): EmailServiceConfig {
    return { ...this.config };
  }
}