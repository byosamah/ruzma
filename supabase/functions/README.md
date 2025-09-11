# Ruzma Email Templates - Supabase Edge Functions

This directory contains the React Email-based email template system for Ruzma, designed to run as Supabase Edge Functions for server-side rendering.

## 🏗️ Architecture

### **Server-Side React Email Templates**
- **No client-side bundle issues** - All React Email rendering happens on the server
- **Multi-language support** - English (LTR) and Arabic (RTL) layouts
- **Custom branding** - Dynamic colors, logos, and freelancer branding
- **Responsive design** - Mobile-first email templates

### **Edge Function Structure**
```
supabase/functions/
├── send-react-email/
│   ├── index.ts              # Main Edge Function
│   ├── package.json          # React Email dependencies
│   └── import_map.json       # Deno import mappings
├── _shared/
│   └── email-templates/
│       ├── base-template.tsx       # Base layout component
│       ├── contract-approval.tsx   # Contract approval email
│       ├── payment-notification.tsx # Payment updates
│       ├── client-invite.tsx       # Project invitations
│       └── index.ts               # Template registry
└── migrations/
    └── 001_email_logs.sql    # Email tracking table
```

## 📧 Available Templates

### **1. Contract Approval Email**
- **Template ID**: `contract-approval`
- **Languages**: English, Arabic (RTL)
- **Features**: Project details, milestone breakdown, approval button
- **Data Required**: `projectName`, `clientName`, `contractUrl`, `milestones`, etc.

### **2. Payment Notification Email**
- **Template ID**: `payment-notification` 
- **Languages**: English, Arabic (RTL)
- **Features**: Payment status, milestone details, project link
- **Data Required**: `projectName`, `milestoneName`, `amount`, `isApproved`, etc.

### **3. Client Invite Email**
- **Template ID**: `client-invite`
- **Languages**: English, Arabic (RTL)
- **Features**: Project dashboard access, feature overview, instructions
- **Data Required**: `projectName`, `clientName`, `projectUrl`, etc.

## 🚀 Usage

### **From EnhancedEmailService**
```typescript
const emailService = new EnhancedEmailService(user, {
  useReactEmailTemplates: true, // ✅ ENABLED
  fallbackToEdgeFunctions: true,
  defaultLanguage: 'en'
});

await emailService.sendContractApproval({
  projectId: 'project-id',
  clientEmail: 'client@example.com',
  language: 'ar', // Arabic with RTL layout
  brandingColor: '#3B82F6',
  companyName: 'Freelancer Company'
});
```

### **Direct Edge Function Call**
```typescript
const { error } = await supabase.functions.invoke('send-react-email', {
  body: {
    template: 'contract-approval',
    to: 'client@example.com',
    language: 'ar',
    brandingColor: '#10B981',
    data: {
      projectName: 'Website Redesign',
      clientName: 'John Doe',
      freelancerName: 'Ahmed Ali',
      // ... other required data
    }
  }
});
```

## ⚙️ Configuration

### **Environment Variables**
```bash
# Email Service Provider
EMAIL_SERVICE=resend # or 'sendgrid'

# Resend Configuration
RESEND_API_KEY=re_xxxxx
FROM_EMAIL=noreply@ruzma.co

# SendGrid Configuration (Alternative)
SENDGRID_API_KEY=SG.xxxxx

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### **Supabase Configuration**
The `config.toml` file configures:
- Edge Functions environment variables
- Import map for React Email dependencies
- CORS and API settings

## 🎨 Template Features

### **Multi-Language Support**
- **English**: Left-to-right layout, Inter font
- **Arabic**: Right-to-left layout, Tajawal font
- **Dynamic text alignment** and **direction**
- **Localized formatting** for currency and dates

### **Custom Branding**
- **Dynamic brand colors** from freelancer settings
- **Company logos** and names
- **Personalized messaging**
- **Consistent visual identity**

### **Responsive Design**
- **Mobile-first approach**
- **Email client compatibility** (Gmail, Outlook, Apple Mail)
- **Accessible design patterns**
- **Proper fallbacks** for older email clients

## 🔧 Development

### **Local Development**
```bash
# Start Supabase locally
supabase start

# Deploy Edge Function
supabase functions deploy send-react-email

# Test locally
supabase functions serve send-react-email
```

### **Adding New Templates**
1. **Create template component** in `_shared/email-templates/`
2. **Add to template registry** in `index.ts`
3. **Update validation** in `validateTemplateData()`
4. **Add to EnhancedEmailService** methods
5. **Test with both languages**

### **Template Development Guidelines**
- **Use BaseTemplate** for consistent layout
- **Support both LTR and RTL** layouts
- **Include proper accessibility** attributes
- **Test across email clients**
- **Follow brand guidelines**

## 📊 Email Tracking

All sent emails are logged to the `email_logs` table:
- **Template used**
- **Recipient email**
- **Language preference**
- **Send status** (sent/failed)
- **Email service used**
- **Subject line**
- **Error messages** (if any)

## 🛡️ Security

- **RLS policies** protect email logs
- **Server-side rendering** prevents client-side exposure
- **Input validation** for all template data
- **Rate limiting** through Supabase Edge Functions
- **No sensitive data** in email content

## 🚨 Troubleshooting

### **Common Issues**
1. **Import errors**: Check `import_map.json` configuration
2. **Template not found**: Verify template name in registry
3. **Validation failures**: Check required data fields
4. **Email not sending**: Verify API keys and configuration

### **Fallback System**
The system includes automatic fallback:
1. **Try React Email** templates first
2. **Fall back** to legacy Edge Functions
3. **Log errors** for debugging
4. **Maintain service availability**

## 📈 Performance

- **Server-side rendering** for fast email generation
- **Cached dependencies** in Edge Functions
- **Optimized React Email** components
- **Efficient email delivery** through Resend/SendGrid
- **Minimal cold start** times

---

**🎯 Result**: Beautiful, branded, multi-language email templates with zero client-side bundle impact!