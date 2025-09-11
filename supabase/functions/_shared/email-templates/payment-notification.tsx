import {
  Text,
  Button,
  Section,
  Row,
  Column,
  Hr,
} from '@react-email/components';
import React from 'react';
import { BaseTemplate } from './base-template.tsx';

interface PaymentNotificationTemplateProps {
  projectName: string;
  clientName: string;
  clientEmail: string;
  freelancerName: string;
  freelancerCompany?: string;
  milestoneName: string;
  amount: number;
  currency: string;
  isApproved: boolean;
  projectUrl: string;
  language?: 'en' | 'ar';
  brandingColor?: string;
  companyName?: string;
  companyLogo?: string;
}

export const PaymentNotificationTemplate: React.FC<PaymentNotificationTemplateProps> = ({
  projectName,
  clientName,
  freelancerName,
  freelancerCompany,
  milestoneName,
  amount,
  currency,
  isApproved,
  projectUrl,
  language = 'en',
  brandingColor = '#3B82F6',
  companyName,
  companyLogo,
}) => {
  const isRTL = language === 'ar';
  const textAlign = isRTL ? 'right' : 'left';

  const formatCurrency = (amount: number, curr: string) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: curr,
    }).format(amount);
  };

  const statusColor = isApproved ? '#10B981' : '#F59E0B'; // Green for approved, orange for pending
  const statusIcon = isApproved ? '✅' : '⏳';

  const content = isRTL ? {
    greeting: `مرحباً ${clientName}،`,
    titleApproved: 'تم اعتماد الدفعة - تحديث المشروع',
    titlePending: 'طلب دفعة - تحديث المشروع',
    introApproved: `تم اعتماد الدفعة لمعلم "${milestoneName}" في مشروع "${projectName}".`,
    introPending: `تم طلب دفعة لمعلم "${milestoneName}" في مشروع "${projectName}".`,
    paymentDetailsTitle: 'تفاصيل الدفعة:',
    milestoneLabel: 'المعلم:',
    amountLabel: 'المبلغ:',
    statusLabel: 'الحالة:',
    statusApproved: 'تم الاعتماد',
    statusPending: 'في انتظار الدفع',
    nextStepsTitle: 'الخطوات التالية:',
    nextStepsApproved: 'تم تسليم المعلم. يمكنك مراجعة العمل والتقدم إلى المعلم التالي من خلال لوحة تحكم المشروع.',
    nextStepsPending: 'يرجى مراجعة العمل المُسلم وتأكيد الدفعة من خلال لوحة تحكم المشروع.',
    ctaButton: 'عرض المشروع',
    regards: 'مع أطيب التحيات،',
    poweredBy: 'مدعوم بواسطة',
  } : {
    greeting: `Hello ${clientName},`,
    titleApproved: 'Payment Approved - Project Update',
    titlePending: 'Payment Requested - Project Update',
    introApproved: `The payment for milestone "${milestoneName}" in project "${projectName}" has been approved.`,
    introPending: `A payment has been requested for milestone "${milestoneName}" in project "${projectName}".`,
    paymentDetailsTitle: 'Payment Details:',
    milestoneLabel: 'Milestone:',
    amountLabel: 'Amount:',
    statusLabel: 'Status:',
    statusApproved: 'Approved',
    statusPending: 'Pending Payment',
    nextStepsTitle: 'Next Steps:',
    nextStepsApproved: 'The milestone has been delivered. You can review the work and proceed to the next milestone through your project dashboard.',
    nextStepsPending: 'Please review the delivered work and confirm the payment through your project dashboard.',
    ctaButton: 'View Project',
    regards: 'Best regards,',
    poweredBy: 'Powered by',
  };

  const title = isApproved ? content.titleApproved : content.titlePending;
  const intro = isApproved ? content.introApproved : content.introPending;
  const status = isApproved ? content.statusApproved : content.statusPending;
  const nextSteps = isApproved ? content.nextStepsApproved : content.nextStepsPending;

  return (
    <BaseTemplate
      language={language}
      brandingColor={brandingColor}
      companyName={companyName || freelancerCompany || 'Ruzma'}
      companyLogo={companyLogo}
      previewText={`${projectName} - ${title}`}
    >
      {/* Greeting */}
      <Text style={{ ...textStyle, textAlign, marginBottom: '24px' }}>
        {content.greeting}
      </Text>

      {/* Title */}
      <Text style={{ ...titleStyle, textAlign, color: brandingColor }}>
        {statusIcon} {title}
      </Text>

      {/* Introduction */}
      <Text style={{ ...textStyle, textAlign }}>
        {intro}
      </Text>

      {/* Payment Details */}
      <Section style={sectionStyle}>
        <Text style={{ ...headingStyle, textAlign, color: brandingColor }}>
          {content.paymentDetailsTitle}
        </Text>
        
        <div style={cardStyle}>
          <Row style={{ marginBottom: '12px' }}>
            <Column style={{ width: '30%' }}>
              <Text style={{ ...boldTextStyle, textAlign }}>
                {content.milestoneLabel}
              </Text>
            </Column>
            <Column style={{ width: '70%' }}>
              <Text style={{ ...textStyle, textAlign }}>
                {milestoneName}
              </Text>
            </Column>
          </Row>

          <Row style={{ marginBottom: '12px' }}>
            <Column style={{ width: '30%' }}>
              <Text style={{ ...boldTextStyle, textAlign }}>
                {content.amountLabel}
              </Text>
            </Column>
            <Column style={{ width: '70%' }}>
              <Text style={{ ...textStyle, textAlign, color: brandingColor, fontWeight: '600' }}>
                {formatCurrency(amount, currency)}
              </Text>
            </Column>
          </Row>

          <Row>
            <Column style={{ width: '30%' }}>
              <Text style={{ ...boldTextStyle, textAlign }}>
                {content.statusLabel}
              </Text>
            </Column>
            <Column style={{ width: '70%' }}>
              <Text style={{ 
                ...textStyle, 
                textAlign, 
                color: statusColor, 
                fontWeight: '600',
                backgroundColor: `${statusColor}20`,
                padding: '4px 12px',
                borderRadius: '20px',
                display: 'inline-block'
              }}>
                {status}
              </Text>
            </Column>
          </Row>
        </div>
      </Section>

      {/* Project Summary */}
      <Section style={sectionStyle}>
        <div style={projectCardStyle}>
          <Text style={{ ...boldTextStyle, textAlign, marginBottom: '8px', color: brandingColor }}>
            📋 {projectName}
          </Text>
          <Text style={{ ...smallTextStyle, textAlign, color: '#64748b' }}>
            {content.nextStepsTitle}
          </Text>
          <Text style={{ ...textStyle, textAlign, marginTop: '8px' }}>
            {nextSteps}
          </Text>
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

      {/* Signature */}
      <Hr style={{ margin: '32px 0 24px 0', borderTop: '1px solid #e2e8f0' }} />
      
      <Text style={{ ...textStyle, textAlign }}>
        {content.regards}
      </Text>
      <Text style={{ ...boldTextStyle, textAlign, color: brandingColor }}>
        {freelancerName}
      </Text>
      {freelancerCompany && (
        <Text style={{ ...textStyle, textAlign, color: '#64748b' }}>
          {freelancerCompany}
        </Text>
      )}

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

const cardStyle = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '24px',
  margin: '16px 0',
};

const projectCardStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '20px',
  margin: '16px 0',
};

const buttonStyle = {
  backgroundColor: '#3B82F6',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
  margin: '16px 0',
  border: 'none',
  cursor: 'pointer',
};

export default PaymentNotificationTemplate;