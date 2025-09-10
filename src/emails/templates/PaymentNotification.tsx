import React from 'react';
import { Text, Section, Row, Column, Hr } from '@react-email/components';
import { EmailLayout, Header, Footer, Button, Card, Badge } from '../components';
import { formatCurrency, formatDate, generatePreviewText } from '../utils/render';
import { emailStyles, safeStyles } from '../utils/styles';

export interface PaymentNotificationEmailData {
  // Project Information
  projectName: string;
  projectId: string;
  
  // Client Information
  clientName: string;
  clientEmail: string;
  clientToken: string;
  
  // Freelancer Information
  freelancerName: string;
  freelancerCompany?: string;
  
  // Payment Information
  milestoneName: string;
  milestoneDescription?: string;
  amount: number;
  currency: string;
  dueDate?: string;
  isApproved: boolean;
  
  // Status and Actions
  paymentUrl?: string;
  projectUrl: string;
  
  // Customization
  language?: 'en' | 'ar';
  brandingColor?: string;
}

export function PaymentNotificationEmail({
  projectName,
  projectId,
  clientName,
  clientEmail,
  clientToken,
  freelancerName,
  freelancerCompany,
  milestoneName,
  milestoneDescription,
  amount,
  currency = 'USD',
  dueDate,
  isApproved,
  paymentUrl,
  projectUrl,
  language = 'en',
  brandingColor
}: PaymentNotificationEmailData) {
  const isRTL = language === 'ar';
  
  const translations = {
    en: {
      subjectApproved: `Payment Received - ${projectName}`,
      subjectPending: `Payment Due - ${projectName}`,
      greetingApproved: `Great news, ${clientName}!`,
      greetingPending: `Hi ${clientName},`,
      introApproved: `We've received your payment for "${milestoneName}" in the project "${projectName}". ${freelancerName} has been notified and will begin work on the next milestone.`,
      introPending: `The milestone "${milestoneName}" for your project "${projectName}" has been completed and is ready for payment.`,
      paymentDetails: 'Payment Details',
      milestone: 'Milestone',
      amount: 'Amount',
      dueDate: 'Due Date',
      status: 'Status',
      freelancer: 'Freelancer',
      project: 'Project',
      statusPaid: 'Paid ✅',
      statusPending: 'Payment Required 🔔',
      makePayment: 'Make Payment',
      viewProject: 'View Project',
      nextSteps: 'What\'s Next?',
      nextStepsApproved: [
        `${freelancerName} will begin work on the next milestone`,
        'You\'ll receive updates as work progresses',
        'Feel free to communicate through the project portal'
      ],
      nextStepsPending: [
        'Review the completed milestone deliverables',
        'Make payment to continue project progress',
        'Contact the freelancer if you have questions'
      ],
      paymentInstructions: 'Payment Instructions',
      paymentNote: 'Please make payment within 7 days to keep your project on schedule. Late payments may delay project completion.',
      thankYou: 'Thank you for your payment!',
      receivedNote: 'Your payment helps keep projects moving smoothly and freelancers motivated.',
      needHelp: 'Need Help?',
      contactSupport: 'Contact support if you have any questions about this payment.',
      viewInPortal: 'View full details in your project portal'
    },
    ar: {
      subjectApproved: `تم استلام الدفعة - ${projectName}`,
      subjectPending: `مطلوب الدفع - ${projectName}`,
      greetingApproved: `أخبار رائعة، ${clientName}!`,
      greetingPending: `مرحباً ${clientName}،`,
      introApproved: `لقد استلمنا دفعتك لـ "${milestoneName}" في مشروع "${projectName}". تم إخطار ${freelancerName} وسيبدأ العمل في المرحلة التالية.`,
      introPending: `تم إنجاز المرحلة "${milestoneName}" لمشروعك "${projectName}" وهي جاهزة للدفع.`,
      paymentDetails: 'تفاصيل الدفع',
      milestone: 'المرحلة',
      amount: 'المبلغ',
      dueDate: 'تاريخ الاستحقاق',
      status: 'الحالة',
      freelancer: 'المستقل',
      project: 'المشروع',
      statusPaid: 'مدفوعة ✅',
      statusPending: 'مطلوب الدفع 🔔',
      makePayment: 'الدفع الآن',
      viewProject: 'عرض المشروع',
      nextSteps: 'ما هي الخطوات التالية؟',
      nextStepsApproved: [
        `سيبدأ ${freelancerName} العمل في المرحلة التالية`,
        'ستتلقى تحديثات مع تقدم العمل',
        'لا تتردد في التواصل من خلال بوابة المشروع'
      ],
      nextStepsPending: [
        'مراجعة المخرجات المكتملة للمرحلة',
        'الدفع لمتابعة تقدم المشروع',
        'تواصل مع المستقل إذا كان لديك أسئلة'
      ],
      paymentInstructions: 'تعليمات الدفع',
      paymentNote: 'يرجى الدفع خلال 7 أيام للحفاظ على جدول المشروع. التأخر في الدفع قد يؤخر إنجاز المشروع.',
      thankYou: 'شكراً لك على الدفعة!',
      receivedNote: 'دفعتك تساعد في سير المشاريع بسلاسة وتحفيز المستقلين.',
      needHelp: 'تحتاج مساعدة؟',
      contactSupport: 'تواصل مع الدعم إذا كان لديك أي أسئلة حول هذه الدفعة.',
      viewInPortal: 'عرض التفاصيل الكاملة في بوابة مشروعك'
    }
  };
  
  const t = translations[language];
  const preview = generatePreviewText('paymentNotification', { 
    projectName, 
    milestoneName, 
    isApproved, 
    freelancerName 
  }, language);
  
  const statusColor = isApproved ? emailStyles.colors.success : emailStyles.colors.warning;
  const statusBadgeVariant = isApproved ? 'success' : 'warning';
  
  return (
    <EmailLayout preview={preview} language={language} dir={isRTL ? 'rtl' : 'ltr'}>
      <Header language={language} />
      
      {/* Main Content Card */}
      <Card language={language} variant="elevated">
        {/* Greeting */}
        <Text style={{ 
          ...safeStyles.text.heading2, 
          textAlign: isRTL ? 'right' : 'left',
          color: statusColor,
          marginBottom: emailStyles.spacing.md
        }}>
          {isApproved ? t.greetingApproved : t.greetingPending}
        </Text>
        
        {/* Introduction */}
        <Text style={{ 
          ...safeStyles.text.body, 
          textAlign: isRTL ? 'right' : 'left',
          marginBottom: emailStyles.spacing.lg 
        }}>
          {isApproved ? t.introApproved : t.introPending}
        </Text>
        
        {/* Status Badge */}
        <Section style={{ textAlign: 'center', margin: `${emailStyles.spacing.lg} 0` }}>
          <Badge variant={statusBadgeVariant} size="lg" language={language}>
            {isApproved ? t.statusPaid : t.statusPending}
          </Badge>
        </Section>
        
        {/* CTA Buttons */}
        <Section style={{ textAlign: 'center', margin: `${emailStyles.spacing.xl} 0` }}>
          {!isApproved && paymentUrl && (
            <Button
              href={paymentUrl}
              variant="primary"
              size="lg"
              language={language}
              style={{
                backgroundColor: brandingColor || emailStyles.colors.primary,
                marginBottom: emailStyles.spacing.md
              }}
            >
              {t.makePayment}
            </Button>
          )}
          
          <Button
            href={projectUrl}
            variant={isApproved ? "primary" : "secondary"}
            size="md"
            language={language}
            style={{
              backgroundColor: isApproved ? (brandingColor || emailStyles.colors.primary) : 'transparent'
            }}
          >
            {t.viewProject}
          </Button>
        </Section>
        
        <Hr style={{ 
          borderColor: emailStyles.colors.gray[200], 
          margin: `${emailStyles.spacing.xl} 0` 
        }} />
        
        {/* Payment Details */}
        <Section>
          <Text style={{ 
            ...safeStyles.text.heading2, 
            textAlign: isRTL ? 'right' : 'left',
            marginBottom: emailStyles.spacing.md
          }}>
            {t.paymentDetails}
          </Text>
          
          <Row>
            <Column style={{ paddingRight: isRTL ? '0' : emailStyles.spacing.md, paddingLeft: isRTL ? emailStyles.spacing.md : '0' }}>
              <Text style={{ ...safeStyles.text.small, fontWeight: '600', margin: '0', textAlign: isRTL ? 'right' : 'left' }}>
                {t.project}:
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
                {t.milestone}:
              </Text>
            </Column>
            <Column>
              <Text style={{ ...safeStyles.text.small, margin: '0', textAlign: isRTL ? 'right' : 'left' }}>
                {milestoneName}
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
                {t.amount}:
              </Text>
            </Column>
            <Column>
              <Text style={{ 
                ...safeStyles.text.small, 
                margin: '0', 
                fontWeight: '600',
                color: statusColor,
                fontSize: '18px',
                textAlign: isRTL ? 'right' : 'left'
              }}>
                {formatCurrency(amount, currency)}
              </Text>
            </Column>
          </Row>
          
          {dueDate && !isApproved && (
            <Row style={{ marginTop: emailStyles.spacing.sm }}>
              <Column style={{ paddingRight: isRTL ? '0' : emailStyles.spacing.md, paddingLeft: isRTL ? emailStyles.spacing.md : '0' }}>
                <Text style={{ ...safeStyles.text.small, fontWeight: '600', margin: '0', textAlign: isRTL ? 'right' : 'left' }}>
                  {t.dueDate}:
                </Text>
              </Column>
              <Column>
                <Text style={{ 
                  ...safeStyles.text.small, 
                  margin: '0',
                  color: emailStyles.colors.warning,
                  fontWeight: '500',
                  textAlign: isRTL ? 'right' : 'left'
                }}>
                  {formatDate(dueDate, language)}
                </Text>
              </Column>
            </Row>
          )}
        </Section>
        
        {/* Milestone Description */}
        {milestoneDescription && (
          <Section style={{ marginTop: emailStyles.spacing.lg }}>
            <Card variant="highlight" padding="md" language={language}>
              <Text style={{ 
                ...safeStyles.text.body, 
                textAlign: isRTL ? 'right' : 'left',
                fontSize: '14px',
                lineHeight: '1.6',
                margin: '0'
              }}>
                {milestoneDescription}
              </Text>
            </Card>
          </Section>
        )}
        
        {/* What's Next Section */}
        <Section style={{ marginTop: emailStyles.spacing.xl }}>
          <Text style={{ 
            ...safeStyles.text.heading2, 
            textAlign: isRTL ? 'right' : 'left',
            marginBottom: emailStyles.spacing.md
          }}>
            {t.nextSteps}
          </Text>
          
          <Card variant="bordered" padding="md" language={language}>
            {(isApproved ? t.nextStepsApproved : t.nextStepsPending).map((step, index) => (
              <Text 
                key={index}
                style={{ 
                  ...safeStyles.text.small, 
                  textAlign: isRTL ? 'right' : 'left',
                  margin: index === 0 ? '0 0 8px 0' : '8px 0',
                  paddingLeft: isRTL ? '0' : '16px',
                  paddingRight: isRTL ? '16px' : '0'
                }}
              >
                • {step}
              </Text>
            ))}
          </Card>
        </Section>
        
        {/* Payment Instructions or Thank You */}
        <Section style={{ marginTop: emailStyles.spacing.xl }}>
          {isApproved ? (
            <Card variant="highlight" padding="lg" language={language}>
              <Text style={{ 
                ...safeStyles.text.heading2, 
                textAlign: 'center',
                color: emailStyles.colors.success,
                margin: '0 0 16px 0'
              }}>
                {t.thankYou}
              </Text>
              <Text style={{ 
                ...safeStyles.text.body, 
                textAlign: 'center',
                margin: '0'
              }}>
                {t.receivedNote}
              </Text>
            </Card>
          ) : (
            <Card variant="highlight" padding="md" language={language}>
              <Text style={{ 
                ...safeStyles.text.small, 
                fontWeight: '600',
                color: emailStyles.colors.warning,
                margin: '0 0 8px 0',
                textAlign: isRTL ? 'right' : 'left'
              }}>
                💳 {t.paymentInstructions}
              </Text>
              <Text style={{ 
                ...safeStyles.text.small, 
                margin: '0',
                textAlign: isRTL ? 'right' : 'left'
              }}>
                {t.paymentNote}
              </Text>
            </Card>
          )}
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
            margin: '0 0 16px 0'
          }}>
            {t.contactSupport}
          </Text>
          <Text style={{ 
            ...safeStyles.text.small, 
            color: emailStyles.colors.primary,
            margin: '0'
          }}>
            {t.viewInPortal}
          </Text>
        </Section>
      </Card>
      
      <Footer 
        language={language} 
        showUnsubscribe={true}
      />
    </EmailLayout>
  );
}