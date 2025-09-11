import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
  Img,
  Column,
  Row,
} from '@react-email/components';
import React from 'react';

interface BaseTemplateProps {
  children: React.ReactNode;
  language?: 'en' | 'ar';
  brandingColor?: string;
  companyName?: string;
  companyLogo?: string;
  previewText?: string;
}

export const BaseTemplate: React.FC<BaseTemplateProps> = ({
  children,
  language = 'en',
  brandingColor = '#3B82F6',
  companyName = 'Ruzma',
  companyLogo,
  previewText = 'Project update from Ruzma'
}) => {
  const isRTL = language === 'ar';
  const textAlign = isRTL ? 'right' : 'left';
  const direction = isRTL ? 'rtl' : 'ltr';

  return (
    <Html dir={direction} lang={language}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>{previewText}</title>
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;600;700&display=swap');
          `}
        </style>
      </Head>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            <Row>
              <Column style={{ textAlign }}>
                {companyLogo ? (
                  <Img
                    src={companyLogo}
                    width="120"
                    height="40"
                    alt={companyName}
                    style={{ margin: '0 auto' }}
                  />
                ) : (
                  <Text style={{
                    ...logoTextStyle,
                    color: brandingColor,
                    textAlign,
                    fontFamily: isRTL ? 'Tajawal, Arial, sans-serif' : 'Inter, Arial, sans-serif'
                  }}>
                    {companyName}
                  </Text>
                )}
              </Column>
            </Row>
          </Section>

          {/* Main Content */}
          <Section style={{
            ...mainContentStyle,
            textAlign,
            fontFamily: isRTL ? 'Tajawal, Arial, sans-serif' : 'Inter, Arial, sans-serif'
          }}>
            {children}
          </Section>

          {/* Footer */}
          <Section style={footerStyle}>
            <Hr style={hrStyle} />
            <Text style={{
              ...footerTextStyle,
              textAlign,
              fontFamily: isRTL ? 'Tajawal, Arial, sans-serif' : 'Inter, Arial, sans-serif'
            }}>
              {isRTL ? (
                <>
                  هذا البريد الإلكتروني تم إرساله من{' '}
                  <Link href="https://ruzma.co" style={linkStyle}>
                    Ruzma
                  </Link>
                  {' '}- نظام إدارة المشاريع للمستقلين
                </>
              ) : (
                <>
                  This email was sent from{' '}
                  <Link href="https://ruzma.co" style={linkStyle}>
                    Ruzma
                  </Link>
                  {' '}- Freelancer Project Management System
                </>
              )}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const bodyStyle = {
  backgroundColor: '#f6f9fc',
  fontFamily: 'Inter, Arial, sans-serif',
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#333333',
  margin: '0',
  padding: '0',
};

const containerStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  margin: '40px auto',
  maxWidth: '600px',
  padding: '0',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
};

const headerStyle = {
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #e2e8f0',
  padding: '32px 40px 24px',
};

const logoTextStyle = {
  fontSize: '28px',
  fontWeight: '700',
  margin: '0',
  textDecoration: 'none',
};

const mainContentStyle = {
  padding: '40px',
};

const footerStyle = {
  backgroundColor: '#f8fafc',
  borderTop: '1px solid #e2e8f0',
  padding: '24px 40px',
};

const footerTextStyle = {
  color: '#64748b',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0',
};

const hrStyle = {
  border: 'none',
  borderTop: '1px solid #e2e8f0',
  margin: '0 0 24px 0',
};

const linkStyle = {
  color: '#3B82F6',
  textDecoration: 'none',
};

export default BaseTemplate;