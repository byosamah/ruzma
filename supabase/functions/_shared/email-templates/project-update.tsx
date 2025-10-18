import {
  Text,
  Button,
  Section,
  Hr,
} from 'https://esm.sh/@react-email/components@0.0.25';
import React from 'https://esm.sh/react@18.2.0';
import { BaseTemplate } from './base-template.tsx';
import { getEmailContent, replaceVariables } from './content-config.ts';

interface ProjectUpdateTemplateProps {
  projectName: string;
  clientName: string;
  freelancerName: string;
  freelancerCompany?: string;
  updateType: 'status_change' | 'milestone_added' | 'timeline_change' | 'general';
  updateDetails: string;
  projectUrl: string;
  language?: 'en' | 'ar';
  brandingColor?: string;
  companyName?: string;
  companyLogo?: string;
}

export const ProjectUpdateTemplate: React.FC<ProjectUpdateTemplateProps> = ({
  projectName,
  clientName,
  freelancerName,
  freelancerCompany,
  updateType,
  updateDetails,
  projectUrl,
  language = 'en',
  brandingColor = '#3B82F6',
  companyName,
  companyLogo,
}) => {
  const isRTL = language === 'ar';
  const textAlign = isRTL ? 'right' : 'left';

  // Get content from config
  const content = getEmailContent('projectUpdate', language);

  // Replace variables in content
  const subject = replaceVariables(content.subject, { projectName });
  const greeting = replaceVariables(content.greeting, { clientName });
  const intro = replaceVariables(content.intro, { projectName });
  const body = replaceVariables(content.body, { updateDetails });

  // Update type icons
  const updateIcons = {
    status_change: '📊',
    milestone_added: '🎯',
    timeline_change: '📅',
    general: '📋'
  };

  const updateIcon = updateIcons[updateType] || '📋';

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
        {updateIcon} {content.title}
      </Text>

      {/* Introduction */}
      <Text style={{ ...textStyle, textAlign }}>
        {intro}
      </Text>

      {/* Update Details Card */}
      <Section style={sectionStyle}>
        <div style={cardStyle}>
          <Text style={{ ...textStyle, textAlign, marginBottom: '8px', fontWeight: '600', color: brandingColor }}>
            📋 {projectName}
          </Text>
          <Text style={{ ...textStyle, textAlign, margin: '0' }}>
            {body}
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

export default ProjectUpdateTemplate;
