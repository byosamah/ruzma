import { User } from '@supabase/supabase-js';
import { BaseService } from './BaseService';
import { UserService } from './UserService';

export interface ContractApprovalEmailParams {
  projectId: string;
  clientEmail: string;
}

export interface PaymentNotificationParams {
  clientEmail: string;
  projectName: string;
  projectId: string;
  clientToken: string;
  isApproved: boolean;
  milestoneName: string;
}

export interface ClientLinkParams {
  clientEmail: string;
  projectName: string;
  freelancerName: string;
  clientToken: string;
  userId?: string;
}

export class EmailService extends BaseService {
  private userService: UserService;

  constructor(user: User | null) {
    super(user);
    this.userService = new UserService(user);
  }

  async sendContractApproval(params: ContractApprovalEmailParams): Promise<void> {
    try {
      const { error } = await this.supabase.functions.invoke('send-contract-approval', {
        body: { projectId: params.projectId }
      });

      if (error) {
        throw new Error(error.message);
      }

      this.logOperation('contract_approval_email_sent', { projectId: params.projectId });
    } catch (error) {
      return this.handleError(error, 'sendContractApproval');
    }
  }

  async sendPaymentNotification(params: PaymentNotificationParams): Promise<void> {
    try {
      const { error } = await this.supabase.functions.invoke('send-payment-notification', {
        body: params
      });

      if (error) {
        throw new Error(error.message);
      }

      this.logOperation('payment_notification_sent', { projectId: params.projectId });
    } catch (error) {
      return this.handleError(error, 'sendPaymentNotification');
    }
  }

  async sendClientLink(params: ClientLinkParams): Promise<void> {
    try {
      const { error } = await this.supabase.functions.invoke('send-client-link', {
        body: params
      });

      if (error) {
        throw new Error(error.message);
      }

      this.logOperation('client_link_sent', { clientEmail: params.clientEmail });
    } catch (error) {
      return this.handleError(error, 'sendClientLink');
    }
  }
}