// Export all email templates
export { ContractApprovalEmail } from './ContractApproval';
export { PaymentNotificationEmail } from './PaymentNotification';
export { ClientInviteEmail } from './ClientInvite';

// Template types for the render service
export type EmailTemplateType = 
  | 'contractApproval'
  | 'paymentNotification'
  | 'clientInvite'
  | 'invoice'
  | 'revisionRequest'
  | 'contactForm';

// Template component map
export const EMAIL_TEMPLATES = {
  contractApproval: ContractApprovalEmail,
  paymentNotification: PaymentNotificationEmail,
  clientInvite: ClientInviteEmail,
  // TODO: Add more templates as they are created
  // invoice: InvoiceEmail,
  // revisionRequest: RevisionRequestEmail,
  // contactForm: ContactFormEmail,
} as const;