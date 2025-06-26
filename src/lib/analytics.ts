
// Google Analytics 4 tracking utilities
declare global {
  interface Window {
    gtag: (command: string, ...args: any[]) => void;
    dataLayer: any[];
  }
}

// Enhanced Ecommerce Events
export const trackPurchase = (transactionId: string, value: number, currency: string, items: any[]) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: value,
      currency: currency,
      items: items
    });
  }
};

export const trackInvoiceCreated = (invoiceId: string, value: number, currency: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'invoice_created', {
      invoice_id: invoiceId,
      value: value,
      currency: currency,
      event_category: 'business'
    });
  }
};

// Authentication Events
export const trackSignUp = (method: string = 'email') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'sign_up', {
      method: method
    });
  }
};

export const trackLogin = (method: string = 'email') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'login', {
      method: method
    });
  }
};

// Core Business Events
export const trackProjectCreated = (projectId: string, isFirstProject: boolean = false) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'project_created', {
      project_id: projectId,
      is_first_project: isFirstProject,
      event_category: 'business'
    });
    
    if (isFirstProject) {
      window.gtag('event', 'first_project_created', {
        project_id: projectId,
        event_category: 'conversion'
      });
    }
  }
};

export const trackMilestoneCreated = (projectId: string, milestoneCount: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'milestone_created', {
      project_id: projectId,
      milestone_count: milestoneCount,
      event_category: 'business'
    });
  }
};

export const trackPaymentProofUploaded = (milestoneId: string, projectId: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'payment_proof_uploaded', {
      milestone_id: milestoneId,
      project_id: projectId,
      event_category: 'business'
    });
  }
};

export const trackMilestoneApproved = (milestoneId: string, projectId: string, value: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'milestone_approved', {
      milestone_id: milestoneId,
      project_id: projectId,
      value: value,
      event_category: 'business'
    });
  }
};

export const trackDeliverableUploaded = (milestoneId: string, projectId: string, fileSize: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'deliverable_uploaded', {
      milestone_id: milestoneId,
      project_id: projectId,
      file_size: fileSize,
      event_category: 'business'
    });
  }
};

// Feature Usage Events
export const trackTemplateUsed = (templateId: string, templateName: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'template_used', {
      template_id: templateId,
      template_name: templateName,
      event_category: 'feature'
    });
  }
};

export const trackBrandingUpdated = (userId: string, brandingType: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'branding_updated', {
      user_id: userId,
      branding_type: brandingType,
      event_category: 'feature'
    });
  }
};

export const trackClientProjectAccess = (projectId: string, accessMethod: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'client_project_access', {
      project_id: projectId,
      access_method: accessMethod,
      event_category: 'engagement'
    });
  }
};

// Error Tracking
export const trackError = (errorType: string, errorMessage: string, location: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'exception', {
      description: `${errorType}: ${errorMessage}`,
      fatal: false,
      location: location
    });
  }
};

// Page Performance
export const trackPageTiming = (pageName: string, loadTime: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'timing_complete', {
      name: 'page_load',
      value: loadTime,
      event_category: 'performance',
      event_label: pageName
    });
  }
};

// User Properties
export const setUserProperties = (userId: string, userType: string, currency: string, projectCount: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-5YGZMV1FD1', {
      user_id: userId,
      custom_map: {
        user_type: userType,
        currency: currency,
        project_count: projectCount
      }
    });
  }
};

// Conversion Events
export const trackConversion = (conversionName: string, value?: number, currency?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: `G-5YGZMV1FD1/${conversionName}`,
      value: value,
      currency: currency
    });
  }
};
