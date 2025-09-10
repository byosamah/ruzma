import React from 'react';
import { Section } from '@react-email/components';
import { emailStyles, safeStyles } from '../utils/styles';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'bordered' | 'elevated' | 'highlight';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  language?: 'en' | 'ar';
  style?: React.CSSProperties;
  className?: string;
}

export function Card({
  children,
  variant = 'default',
  padding = 'xl',
  language = 'en',
  style,
  className
}: CardProps) {
  const isRTL = language === 'ar';
  
  const paddingStyles = {
    sm: emailStyles.spacing.sm,
    md: emailStyles.spacing.md,
    lg: emailStyles.spacing.lg,
    xl: emailStyles.spacing.xl
  };
  
  const variantStyles = {
    default: {
      backgroundColor: emailStyles.colors.white,
      border: `1px solid ${emailStyles.colors.gray[200]}`,
      borderRadius: emailStyles.radius.lg
    },
    bordered: {
      backgroundColor: emailStyles.colors.white,
      border: `2px solid ${emailStyles.colors.gray[300]}`,
      borderRadius: emailStyles.radius.lg
    },
    elevated: {
      backgroundColor: emailStyles.colors.white,
      border: `1px solid ${emailStyles.colors.gray[200]}`,
      borderRadius: emailStyles.radius.lg,
      boxShadow: emailStyles.shadows.md
    },
    highlight: {
      backgroundColor: `${emailStyles.colors.primary}05`, // 5% opacity
      border: `1px solid ${emailStyles.colors.primary}20`, // 20% opacity
      borderRadius: emailStyles.radius.lg
    }
  };
  
  return (
    <Section
      style={{
        ...variantStyles[variant],
        padding: paddingStyles[padding],
        margin: `${emailStyles.spacing.md} 0`,
        textAlign: isRTL ? 'right' : 'left',
        direction: isRTL ? 'rtl' : 'ltr',
        ...style
      }}
      className={className}
    >
      {children}
    </Section>
  );
}