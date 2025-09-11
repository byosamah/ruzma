import {
  Text,
  Button,
  Section,
  Row,
  Column,
  Hr,
} from '@react-email/components';
import React from 'react';
import { BaseTemplate } from './base-template';

interface ContractApprovalTemplateProps {
  projectName: string;
  projectBrief: string;
  clientName: string;
  clientEmail: string;
  freelancerName: string;
  freelancerCompany?: string;
  contractUrl: string;
  approvalToken: string;
  totalAmount: number;
  currency: string;
  milestones: Array<{
    title: string;
    description: string;
    price: number;
  }>;
  language?: 'en' | 'ar';
  brandingColor?: string;
  companyName?: string;
  companyLogo?: string;
}

export const ContractApprovalTemplate: React.FC<ContractApprovalTemplateProps> = ({
  projectName,
  projectBrief,
  clientName,
  freelancerName,
  freelancerCompany,
  contractUrl,
  totalAmount,
  currency,
  milestones = [],
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

  const content = isRTL ? {
    greeting: `مرحباً ${clientName}،`,
    title: 'مراجعة وموافقة على عقد المشروع',
    intro: `يسعدنا أن نقدم لك عقد المشروع "${projectName}" للمراجعة والموافقة.`,
    projectDetailsTitle: 'تفاصيل المشروع:',
    totalAmountLabel: 'المبلغ الإجمالي:',
    milestonesTitle: 'معالم المشروع:',
    instructionsTitle: 'خطوات الموافقة:',
    instruction1: 'انقر على زر "مراجعة العقد" أدناه',
    instruction2: 'اقرأ تفاصيل المشروع والشروط بعناية',
    instruction3: 'انقر على "موافق" إذا كنت توافق على الشروط',
    instruction4: 'ستتلقى تأكيداً بالبريد الإلكتروني بعد الموافقة',
    ctaButton: 'مراجعة العقد والموافقة',
    note: 'ملاحظة: هذا الرابط صالح لمدة 30 يوماً. إذا كان لديك أي أسئلة، يرجى الرد على هذا البريد الإلكتروني.',
    regards: 'مع أطيب التحيات،',
    poweredBy: 'مدعوم بواسطة',
  } : {
    greeting: `Hello ${clientName},`,
    title: 'Project Contract Review & Approval',
    intro: `We're pleased to present the "${projectName}" project contract for your review and approval.`,
    projectDetailsTitle: 'Project Details:',
    totalAmountLabel: 'Total Amount:',
    milestonesTitle: 'Project Milestones:',
    instructionsTitle: 'How to approve:',
    instruction1: 'Click the "Review Contract" button below',
    instruction2: 'Carefully review the project details and terms',
    instruction3: 'Click "Approve" if you agree to the terms',
    instruction4: 'You\'ll receive an email confirmation after approval',
    ctaButton: 'Review & Approve Contract',
    note: 'Note: This link is valid for 30 days. If you have any questions, please reply to this email.',
    regards: 'Best regards,',
    poweredBy: 'Powered by',
  };

  return (
    <BaseTemplate
      language={language}
      brandingColor={brandingColor}
      companyName={companyName || freelancerCompany || 'Ruzma'}
      companyLogo={companyLogo}
      previewText={`${projectName} - Contract Approval Required`}
    >
      {/* Greeting */}
      <Text style={{ ...textStyle, textAlign, marginBottom: '24px' }}>
        {content.greeting}
      </Text>

      {/* Title */}
      <Text style={{ ...titleStyle, textAlign, color: brandingColor }}>
        {content.title}
      </Text>

      {/* Introduction */}
      <Text style={{ ...textStyle, textAlign }}>
        {content.intro}
      </Text>

      {/* Project Details */}
      <Section style={sectionStyle}>
        <Text style={{ ...headingStyle, textAlign, color: brandingColor }}>
          {content.projectDetailsTitle}
        </Text>
        
        <div style={cardStyle}>
          <Text style={{ ...boldTextStyle, textAlign, marginBottom: '8px' }}>
            {projectName}
          </Text>
          <Text style={{ ...textStyle, textAlign, marginBottom: '16px', color: '#64748b' }}>
            {projectBrief}
          </Text>
          <Text style={{ ...boldTextStyle, textAlign, color: brandingColor }}>
            {content.totalAmountLabel} {formatCurrency(totalAmount, currency)}
          </Text>
        </div>
      </Section>

      {/* Milestones */}
      {milestones.length > 0 && (
        <Section style={sectionStyle}>
          <Text style={{ ...headingStyle, textAlign, color: brandingColor }}>
            {content.milestonesTitle}
          </Text>
          
          {milestones.map((milestone, index) => (
            <div key={index} style={milestoneCardStyle}>
              <Row>
                <Column style={{ width: '70%' }}>
                  <Text style={{ ...boldTextStyle, textAlign, marginBottom: '4px' }}>
                    {milestone.title}
                  </Text>
                  <Text style={{ ...smallTextStyle, textAlign, color: '#64748b' }}>
                    {milestone.description}
                  </Text>
                </Column>
                <Column style={{ width: '30%', textAlign: isRTL ? 'left' : 'right' }}>
                  <Text style={{ ...boldTextStyle, color: brandingColor }}>
                    {formatCurrency(milestone.price, currency)}
                  </Text>
                </Column>
              </Row>
            </div>
          ))}
        </Section>
      )}

      {/* Instructions */}
      <Section style={sectionStyle}>
        <Text style={{ ...headingStyle, textAlign, color: brandingColor }}>
          {content.instructionsTitle}
        </Text>
        
        <ol style={{ ...listStyle, textAlign, paddingLeft: isRTL ? '0' : '20px', paddingRight: isRTL ? '20px' : '0' }}>
          <li style={listItemStyle}>{content.instruction1}</li>
          <li style={listItemStyle}>{content.instruction2}</li>
          <li style={listItemStyle}>{content.instruction3}</li>
          <li style={listItemStyle}>{content.instruction4}</li>
        </ol>
      </Section>

      {/* CTA Button */}
      <Section style={{ ...sectionStyle, textAlign: 'center' }}>
        <Button
          href={contractUrl}
          style={{
            ...buttonStyle,
            backgroundColor: brandingColor,
          }}
        >
          {content.ctaButton}
        </Button>
      </Section>

      {/* Note */}
      <Section style={sectionStyle}>
        <Text style={{ ...smallTextStyle, textAlign, color: '#64748b', fontStyle: 'italic' }}>
          {content.note}
        </Text>
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

const milestoneCardStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  padding: '16px',
  margin: '12px 0',
};

const listStyle = {
  margin: '16px 0',
  padding: '0',
};

const listItemStyle = {
  margin: '8px 0',
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#374151',
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

export default ContractApprovalTemplate;