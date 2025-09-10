import React from 'react';
import { Text } from '@react-email/components';
import { emailStyles } from '../utils/styles';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  language?: 'en' | 'ar';
  style?: React.CSSProperties;
}

export function Badge({
  children,
  variant = 'primary',
  size = 'md',
  language = 'en',
  style
}: BadgeProps) {
  const isRTL = language === 'ar';
  
  const variantStyles = {
    primary: {
      backgroundColor: emailStyles.colors.primary,
      color: emailStyles.colors.white
    },
    secondary: {
      backgroundColor: emailStyles.colors.secondary,
      color: emailStyles.colors.white
    },
    success: {
      backgroundColor: emailStyles.colors.success,
      color: emailStyles.colors.white
    },
    warning: {
      backgroundColor: emailStyles.colors.warning,
      color: emailStyles.colors.white
    },
    danger: {
      backgroundColor: emailStyles.colors.danger,
      color: emailStyles.colors.white
    },
    gray: {
      backgroundColor: emailStyles.colors.gray[100],
      color: emailStyles.colors.gray[600]
    }
  };
  
  const sizeStyles = {
    sm: {
      fontSize: '12px',
      padding: '2px 8px',
      borderRadius: emailStyles.radius.sm
    },
    md: {
      fontSize: '14px',
      padding: '4px 12px',
      borderRadius: emailStyles.radius.md
    },
    lg: {
      fontSize: '16px',
      padding: '6px 16px',
      borderRadius: emailStyles.radius.lg
    }
  };
  
  return (
    <Text
      style={{
        ...variantStyles[variant],
        ...sizeStyles[size],
        display: 'inline-block',
        fontWeight: '500',
        lineHeight: '1',
        textAlign: 'center',
        whiteSpace: 'nowrap',
        margin: '0',
        direction: isRTL ? 'rtl' : 'ltr',
        ...style
      }}
    >
      {children}
    </Text>
  );
}