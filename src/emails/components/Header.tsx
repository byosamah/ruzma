import React from 'react';
import { Section, Row, Column, Img, Text, Link } from '@react-email/components';
import { emailStyles, safeStyles } from '../utils/styles';
import { getCompanyInfo, getLogoUrl } from '../utils/render';

interface HeaderProps {
  language?: 'en' | 'ar';
  showTagline?: boolean;
  logoUrl?: string;
}

export function Header({ 
  language = 'en', 
  showTagline = true,
  logoUrl 
}: HeaderProps) {
  const company = getCompanyInfo();
  const isRTL = language === 'ar';
  const finalLogoUrl = logoUrl || getLogoUrl();
  
  return (
    <Section
      style={{
        backgroundColor: emailStyles.colors.white,
        padding: emailStyles.spacing.xl,
        marginBottom: emailStyles.spacing.md,
        borderRadius: emailStyles.radius.lg,
        border: `1px solid ${emailStyles.colors.gray[200]}`,
        textAlign: isRTL ? 'right' : 'left'
      }}
    >
      <Row>
        <Column align={isRTL ? 'right' : 'left'}>
          <Link
            href={company.website}
            style={{
              textDecoration: 'none'
            }}
          >
            <Img
              src={finalLogoUrl}
              alt="Ruzma Logo"
              width="120"
              height="32"
              style={{
                display: 'block',
                margin: isRTL ? '0 0 0 auto' : '0 auto 0 0'
              }}
            />
          </Link>
          
          {showTagline && (
            <Text
              style={{
                ...safeStyles.text.small,
                marginTop: emailStyles.spacing.sm,
                color: emailStyles.colors.gray[500],
                textAlign: isRTL ? 'right' : 'left'
              }}
            >
              {language === 'ar' ? 'إدارة مشاريع المستقلين' : 'Freelancer Project Management'}
            </Text>
          )}
        </Column>
        
        <Column align={isRTL ? 'left' : 'right'}>
          <Link
            href={company.website}
            style={{
              ...safeStyles.text.small,
              color: emailStyles.colors.primary,
              textDecoration: 'none'
            }}
          >
            {language === 'ar' ? 'زيارة الموقع' : 'Visit Website'}
          </Link>
        </Column>
      </Row>
    </Section>
  );
}