import React from 'react';
import { Text, Section, Row, Column, Hr } from '@react-email/components';
import { EmailLayout, Header, Footer, Button, Card, Badge } from '../components';
import { formatCurrency, formatDate, generatePreviewText } from '../utils/render';
import { emailStyles, safeStyles } from '../utils/styles';

export interface ClientInviteEmailData {
  // Project Information
  projectName: string;
  projectBrief?: string;
  totalAmount?: number;
  currency?: string;
  
  // Client Information
  clientName: string;
  clientEmail: string;
  clientToken: string;
  
  // Freelancer Information
  freelancerName: string;
  freelancerCompany?: string;
  freelancerBio?: string;
  
  // Access Information
  projectUrl: string;
  
  // Milestones (optional preview)
  milestones?: Array<{
    id: string;
    title: string;
    price: number;
  }>;
  
  // Customization
  language?: 'en' | 'ar';
  brandingColor?: string;
  inviteMessage?: string;
}

export function ClientInviteEmail({
  projectName,
  projectBrief,
  totalAmount,
  currency = 'USD',
  clientName,
  clientEmail,
  clientToken,
  freelancerName,
  freelancerCompany,
  freelancerBio,
  projectUrl,
  milestones = [],
  language = 'en',
  brandingColor,
  inviteMessage
}: ClientInviteEmailData) {
  const isRTL = language === 'ar';
  
  const translations = {
    en: {
      subject: `Project Invitation - ${projectName}`,
      greeting: `Hi ${clientName},`,
      intro: `${freelancerName} has invited you to collaborate on the project "${projectName}". You now have access to a dedicated project portal where you can track progress, communicate, and manage all project details.`,
      customIntro: inviteMessage || `You've been invited to collaborate on an exciting new project. ${freelancerName} is looking forward to working with you!`,
      projectDetails: 'Project Overview',
      projectName: 'Project',
      totalAmount: 'Total Budget',
      milestones: 'Milestones',
      milestonesCount: `${milestones.length} milestone${milestones.length !== 1 ? 's' : ''}`,
      freelancer: 'Your Freelancer',
      accessPortal: 'Access Project Portal',
      whatCanYouDo: 'What can you do in the portal?',
      portalFeatures: [
        '📊 Track project progress and milestones',
        '💬 Communicate directly with your freelancer',
        '📁 View and download project deliverables',
        '💳 Make secure payments when milestones complete',
        '🔄 Request revisions and provide feedback',
        '📈 Monitor project timeline and budget'
      ],
      getStarted: 'Getting Started',
      getStartedSteps: [
        'Click the "Access Project Portal" button above',
        'Review the project details and timeline',
        'Introduce yourself to your freelancer',
        'Ask any questions you might have'
      ],
      secureAccess: 'Secure Access',
      secureNote: 'This portal is private and secure. Only you and your freelancer can access it.',
      needHelp: 'Need Help?',
      supportNote: 'Our support team is here to help if you have any questions about using the project portal.',
      linkExpires: 'This invitation link is valid for 30 days.',
      footer: 'You received this email because you were invited to collaborate on a project through Ruzma.'
    },
    ar: {
      subject: `دعوة مشروع - ${projectName}`,
      greeting: `مرحباً ${clientName}،`,
      intro: `لقد دعاك ${freelancerName} للتعاون في مشروع "${projectName}". أصبح لديك الآن الوصول إلى بوابة مشروع مخصصة حيث يمكنك تتبع التقدم والتواصل وإدارة جميع تفاصيل المشروع.`,
      customIntro: inviteMessage || `لقد تم دعوتك للتعاون في مشروع جديد ومثير. ${freelancerName} يتطلع للعمل معك!`,
      projectDetails: 'نظرة عامة على المشروع',
      projectName: 'المشروع',
      totalAmount: 'الميزانية الإجمالية',
      milestones: 'المراحل',
      milestonesCount: `${milestones.length} مرحلة`,
      freelancer: 'المستقل الخاص بك',
      accessPortal: 'الوصول إلى بوابة المشروع',
      whatCanYouDo: 'ما يمكنك فعله في البوابة؟',
      portalFeatures: [
        '📊 تتبع تقدم المشروع والمراحل',
        '💬 التواصل المباشر مع المستقل',
        '📁 عرض وتحميل مخرجات المشروع',
        '💳 الدفع الآمن عند إكمال المراحل',
        '🔄 طلب التعديلات وتقديم التغذية الراجعة',
        '📈 مراقبة الجدول الزمني والميزانية للمشروع'
      ],
      getStarted: 'البدء',
      getStartedSteps: [
        'انقر على زر "الوصول إلى بوابة المشروع" أعلاه',
        'راجع تفاصيل المشروع والجدول الزمني',
        'عرّف بنفسك للمستقل',
        'اسأل أي أسئلة قد تكون لديك'
      ],
      secureAccess: 'الوصول الآمن',
      secureNote: 'هذه البوابة خاصة وآمنة. فقط أنت والمستقل يمكنكما الوصول إليها.',
      needHelp: 'تحتاج مساعدة؟',
      supportNote: 'فريق الدعم موجود لمساعدتك إذا كان لديك أي أسئلة حول استخدام بوابة المشروع.',
      linkExpires: 'رابط الدعوة صالح لمدة 30 يوماً.',
      footer: 'تلقيت هذا البريد الإلكتروني لأنه تم دعوتك للتعاون في مشروع من خلال رزمة.'
    }
  };
  
  const t = translations[language];
  const preview = generatePreviewText('clientInvite', { 
    projectName, 
    clientName, 
    freelancerName 
  }, language);
  
  return (
    <EmailLayout preview={preview} language={language} dir={isRTL ? 'rtl' : 'ltr'}>
      <Header language={language} />
      
      {/* Welcome Card */}
      <Card language={language} variant="elevated">
        {/* Greeting */}
        <Text style={{ 
          ...safeStyles.text.heading1, 
          textAlign: isRTL ? 'right' : 'left',
          color: emailStyles.colors.primary,
          marginBottom: emailStyles.spacing.md
        }}>
          🎉 {t.greeting.replace('Hi', language === 'ar' ? 'مرحباً' : 'Welcome')}
        </Text>
        
        {/* Introduction */}
        <Text style={{ 
          ...safeStyles.text.body, 
          textAlign: isRTL ? 'right' : 'left',
          marginBottom: emailStyles.spacing.lg,
          fontSize: '18px',
          lineHeight: '1.6'
        }}>
          {inviteMessage ? t.customIntro : t.intro}
        </Text>
        
        {/* CTA Button */}
        <Section style={{ textAlign: 'center', margin: `${emailStyles.spacing.xl} 0` }}>
          <Button
            href={projectUrl}
            variant="primary"
            size="lg"
            language={language}
            style={{
              backgroundColor: brandingColor || emailStyles.colors.primary,
              fontSize: '18px',
              padding: '16px 32px'
            }}
          >
            {t.accessPortal}
          </Button>
        </Section>
      </Card>
      
      <Hr style={{ 
        borderColor: emailStyles.colors.gray[200], 
        margin: `${emailStyles.spacing.xl} 0` 
      }} />
      
      {/* Project Details */}
      <Card language={language} variant="bordered">
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
            <Text style={{ ...safeStyles.text.small, margin: '0', textAlign: isRTL ? 'right' : 'left', fontWeight: '600' }}>
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
        
        {totalAmount && (
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
        )}
        
        {milestones.length > 0 && (
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
        )}
        
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
        
        {/* Freelancer Bio */}
        {freelancerBio && (
          <Section style={{ marginTop: emailStyles.spacing.lg }}>
            <Text style={{ 
              ...safeStyles.text.small, 
              fontWeight: '600',
              margin: '0 0 8px 0',
              textAlign: isRTL ? 'right' : 'left'
            }}>
              {language === 'ar' ? 'نبذة عن المستقل:' : 'About your freelancer:'}
            </Text>
            <Text style={{ 
              ...safeStyles.text.small, 
              margin: '0',
              fontStyle: 'italic',
              textAlign: isRTL ? 'right' : 'left'
            }}>
              "{freelancerBio}"
            </Text>
          </Section>
        )}
      </Card>
      
      {/* Portal Features */}
      <Card language={language} variant="default">
        <Text style={{ 
          ...safeStyles.text.heading2, 
          textAlign: isRTL ? 'right' : 'left',
          marginBottom: emailStyles.spacing.md
        }}>
          {t.whatCanYouDo}
        </Text>
        
        {t.portalFeatures.map((feature, index) => (
          <Text 
            key={index}
            style={{ 
              ...safeStyles.text.body, 
              textAlign: isRTL ? 'right' : 'left',
              margin: '8px 0',
              paddingLeft: isRTL ? '0' : '8px',
              paddingRight: isRTL ? '8px' : '0'
            }}
          >
            {feature}
          </Text>
        ))}
      </Card>
      
      {/* Getting Started */}
      <Card language={language} variant="highlight">
        <Text style={{ 
          ...safeStyles.text.heading2, 
          textAlign: isRTL ? 'right' : 'left',
          marginBottom: emailStyles.spacing.md,
          color: emailStyles.colors.primary
        }}>
          🚀 {t.getStarted}
        </Text>
        
        {t.getStartedSteps.map((step, index) => (
          <Text 
            key={index}
            style={{ 
              ...safeStyles.text.body, 
              textAlign: isRTL ? 'right' : 'left',
              margin: '12px 0',
              paddingLeft: isRTL ? '0' : '16px',
              paddingRight: isRTL ? '16px' : '0',
              fontWeight: index === 0 ? '600' : 'normal'
            }}
          >
            {index + 1}. {step}
          </Text>
        ))}
        
        {/* Second CTA */}
        <Section style={{ textAlign: 'center', margin: `${emailStyles.spacing.lg} 0 0 0` }}>
          <Button
            href={projectUrl}
            variant="primary"
            size="md"
            language={language}
            style={{
              backgroundColor: brandingColor || emailStyles.colors.primary
            }}
          >
            {t.accessPortal}
          </Button>
        </Section>
      </Card>
      
      {/* Security Note */}
      <Section style={{ textAlign: 'center', margin: `${emailStyles.spacing.xl} 0` }}>
        <Card variant="bordered" padding="md" language={language}>
          <Text style={{ 
            ...safeStyles.text.small, 
            fontWeight: '600',
            color: emailStyles.colors.success,
            margin: '0 0 8px 0'
          }}>
            🔒 {t.secureAccess}
          </Text>
          <Text style={{ 
            ...safeStyles.text.small, 
            margin: '0 0 16px 0',
            textAlign: 'center'
          }}>
            {t.secureNote}
          </Text>
          <Text style={{ 
            ...safeStyles.text.small, 
            color: emailStyles.colors.gray[500],
            fontStyle: 'italic',
            margin: '0'
          }}>
            {t.linkExpires}
          </Text>
        </Card>
      </Section>
      
      {/* Support Section */}
      <Section style={{ textAlign: 'center' }}>
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
          {t.supportNote}
        </Text>
      </Section>
      
      <Footer 
        language={language} 
        showUnsubscribe={false}
      />
    </EmailLayout>
  );
}