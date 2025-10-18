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

interface MilestoneUpdateTemplateProps {
  projectName: string;
  clientName: string;
  freelancerName: string;
  freelancerCompany?: string;
  milestoneName: string;
  oldStatus: 'pending' | 'in_progress' | 'review' | 'completed';
  newStatus: 'pending' | 'in_progress' | 'review' | 'completed';
  message?: string;
  projectUrl: string;
  language?: 'en' | 'ar';
  brandingColor?: string;
  companyName?: string;
  companyLogo?: string;
}

export const MilestoneUpdateTemplate: React.FC<MilestoneUpdateTemplateProps> = ({
  projectName,
  clientName,
  freelancerName,
  freelancerCompany,
  milestoneName,
  oldStatus,
  newStatus,
  message,
  projectUrl,
  language = 'en',
  brandingColor = '#3B82F6',
  companyName,
  companyLogo,
}) => {
  const isRTL = language === 'ar';
  const textAlign = isRTL ? 'right' : 'left';

  // Get content from config
  const content = getEmailContent('milestoneUpdate', language);

  // Status colors and icons
  const statusColors = {
    pending: '#94A3B8',
    in_progress: '#3B82F6',
    review: '#F59E0B',
    completed: '#10B981'
  };

  const statusIcons = {
    pending: '⏳',
    in_progress: '⚙️',
    review: '👀',
    completed: '✅'
  };

  // Get localized status names
  const getStatusName = (status: string) => {
    switch (status) {
      case 'pending': return content.pending;
      case 'in_progress': return content.inProgress;
      case 'review': return content.review;
      case 'completed': return content.completed;
      default: return status;
    }
  };

  // Replace variables
  const subject = replaceVariables(content.subject, { milestoneName });
  const greeting = replaceVariables(content.greeting, { clientName });
  const intro = replaceVariables(content.intro, { milestoneName, projectName });

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
      <Text style={{ ...titleStyle, textAlign, color: brandingColor }}>
        🎯 {content.title}
      </Text>

      {/* Introduction */}
      <Text style={{ ...textStyle, textAlign }}>
        {intro}
      </Text>

      {/* Status Change Card */}
      <Section style={sectionStyle}>
        <div style={cardStyle}>
          <Text style={{ ...headingStyle, textAlign, color: brandingColor, marginBottom: '16px' }}>
            {content.statusChangeLabel}
          </Text>

          {/* Old Status */}
          <Row style={{ marginBottom: '16px' }}>
            <Column style={{ width: '35%' }}>
              <Text style={{ ...boldTextStyle, textAlign }}>
                {content.oldStatusLabel}
              </Text>
            </Column>
            <Column style={{ width: '65%' }}>
              <Text style={{
                ...textStyle,
                textAlign,
                margin: '0',
                color: statusColors[oldStatus],
                fontWeight: '600',
                backgroundColor: `${statusColors[oldStatus]}20`,
                padding: '6px 16px',
                borderRadius: '20px',
                display: 'inline-block'
              }}>
                {statusIcons[oldStatus]} {getStatusName(oldStatus)}
              </Text>
            </Column>
          </Row>

          {/* Arrow */}
          <div style={{ textAlign: 'center', margin: '8px 0' }}>
            <Text style={{ fontSize: '24px', margin: '0', color: brandingColor }}>
              {isRTL ? '↑' : '↓'}
            </Text>
          </div>

          {/* New Status */}
          <Row style={{ marginTop: '16px' }}>
            <Column style={{ width: '35%' }}>
              <Text style={{ ...boldTextStyle, textAlign }}>
                {content.newStatusLabel}
              </Text>
            </Column>
            <Column style={{ width: '65%' }}>
              <Text style={{
                ...textStyle,
                textAlign,
                margin: '0',
                color: statusColors[newStatus],
                fontWeight: '600',
                backgroundColor: `${statusColors[newStatus]}20`,
                padding: '6px 16px',
                borderRadius: '20px',
                display: 'inline-block',
                border: `2px solid ${statusColors[newStatus]}`
              }}>
                {statusIcons[newStatus]} {getStatusName(newStatus)}
              </Text>
            </Column>
          </Row>
        </div>
      </Section>

      {/* Freelancer Message (if provided) */}
      {message && (
        <Section style={sectionStyle}>
          <div style={{
            ...messageBoxStyle,
            backgroundColor: `${brandingColor}10`,
            borderLeft: `4px solid ${brandingColor}`
          }}>
            <Text style={{ ...boldTextStyle, textAlign, marginBottom: '8px', color: brandingColor }}>
              💬 {content.messageLabel}
            </Text>
            <Text style={{ ...textStyle, textAlign, margin: '0' }}>
              "{message}"
            </Text>
          </div>
        </Section>
      )}

      {/* Project Info */}
      <Section style={sectionStyle}>
        <div style={projectCardStyle}>
          <Text style={{ ...boldTextStyle, textAlign, marginBottom: '8px', color: brandingColor }}>
            📋 {projectName}
          </Text>
          <Text style={{ ...smallTextStyle, textAlign, color: '#64748b', margin: '0' }}>
            {milestoneName}
          </Text>
        </div>
      </Section>

      {/* CTA Button */}
      <Section style={{ ...sectionStyle, textAlign: 'center' }}>
        <Button
          href={projectUrl}
          style={{
            ...buttonStyle,
            backgroundColor: statusColors[newStatus],
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

const messageBoxStyle = {
  borderRadius: '8px',
  padding: '20px 24px',
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

export default MilestoneUpdateTemplate;
