import {
  Text,
  Button,
  Section,
  Hr,
} from '@react-email/components';
import React from 'react';
import { BaseTemplate } from './base-template';

interface ClientInviteTemplateProps {
  projectName: string;
  clientName: string;
  clientEmail: string;
  freelancerName: string;
  projectUrl: string;
  inviteMessage?: string;
  language?: 'en' | 'ar';
  brandingColor?: string;
  companyName?: string;
  companyLogo?: string;
}

export const ClientInviteTemplate: React.FC<ClientInviteTemplateProps> = ({
  projectName,
  clientName,
  freelancerName,
  projectUrl,
  inviteMessage,
  language = 'en',
  brandingColor = '#3B82F6',
  companyName,
  companyLogo,
}) => {
  const isRTL = language === 'ar';
  const textAlign = isRTL ? 'right' : 'left';

  const content = isRTL ? {
    greeting: `مرحباً ${clientName}،`,
    title: 'دعوة للانضمام إلى مشروعك',
    intro: `يسرني دعوتك لمتابعة تطور مشروع "${projectName}" من خلال لوحة التحكم الخاصة بالعملاء.`,
    featuresTitle: 'ما يمكنك فعله:',
    feature1: '📋 مراجعة تفاصيل المشروع والمعالم',
    feature2: '💬 التواصل والتعليق على المعالم',
    feature3: '✅ الموافقة على المخرجات والمدفوعات',
    feature4: '📈 متابعة تقدم المشروع في الوقت الفعلي',
    feature5: '📄 تحميل العقود والمستندات',
    accessTitle: 'كيفية الوصول:',
    accessStep1: 'انقر على الزر أدناه للوصول إلى لوحة تحكم المشروع',
    accessStep2: 'احفظ هذا الرابط للوصول المستقبلي',
    accessStep3: 'لا حاجة لإنشاء حساب - استخدم الرابط مباشرة',
    ctaButton: 'الوصول إلى لوحة تحكم المشروع',
    securityTitle: 'الأمان والخصوصية:',
    securityText: 'هذا الرابط آمن ومخصص لك فقط. يمكنك الوصول إليه من أي جهاز متى شئت.',
    supportText: 'إذا كان لديك أي أسئلة أو احتجت للمساعدة، لا تتردد في التواصل معي.',
    regards: 'مع أطيب التحيات،',
    poweredBy: 'مدعوم بواسطة',
  } : {
    greeting: `Hello ${clientName},`,
    title: 'You\'re Invited to Your Project Dashboard',
    intro: `I'm excited to invite you to track the progress of "${projectName}" through your dedicated client dashboard.`,
    featuresTitle: 'What you can do:',
    feature1: '📋 Review project details and milestones',
    feature2: '💬 Communicate and comment on milestones',
    feature3: '✅ Approve deliverables and payments',
    feature4: '📈 Track project progress in real-time',
    feature5: '📄 Download contracts and documents',
    accessTitle: 'How to access:',
    accessStep1: 'Click the button below to access your project dashboard',
    accessStep2: 'Bookmark this link for future access',
    accessStep3: 'No account creation needed - use the link directly',
    ctaButton: 'Access Project Dashboard',
    securityTitle: 'Security & Privacy:',
    securityText: 'This link is secure and exclusive to you. You can access it from any device at any time.',
    supportText: 'If you have any questions or need assistance, feel free to reach out to me directly.',
    regards: 'Best regards,',
    poweredBy: 'Powered by',
  };

  return (
    <BaseTemplate
      language={language}
      brandingColor={brandingColor}
      companyName={companyName || 'Ruzma'}
      companyLogo={companyLogo}
      previewText={`${projectName} - Project Dashboard Access`}
    >
      {/* Greeting */}
      <Text style={{ ...textStyle, textAlign, marginBottom: '24px' }}>
        {content.greeting}
      </Text>

      {/* Title */}
      <Text style={{ ...titleStyle, textAlign, color: brandingColor }}>
        🎉 {content.title}
      </Text>

      {/* Introduction */}
      <Text style={{ ...textStyle, textAlign }}>
        {content.intro}
      </Text>

      {/* Custom Message */}
      {inviteMessage && (
        <Section style={sectionStyle}>
          <div style={messageCardStyle}>
            <Text style={{ ...textStyle, textAlign, fontStyle: 'italic', margin: '0' }}>
              "{inviteMessage}"
            </Text>
          </div>
        </Section>
      )}

      {/* Features */}
      <Section style={sectionStyle}>
        <Text style={{ ...headingStyle, textAlign, color: brandingColor }}>
          {content.featuresTitle}
        </Text>
        
        <div style={featureListStyle}>
          <Text style={{ ...featureItemStyle, textAlign }}>{content.feature1}</Text>
          <Text style={{ ...featureItemStyle, textAlign }}>{content.feature2}</Text>
          <Text style={{ ...featureItemStyle, textAlign }}>{content.feature3}</Text>
          <Text style={{ ...featureItemStyle, textAlign }}>{content.feature4}</Text>
          <Text style={{ ...featureItemStyle, textAlign }}>{content.feature5}</Text>
        </div>
      </Section>

      {/* CTA Button */}
      <Section style={{ ...sectionStyle, textAlign: 'center' }}>
        <Button
          href={projectUrl}
          style={{
            ...buttonStyle,
            backgroundColor: brandingColor,
          }}
        >
          {content.ctaButton}
        </Button>
      </Section>

      {/* Access Instructions */}
      <Section style={sectionStyle}>
        <Text style={{ ...headingStyle, textAlign, color: brandingColor }}>
          {content.accessTitle}
        </Text>
        
        <div style={instructionCardStyle}>
          <Text style={{ ...instructionItemStyle, textAlign }}>
            <span style={{ fontWeight: '600', color: brandingColor }}>1.</span> {content.accessStep1}
          </Text>
          <Text style={{ ...instructionItemStyle, textAlign }}>
            <span style={{ fontWeight: '600', color: brandingColor }}>2.</span> {content.accessStep2}
          </Text>
          <Text style={{ ...instructionItemStyle, textAlign }}>
            <span style={{ fontWeight: '600', color: brandingColor }}>3.</span> {content.accessStep3}
          </Text>
        </div>
      </Section>

      {/* Security Note */}
      <Section style={sectionStyle}>
        <Text style={{ ...headingStyle, textAlign, color: brandingColor }}>
          🔒 {content.securityTitle}
        </Text>
        <Text style={{ ...textStyle, textAlign, color: '#64748b' }}>
          {content.securityText}
        </Text>
      </Section>

      {/* Support */}
      <Section style={sectionStyle}>
        <div style={supportCardStyle}>
          <Text style={{ ...textStyle, textAlign, margin: '0' }}>
            {content.supportText}
          </Text>
        </div>
      </Section>

      {/* Signature */}
      <Hr style={{ margin: '32px 0 24px 0', borderTop: '1px solid #e2e8f0' }} />
      
      <Text style={{ ...textStyle, textAlign }}>
        {content.regards}
      </Text>
      <Text style={{ ...boldTextStyle, textAlign, color: brandingColor }}>
        {freelancerName}
      </Text>

      {/* Footer */}
      <Section style={{ textAlign: 'center', marginTop: '40px' }}>
        <Text style={{ ...smallTextStyle, color: '#94a3b8' }}>
          {content.poweredBy}{' '}
          <a href="https://ruzma.co" style={{ color: brandingColor, textDecoration: 'none' }}>
            Ruzma
          </a>
        </Text>
      </Section>
    </BaseTemplate>
  );
};

