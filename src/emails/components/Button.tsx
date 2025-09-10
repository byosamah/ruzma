import React from 'react';
import { Button as ReactEmailButton } from '@react-email/components';
import { emailStyles, getButtonStyles } from '../utils/styles';

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  language?: 'en' | 'ar';
  className?: string;
  style?: React.CSSProperties;
}

export function Button({
  href,
  children,
  variant = 'primary',
  size = 'md',
  language = 'en',
  className,
  style
}: ButtonProps) {
  const isRTL = language === 'ar';
  
  const sizeStyles = {
    sm: {
      padding: '8px 16px',
      fontSize: '14px',
      borderRadius: emailStyles.radius.sm
    },
    md: {
      padding: '12px 24px',
      fontSize: '16px',
      borderRadius: emailStyles.radius.md
    },
    lg: {
      padding: '16px 32px',
      fontSize: '18px',
      borderRadius: emailStyles.radius.lg
    }
  };
  
  const baseButtonStyle = getButtonStyles(variant);
  const sizeStyle = sizeStyles[size];
  
  return (
    <ReactEmailButton
      href={href}
      style={{
        ...baseButtonStyle,
        ...sizeStyle,
        textAlign: 'center',
        lineHeight: '1.5',
        letterSpacing: '0.025em',
        transition: 'all 0.2s ease',
        WebkitAppearance: 'none',
        MozAppearance: 'none',
        direction: isRTL ? 'rtl' : 'ltr',
        ...style
      }}
      className={className}
    >
      {children}
    </ReactEmailButton>
  );
}