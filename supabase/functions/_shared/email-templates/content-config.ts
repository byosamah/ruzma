/**
 * Email Content Configuration
 *
 * This file contains all email template content in plain text format
 * for easy editing without touching HTML/React code.
 *
 * Variables are marked with {{variableName}} and will be replaced
 * with actual values when the email is sent.
 *
 * Supports both English (en) and Arabic (ar) languages.
 */

export const EMAIL_CONTENT = {
  // ==========================================
  // 1. PROJECT UPDATE NOTIFICATIONS
  // ==========================================
  projectUpdate: {
    en: {
      subject: "Project Update - {{projectName}}",
      greeting: "Hello {{clientName}},",
      title: "📋 Project Update",
      intro: "There's an update on your project \"{{projectName}}\".",
      body: "{{updateDetails}}",
      cta: "View Project Dashboard",
      closing: "Best regards,",
      poweredBy: "Powered by"
    },
    ar: {
      subject: "تحديث المشروع - {{projectName}}",
      greeting: "مرحباً {{clientName}}،",
      title: "📋 تحديث المشروع",
      intro: "هناك تحديث على مشروعك \"{{projectName}}\".",
      body: "{{updateDetails}}",
      cta: "عرض لوحة تحكم المشروع",
      closing: "مع أطيب التحيات،",
      poweredBy: "مدعوم بواسطة"
    }
  },

  // ==========================================
  // 2. PAYMENT REMINDER NOTIFICATIONS
  // ==========================================
  paymentReminder: {
    en: {
      subject: "Payment Reminder - {{milestoneName}} {{dueStatus}}",
      greeting: "Hello {{clientName}},",
      title: "💰 Payment Reminder",
      intro: "This is a friendly reminder about the upcoming payment for milestone \"{{milestoneName}}\" in project \"{{projectName}}\".",
      dueLabel: "Due Date:",
      amountLabel: "Amount:",
      statusLabel: "Status:",
      overdueWarning: "This payment is now overdue by {{daysOverdue}} days. Please settle this as soon as possible.",
      upcomingNotice: "This payment is due in {{daysUntilDue}} days. Please review and arrange payment.",
      cta: "Make Payment",
      closing: "Best regards,",
      poweredBy: "Powered by"
    },
    ar: {
      subject: "تذكير بالدفعة - {{milestoneName}} {{dueStatus}}",
      greeting: "مرحباً {{clientName}}،",
      title: "💰 تذكير بالدفعة",
      intro: "هذا تذكير ودي بشأن الدفعة القادمة لمعلم \"{{milestoneName}}\" في مشروع \"{{projectName}}\".",
      dueLabel: "تاريخ الاستحقاق:",
      amountLabel: "المبلغ:",
      statusLabel: "الحالة:",
      overdueWarning: "هذه الدفعة متأخرة بمقدار {{daysOverdue}} يوم. يرجى التسوية في أقرب وقت ممكن.",
      upcomingNotice: "هذه الدفعة مستحقة خلال {{daysUntilDue}} يوم. يرجى المراجعة وترتيب الدفع.",
      cta: "الدفع الآن",
      closing: "مع أطيب التحيات،",
      poweredBy: "مدعوم بواسطة"
    }
  },

  // ==========================================
  // 3. MILESTONE UPDATE NOTIFICATIONS
  // ==========================================
  milestoneUpdate: {
    en: {
      subject: "Milestone Update - {{milestoneName}}",
      greeting: "Hello {{clientName}},",
      title: "🎯 Milestone Update",
      intro: "The status of milestone \"{{milestoneName}}\" in project \"{{projectName}}\" has been updated.",
      statusChangeLabel: "Status Changed:",
      oldStatusLabel: "Previous Status:",
      newStatusLabel: "New Status:",
      messageLabel: "Message from Freelancer:",
      pending: "Pending",
      inProgress: "In Progress",
      review: "Ready for Review",
      completed: "Completed",
      cta: "Review Milestone",
      closing: "Best regards,",
      poweredBy: "Powered by"
    },
    ar: {
      subject: "تحديث المعلم - {{milestoneName}}",
      greeting: "مرحباً {{clientName}}،",
      title: "🎯 تحديث المعلم",
      intro: "تم تحديث حالة معلم \"{{milestoneName}}\" في مشروع \"{{projectName}}\".",
      statusChangeLabel: "تغيير الحالة:",
      oldStatusLabel: "الحالة السابقة:",
      newStatusLabel: "الحالة الجديدة:",
      messageLabel: "رسالة من المستقل:",
      pending: "قيد الانتظار",
      inProgress: "قيد التنفيذ",
      review: "جاهز للمراجعة",
      completed: "مكتمل",
      cta: "مراجعة المعلم",
      closing: "مع أطيب التحيات،",
      poweredBy: "مدعوم بواسطة"
    }
  },

  // ==========================================
  // 4. MARKETING/PROMOTIONAL EMAILS
  // ==========================================
  marketing: {
    en: {
      subject: "{{promoTitle}}",
      greeting: "Hello {{userName}},",
      title: "{{promoTitle}}",
      intro: "{{promoDescription}}",
      cta: "{{ctaText}}",
      unsubscribe: "Don't want to receive these emails?",
      unsubscribeLink: "Unsubscribe",
      closing: "Best regards,",
      poweredBy: "Powered by"
    },
    ar: {
      subject: "{{promoTitle}}",
      greeting: "مرحباً {{userName}}،",
      title: "{{promoTitle}}",
      intro: "{{promoDescription}}",
      cta: "{{ctaText}}",
      unsubscribe: "لا تريد استلام هذه الرسائل؟",
      unsubscribeLink: "إلغاء الاشتراك",
      closing: "مع أطيب التحيات،",
      poweredBy: "مدعوم بواسطة"
    }
  }
};

/**
 * Helper function to replace variables in template strings
 * Example: replaceVariables("Hello {{name}}", { name: "John" }) => "Hello John"
 */
export function replaceVariables(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] !== undefined ? variables[key] : match;
  });
}

/**
 * Get email content for a specific type and language
 */
export function getEmailContent(
  type: 'projectUpdate' | 'paymentReminder' | 'milestoneUpdate' | 'marketing',
  language: 'en' | 'ar' = 'en'
) {
  return EMAIL_CONTENT[type][language];
}