// Styles
const textStyle = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#374151',
  margin: '0 0 16px 0',
};

const titleStyle = {
  fontSize: '28px',
  fontWeight: '700',
  lineHeight: '1.3',
  margin: '0 0 24px 0',
};

const headingStyle = {
  fontSize: '20px',
  fontWeight: '600',
  lineHeight: '1.4',
  margin: '0 0 16px 0',
};

const boldTextStyle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#374151',
  margin: '0',
};

const smallTextStyle = {
  fontSize: '14px',
  lineHeight: '1.5',
  color: '#374151',
  margin: '0',
};

const sectionStyle = {
  margin: '32px 0',
};

const messageCardStyle = {
  backgroundColor: '#f0f9ff',
  border: '1px solid #bae6fd',
  borderLeft: '4px solid #3B82F6',
  borderRadius: '6px',
  padding: '20px',
  margin: '16px 0',
};

const featureListStyle = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '20px',
  margin: '16px 0',
};

const featureItemStyle = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#374151',
  margin: '0 0 12px 0',
};

const instructionCardStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '20px',
  margin: '16px 0',
};

const instructionItemStyle = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#374151',
  margin: '0 0 12px 0',
};

const supportCardStyle = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fcd34d',
  borderRadius: '8px',
  padding: '20px',
  margin: '16px 0',
};

const buttonStyle = {
  backgroundColor: '#3B82F6',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 40px',
  margin: '16px 0',
  border: 'none',
  cursor: 'pointer',
};

export default ClientInviteTemplate;