import React from 'react';
import { render } from '@react-email/render';
import { User } from '@supabase/supabase-js';
import { BaseService } from './BaseService';
import { 
  EMAIL_TEMPLATES, 
  EmailTemplateType 
} from '@/emails/templates';
import { 
  renderEmailTemplate, 
  getEmailSubject, 
  generatePreviewText,
  EmailRenderOptions 
} from '@/emails/utils/render';

export interface EmailTemplateData {
  // Template identification
  templateType: EmailTemplateType;
  language?: 'en' | 'ar';
  
  // Email metadata
  to: string;
  subject?: string;
  
  // Template data
  data: Record<string, any>;
  
  // Customization
  brandingColor?: string;
  customPreview?: string;
}

export interface RenderedEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
  preview: string;
}

export class EmailRenderService extends BaseService {
  constructor(user: User | null = null) {
    super(user);
  }
  
  /**
   * Render an email template to HTML and text
   */
  async renderTemplate(templateData: EmailTemplateData): Promise<RenderedEmail> {
    try {
      const {
        templateType,
        language = 'en',
        to,
        subject,
        data,
        brandingColor,
        customPreview
      } = templateData;
      
      // Get the template component
      const TemplateComponent = EMAIL_TEMPLATES[templateType];
      if (!TemplateComponent) {
        throw new Error(`Template ${templateType} not found`);
      }
      
      // Prepare template props
      const templateProps = {
        ...data,
        language,
        brandingColor
      };
      
      // Generate subject if not provided
      const emailSubject = subject || getEmailSubject(templateType, data, language);
      
      // Generate preview text
      const preview = customPreview || generatePreviewText(templateType, data, language);
      
      // Render HTML version
      const html = await render(
        React.createElement(TemplateComponent, templateProps),
        { pretty: true }
      );
      
      // Render plain text version
      const text = await render(
        React.createElement(TemplateComponent, templateProps),
        { plainText: true }
      );
      
      // Log the email render operation
      this.logOperation('email_template_rendered', {
        templateType,
        language,
        to,
        hasUser: !!this.user
      });
      
      return {
        to,
        subject: emailSubject,
        html,
        text,
        preview
      };
      
    } catch (error) {
      return this.handleError(error, 'renderTemplate');
    }
  }
  
  /**
   * Render multiple templates in batch
   */
  async renderBatch(templates: EmailTemplateData[]): Promise<RenderedEmail[]> {
    try {
      const promises = templates.map(template => this.renderTemplate(template));
      const results = await Promise.all(promises);
      
      this.logOperation('email_batch_rendered', {
        count: templates.length,
        templates: templates.map(t => t.templateType)
      });
      
      return results;
      
    } catch (error) {
      return this.handleError(error, 'renderBatch');
    }
  }
  
  /**
   * Render a contract approval email
   */
  async renderContractApprovalEmail(data: {
    projectName: string;
    clientName: string;
    freelancerName: string;
    contractUrl: string;
    totalAmount: number;
    currency: string;
    milestones: any[];
    language?: 'en' | 'ar';
  }): Promise<RenderedEmail> {
    return this.renderTemplate({
      templateType: 'contractApproval',
      to: data.clientEmail || '',
      language: data.language,
      data
    });
  }
  
  /**
   * Render a payment notification email
   */
  async renderPaymentNotificationEmail(data: {
    projectName: string;
    clientName: string;
    freelancerName: string;
    milestoneName: string;
    amount: number;
    currency: string;
    isApproved: boolean;
    projectUrl: string;
    language?: 'en' | 'ar';
  }): Promise<RenderedEmail> {
    return this.renderTemplate({
      templateType: 'paymentNotification',
      to: data.clientEmail || '',
      language: data.language,
      data
    });
  }
  
  /**
   * Render a client invite email
   */
  async renderClientInviteEmail(data: {
    projectName: string;
    clientName: string;
    freelancerName: string;
    projectUrl: string;
    totalAmount?: number;
    currency?: string;
    language?: 'en' | 'ar';
    inviteMessage?: string;
  }): Promise<RenderedEmail> {
    return this.renderTemplate({
      templateType: 'clientInvite',
      to: data.clientEmail || '',
      language: data.language,
      data
    });
  }
  
  /**
   * Get available templates
   */
  getAvailableTemplates(): EmailTemplateType[] {
    return Object.keys(EMAIL_TEMPLATES) as EmailTemplateType[];
  }
  
  /**
   * Check if a template exists
   */
  hasTemplate(templateType: string): templateType is EmailTemplateType {
    return templateType in EMAIL_TEMPLATES;
  }
  
  /**
   * Validate template data
   */
  validateTemplateData(templateType: EmailTemplateType, data: any): boolean {
    // Basic validation - can be extended with schema validation
    const requiredFields: Record<EmailTemplateType, string[]> = {
      contractApproval: ['projectName', 'clientName', 'freelancerName', 'contractUrl'],
      paymentNotification: ['projectName', 'clientName', 'milestoneName', 'amount', 'isApproved'],
      clientInvite: ['projectName', 'clientName', 'freelancerName', 'projectUrl'],
      invoice: ['invoiceNumber', 'clientName', 'amount'],
      revisionRequest: ['projectName', 'milestoneName', 'clientName'],
      contactForm: ['name', 'email', 'message']
    };
    
    const required = requiredFields[templateType] || [];
    return required.every(field => data[field] !== undefined && data[field] !== null);
  }
  
  /**
   * Get template preview URL for development
   */
  getPreviewUrl(templateType: EmailTemplateType): string {
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3001' 
      : 'https://app.ruzma.co';
    
    return `${baseUrl}/emails/preview/${templateType}`;
  }
}