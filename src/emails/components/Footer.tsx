import React from 'react';
import { Section, Row, Column, Text, Link, Hr } from '@react-email/components';
import { emailStyles, safeStyles } from '../utils/styles';
import { getCompanyInfo } from '../utils/render';

interface FooterProps {
  language?: 'en' | 'ar';
  showUnsubscribe?: boolean;
  unsubscribeUrl?: string;
}

export function Footer({ 
  language = 'en', 
  showUnsubscribe = true,
  unsubscribeUrl 
}: FooterProps) {
  const company = getCompanyInfo();
  const isRTL = language === 'ar';
  const currentYear = new Date().getFullYear();
  
  const translations = {
    en: {
      copyright: `© ${currentYear} ${company.name}. All rights reserved.`,
      support: 'Need help?',
      contactUs: 'Contact us',
      unsubscribe: 'Unsubscribe from these emails',
      address: company.address.en,
      followUs: 'Follow us',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service'
    },
    ar: {
      copyright: `© ${currentYear} ${company.name}. جميع الحقوق محفوظة.`,
      support: 'تحتاج مساعدة؟',
      contactUs: 'اتصل بنا',
      unsubscribe: 'إلغاء الاشتراك من هذه الرسائل',
      address: company.address.ar,
      followUs: 'تابعنا',
      privacyPolicy: 'سياسة الخصوصية',
      termsOfService: 'شروط الخدمة'
    }
  };
  
  const t = translations[language];
  
  return (
    <>
      <Hr
        style={{
          borderColor: emailStyles.colors.gray[200],
          margin: `${emailStyles.spacing.xl} 0 ${emailStyles.spacing.lg} 0`
        }}
      />
      
      <Section
        style={{
          backgroundColor: emailStyles.colors.gray[50],
          padding: emailStyles.spacing.xl,
          borderRadius: emailStyles.radius.lg,
          textAlign: isRTL ? 'right' : 'left'
        }}
      >
        {/* Support Section */}
        <Row style={{ marginBottom: emailStyles.spacing.md }}>
          <Column>
            <Text
              style={{
                ...safeStyles.text.small,
                fontWeight: '600',
                color: emailStyles.colors.gray[900],
                margin: `0 0 ${emailStyles.spacing.sm} 0`,
                textAlign: isRTL ? 'right' : 'left'
              }}
            >
              {t.support}
            </Text>
            <Link
              href={`mailto:${company.supportEmail}`}
              style={{
                ...safeStyles.text.small,
                color: emailStyles.colors.primary,
                textDecoration: 'none'
              }}
            >
              {t.contactUs}
            </Link>
          </Column>
        </Row>
        
        {/* Links Section */}
        <Row style={{ marginBottom: emailStyles.spacing.md }}>
          <Column>
            <Text
              style={{
                ...safeStyles.text.small,
                textAlign: isRTL ? 'right' : 'left',
                margin: '0'
              }}
            >
              <Link
                href={`${company.website}/privacy`}
                style={{
                  color: emailStyles.colors.gray[500],
                  textDecoration: 'none',
                  marginRight: isRTL ? '0' : emailStyles.spacing.md,
                  marginLeft: isRTL ? emailStyles.spacing.md : '0'
                }}
              >
                {t.privacyPolicy}
              </Link>
              <Link
                href={`${company.website}/terms`}
                style={{
                  color: emailStyles.colors.gray[500],
                  textDecoration: 'none'
                }}
              >
                {t.termsOfService}
              </Link>
            </Text>
          </Column>
        </Row>
        
        {/* Unsubscribe Section */}
        {showUnsubscribe && unsubscribeUrl && (
          <Row style={{ marginBottom: emailStyles.spacing.md }}>
            <Column>
              <Link
                href={unsubscribeUrl}
                style={{
                  ...safeStyles.text.small,
                  color: emailStyles.colors.gray[500],
                  textDecoration: 'underline',
                  textAlign: isRTL ? 'right' : 'left'
                }}
              >
                {t.unsubscribe}
              </Link>
            </Column>
          </Row>
        )}
        
        {/* Copyright Section */}
        <Row>
          <Column>
            <Text
              style={{
                ...safeStyles.text.small,
                color: emailStyles.colors.gray[500],
                textAlign: isRTL ? 'right' : 'left',
                margin: '0'
              }}
            >
              {t.copyright}
            </Text>
            <Text
              style={{
                ...safeStyles.text.small,
                color: emailStyles.colors.gray[500],
                textAlign: isRTL ? 'right' : 'left',
                margin: `${emailStyles.spacing.xs} 0 0 0`
              }}
            >
              {t.address}
            </Text>
          </Column>
        </Row>
      </Section>
    </>
  );
}