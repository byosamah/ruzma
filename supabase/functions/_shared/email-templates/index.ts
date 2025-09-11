import { render } from '@react-email/render';
import React from 'react';

// Template imports
import { ContractApprovalTemplate } from './contract-approval.tsx';
import { PaymentNotificationTemplate } from './payment-notification.tsx';
import { ClientInviteTemplate } from './client-invite.tsx';

// Template types
export interface TemplateData {
  [key: string]: any;
}

export interface EmailTemplateProps {
  template: 'contract-approval' | 'payment-notification' | 'client-invite';
  data: TemplateData;
  language?: 'en' | 'ar';
  brandingColor?: string;
  companyName?: string;
  companyLogo?: string;
}

// Template renderer
export const renderEmailTemplate = async (props: EmailTemplateProps): Promise<{ html: string; subject: string }> => {
  const { template, data, language = 'en', brandingColor, companyName, companyLogo } = props;

  let component: React.ReactElement;
  let subject: string;

  // Select template and generate subject
  switch (template) {
    case 'contract-approval':
      component = React.createElement(ContractApprovalTemplate, {
        ...data,
        language,
        brandingColor,
        companyName,
        companyLogo,
      });
      subject = language === 'ar' 
        ? `مراجعة العقد مطلوبة - ${data.projectName}`
        : `Contract Approval Required - ${data.projectName}`;
      break;

    case 'payment-notification':
      component = React.createElement(PaymentNotificationTemplate, {
        ...data,
        language,
        brandingColor,
        companyName,
        companyLogo,
      });
      const statusText = language === 'ar' 
        ? (data.isApproved ? 'تم اعتماد الدفعة' : 'طلب دفعة')
        : (data.isApproved ? 'Payment Approved' : 'Payment Requested');
      subject = language === 'ar'
        ? `${statusText} - ${data.projectName}`
        : `${statusText} - ${data.projectName}`;
      break;

    case 'client-invite':
      component = React.createElement(ClientInviteTemplate, {
        ...data,
        language,
        brandingColor,
        companyName,
        companyLogo,
      });
      subject = language === 'ar'
        ? `دعوة المشروع - ${data.projectName}`
        : `Project Invitation - ${data.projectName}`;
      break;

    default:
      throw new Error(`Unknown template: ${template}`);
  }

  // Render template to HTML
  const html = render(component);

  return {
    html,
    subject,
  };
};

// Export templates for direct use if needed
export {
  ContractApprovalTemplate,
  PaymentNotificationTemplate,
  ClientInviteTemplate,
};

// Template validation
export const validateTemplateData = (template: string, data: TemplateData): boolean => {
  const requiredFields: Record<string, string[]> = {
    'contract-approval': [
      'projectName',
      'projectBrief', 
      'clientName',
      'clientEmail',
      'freelancerName',
      'contractUrl',
      'approvalToken',
      'totalAmount',
      'currency',
      'milestones'
    ],
    'payment-notification': [
      'projectName',
      'clientName',
      'clientEmail', 
      'freelancerName',
      'milestoneName',
      'amount',
      'currency',
      'isApproved',
      'projectUrl'
    ],
    'client-invite': [
      'projectName',
      'clientName',
      'clientEmail',
      'freelancerName',
      'projectUrl'
    ]
  };

  const required = requiredFields[template];
  if (!required) {
    return false;
  }

  return required.every(field => data.hasOwnProperty(field) && data[field] !== undefined);
};