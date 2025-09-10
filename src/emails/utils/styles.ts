// Shared styles for email templates
// These styles are optimized for email clients

export const emailStyles = {
  // Colors matching Ruzma brand
  colors: {
    primary: '#2563eb', // Blue-600
    secondary: '#64748b', // Slate-500
    success: '#10b981', // Emerald-500
    warning: '#f59e0b', // Amber-500
    danger: '#ef4444', // Red-500
    white: '#ffffff',
    black: '#000000',
    gray: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      500: '#64748b',
      600: '#475569',
      900: '#0f172a'
    }
  },

  // Typography
  fonts: {
    sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    heading: 'Inter, system-ui, sans-serif'
  },

  // Spacing
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px'
  },

  // Border radius
  radius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px'
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
  }
};

// Common email client safe styles
export const safeStyles = {
  // Reset styles for email clients
  reset: {
    margin: '0',
    padding: '0',
    boxSizing: 'border-box' as const
  },

  // Container styles
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: emailStyles.colors.white,
    fontFamily: emailStyles.fonts.sans
  },

  // Button styles
  button: {
    primary: {
      backgroundColor: emailStyles.colors.primary,
      color: emailStyles.colors.white,
      padding: '12px 24px',
      borderRadius: emailStyles.radius.md,
      textDecoration: 'none',
      fontWeight: '600',
      display: 'inline-block',
      border: 'none',
      cursor: 'pointer'
    },
    secondary: {
      backgroundColor: emailStyles.colors.white,
      color: emailStyles.colors.primary,
      padding: '12px 24px',
      borderRadius: emailStyles.radius.md,
      textDecoration: 'none',
      fontWeight: '600',
      display: 'inline-block',
      border: `2px solid ${emailStyles.colors.primary}`,
      cursor: 'pointer'
    }
  },

  // Card styles
  card: {
    backgroundColor: emailStyles.colors.white,
    padding: emailStyles.spacing.xl,
    margin: `${emailStyles.spacing.md} 0`,
    borderRadius: emailStyles.radius.lg,
    border: `1px solid ${emailStyles.colors.gray[200]}`
  },

  // Text styles
  text: {
    body: {
      fontSize: '16px',
      lineHeight: '1.6',
      color: emailStyles.colors.gray[600],
      margin: `${emailStyles.spacing.md} 0`
    },
    heading1: {
      fontSize: '32px',
      fontWeight: '700',
      lineHeight: '1.2',
      color: emailStyles.colors.gray[900],
      margin: `${emailStyles.spacing.lg} 0 ${emailStyles.spacing.md} 0`,
      fontFamily: emailStyles.fonts.heading
    },
    heading2: {
      fontSize: '24px',
      fontWeight: '600',
      lineHeight: '1.3',
      color: emailStyles.colors.gray[900],
      margin: `${emailStyles.spacing.lg} 0 ${emailStyles.spacing.md} 0`,
      fontFamily: emailStyles.fonts.heading
    },
    small: {
      fontSize: '14px',
      lineHeight: '1.4',
      color: emailStyles.colors.gray[500]
    }
  }
};

// RTL styles for Arabic emails
export const rtlStyles = {
  container: {
    direction: 'rtl' as const,
    textAlign: 'right' as const
  },
  text: {
    textAlign: 'right' as const
  },
  button: {
    textAlign: 'left' as const // Keep button text LTR
  }
};

// Utility functions for styling
export const getResponsiveWidth = (width: string) => ({
  width,
  maxWidth: width,
  minWidth: '0'
});

export const getButtonStyles = (variant: 'primary' | 'secondary' = 'primary') => {
  return safeStyles.button[variant];
};

export const getTextStyles = (variant: 'body' | 'heading1' | 'heading2' | 'small' = 'body') => {
  return safeStyles.text[variant];
};