import React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Preview,
  Tailwind
} from '@react-email/components';
import { emailStyles, rtlStyles } from '../utils/styles';

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
  language?: 'en' | 'ar';
  dir?: 'ltr' | 'rtl';
}

export function EmailLayout({ 
  preview, 
  children, 
  language = 'en',
  dir = language === 'ar' ? 'rtl' : 'ltr'
}: EmailLayoutProps) {
  const isRTL = dir === 'rtl' || language === 'ar';
  
  return (
    <Html dir={dir} lang={language}>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="x-apple-disable-message-reformatting" />
        <title>Ruzma</title>
        <style>{`
          /* Email client reset styles */
          * {
            box-sizing: border-box;
          }
          
          body {
            margin: 0;
            padding: 0;
            background-color: ${emailStyles.colors.gray[50]};
            font-family: ${emailStyles.fonts.sans};
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          
          /* Outlook specific styles */
          .ExternalClass {
            width: 100%;
          }
          
          .ExternalClass,
          .ExternalClass p,
          .ExternalClass span,
          .ExternalClass font,
          .ExternalClass td,
          .ExternalClass div {
            line-height: 100%;
          }
          
          /* Yahoo specific styles */
          .yshortcuts a {
            border-bottom: none !important;
          }
          
          /* iOS blue links */
          a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
          }
          
          /* RTL support */
          ${isRTL ? `
          .rtl-container {
            direction: rtl;
            text-align: right;
          }
          
          .rtl-text {
            text-align: right;
          }
          
          .rtl-button {
            text-align: center;
          }
          ` : ''}
        `}</style>
      </Head>
      
      <Preview>{preview}</Preview>
      
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: emailStyles.colors,
              fontFamily: {
                sans: emailStyles.fonts.sans.split(', '),
                heading: emailStyles.fonts.heading.split(', ')
              },
              spacing: emailStyles.spacing,
              borderRadius: emailStyles.radius
            }
          }
        }}
      >
        <Body 
          className="bg-gray-50 font-sans"
          style={{
            backgroundColor: emailStyles.colors.gray[50],
            fontFamily: emailStyles.fonts.sans,
            ...(isRTL ? rtlStyles.container : {})
          }}
        >
          <Container 
            className={`mx-auto py-8 px-4 max-w-2xl ${isRTL ? 'rtl-container' : ''}`}
            style={{
              maxWidth: '600px',
              margin: '0 auto',
              padding: '32px 16px',
              ...(isRTL ? rtlStyles.container : {})
            }}
          >
            {children}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}