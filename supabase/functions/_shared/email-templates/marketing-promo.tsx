import {
  Text,
  Button,
  Section,
  Img,
  Hr,
  Link,
} from 'https://esm.sh/@react-email/components@0.0.25';
import React from 'https://esm.sh/react@18.2.0';
import { BaseTemplate } from './base-template.tsx';
import { getEmailContent, replaceVariables } from './content-config.ts';

interface MarketingPromoTemplateProps {
  userName: string;
  userEmail: string;
  promoTitle: string;
  promoDescription: string;
  ctaText: string;
  ctaUrl: string;
  promoImageUrl?: string;
  language?: 'en' | 'ar';
  brandingColor?: string;
  companyName?: string;
  companyLogo?: string;
}

export const MarketingPromoTemplate: React.FC<MarketingPromoTemplateProps> = ({
  userName,
  userEmail,
  promoTitle,
  promoDescription,
  ctaText,
  ctaUrl,
  promoImageUrl,
  language = 'en',
  brandingColor = '#3B82F6',
  companyName,
  companyLogo,
}) => {
  const isRTL = language === 'ar';
  const textAlign = isRTL ? 'right' : 'left';

  // Get content from config
  const content = getEmailContent('marketing', language);

  // Replace variables
  const subject = replaceVariables(content.subject, { promoTitle });
  const greeting = replaceVariables(content.greeting, { userName });
  const title = replaceVariables(content.title, { promoTitle });
  const intro = replaceVariables(content.intro, { promoDescription });
  const cta = replaceVariables(content.cta, { ctaText });

  // Generate unsubscribe link (in real implementation, this would be a real unsubscribe URL)
  const unsubscribeUrl = `${Deno.env.get('APP_BASE_URL')}/unsubscribe?email=${encodeURIComponent(userEmail)}&type=marketing`;

  return (
    <BaseTemplate
      language={language}
      brandingColor={brandingColor}
      companyName={companyName || 'Ruzma'}
      companyLogo={companyLogo}
      previewText={promoTitle}
    >
      {/* Greeting */}
      <Text style={{ ...textStyle, textAlign, marginBottom: '24px' }}>
        {greeting}
      </Text>

      {/* Title */}
      <Text style={{ ...titleStyle, textAlign, color: brandingColor }}>
        {title}
      </Text>

      {/* Promo Image (if provided) */}
      {promoImageUrl && (
        <Section style={{ ...sectionStyle, textAlign: 'center' }}>
          <Img
            src={promoImageUrl}
            alt={promoTitle}
            style={{
              width: '100%',
              maxWidth: '600px',
              height: 'auto',
              borderRadius: '8px',
              margin: '0 auto',
            }}
          />
        </Section>
      )}

      {/* Description */}
      <Text style={{ ...textStyle, textAlign, fontSize: '18px', lineHeight: '1.7' }}>
        {intro}
      </Text>

      {/* CTA Button */}
      <Section style={{ ...sectionStyle, textAlign: 'center' }}>
        <Button
          href={ctaUrl}
          style={{
            ...buttonStyle,
            backgroundColor: brandingColor,
          }}
        >
          {cta}
        </Button>
      </Section>

      {/* Unsubscribe Section */}
      <Hr style={{ margin: '40px 0 24px 0', borderTop: '1px solid #e2e8f0' }} />

      <Section style={{ textAlign: 'center' }}>
        <Text style={{ ...smallTextStyle, color: '#94a3b8', marginBottom: '8px' }}>
          {content.unsubscribe}
        </Text>
        <Link
          href={unsubscribeUrl}
          style={{
            ...smallTextStyle,
            color: '#94a3b8',
            textDecoration: 'underline',
          }}
        >
          {content.unsubscribeLink}
        </Link>
      </Section>

      {/* Footer */}
      <Section style={{ textAlign: 'center', marginTop: '24px' }}>
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

const smallTextStyle = {
  fontSize: '14px',
  lineHeight: '1.5',
  color: '#374151',
  margin: '0',
};

const sectionStyle = {
  margin: '32px 0',
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

export default MarketingPromoTemplate;
