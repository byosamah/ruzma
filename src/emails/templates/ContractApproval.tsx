import React from 'react';
import { Text, Section, Row, Column, Hr } from '@react-email/components';
import { EmailLayout, Header, Footer, Button, Card, Badge } from '../components';
import { formatCurrency, formatDate, generatePreviewText } from '../utils/render';
import { emailStyles, safeStyles } from '../utils/styles';

export interface ContractApprovalEmailData {
  // Project Information
  projectName: string;
  projectBrief?: string;
  totalAmount: number;
  currency: string;
  startDate?: string;
  endDate?: string;
  
  // Client Information
  clientName: string;
  clientEmail: string;
  
  // Freelancer Information
  freelancerName: string;
  freelancerCompany?: string;
  
  // Contract Information
  contractUrl: string;
  approvalToken: string;
  
  // Milestones
  milestones: Array<{
    id: string;
    title: string;
    description?: string;
    price: number;
    deliverable?: string;
  }>;
  
  // Customization
  language?: 'en' | 'ar';
  brandingColor?: string;
}

export function ContractApprovalEmail({
  projectName,
  projectBrief,
  totalAmount,
  currency = 'USD',
  startDate,
  endDate,
  clientName,
  clientEmail,
  freelancerName,
  freelancerCompany,
  contractUrl,
  approvalToken,
  milestones = [],
  language = 'en',
  brandingColor
}: ContractApprovalEmailData) {
  const isRTL = language === 'ar';
  
  const translations = {
    en: {
      subject: `Contract Approval Required - ${projectName}`,
      greeting: `Hi ${clientName},`,
      intro: `${freelancerName} has sent you a contract for the project "${projectName}". Please review and approve the contract to get started.`,
      projectDetails: 'Project Details',
      projectName: 'Project Name',
      totalAmount: 'Total Amount',
      timeline: 'Timeline',
      milestones: 'Milestones',
      milestone: 'Milestone',
      milestonesCount: `${milestones.length} milestone${milestones.length !== 1 ? 's' : ''}`,
      freelancer: 'Freelancer',
      reviewContract: 'Review & Approve Contract',
      important: 'Important',
      approvalNote: 'By approving this contract, you agree to the terms and payment schedule outlined in the project milestones.',
      needHelp: 'Need help?',
      contactSupport: 'Contact our support team if you have any questions about this contract.',
      expires: 'This contract approval link will expire in 30 days.',
      footer: 'This email was sent because you were invited to review a project contract on Ruzma.',
      from: 'From',
      to: 'To',
      startDate: 'Start Date',
      endDate: 'End Date'
    },
    ar: {
      subject: `مطلوب الموافقة على العقد - ${projectName}`,
      greeting: `مرحباً ${clientName}،`,
      intro: `لقد أرسل ${freelancerName} عقداً لمشروع "${projectName}". يرجى مراجعة العقد والموافقة عليه للبدء.`,
      projectDetails: 'تفاصيل المشروع',
      projectName: 'اسم المشروع',
      totalAmount: 'المبلغ الإجمالي',
      timeline: 'الجدول الزمني',
      milestones: 'المراحل',
      milestone: 'مرحلة',
      milestonesCount: `${milestones.length} مرحلة`,
      freelancer: 'المستقل',
      reviewContract: 'مراجعة والموافقة على العقد',
      important: 'مهم',
      approvalNote: 'بالموافقة على هذا العقد، فإنك توافق على الشروط وجدول الدفعات المحدد في مراحل المشروع.',
      needHelp: 'تحتاج مساعدة؟',
      contactSupport: 'تواصل مع فريق الدعم إذا كان لديك أي أسئلة حول هذا العقد.',
      expires: 'سينتهي رابط الموافقة على العقد خلال 30 يوماً.',
      footer: 'تم إرسال هذا البريد الإلكتروني لأنه تم دعوتك لمراجعة عقد مشروع في رزمة.',
      from: 'من',
      to: 'إلى',
      startDate: 'تاريخ البداية',
      endDate: 'تاريخ الانتهاء'
    }
  };
  
  const t = translations[language];
  const preview = generatePreviewText('contractApproval', { projectName, clientName, freelancerName }, language);
  
  return (
    <EmailLayout preview={preview} language={language} dir={isRTL ? 'rtl' : 'ltr'}>
      <Header language={language} />
      
      {/* Main Content Card */}
      <Card language={language} variant="elevated">
        {/* Greeting */}
        <Text style={{ ...safeStyles.text.body, textAlign: isRTL ? 'right' : 'left' }}>
          {t.greeting}
        </Text>
        
        {/* Introduction */}
        <Text style={{ 
          ...safeStyles.text.body, 
          textAlign: isRTL ? 'right' : 'left',
          marginBottom: emailStyles.spacing.lg 
        }}>
          {t.intro}
        </Text>
        
        {/* CTA Button */}
        <Section style={{ textAlign: 'center', margin: `${emailStyles.spacing.xl} 0` }}>
          <Button
            href={contractUrl}
            variant="primary"
            size="lg"
            language={language}
            style={{
              backgroundColor: brandingColor || emailStyles.colors.primary
            }}
          >
            {t.reviewContract}
          </Button>
        </Section>
        
        <Hr style={{ 
          borderColor: emailStyles.colors.gray[200], 
          margin: `${emailStyles.spacing.xl} 0` 
        }} />
        
        {/* Project Details */}
        <Section>
          <Text style={{ 
            ...safeStyles.text.heading2, 
            textAlign: isRTL ? 'right' : 'left',
            marginBottom: emailStyles.spacing.md
          }}>
            {t.projectDetails}
          </Text>
          
          <Row>
            <Column style={{ paddingRight: isRTL ? '0' : emailStyles.spacing.md, paddingLeft: isRTL ? emailStyles.spacing.md : '0' }}>
              <Text style={{ ...safeStyles.text.small, fontWeight: '600', margin: '0', textAlign: isRTL ? 'right' : 'left' }}>
                {t.projectName}:
              </Text>
            </Column>
            <Column>
              <Text style={{ ...safeStyles.text.small, margin: '0', textAlign: isRTL ? 'right' : 'left' }}>
                {projectName}
              </Text>
            </Column>
          </Row>
          
          <Row style={{ marginTop: emailStyles.spacing.sm }}>
            <Column style={{ paddingRight: isRTL ? '0' : emailStyles.spacing.md, paddingLeft: isRTL ? emailStyles.spacing.md : '0' }}>
              <Text style={{ ...safeStyles.text.small, fontWeight: '600', margin: '0', textAlign: isRTL ? 'right' : 'left' }}>
                {t.freelancer}:
              </Text>
            </Column>
            <Column>
              <Text style={{ ...safeStyles.text.small, margin: '0', textAlign: isRTL ? 'right' : 'left' }}>
                {freelancerName}
                {freelancerCompany && ` (${freelancerCompany})`}
              </Text>
            </Column>
          </Row>
          
          <Row style={{ marginTop: emailStyles.spacing.sm }}>
            <Column style={{ paddingRight: isRTL ? '0' : emailStyles.spacing.md, paddingLeft: isRTL ? emailStyles.spacing.md : '0' }}>
              <Text style={{ ...safeStyles.text.small, fontWeight: '600', margin: '0', textAlign: isRTL ? 'right' : 'left' }}>
                {t.totalAmount}:
              </Text>
            </Column>
            <Column>
              <Text style={{ 
                ...safeStyles.text.small, 
                margin: '0', 
                fontWeight: '600',
                color: emailStyles.colors.success,
                textAlign: isRTL ? 'right' : 'left'
              }}>
                {formatCurrency(totalAmount, currency)}
              </Text>
            </Column>
          </Row>
          
          {/* Timeline */}
          {(startDate || endDate) && (
            <Row style={{ marginTop: emailStyles.spacing.sm }}>
              <Column style={{ paddingRight: isRTL ? '0' : emailStyles.spacing.md, paddingLeft: isRTL ? emailStyles.spacing.md : '0' }}>
                <Text style={{ ...safeStyles.text.small, fontWeight: '600', margin: '0', textAlign: isRTL ? 'right' : 'left' }}>
                  {t.timeline}:
                </Text>
              </Column>
              <Column>
                <Text style={{ ...safeStyles.text.small, margin: '0', textAlign: isRTL ? 'right' : 'left' }}>
                  {startDate && `${t.startDate}: ${formatDate(startDate, language)}`}
                  {startDate && endDate && ' | '}
                  {endDate && `${t.endDate}: ${formatDate(endDate, language)}`}
                </Text>
              </Column>
            </Row>
          )}
          
          <Row style={{ marginTop: emailStyles.spacing.sm }}>
            <Column style={{ paddingRight: isRTL ? '0' : emailStyles.spacing.md, paddingLeft: isRTL ? emailStyles.spacing.md : '0' }}>
              <Text style={{ ...safeStyles.text.small, fontWeight: '600', margin: '0', textAlign: isRTL ? 'right' : 'left' }}>
                {t.milestones}:
              </Text>
            </Column>
            <Column>
              <Badge variant="primary" size="sm" language={language}>
                {t.milestonesCount}
              </Badge>
            </Column>
          </Row>
        </Section>
        
        {/* Project Brief */}
        {projectBrief && (
          <Section style={{ marginTop: emailStyles.spacing.lg }}>
            <Card variant="highlight" padding="md" language={language}>
              <Text style={{ 
                ...safeStyles.text.body, 
                textAlign: isRTL ? 'right' : 'left',
                fontSize: '14px',
                lineHeight: '1.6',
                margin: '0'
              }}>
                {projectBrief}
              </Text>
            </Card>
          </Section>
        )}
        
        {/* Milestones List */}
        {milestones.length > 0 && (
          <Section style={{ marginTop: emailStyles.spacing.xl }}>
            <Text style={{ 
              ...safeStyles.text.heading2, 
              textAlign: isRTL ? 'right' : 'left',
              marginBottom: emailStyles.spacing.md
            }}>
              {t.milestones}
            </Text>
            
            {milestones.map((milestone, index) => (
              <Card key={milestone.id} variant="bordered" padding="md" language={language}>
                <Row>
                  <Column style={{ width: '80%' }}>
                    <Text style={{ 
                      ...safeStyles.text.small, 
                      fontWeight: '600', 
                      margin: '0 0 4px 0',
                      textAlign: isRTL ? 'right' : 'left'
                    }}>
                      {t.milestone} {index + 1}: {milestone.title}
                    </Text>
                    {milestone.description && (
                      <Text style={{ 
                        ...safeStyles.text.small, 
                        margin: '0',
                        color: emailStyles.colors.gray[500],
                        textAlign: isRTL ? 'right' : 'left'
                      }}>
                        {milestone.description}
                      </Text>
                    )}
                  </Column>
                  <Column style={{ width: '20%' }} align={isRTL ? 'left' : 'right'}>
                    <Text style={{ 
                      ...safeStyles.text.small, 
                      fontWeight: '600',
                      margin: '0',
                      color: emailStyles.colors.primary
                    }}>
                      {formatCurrency(milestone.price, currency)}
                    </Text>
                  </Column>
                </Row>
              </Card>
            ))}
          </Section>
        )}
        
        {/* Important Note */}
        <Section style={{ marginTop: emailStyles.spacing.xl }}>
          <Card variant="highlight" padding="md" language={language}>
            <Text style={{ 
              ...safeStyles.text.small, 
              fontWeight: '600',
              color: emailStyles.colors.warning,
              margin: '0 0 8px 0',
              textAlign: isRTL ? 'right' : 'left'
            }}>
              ⚠️ {t.important}
            </Text>
            <Text style={{ 
              ...safeStyles.text.small, 
              margin: '0',
              textAlign: isRTL ? 'right' : 'left'
            }}>
              {t.approvalNote}
            </Text>
          </Card>
        </Section>
        
        {/* Help Section */}
        <Section style={{ marginTop: emailStyles.spacing.lg, textAlign: 'center' }}>
          <Text style={{ 
            ...safeStyles.text.small, 
            color: emailStyles.colors.gray[500],
            margin: '0 0 8px 0'
          }}>
            {t.needHelp}
          </Text>
          <Text style={{ 
            ...safeStyles.text.small, 
            color: emailStyles.colors.gray[500],
            margin: '0'
          }}>
            {t.contactSupport}
          </Text>
        </Section>
        
        {/* Expiration Notice */}
        <Section style={{ marginTop: emailStyles.spacing.md, textAlign: 'center' }}>
          <Text style={{ 
            ...safeStyles.text.small, 
            color: emailStyles.colors.gray[500],
            fontStyle: 'italic',
            margin: '0'
          }}>
            {t.expires}
          </Text>
        </Section>
      </Card>
      
      <Footer 
        language={language} 
        showUnsubscribe={false}
      />
    </EmailLayout>
  );
}