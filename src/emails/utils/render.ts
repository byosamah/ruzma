// Email rendering utilities for Ruzma
import { render } from '@react-email/render';

export interface EmailRenderOptions {
  plainText?: boolean;
  pretty?: boolean;
  dir?: 'ltr' | 'rtl';
}

export interface EmailData {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
  language?: 'en' | 'ar';
}

// Format currency for emails
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    // Fallback for unsupported currencies
    return `${currency.toUpperCase()} ${amount.toFixed(2)}`;
  }
}

// Format date for emails
export function formatDate(date: string | Date, language: 'en' | 'ar' = 'en'): string {
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';
  
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    }).format(new Date(date));
  } catch (error) {
    // Fallback to ISO string
    return new Date(date).toLocaleDateString();
  }
}

// Get appropriate greeting based on time
export function getTimeBasedGreeting(language: 'en' | 'ar' = 'en'): string {
  const hour = new Date().getHours();
  
  if (language === 'ar') {
    if (hour < 12) return 'صباح الخير';
    if (hour < 17) return 'مساء الخير';
    return 'مساء الخير';
  }
  
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// Truncate text for email previews
export function truncateText(text: string, maxLength: number = 150): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

// Generate email preview text
export function generatePreviewText(
  template: string, 
  data: any, 
  language: 'en' | 'ar' = 'en'
): string {
  const previews = {
    en: {
      contractApproval: `Contract approval required for ${data.projectName}`,
      paymentNotification: `Payment ${data.isApproved ? 'received' : 'due'} for ${data.projectName}`,
      clientInvite: `You've been invited to view ${data.projectName}`,
      invoice: `Invoice ${data.invoiceNumber} from ${data.freelancerName}`,
      revisionRequest: `Revision requested for ${data.milestoneName}`,
      contactForm: `New message from ${data.name}: ${truncateText(data.message, 100)}`
    },
    ar: {
      contractApproval: `مطلوب الموافقة على العقد لمشروع ${data.projectName}`,
      paymentNotification: `${data.isApproved ? 'تم استلام الدفعة' : 'مطلوب الدفع'} لمشروع ${data.projectName}`,
      clientInvite: `تم دعوتك لعرض مشروع ${data.projectName}`,
      invoice: `فاتورة ${data.invoiceNumber} من ${data.freelancerName}`,
      revisionRequest: `طلب تعديل على ${data.milestoneName}`,
      contactForm: `رسالة جديدة من ${data.name}: ${truncateText(data.message, 100)}`
    }
  };

  return previews[language][template as keyof typeof previews.en] || 
         `Update from Ruzma regarding ${data.projectName || 'your project'}`;
}

// Render email template to HTML
export async function renderEmailTemplate(
  template: React.ComponentType<any>,
  data: any,
  options: EmailRenderOptions = {}
): Promise<string> {
  const { plainText = false, pretty = true } = options;
  
  try {
    const html = await render(React.createElement(template, data), {
      plainText,
      pretty
    });
    
    return html;
  } catch (error) {
    console.error('Error rendering email template:', error);
    throw new Error(`Failed to render email template: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Get email subject based on template and data
export function getEmailSubject(
  template: string,
  data: any,
  language: 'en' | 'ar' = 'en'
): string {
  const subjects = {
    en: {
      contractApproval: `Contract Approval Required - ${data.projectName}`,
      paymentNotification: `Payment ${data.isApproved ? 'Received' : 'Due'} - ${data.projectName}`,
      clientInvite: `Project Invitation - ${data.projectName}`,
      invoice: `Invoice ${data.invoiceNumber} - ${data.freelancerName}`,
      revisionRequest: `Revision Request - ${data.milestoneName}`,
      contactForm: `Contact Form Message from ${data.name}`
    },
    ar: {
      contractApproval: `مطلوب الموافقة على العقد - ${data.projectName}`,
      paymentNotification: `${data.isApproved ? 'تم استلام الدفعة' : 'مطلوب الدفع'} - ${data.projectName}`,
      clientInvite: `دعوة مشروع - ${data.projectName}`,
      invoice: `فاتورة ${data.invoiceNumber} - ${data.freelancerName}`,
      revisionRequest: `طلب تعديل - ${data.milestoneName}`,
      contactForm: `رسالة من نموذج الاتصال من ${data.name}`
    }
  };

  return subjects[language][template as keyof typeof subjects.en] || 
         `Update from Ruzma`;
}

// Email validation utility
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Get logo URL for emails
export function getLogoUrl(isDark: boolean = false): string {
  const baseUrl = process.env.VITE_APP_URL || 'https://app.ruzma.co';
  return `${baseUrl}/logo${isDark ? '-dark' : ''}.png`;
}

// Get company information
export function getCompanyInfo() {
  return {
    name: 'Ruzma',
    tagline: 'Freelancer Project Management',
    website: 'https://ruzma.co',
    supportEmail: 'hey@ruzma.co',
    address: {
      en: 'Ruzma Inc.',
      ar: 'شركة رزمة'
    }
  };
}