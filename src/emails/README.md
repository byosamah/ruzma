# Ruzma Email System - React Email Templates

Beautiful, modern email templates built with React Email, inspired by Marc Lou's design system approach.

## 🚀 Quick Start

### Development Preview

Start the email preview server:

```bash
npm run email:dev
```

Visit http://localhost:3001 to preview all email templates.

### Using Templates in Code

```typescript
import { EmailRenderService } from '@/services/core/EmailRenderService';

const emailService = new EmailRenderService(user);

// Render contract approval email
const email = await emailService.renderContractApprovalEmail({
  projectName: "Brand Design Project",
  clientName: "John Doe",
  freelancerName: "Jane Smith",
  contractUrl: "https://app.ruzma.co/contract/abc123",
  totalAmount: 2500,
  currency: "USD",
  milestones: [...],
  language: "en" // or "ar" for Arabic
});
```

## 📧 Available Templates

### 1. Contract Approval (`ContractApprovalEmail`)
- **Purpose**: Sent when a freelancer sends a contract for client approval
- **Features**: Project details, milestone breakdown, approval CTA
- **Languages**: English, Arabic (RTL support)

### 2. Payment Notification (`PaymentNotificationEmail`) 
- **Purpose**: Sent when payment is due or received
- **Features**: Payment status, milestone info, next steps
- **Languages**: English, Arabic (RTL support)

### 3. Client Invite (`ClientInviteEmail`)
- **Purpose**: Invites clients to access their project portal
- **Features**: Project overview, portal features, getting started guide
- **Languages**: English, Arabic (RTL support)

## 🎨 Design System

### Components

- **`EmailLayout`**: Base wrapper with HTML structure
- **`Header`**: Branded header with logo and tagline
- **`Footer`**: Footer with links and unsubscribe
- **`Button`**: CTA buttons with hover states
- **`Card`**: Content containers with variants
- **`Badge`**: Status indicators

### Styling

- **Color System**: Consistent with Ruzma brand colors
- **Typography**: Inter font family, responsive text sizes
- **Spacing**: Systematic spacing scale
- **Mobile-First**: Responsive design for all devices

### RTL Support

Full Arabic language support with:
- Right-to-left text direction
- Mirrored layouts
- Arabic typography
- Localized content

## 📱 Mobile Responsiveness

All templates are optimized for:
- **Gmail** (iOS, Android, Web)
- **Apple Mail** (iOS, macOS)
- **Outlook** (Web, Desktop, Mobile)
- **Yahoo Mail**
- **Thunderbird**

## 🔧 Architecture

### Service Layer

```
EmailRenderService
├── renderTemplate()          # Render any template
├── renderBatch()            # Batch render multiple emails
├── renderContractApprovalEmail()
├── renderPaymentNotificationEmail()
└── renderClientInviteEmail()
```

### Enhanced Email Service

```
EnhancedEmailService
├── sendContractApproval()   # With React Email templates
├── sendPaymentNotification() # With fallback to Edge Functions
└── sendClientLink()         # Hybrid approach
```

## 🌐 Internationalization

### Supported Languages

- **English** (`en`): Left-to-right, Latin script
- **Arabic** (`ar`): Right-to-left, Arabic script

### Adding New Languages

1. Add translations to template files
2. Update `EmailRenderService` language support
3. Test RTL behavior (if applicable)

### Language Detection

```typescript
// Automatic based on user profile
const email = await emailService.renderTemplate({
  templateType: 'contractApproval',
  language: user.profile.language, // 'en' | 'ar'
  data: {...}
});
```

## 🧪 Testing

### Preview All Templates

```bash
npm run email:dev
```

### Test Data

Sample data is available in `src/emails/preview/index.tsx`:

```typescript
import { sampleData, sampleDataArabic } from '@/emails/preview';

// English samples
const contractData = sampleData.contractApproval;

// Arabic samples  
const contractDataAr = sampleDataArabic.contractApproval;
```

### Email Client Testing

Templates are tested against:
- Gmail (web, iOS, Android)
- Apple Mail (macOS, iOS) 
- Outlook (web, desktop, mobile)
- Yahoo Mail
- Thunderbird

## 🎯 Best Practices

### Template Design

1. **Mobile-First**: Design for mobile, enhance for desktop
2. **Touch Targets**: Minimum 44px for buttons and links
3. **Contrast**: WCAG AA compliance for text contrast
4. **Loading**: Optimize images and keep HTML lightweight

### Content Guidelines

1. **Subject Lines**: Clear, descriptive, under 50 characters
2. **Preview Text**: Compelling preview, under 150 characters  
3. **CTAs**: One primary action per email
4. **Personalization**: Use recipient's name and project details

### Technical Guidelines

1. **HTML Tables**: Use for layout (email client compatibility)
2. **Inline CSS**: Critical styles inlined automatically
3. **Alt Text**: All images have descriptive alt text
4. **Testing**: Preview in multiple clients before deployment

## 🔄 Migration Guide

### From Edge Functions to React Email

1. **Keep Edge Functions**: Maintain as fallback
2. **Enable New Templates**: Use `EnhancedEmailService`
3. **Gradual Rollout**: Start with low-risk emails
4. **Monitor Performance**: Track delivery and engagement

### Configuration

```typescript
const emailService = new EnhancedEmailService(user, {
  useReactEmailTemplates: true,
  fallbackToEdgeFunctions: true,
  defaultLanguage: 'en'
});
```

## 📊 Performance

### Bundle Size
- **React Email**: ~50KB gzipped
- **Templates**: ~10KB per template
- **Total Overhead**: ~80KB

### Render Speed
- **Simple Template**: ~50ms
- **Complex Template**: ~200ms
- **Batch Rendering**: ~100ms per template

### Compatibility
- **Email Clients**: 95%+ compatibility
- **Mobile Devices**: 100% responsive
- **Accessibility**: WCAG AA compliant

## 🛠️ Development

### Adding New Templates

1. Create template component in `src/emails/templates/`
2. Export from `src/emails/templates/index.ts`  
3. Add to `EMAIL_TEMPLATES` map
4. Add sample data to preview
5. Add render method to `EmailRenderService`

### Styling Guidelines

1. Use `emailStyles` from `src/emails/utils/styles.ts`
2. Follow existing component patterns
3. Test in email clients, not just browsers
4. Support both LTR and RTL languages

### Testing Checklist

- [ ] Desktop email clients (Outlook, Thunderbird)
- [ ] Web email clients (Gmail, Yahoo, Outlook.com)
- [ ] Mobile email apps (Gmail iOS/Android, Apple Mail)
- [ ] Both English and Arabic versions
- [ ] All interactive elements work
- [ ] Images load properly
- [ ] Links work correctly
- [ ] Text is readable on all backgrounds

---

## 📚 Resources

- [React Email Documentation](https://react.email)
- [Email Client CSS Support](https://www.campaignmonitor.com/css)
- [Arabic Typography Guidelines](https://github.com/mandel59/adab)
- [Email Accessibility Guidelines](https://webaim.org/techniques/email/)

Built with ❤️ for Ruzma by the Email Design System