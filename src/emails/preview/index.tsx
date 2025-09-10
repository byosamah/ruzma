import React from 'react';
import { 
  ContractApprovalEmail,
  PaymentNotificationEmail,
  ClientInviteEmail
} from '../templates';

// Sample data for email previews
export const sampleData = {
  contractApproval: {
    projectName: "Brand Identity Design for TechCorp",
    projectBrief: "Complete brand identity package including logo design, color palette, typography guidelines, and brand application examples for a growing technology company.",
    totalAmount: 2500,
    currency: "USD",
    startDate: "2024-01-15",
    endDate: "2024-02-15",
    clientName: "Sarah Johnson",
    clientEmail: "sarah@techcorp.com",
    freelancerName: "Ahmed Hassan",
    freelancerCompany: "Hassan Design Studio",
    contractUrl: "https://app.ruzma.co/contract/abc123",
    approvalToken: "abc123",
    milestones: [
      {
        id: "1",
        title: "Logo Concepts",
        description: "Initial logo concepts and mood board",
        price: 800,
        deliverable: "3 logo concepts with rationale"
      },
      {
        id: "2", 
        title: "Brand Guidelines",
        description: "Complete brand style guide development",
        price: 1200,
        deliverable: "Brand guidelines document"
      },
      {
        id: "3",
        title: "Brand Applications",
        description: "Business cards, letterhead, and digital assets",
        price: 500,
        deliverable: "Application examples and files"
      }
    ]
  },
  
  paymentNotification: {
    projectName: "Brand Identity Design for TechCorp",
    projectId: "proj_123",
    clientName: "Sarah Johnson",
    clientEmail: "sarah@techcorp.com",
    clientToken: "client_token_123",
    freelancerName: "Ahmed Hassan",
    freelancerCompany: "Hassan Design Studio",
    milestoneName: "Logo Concepts",
    milestoneDescription: "Initial logo concepts and mood board with 3 creative directions",
    amount: 800,
    currency: "USD",
    dueDate: "2024-01-22",
    isApproved: false,
    paymentUrl: "https://app.ruzma.co/payment/milestone_123",
    projectUrl: "https://app.ruzma.co/client/client_token_123"
  },
  
  clientInvite: {
    projectName: "Brand Identity Design for TechCorp",
    projectBrief: "Complete brand identity package including logo design, color palette, typography guidelines, and brand application examples for a growing technology company.",
    totalAmount: 2500,
    currency: "USD",
    clientName: "Sarah Johnson",
    clientEmail: "sarah@techcorp.com",
    clientToken: "client_token_123",
    freelancerName: "Ahmed Hassan",
    freelancerCompany: "Hassan Design Studio",
    freelancerBio: "Creative brand designer with 8+ years of experience helping startups and established companies build memorable visual identities.",
    projectUrl: "https://app.ruzma.co/client/client_token_123",
    milestones: [
      { id: "1", title: "Logo Concepts", price: 800 },
      { id: "2", title: "Brand Guidelines", price: 1200 },
      { id: "3", title: "Brand Applications", price: 500 }
    ],
    inviteMessage: "I'm excited to work with TechCorp on this brand identity project. Let's create something amazing together!"
  }
};

// Arabic sample data
export const sampleDataArabic = {
  contractApproval: {
    ...sampleData.contractApproval,
    projectName: "تصميم الهوية التجارية لشركة التقنية",
    projectBrief: "حزمة هوية تجارية كاملة تشمل تصميم الشعار ولوحة الألوان وإرشادات الطباعة وأمثلة تطبيق العلامة التجارية لشركة تقنية متنامية.",
    clientName: "سارة جونسون",
    freelancerName: "أحمد حسن",
    freelancerCompany: "استوديو حسن للتصميم",
    milestones: [
      {
        id: "1",
        title: "مفاهيم الشعار",
        description: "مفاهيم الشعار الأولية ولوحة المزاج",
        price: 800,
        deliverable: "3 مفاهيم للشعار مع التبرير"
      },
      {
        id: "2",
        title: "إرشادات العلامة التجارية", 
        description: "تطوير دليل أسلوب العلامة التجارية الكامل",
        price: 1200,
        deliverable: "وثيقة إرشادات العلامة التجارية"
      },
      {
        id: "3",
        title: "تطبيقات العلامة التجارية",
        description: "بطاقات العمل والأوراق الرسمية والأصول الرقمية",
        price: 500,
        deliverable: "أمثلة التطبيق والملفات"
      }
    ],
    language: 'ar' as const
  },
  
  paymentNotification: {
    ...sampleData.paymentNotification,
    projectName: "تصميم الهوية التجارية لشركة التقنية",
    clientName: "سارة جونسون",
    freelancerName: "أحمد حسن",
    freelancerCompany: "استوديو حسن للتصميم",
    milestoneName: "مفاهيم الشعار",
    milestoneDescription: "مفاهيم الشعار الأولية ولوحة المزاج مع 3 اتجاهات إبداعية",
    language: 'ar' as const
  },
  
  clientInvite: {
    ...sampleData.clientInvite,
    projectName: "تصميم الهوية التجارية لشركة التقنية",
    projectBrief: "حزمة هوية تجارية كاملة تشمل تصميم الشعار ولوحة الألوان وإرشادات الطباعة وأمثلة تطبيق العلامة التجارية لشركة تقنية متنامية.",
    clientName: "سارة جونسون",
    freelancerName: "أحمد حسن",
    freelancerCompany: "استوديو حسن للتصميم",
    freelancerBio: "مصمم علامات تجارية إبداعي مع أكثر من 8 سنوات من الخبرة في مساعدة الشركات الناشئة والراسخة في بناء هويات بصرية لا تُنسى.",
    milestones: [
      { id: "1", title: "مفاهيم الشعار", price: 800 },
      { id: "2", title: "إرشادات العلامة التجارية", price: 1200 },
      { id: "3", title: "تطبيقات العلامة التجارية", price: 500 }
    ],
    inviteMessage: "أنا متحمس للعمل مع شركة التقنية في مشروع الهوية التجارية هذا. دعونا نصنع شيئاً رائعاً معاً!",
    language: 'ar' as const
  }
};

// Preview components
export const ContractApprovalPreview = ({ language = 'en' }: { language?: 'en' | 'ar' }) => {
  const data = language === 'ar' ? sampleDataArabic.contractApproval : sampleData.contractApproval;
  return <ContractApprovalEmail {...data} language={language} />;
};

export const PaymentNotificationPreview = ({ 
  language = 'en', 
  isApproved = false 
}: { 
  language?: 'en' | 'ar';
  isApproved?: boolean;
}) => {
  const data = language === 'ar' ? sampleDataArabic.paymentNotification : sampleData.paymentNotification;
  return <PaymentNotificationEmail {...data} language={language} isApproved={isApproved} />;
};

export const ClientInvitePreview = ({ language = 'en' }: { language?: 'en' | 'ar' }) => {
  const data = language === 'ar' ? sampleDataArabic.clientInvite : sampleData.clientInvite;
  return <ClientInviteEmail {...data} language={language} />;
};