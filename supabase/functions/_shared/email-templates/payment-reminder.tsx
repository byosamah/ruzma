import {
  Text,
  Button,
  Section,
  Row,
  Column,
  Hr,
} from 'https://esm.sh/@react-email/components@0.0.25';
import React from 'https://esm.sh/react@18.2.0';
import { BaseTemplate } from './base-template.tsx';
import { getEmailContent, replaceVariables } from './content-config.ts';

interface PaymentReminderTemplateProps {
  projectName: string;
  clientName: string;
  freelancerName: string;
  freelancerCompany?: string;
  milestoneName: string;
  amount: number;
  currency: string;
  dueDate: string;
  daysUntilDue: number; // Positive = future, Negative = overdue
  projectUrl: string;
  language?: 'en' | 'ar';
  brandingColor?: string;
  companyName?: string;
  companyLogo?: string;
}

export const PaymentReminderTemplate: React.FC<PaymentReminderTemplateProps> = ({
  projectName,
  clientName,
  freelancerName,
  freelancerCompany,
  milestoneName,
  amount,
  currency,
  dueDate,
  daysUntilDue,
  projectUrl,
  language = 'en',
  brandingColor = '#3B82F6',
  companyName,
  companyLogo,
}) => {
  const isRTL = language === 'ar';
  const textAlign = isRTL ? 'right' : 'left';

  // Get content from config
  const content = getEmailContent('paymentReminder', language);

  // Determine status and styling
  const isOverdue = daysUntilDue < 0;
  const statusColor = isOverdue ? '#DC2626' : '#F59E0B'; // Red for overdue, Orange for upcoming
  const statusIcon = isOverdue ? '⚠️' : '💰';

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Replace variables
  const dueStatus = isOverdue
    ? (language === 'ar' ? 'متأخرة' : 'Overdue')
    : (language === 'ar' ? 'قادمة' : 'Due Soon');

  const subject = replaceVariables(content.subject, {
    milestoneName,
    dueStatus
  });

  const greeting = replaceVariables(content.greeting, { clientName });
  const intro = replaceVariables(content.intro, { milestoneName, projectName });

  const warningMessage = isOverdue
    ? replaceVariables(content.overdueWarning, {
        daysOverdue: Math.abs(daysUntilDue).toString()
      })
    : replaceVariables(content.upcomingNotice, {
        daysUntilDue: daysUntilDue.toString()
      });

  return (
    <BaseTemplate
      language={language}
      brandingColor={brandingColor}
      companyName={companyName || freelancerCompany || 'Ruzma'}
      companyLogo={companyLogo}
      previewText={`${projectName} - ${content.title}`}
    >
      {/* Greeting */}
      <Text style={{ ...textStyle, textAlign, marginBottom: '24px' }}>
        {greeting}
      </Text>

      {/* Title */}
      <Text style={{ ...titleStyle, textAlign, color: statusColor }}>
        {statusIcon} {content.title}
      </Text>

      {/* Introduction */}
      <Text style={{ ...textStyle, textAlign }}>
        {intro}
      </Text>

      {/* Payment Details Card */}
      <Section style={sectionStyle}>
        <div style={{
          ...cardStyle,
          borderLeft: `4px solid ${statusColor}`
        }}>
          <Row style={{ marginBottom: '12px' }}>
            <Column style={{ width: '40%' }}>
              <Text style={{ ...boldTextStyle, textAlign }}>
                {language === 'ar' ? 'المشروع:' : 'Project:'}
              </Text>
            </Column>
            <Column style={{ width: '60%' }}>
              <Text style={{ ...textStyle, textAlign, margin: '0' }}>
                {projectName}
              </Text>
            </Column>
          </Row>

          <Row style={{ marginBottom: '12px' }}>
            <Column style={{ width: '40%' }}>
              <Text style={{ ...boldTextStyle, textAlign }}>
                {language === 'ar' ? 'المعلم:' : 'Milestone:'}
              </Text>
            </Column>
            <Column style={{ width: '60%' }}>
              <Text style={{ ...textStyle, textAlign, margin: '0' }}>
                {milestoneName}
              </Text>
            </Column>
          </Row>

          <Row style={{ marginBottom: '12px' }}>
            <Column style={{ width: '40%' }}>
              <Text style={{ ...boldTextStyle, textAlign }}>
                {content.amountLabel}
              </Text>
            </Column>
            <Column style={{ width: '60%' }}>
              <Text style={{
                ...textStyle,
                textAlign,
                margin: '0',
                color: brandingColor,
                fontWeight: '600',
                fontSize: '18px'
              }}>
                {formatCurrency(amount)}
              </Text>
            </Column>
          </Row>

          <Row style={{ marginBottom: '12px' }}>
            <Column style={{ width: '40%' }}>
              <Text style={{ ...boldTextStyle, textAlign }}>
                {content.dueLabel}
              </Text>
            </Column>
            <Column style={{ width: '60%' }}>
              <Text style={{ ...textStyle, textAlign, margin: '0' }}>
                {dueDate}
              </Text>
            </Column>
          </Row>

          <Row>
            <Column style={{ width: '40%' }}>
              <Text style={{ ...boldTextStyle, textAlign }}>
                {content.statusLabel}
              </Text>
            </Column>
            <Column style={{ width: '60%' }}>
              <Text style={{
                ...textStyle,
                textAlign,
                margin: '0',
                color: statusColor,
                fontWeight: '600',
                backgroundColor: `${statusColor}20`,
                padding: '4px 12px',
                borderRadius: '20px',
                display: 'inline-block'
              }}>
                {dueStatus}
              </Text>
            </Column>
          </Row>
        </div>
      </Section>

      {/* Warning/Notice Box */}
      <Section style={sectionStyle}>
        <div style={{
          ...noticeBoxStyle,
          backgroundColor: `${statusColor}15`,
          borderLeft: `4px solid ${statusColor}`
        }}>
          <Text style={{ ...textStyle, textAlign, margin: '0', color: '#374151' }}>
            {warningMessage}
          </Text>
        </div>
      </Section>

      {/* CTA Button */}
      <Section style={{ ...sectionStyle, textAlign: 'center' }}>
        <Button
          href={projectUrl}
          style={{
            ...buttonStyle,
            backgroundColor: statusColor,
          }}
        >
          {content.cta}
        </Button>
      </Section>

      {/* Signature */}
      <Hr style={{ margin: '32px 0 24px 0', borderTop: '1px solid #e2e8f0' }} />

      <Text style={{ ...textStyle, textAlign }}>
        {content.closing}
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

const noticeBoxStyle = {
  borderRadius: '8px',
  padding: '20px 24px',
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

export default PaymentReminderTemplate;
