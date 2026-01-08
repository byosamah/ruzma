# Jordan e-Fotara Integration Plan for Ruzma

**Created:** 2025-01-11
**Status:** Planning Phase
**Source SDK:** [jofotara - PHP SDK for Jordanian e-Fotara Portal](https://github.com/jafar-albadarneh/jofotara)

---

## 📋 Executive Summary

**Objective:** Enable Jordanian freelancers to automatically submit invoices to Jordan's e-Fotara tax system (optional, opt-in feature).

**Approach:** Direct REST API integration (TypeScript) in Supabase Edge Functions, avoiding PHP SDK complexity.

**Technical Constraint:** The jofotara SDK is PHP-based, but Ruzma uses TypeScript/Deno. We will implement the e-Fotara REST API directly in TypeScript instead of porting the PHP SDK.

**Key Features:**
- ✅ Optional opt-in for Jordanian users
- ✅ Credentials stored in user profile settings
- ✅ Non-blocking invoice creation (graceful degradation)
- ✅ Manual retry for failed submissions
- ✅ Complete audit trail and status tracking

---

## 🎯 User Requirements (From Q&A)

Based on discussion with product owner:

1. **SDK Approach:** Use direct REST API integration (recommended approach) instead of PHP SDK
2. **Credentials Management:** In user profile settings
3. **Error Handling:**
   - Allow invoice creation even if e-Fotara fails
   - Add manual retry option in UI
4. **Compliance Mode:** Optional with opt-in toggle (not mandatory)

---

## 📚 Understanding e-Fotara (Jordan Tax System)

### What is e-Fotara?
Jordan's electronic tax invoicing system (JoFotara) is a mandatory system for businesses to submit invoices to the Jordan Tax Department. Similar to systems in other countries:
- Saudi Arabia: ZATCA (Fatoora)
- UAE: e-Invoicing
- Egypt: e-Invoice

### Key Requirements:
- UBL 2.1 compliant XML format
- Real-time submission to Jordan Tax Authority
- Unique UUID for each invoice
- Tax Identification Number (TIN) for seller and buyer
- Supplier Income Source sequence number
- No sandbox environment (production only with past dates for testing)

### Invoice Types Supported by e-Fotara:
1. **General Sales Invoice** (most common for Ruzma use case)
2. Special Sales Invoice (exports)
3. Income Invoice
4. Credit Invoice (returns/corrections)

### Payment Methods:
- **Cash** (code: 012)
- **Receivable** (code: 022) - most common for B2B invoices

### Tax Handling:
- Standard VAT: 16%
- Tax Exempt: 0%
- Zero-rated: 0% (exports)

---

## 🏗️ Implementation Phases

### **Phase 1: Database Schema Updates**

#### 1.1 Add e-Fotara fields to `profiles` table

**Migration:** `supabase/migrations/20250111_add_efotara_support.sql`

```sql
-- Add e-Fotara configuration fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS efotara_enabled BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS efotara_client_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS efotara_client_secret TEXT; -- Will be encrypted
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS efotara_supplier_income_source TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS efotara_tin TEXT; -- Tax Identification Number
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS efotara_seller_name TEXT;

-- Add comments for documentation
COMMENT ON COLUMN profiles.efotara_enabled IS 'Whether user has enabled Jordan e-Fotara integration';
COMMENT ON COLUMN profiles.efotara_client_id IS 'e-Fotara API Client ID from Jordan Tax portal';
COMMENT ON COLUMN profiles.efotara_client_secret IS 'Encrypted e-Fotara API Client Secret';
COMMENT ON COLUMN profiles.efotara_supplier_income_source IS 'Supplier income source sequence (تسلسل مصدر الدخل)';
COMMENT ON COLUMN profiles.efotara_tin IS 'Jordan Tax Identification Number';
COMMENT ON COLUMN profiles.efotara_seller_name IS 'Seller name for e-Fotara invoices';
```

#### 1.2 Create `efotara_submissions` tracking table

```sql
-- Create table to track all e-Fotara submissions
CREATE TABLE IF NOT EXISTS efotara_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

  -- Submission tracking
  submission_status TEXT NOT NULL CHECK (submission_status IN ('pending', 'submitted', 'failed')),
  submission_attempt INTEGER DEFAULT 1,

  -- e-Fotara identifiers
  efotara_invoice_uuid TEXT, -- UUID sent to e-Fotara
  efotara_reference_number TEXT, -- Reference number from e-Fotara response
  efotara_qr_code TEXT, -- QR code URL/data from e-Fotara

  -- Audit trail
  request_payload JSONB, -- Full request sent to e-Fotara
  response_payload JSONB, -- Full response received from e-Fotara
  error_message TEXT, -- Error message if submission failed
  error_code TEXT, -- Error code from e-Fotara API

  -- Timestamps
  submitted_at TIMESTAMPTZ, -- When successfully submitted
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_invoice_submission UNIQUE(invoice_id, submission_attempt)
);

-- Create indexes for performance
CREATE INDEX idx_efotara_submissions_user ON efotara_submissions(user_id);
CREATE INDEX idx_efotara_submissions_invoice ON efotara_submissions(invoice_id);
CREATE INDEX idx_efotara_submissions_status ON efotara_submissions(submission_status);
CREATE INDEX idx_efotara_submissions_created ON efotara_submissions(created_at DESC);

-- Add RLS policies
ALTER TABLE efotara_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own e-Fotara submissions"
  ON efotara_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own e-Fotara submissions"
  ON efotara_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all submissions"
  ON efotara_submissions FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_efotara_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_efotara_submissions_updated_at
  BEFORE UPDATE ON efotara_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_efotara_submissions_updated_at();

-- Add comments
COMMENT ON TABLE efotara_submissions IS 'Tracks all invoice submissions to Jordan e-Fotara system';
COMMENT ON COLUMN efotara_submissions.efotara_invoice_uuid IS 'UUID v4 sent to e-Fotara (different from our invoice ID)';
COMMENT ON COLUMN efotara_submissions.efotara_reference_number IS 'Official reference number from Jordan Tax Department';
COMMENT ON COLUMN efotara_submissions.request_payload IS 'Complete request for audit and debugging';
COMMENT ON COLUMN efotara_submissions.response_payload IS 'Complete response for audit and compliance';
```

#### 1.3 Add client TIN field (optional but recommended)

```sql
-- Add optional TIN field to clients table for Jordanian clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS tax_id TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS tax_id_type TEXT CHECK (tax_id_type IN ('TIN', 'NIN', 'PN'));

COMMENT ON COLUMN clients.tax_id IS 'Tax ID (TIN), National ID (NIN), or Passport Number (PN) for e-Fotara';
COMMENT ON COLUMN clients.tax_id_type IS 'Type of identification: TIN, NIN, or PN';
```

---

### **Phase 2: Profile Settings UI**

#### 2.1 Create e-Fotara settings component

**File:** `src/components/Profile/EFotaraSettings.tsx`

**Features:**
- Only visible to users with `country === 'JO'`
- Enable/disable toggle with warning about tax compliance
- Secure credential input fields
- Test connection button to validate credentials
- Help text with links to Jordan Tax Department resources
- Save/cancel buttons

**Form Fields:**
1. **Enable e-Fotara** (toggle)
2. **Client ID** (text input, required)
3. **Client Secret** (password input, required)
4. **Supplier Income Source** (text input, required, with help tooltip)
5. **Tax ID Number (TIN)** (text input, required)
6. **Seller Name** (text input, pre-filled from profile name, required)

**Validation:**
- All fields required when e-Fotara is enabled
- Client ID format validation
- TIN format validation (Jordan format)
- Test connection before saving

**UI/UX Notes:**
- Show warning: "e-Fotara integration is optional. Enable only if required by Jordan Tax Department."
- Help text: "Find your credentials in the Jordan Tax Portal under 'e-Fotara API Settings'"
- Link to setup guide documentation
- Success/error toasts for save operations

#### 2.2 Update Profile page structure

**File:** `src/pages/Profile.tsx`

Add new tab/section:
```typescript
// Only show for Jordanian users
{profile?.country === 'JO' && (
  <Tabs.Panel value="efotara">
    <EFotaraSettings />
  </Tabs.Panel>
)}
```

#### 2.3 Create service methods

**File:** `src/services/core/ProfileService.ts`

```typescript
// Add methods for e-Fotara credentials management

async getEFotaraSettings(): Promise<EFotaraSettings> {
  const { data, error } = await supabase
    .from('profiles')
    .select('efotara_enabled, efotara_client_id, efotara_supplier_income_source, efotara_tin, efotara_seller_name')
    .eq('id', this.userId)
    .single();

  if (error) throw error;
  return data;
}

async updateEFotaraSettings(settings: EFotaraSettings): Promise<void> {
  // Client secret should be encrypted before storing
  const encryptedSecret = await this.encryptSecret(settings.efotara_client_secret);

  const { error } = await supabase
    .from('profiles')
    .update({
      efotara_enabled: settings.efotara_enabled,
      efotara_client_id: settings.efotara_client_id,
      efotara_client_secret: encryptedSecret,
      efotara_supplier_income_source: settings.efotara_supplier_income_source,
      efotara_tin: settings.efotara_tin,
      efotara_seller_name: settings.efotara_seller_name,
    })
    .eq('id', this.userId);

  if (error) throw error;
}

async testEFotaraConnection(): Promise<{ success: boolean; message: string }> {
  // Call Edge Function to test credentials
  const { data, error } = await supabase.functions.invoke('test-efotara-connection', {
    body: { userId: this.userId }
  });

  if (error) throw error;
  return data;
}
```

---

### **Phase 3: TypeScript e-Fotara Client**

#### 3.1 Create Edge Function: `submit-efotara`

**File:** `supabase/functions/submit-efotara/index.ts`

**Purpose:** Handle invoice submission to Jordan e-Fotara API

**Flow:**
1. Receive invoice ID from client
2. Fetch user's e-Fotara credentials from profiles (decrypt secret)
3. Fetch invoice data from database
4. Build UBL 2.1 compliant XML
5. Authenticate with e-Fotara API (OAuth)
6. Submit invoice XML
7. Parse response (reference number, QR code, etc.)
8. Store submission record in `efotara_submissions` table
9. Return result to client

**Environment Variables Required:**
```bash
# Set in Supabase Edge Functions
EFOTARA_API_BASE_URL=https://api.efotara.gov.jo  # Confirm actual URL
ENCRYPTION_KEY=<your-encryption-key>
```

**Error Handling:**
- Network errors: Retry with exponential backoff
- Authentication errors: Return clear message to user
- Validation errors: Return specific field errors
- Rate limiting: Queue for later retry
- All errors logged to `efotara_submissions` table

#### 3.2 Create e-Fotara API client module

**File:** `supabase/functions/_shared/efotara-client.ts`

**Key Components:**

```typescript
export class EFotaraClient {
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;
  private accessToken?: string;

  constructor(config: EFotaraConfig) {
    this.baseUrl = config.baseUrl;
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
  }

  // OAuth authentication
  async authenticate(): Promise<void> {
    // Get access token from e-Fotara OAuth endpoint
    const response = await fetch(`${this.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    });

    const data = await response.json();
    this.accessToken = data.access_token;
  }

  // Submit invoice
  async submitInvoice(invoice: EFotaraInvoice): Promise<EFotaraResponse> {
    // Ensure authenticated
    if (!this.accessToken) {
      await this.authenticate();
    }

    // Build XML
    const xmlInvoice = this.buildInvoiceXML(invoice);

    // Base64 encode XML
    const base64Invoice = btoa(xmlInvoice);

    // Submit to e-Fotara
    const response = await fetch(`${this.baseUrl}/api/v1/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify({
        invoice: base64Invoice,
      }),
    });

    if (!response.ok) {
      throw new EFotaraError(await response.text());
    }

    return await response.json();
  }

  // Build UBL 2.1 XML invoice
  private buildInvoiceXML(invoice: EFotaraInvoice): string {
    // Generate UBL 2.1 compliant XML
    // Based on jofotara SDK XML builder pattern
    // See: https://github.com/jafar-albadarneh/jofotara/blob/main/src/Builders/XmlBuilder.php

    return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">
  <cbc:ID>${invoice.invoiceId}</cbc:ID>
  <cbc:UUID>${invoice.uuid}</cbc:UUID>
  <cbc:IssueDate>${invoice.issueDate}</cbc:IssueDate>
  <cbc:InvoiceTypeCode>${invoice.invoiceTypeCode}</cbc:InvoiceTypeCode>
  <!-- ... complete UBL 2.1 structure ... -->
</Invoice>`;
  }

  // Validate invoice data
  validateInvoice(invoice: EFotaraInvoice): ValidationResult {
    const errors: string[] = [];

    if (!invoice.invoiceId) errors.push('Invoice ID is required');
    if (!invoice.uuid) errors.push('UUID is required');
    if (!invoice.issueDate) errors.push('Issue date is required');
    // ... more validations ...

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
```

#### 3.3 Create type definitions

**File:** `supabase/functions/_shared/efotara-types.ts`

```typescript
export interface EFotaraConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
}

export interface EFotaraInvoice {
  invoiceId: string;
  uuid: string;
  issueDate: string; // dd-MM-yyyy format
  dueDate?: string;
  invoiceTypeCode: string; // '388' for general sales
  paymentMethodCode: string; // '012' cash, '022' receivable
  currency: string; // Should be 'JOD'

  seller: {
    name: string;
    tin: string;
    address?: string;
  };

  buyer: {
    id: string;
    idType: 'TIN' | 'NIN' | 'PN';
    name: string;
    address?: string;
  };

  items: EFotaraInvoiceItem[];

  totals: {
    taxExclusiveAmount: number;
    taxInclusiveAmount: number;
    taxAmount: number;
    discountAmount?: number;
    payableAmount: number;
  };

  supplierIncomeSource: string;
}

export interface EFotaraInvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineExtensionAmount: number;
  taxRate: number; // 16 for standard VAT, 0 for exempt
  taxAmount: number;
}

export interface EFotaraResponse {
  success: boolean;
  referenceNumber?: string;
  qrCode?: string;
  message?: string;
  errors?: Array<{
    code: string;
    message: string;
  }>;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
```

#### 3.4 Data mapping helper

**File:** `supabase/functions/_shared/efotara-mapper.ts`

```typescript
import { InvoiceFormData } from '../../../src/components/CreateInvoice/types';
import { EFotaraInvoice } from './efotara-types';

export function mapRuzmaToEFotara(
  invoiceData: InvoiceFormData,
  profile: {
    efotara_tin: string;
    efotara_seller_name: string;
    efotara_supplier_income_source: string;
  },
  clientTaxId?: { id: string; type: 'TIN' | 'NIN' | 'PN' }
): EFotaraInvoice {
  // Generate UUID v4 for e-Fotara
  const uuid = crypto.randomUUID();

  // Format date as dd-MM-yyyy
  const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Calculate tax per item
  const items = invoiceData.lineItems.map((item, index) => {
    const lineExtensionAmount = item.quantity * item.amount;
    const taxRate = invoiceData.tax > 0 ? 16 : 0; // Simplified: use invoice-level tax
    const taxAmount = (lineExtensionAmount * taxRate) / 100;

    return {
      id: String(index + 1),
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.amount,
      lineExtensionAmount,
      taxRate,
      taxAmount,
    };
  });

  return {
    invoiceId: invoiceData.invoiceId,
    uuid,
    issueDate: formatDate(invoiceData.invoiceDate),
    dueDate: formatDate(invoiceData.dueDate),
    invoiceTypeCode: '388', // General sales invoice
    paymentMethodCode: '022', // Receivable (most common for B2B)
    currency: 'JOD', // Jordan Dinar

    seller: {
      name: profile.efotara_seller_name,
      tin: profile.efotara_tin,
      address: invoiceData.payTo.address,
    },

    buyer: {
      id: clientTaxId?.id || 'UNKNOWN',
      idType: clientTaxId?.type || 'TIN',
      name: invoiceData.billedTo.name,
      address: invoiceData.billedTo.address,
    },

    items,

    totals: {
      taxExclusiveAmount: invoiceData.subtotal,
      taxInclusiveAmount: invoiceData.total,
      taxAmount: invoiceData.tax,
      payableAmount: invoiceData.total,
    },

    supplierIncomeSource: profile.efotara_supplier_income_source,
  };
}

// Validation before submission
export function validateForEFotara(invoiceData: InvoiceFormData): ValidationResult {
  const errors: string[] = [];

  // Currency must be JOD for Jordanian invoices
  if (invoiceData.currency !== 'JOD') {
    errors.push('Invoice currency must be JOD (Jordan Dinar) for e-Fotara submission');
  }

  // Must have at least one line item
  if (!invoiceData.lineItems || invoiceData.lineItems.length === 0) {
    errors.push('Invoice must have at least one line item');
  }

  // Required buyer information
  if (!invoiceData.billedTo?.name) {
    errors.push('Client name is required');
  }

  // Date validation
  if (!invoiceData.invoiceDate) {
    errors.push('Invoice date is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

#### 3.5 Complete Edge Function implementation

**File:** `supabase/functions/submit-efotara/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { EFotaraClient } from '../_shared/efotara-client.ts';
import { mapRuzmaToEFotara, validateForEFotara } from '../_shared/efotara-mapper.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request
    const { invoiceId, userId } = await req.json();

    console.log(`Processing e-Fotara submission for invoice ${invoiceId}`);

    // 1. Fetch user's e-Fotara credentials
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('efotara_enabled, efotara_client_id, efotara_client_secret, efotara_tin, efotara_seller_name, efotara_supplier_income_source')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      throw new Error('Failed to fetch user profile');
    }

    if (!profile.efotara_enabled) {
      throw new Error('e-Fotara integration is not enabled for this user');
    }

    // 2. Fetch invoice data
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*, invoice_data')
      .eq('id', invoiceId)
      .eq('user_id', userId)
      .single();

    if (invoiceError || !invoice) {
      throw new Error('Invoice not found');
    }

    const invoiceData = invoice.invoice_data as any;

    // 3. Validate invoice for e-Fotara submission
    const validationResult = validateForEFotara(invoiceData);
    if (!validationResult.valid) {
      throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
    }

    // 4. Get client tax ID if available
    let clientTaxId;
    if (invoice.client_id) {
      const { data: client } = await supabase
        .from('clients')
        .select('tax_id, tax_id_type')
        .eq('id', invoice.client_id)
        .single();

      if (client?.tax_id) {
        clientTaxId = { id: client.tax_id, type: client.tax_id_type };
      }
    }

    // 5. Map to e-Fotara format
    const efotaraInvoice = mapRuzmaToEFotara(invoiceData, profile, clientTaxId);

    // 6. Create submission record (pending)
    const { data: submission, error: submissionCreateError } = await supabase
      .from('efotara_submissions')
      .insert({
        user_id: userId,
        invoice_id: invoiceId,
        submission_status: 'pending',
        efotara_invoice_uuid: efotaraInvoice.uuid,
        request_payload: efotaraInvoice,
      })
      .select()
      .single();

    if (submissionCreateError) {
      console.error('Failed to create submission record:', submissionCreateError);
    }

    // 7. Initialize e-Fotara client
    const efotaraClient = new EFotaraClient({
      baseUrl: Deno.env.get('EFOTARA_API_BASE_URL') ?? 'https://api.efotara.gov.jo',
      clientId: profile.efotara_client_id,
      clientSecret: profile.efotara_client_secret, // TODO: Decrypt
    });

    // 8. Submit to e-Fotara
    const response = await efotaraClient.submitInvoice(efotaraInvoice);

    // 9. Update submission record with result
    if (response.success && submission) {
      await supabase
        .from('efotara_submissions')
        .update({
          submission_status: 'submitted',
          efotara_reference_number: response.referenceNumber,
          efotara_qr_code: response.qrCode,
          response_payload: response,
          submitted_at: new Date().toISOString(),
        })
        .eq('id', submission.id);

      console.log(`Successfully submitted invoice ${invoiceId} to e-Fotara`);

      return new Response(
        JSON.stringify({
          success: true,
          referenceNumber: response.referenceNumber,
          qrCode: response.qrCode,
          message: 'Invoice successfully submitted to e-Fotara',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } else {
      // Submission failed
      if (submission) {
        await supabase
          .from('efotara_submissions')
          .update({
            submission_status: 'failed',
            error_message: response.message || 'Unknown error',
            error_code: response.errors?.[0]?.code,
            response_payload: response,
          })
          .eq('id', submission.id);
      }

      throw new Error(response.message || 'e-Fotara submission failed');
    }

  } catch (error) {
    console.error('e-Fotara submission error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
```

#### 3.6 Create test connection Edge Function

**File:** `supabase/functions/test-efotara-connection/index.ts`

Simple function to validate credentials without submitting an invoice.

---

### **Phase 4: Invoice Service Integration**

#### 4.1 Add e-Fotara submission method to InvoiceService

**File:** `src/services/invoiceService.ts`

```typescript
// Add new method to InvoiceService class

async submitToEFotara(invoiceId: string): Promise<EFotaraSubmissionResult> {
  this.ensureAuthenticated();

  const { user } = this.deps;

  // Check if user has e-Fotara enabled
  const { data: profile } = await this.deps.supabase
    .from('profiles')
    .select('efotara_enabled, country')
    .eq('id', user!.id)
    .single();

  if (!profile?.efotara_enabled || profile.country !== 'JO') {
    throw new Error('e-Fotara integration is not enabled');
  }

  // Call Edge Function
  const { data, error } = await this.deps.supabase.functions.invoke('submit-efotara', {
    body: {
      invoiceId,
      userId: user!.id,
    },
  });

  if (error) {
    throw new Error(`e-Fotara submission failed: ${error.message}`);
  }

  return data;
}

// Check if user should auto-submit to e-Fotara
private async shouldAutoSubmitToEFotara(userId: string): Promise<boolean> {
  const { data: profile } = await this.deps.supabase
    .from('profiles')
    .select('efotara_enabled, country')
    .eq('id', userId)
    .single();

  return profile?.country === 'JO' && profile?.efotara_enabled === true;
}
```

#### 4.2 Update createInvoice method

**File:** `src/services/invoiceService.ts`

```typescript
async createInvoice(
  invoice: Omit<Tables<'invoices'>['Insert'], 'user_id'>,
  userId: string,
  invoiceData?: any
): Promise<Invoice> {
  this.ensureAuthenticated();

  try {
    // ... existing creation logic ...

    const createdInvoice = await this.insertInvoice(invoice);

    // Track analytics
    await this.trackInvoiceCreated(createdInvoice);

    // 🆕 Auto-submit to e-Fotara if enabled (non-blocking)
    const shouldSubmit = await this.shouldAutoSubmitToEFotara(userId);

    if (shouldSubmit) {
      // Fire and forget - don't block invoice creation
      this.submitToEFotara(createdInvoice.id)
        .then(() => {
          console.log('Invoice auto-submitted to e-Fotara');
        })
        .catch((error) => {
          console.error('e-Fotara auto-submission failed:', error);
          // Error is already logged in efotara_submissions table
        });
    }

    return createdInvoice;
  } catch (error) {
    return this.handleError(error, 'Failed to create invoice');
  }
}
```

#### 4.3 Add retry method

```typescript
async retryEFotaraSubmission(invoiceId: string): Promise<EFotaraSubmissionResult> {
  this.ensureAuthenticated();

  // Check if there's a previous failed submission
  const { data: previousSubmission } = await this.deps.supabase
    .from('efotara_submissions')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (previousSubmission?.submission_status === 'submitted') {
    throw new Error('Invoice already successfully submitted to e-Fotara');
  }

  // Retry submission
  return await this.submitToEFotara(invoiceId);
}
```

---

### **Phase 5: UI Updates**

#### 5.1 Create e-Fotara Status Badge Component

**File:** `src/components/Invoices/EFotaraStatusBadge.tsx`

```typescript
import { Badge } from '@/components/ui/badge';
import { useT } from '@/lib/i18n';
import { CheckCircle2, Clock, XCircle, Minus } from 'lucide-react';

type EFotaraStatus = 'submitted' | 'pending' | 'failed' | 'not_submitted';

interface EFotaraStatusBadgeProps {
  status: EFotaraStatus;
  onClick?: () => void;
}

export function EFotaraStatusBadge({ status, onClick }: EFotaraStatusBadgeProps) {
  const t = useT();

  const config = {
    submitted: {
      icon: CheckCircle2,
      label: t('invoices.efotara.submitted'),
      variant: 'success' as const,
    },
    pending: {
      icon: Clock,
      label: t('invoices.efotara.pending'),
      variant: 'warning' as const,
    },
    failed: {
      icon: XCircle,
      label: t('invoices.efotara.failed'),
      variant: 'destructive' as const,
    },
    not_submitted: {
      icon: Minus,
      label: t('invoices.efotara.notSubmitted'),
      variant: 'secondary' as const,
    },
  };

  const { icon: Icon, label, variant } = config[status];

  return (
    <Badge
      variant={variant}
      className="cursor-pointer gap-1"
      onClick={onClick}
    >
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
```

#### 5.2 Create e-Fotara Submission Details Dialog

**File:** `src/components/Invoices/EFotaraSubmissionDetails.tsx`

Shows complete submission history, errors, and retry option.

#### 5.3 Update Invoice List

**File:** `src/components/Invoices/InvoiceList.tsx`

Add e-Fotara status column for Jordanian users:

```typescript
// Add to table columns
{profile?.country === 'JO' && profile?.efotara_enabled && (
  <TableHead>{t('invoices.efotara.status')}</TableHead>
)}

// Add to table cells
{profile?.country === 'JO' && profile?.efotara_enabled && (
  <TableCell>
    <EFotaraStatusBadge
      status={getEFotaraStatus(invoice.id)}
      onClick={() => openEFotaraDetails(invoice.id)}
    />
  </TableCell>
)}
```

#### 5.4 Update Invoice Details Dialog

**File:** `src/components/Invoices/InvoiceDetailsDialog.tsx`

Add e-Fotara section showing:
- Submission status
- Reference number
- QR code (if available)
- Submission timestamp
- Error message (if failed)
- Retry button

#### 5.5 Update Create Invoice Success Flow

**File:** `src/components/CreateInvoice/InvoiceForm.tsx`

After invoice creation, show appropriate toast:

```typescript
if (efotaraEnabled) {
  // Show loading state
  toast.loading('Submitting to e-Fotara...', { id: 'efotara' });

  // Wait a bit for Edge Function result
  setTimeout(async () => {
    const submission = await checkEFotaraStatus(invoiceId);

    if (submission?.status === 'submitted') {
      toast.success('Invoice submitted to e-Fotara ✓', { id: 'efotara' });
    } else if (submission?.status === 'failed') {
      toast.error('e-Fotara submission failed. You can retry later.', { id: 'efotara' });
    } else {
      toast.info('e-Fotara submission pending...', { id: 'efotara' });
    }
  }, 2000);
}
```

---

### **Phase 6: Translations**

#### 6.1 Profile translations

**File:** `src/lib/translations/profile.ts`

```typescript
efotara: {
  title: {
    en: 'Jordan e-Fotara Integration',
    ar: 'تكامل نظام الفوترة الإلكترونية الأردني'
  },
  subtitle: {
    en: 'Automatically submit invoices to Jordan Tax Department',
    ar: 'إرسال الفواتير تلقائياً إلى دائرة ضريبة الدخل والمبيعات الأردنية'
  },
  enabled: {
    en: 'Enable e-Fotara Integration',
    ar: 'تفعيل نظام الفوترة الإلكترونية'
  },
  optionalNotice: {
    en: 'e-Fotara integration is optional. Enable only if required by Jordan Tax Department for your business.',
    ar: 'تكامل الفوترة الإلكترونية اختياري. قم بالتفعيل فقط إذا كان مطلوباً من قبل دائرة الضرائب لنشاطك التجاري.'
  },
  credentials: {
    en: 'API Credentials',
    ar: 'بيانات الاعتماد'
  },
  clientId: {
    en: 'Client ID',
    ar: 'معرف العميل'
  },
  clientIdHelp: {
    en: 'Your e-Fotara API Client ID from Jordan Tax Portal',
    ar: 'معرف العميل الخاص بك من بوابة الفوترة الإلكترونية'
  },
  clientSecret: {
    en: 'Client Secret',
    ar: 'الرمز السري'
  },
  clientSecretHelp: {
    en: 'Your e-Fotara API Client Secret (will be encrypted)',
    ar: 'الرمز السري الخاص بك (سيتم تشفيره)'
  },
  supplierIncomeSource: {
    en: 'Supplier Income Source',
    ar: 'تسلسل مصدر الدخل'
  },
  supplierIncomeSourceHelp: {
    en: 'Supplier income source sequence number from your e-Fotara portal',
    ar: 'رقم تسلسل مصدر الدخل من بوابة الفوترة الإلكترونية'
  },
  tin: {
    en: 'Tax Identification Number (TIN)',
    ar: 'الرقم الضريبي'
  },
  tinHelp: {
    en: 'Your business Tax ID registered with Jordan Tax Department',
    ar: 'الرقم الضريبي لنشاطك التجاري المسجل لدى دائرة الضرائب'
  },
  sellerName: {
    en: 'Seller Name',
    ar: 'اسم البائع'
  },
  sellerNameHelp: {
    en: 'Your business name as registered for e-Fotara',
    ar: 'اسم نشاطك التجاري كما هو مسجل في نظام الفوترة الإلكترونية'
  },
  testConnection: {
    en: 'Test Connection',
    ar: 'اختبار الاتصال'
  },
  testConnectionSuccess: {
    en: 'Connection successful! Credentials are valid.',
    ar: 'تم الاتصال بنجاح! بيانات الاعتماد صحيحة.'
  },
  testConnectionFailed: {
    en: 'Connection failed. Please check your credentials.',
    ar: 'فشل الاتصال. يرجى التحقق من بيانات الاعتماد.'
  },
  saveSettings: {
    en: 'Save e-Fotara Settings',
    ar: 'حفظ إعدادات الفوترة الإلكترونية'
  },
  settingsSaved: {
    en: 'e-Fotara settings saved successfully',
    ar: 'تم حفظ إعدادات الفوترة الإلكترونية بنجاح'
  },
  helpLink: {
    en: 'How to get e-Fotara credentials',
    ar: 'كيفية الحصول على بيانات الفوترة الإلكترونية'
  }
}
```

#### 6.2 Invoice translations

**File:** `src/lib/translations/invoices.ts`

```typescript
efotara: {
  status: {
    en: 'e-Fotara Status',
    ar: 'حالة الفوترة الإلكترونية'
  },
  submitted: {
    en: 'Submitted',
    ar: 'تم الإرسال'
  },
  pending: {
    en: 'Pending',
    ar: 'قيد الانتظار'
  },
  failed: {
    en: 'Failed',
    ar: 'فشل'
  },
  notSubmitted: {
    en: 'Not Submitted',
    ar: 'لم يتم الإرسال'
  },
  details: {
    en: 'e-Fotara Submission Details',
    ar: 'تفاصيل إرسال الفوترة الإلكترونية'
  },
  referenceNumber: {
    en: 'Reference Number',
    ar: 'الرقم المرجعي'
  },
  submittedAt: {
    en: 'Submitted At',
    ar: 'تاريخ الإرسال'
  },
  errorMessage: {
    en: 'Error Message',
    ar: 'رسالة الخطأ'
  },
  retrySubmission: {
    en: 'Retry Submission',
    ar: 'إعادة المحاولة'
  },
  retrying: {
    en: 'Retrying...',
    ar: 'جاري إعادة المحاولة...'
  },
  qrCode: {
    en: 'QR Code',
    ar: 'رمز الاستجابة السريعة'
  },
  downloadQR: {
    en: 'Download QR Code',
    ar: 'تحميل رمز الاستجابة'
  },
  submittedSuccess: {
    en: 'Invoice successfully submitted to e-Fotara',
    ar: 'تم إرسال الفاتورة بنجاح إلى نظام الفوترة الإلكترونية'
  },
  submittedPartial: {
    en: 'Invoice created. e-Fotara submission is pending.',
    ar: 'تم إنشاء الفاتورة. إرسال الفوترة الإلكترونية قيد الانتظار.'
  },
  submittedFailed: {
    en: 'Invoice created but e-Fotara submission failed. You can retry later.',
    ar: 'تم إنشاء الفاتورة لكن فشل إرسالها للفوترة الإلكترونية. يمكنك إعادة المحاولة لاحقاً.'
  },
  currencyWarning: {
    en: 'Warning: Invoice currency is not JOD. e-Fotara requires Jordanian Dinar.',
    ar: 'تحذير: عملة الفاتورة ليست ديناراً أردنياً. نظام الفوترة الإلكترونية يتطلب الدينار الأردني.'
  },
  notEnabled: {
    en: 'e-Fotara integration is not enabled. Enable it in Profile settings.',
    ar: 'لم يتم تفعيل نظام الفوترة الإلكترونية. يمكنك تفعيله من إعدادات الملف الشخصي.'
  }
}
```

---

### **Phase 7: Security & Compliance**

#### 7.1 Credential Encryption

**Implementation:**
- Store encryption key in Supabase Edge Function secrets
- Encrypt `efotara_client_secret` before storing in database
- Decrypt only in Edge Functions with service role access
- Never expose decrypted secrets to client

**Library:** Use Deno's built-in Web Crypto API

```typescript
// Encryption helper
async function encryptSecret(secret: string, key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(secret);
  const keyData = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    'AES-GCM',
    false,
    ['encrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    keyData,
    data
  );

  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  return btoa(String.fromCharCode(...combined));
}

async function decryptSecret(encryptedSecret: string, key: string): Promise<string> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const combined = Uint8Array.from(atob(encryptedSecret), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);

  const keyData = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    'AES-GCM',
    false,
    ['decrypt']
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    keyData,
    data
  );

  return decoder.decode(decrypted);
}
```

#### 7.2 Rate Limiting

**Implementation:**
- Track API calls per user in `efotara_submissions` table
- Limit to 100 submissions per day per user (configurable)
- Return clear error message when limit exceeded
- Reset counter daily

```typescript
async function checkRateLimit(userId: string): Promise<boolean> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const { count, error } = await supabase
    .from('efotara_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', oneDayAgo.toISOString());

  if (error) throw error;

  return (count || 0) < 100; // Max 100 submissions per day
}
```

#### 7.3 Audit Logging

**What to log:**
- All submission attempts (success and failure)
- Complete request payload (for compliance)
- Complete response payload (for audit)
- Error details
- Retry attempts
- Credential test attempts

**Retention:**
- Keep submission records for 7 years (Jordan tax law requirement)
- Archive old records to cold storage
- Provide user export functionality

#### 7.4 Data Validation

**Pre-submission checks:**
- Currency must be JOD
- All required fields present
- Date format validation
- TIN format validation
- Amount calculations correct
- Line items valid

```typescript
function validateInvoiceForEFotara(invoice: InvoiceFormData): ValidationResult {
  const errors: string[] = [];

  // Currency check
  if (invoice.currency !== 'JOD') {
    errors.push('Currency must be JOD (Jordan Dinar)');
  }

  // Required fields
  if (!invoice.invoiceId) errors.push('Invoice ID required');
  if (!invoice.invoiceDate) errors.push('Invoice date required');
  if (!invoice.billedTo?.name) errors.push('Client name required');

  // Line items
  if (!invoice.lineItems || invoice.lineItems.length === 0) {
    errors.push('At least one line item required');
  }

  // Amount validation
  const calculatedSubtotal = invoice.lineItems.reduce(
    (sum, item) => sum + (item.quantity * item.amount),
    0
  );
  if (Math.abs(calculatedSubtotal - invoice.subtotal) > 0.01) {
    errors.push('Subtotal mismatch');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
```

---

### **Phase 8: Testing Strategy**

#### 8.1 Unit Tests

**Test files to create:**
- `src/components/Profile/EFotaraSettings.test.tsx`
- `src/services/invoiceService.test.ts` (update with e-Fotara tests)
- `supabase/functions/_shared/efotara-mapper.test.ts`
- `supabase/functions/_shared/efotara-client.test.ts`

**What to test:**
- Data mapping (Ruzma → e-Fotara format)
- Date formatting (dd-MM-yyyy)
- Currency validation
- XML generation
- Validation logic
- Error handling

#### 8.2 Integration Tests

**Test scenarios:**
1. Enable e-Fotara in profile with valid credentials
2. Test connection with valid/invalid credentials
3. Create invoice with e-Fotara enabled → verify auto-submission
4. Create invoice with e-Fotara disabled → verify no submission
5. Manual retry after failed submission
6. Currency mismatch warning
7. Missing client TIN handling

#### 8.3 Manual Testing Checklist

**Setup:**
- [ ] Create test user with country='JO'
- [ ] Get test credentials from Jordan Tax portal (or use mock server)
- [ ] Enable e-Fotara in profile settings
- [ ] Verify credentials stored encrypted in database

**Invoice Creation:**
- [ ] Create invoice with JOD currency → verify auto-submission
- [ ] Check submission record created in `efotara_submissions`
- [ ] Verify status badge shows "Submitted" or "Pending"
- [ ] View submission details dialog
- [ ] Download QR code (if available)

**Error Cases:**
- [ ] Create invoice with USD currency → verify warning shown
- [ ] Test with invalid credentials → verify error handling
- [ ] Simulate API timeout → verify graceful failure
- [ ] Test manual retry after failure

**Edge Cases:**
- [ ] Invoice without client TIN → verify uses fallback
- [ ] Multiple rapid submissions → verify rate limiting
- [ ] Disable e-Fotara mid-invoice → verify no submission
- [ ] Submit old invoice (past date) → verify accepted

#### 8.4 Production Testing

**Important:** Jordan e-Fotara has NO sandbox environment!

**Testing strategy:**
1. Use **past dates** for test invoices (as per jofotara docs)
2. Create credit invoices to **reverse** test transactions
3. Test with small amounts first
4. Coordinate with Jordan Tax Department if needed
5. Document all test submissions for audit

**Test plan:**
```
Day 1: Submit 1 test invoice with past date
Day 2: Verify in Jordan Tax portal
Day 3: Create credit invoice to reverse
Day 4: Submit 5 more test invoices
Day 5: Enable for beta users
```

---

## 📁 Complete File Checklist

### **New Files to Create:**

**Database:**
- [ ] `supabase/migrations/20250111_add_efotara_support.sql`

**Edge Functions:**
- [ ] `supabase/functions/submit-efotara/index.ts`
- [ ] `supabase/functions/test-efotara-connection/index.ts`
- [ ] `supabase/functions/_shared/efotara-client.ts`
- [ ] `supabase/functions/_shared/efotara-types.ts`
- [ ] `supabase/functions/_shared/efotara-mapper.ts`

**UI Components:**
- [ ] `src/components/Profile/EFotaraSettings.tsx`
- [ ] `src/components/Invoices/EFotaraStatusBadge.tsx`
- [ ] `src/components/Invoices/EFotaraSubmissionDetails.tsx`

**Hooks:**
- [ ] `src/hooks/useEFotaraSubmission.ts`
- [ ] `src/hooks/useEFotaraStatus.ts`

**Types:**
- [ ] `src/types/efotara.ts`

**Tests:**
- [ ] `src/components/Profile/EFotaraSettings.test.tsx`
- [ ] `supabase/functions/_shared/efotara-mapper.test.ts`
- [ ] `supabase/functions/_shared/efotara-client.test.ts`

**Documentation:**
- [ ] `docs/EFOTARA_SETUP_GUIDE.md` (user guide)
- [ ] `docs/EFOTARA_DEVELOPER_GUIDE.md` (technical docs)
- [ ] `docs/EFOTARA_TROUBLESHOOTING.md`

### **Files to Modify:**

**Services:**
- [ ] `src/services/invoiceService.ts` - Add e-Fotara methods

**UI Components:**
- [ ] `src/pages/Profile.tsx` - Add e-Fotara settings tab
- [ ] `src/components/Invoices/InvoiceList.tsx` - Add status column
- [ ] `src/components/Invoices/InvoiceDetailsDialog.tsx` - Add e-Fotara section
- [ ] `src/components/CreateInvoice/InvoiceForm.tsx` - Add submission feedback

**Translations:**
- [ ] `src/lib/translations/profile.ts` - Add e-Fotara translations
- [ ] `src/lib/translations/invoices.ts` - Add status translations

**Types:**
- [ ] `src/integrations/supabase/types.ts` - Regenerate after migration

---

## ⚠️ Known Challenges & Solutions

### **Challenge 1: Client Tax ID (TIN) Not Collected**

**Problem:** e-Fotara requires buyer's TIN, but Ruzma doesn't currently collect this from clients.

**Solutions:**
1. **Short-term:** Use fallback value "UNKNOWN" and ID type "TIN"
2. **Medium-term:** Add optional "Tax ID" field to client creation form
3. **Long-term:** Make TIN required for Jordanian users' clients

**Implementation:**
- Add `tax_id` and `tax_id_type` fields to `clients` table
- Show field only to Jordanian users
- Make it optional (show warning if missing)

### **Challenge 2: PHP SDK vs TypeScript Runtime**

**Problem:** jofotara SDK is PHP-based, Ruzma uses TypeScript/Deno.

**Solution:** ✅ Implement e-Fotara REST API directly in TypeScript
- Study jofotara SDK source code for API patterns
- Extract API endpoints and request formats
- Build TypeScript client from scratch
- Reference: https://github.com/jafar-albadarneh/jofotara/tree/main/src

**Benefits:**
- Native TypeScript types
- Better Deno Edge Function integration
- No PHP runtime needed
- More maintainable for Ruzma team

### **Challenge 3: No Sandbox Environment**

**Problem:** Jordan e-Fotara has no test/sandbox environment.

**Solution:** ✅ Use production API with safe testing practices
- Use past dates for test invoices (per jofotara documentation)
- Create credit invoices to reverse test transactions
- Start with small amounts
- Comprehensive validation before submission
- Manual approval option before first submission

**Testing workflow:**
```
1. Submit test invoice (past date, small amount)
2. Verify in Jordan Tax portal
3. Create credit invoice to reverse
4. Repeat with different scenarios
5. Enable for real usage
```

### **Challenge 4: Currency Requirements**

**Problem:** Ruzma supports multiple currencies, e-Fotara requires JOD.

**Solutions:**
1. **Validation:** Check currency is JOD before submission
2. **Warning:** Show clear message when creating non-JOD invoice as Jordanian user
3. **UI hint:** Suggest JOD currency for Jordanian users
4. **Future:** Add currency conversion option (if legally allowed)

**Implementation:**
```typescript
if (userCountry === 'JO' && currency !== 'JOD') {
  showWarning(
    'e-Fotara requires JOD currency. This invoice will not be submitted automatically.'
  );
}
```

### **Challenge 5: Invoice Number Format**

**Problem:** e-Fotara may have specific format requirements for invoice numbers.

**Solution:**
- Research e-Fotara documentation for format rules
- Current format: `INV-2024-001` (should be acceptable)
- Add validation before submission
- Allow custom format in settings if needed

### **Challenge 6: API Rate Limits**

**Problem:** Unknown rate limits from Jordan Tax Department API.

**Solutions:**
1. Implement conservative rate limiting (100/day per user)
2. Add exponential backoff retry logic
3. Queue failed submissions for later retry
4. Monitor API response headers for rate limit info
5. Log all rate limit errors for analysis

### **Challenge 7: Credential Security**

**Problem:** Storing sensitive API credentials securely.

**Solution:** ✅ Multi-layer security approach
1. Encrypt client secrets with AES-256-GCM
2. Store encryption key in Edge Function environment variables
3. Use RLS policies to restrict access
4. Never expose secrets to client-side code
5. Decrypt only in Edge Functions with service role
6. Audit all credential access

### **Challenge 8: Compliance and Audit Requirements**

**Problem:** Tax authorities require detailed audit trails.

**Solution:** ✅ Comprehensive logging system
1. Store complete request/response in `efotara_submissions`
2. Track all submission attempts (including retries)
3. Keep records for 7 years (Jordan tax law requirement)
4. Provide user export functionality
5. Enable admin audit reports

---

## 🎯 Implementation Priority

### **MVP (Minimum Viable Product) - Phase 1**

**Goal:** Basic working integration for early adopters

**Timeline:** 2 weeks

**Deliverables:**
1. ✅ Database schema (`efotara_submissions` table)
2. ✅ Profile settings UI (credentials management)
3. ✅ Edge Function for submission
4. ✅ Basic invoice auto-submission
5. ✅ Status display in invoice list
6. ✅ Manual retry functionality

**Success Criteria:**
- Jordanian user can enable e-Fotara
- Invoices auto-submit successfully
- Failed submissions can be retried
- Status visible in UI

### **Phase 2: Enhanced Features - Month 2**

**Goal:** Improve reliability and user experience

**Deliverables:**
1. ✅ Test connection button
2. ✅ QR code display
3. ✅ Detailed submission history
4. ✅ Automatic retry queue
5. ✅ Email notifications for failures
6. ✅ Currency validation and warnings
7. ✅ Client TIN collection

**Success Criteria:**
- 95%+ submission success rate
- Clear error messages for all failures
- Users can view complete submission history

### **Phase 3: Advanced Features - Month 3**

**Goal:** Full feature parity with jofotara SDK

**Deliverables:**
1. ⭐ Credit invoice support (returns/corrections)
2. ⭐ Special invoice types (exports, income)
3. ⭐ Bulk submission for old invoices
4. ⭐ e-Fotara analytics dashboard
5. ⭐ Advanced tax handling (multiple rates per invoice)
6. ⭐ Custom invoice type configuration

**Success Criteria:**
- Support all e-Fotara invoice types
- Analytics showing submission trends
- Power users have advanced options

---

## 📊 Success Metrics

### **Adoption Metrics:**
- % of Jordanian users who enable e-Fotara
- Time from signup to first submission
- Active users submitting regularly

### **Technical Metrics:**
- Submission success rate (target: 95%+)
- Average submission time (target: <5 seconds)
- API error rate (target: <5%)
- Retry success rate (target: >80%)

### **User Satisfaction:**
- Support tickets related to e-Fotara
- User feedback scores
- Feature requests vs complaints

### **Compliance Metrics:**
- % of invoices successfully submitted
- Audit trail completeness
- Failed submission resolution time

---

## 📚 Documentation Deliverables

### **User Documentation:**

**1. EFOTARA_SETUP_GUIDE.md**
- What is e-Fotara and why it's needed
- How to register for e-Fotara with Jordan Tax Department
- Step-by-step: Getting your API credentials
- Configuring e-Fotara in Ruzma
- Testing your setup
- Troubleshooting common issues

**2. EFOTARA_FAQ.md**
- Common questions and answers
- What happens if submission fails?
- Can I disable e-Fotara?
- What data is sent to e-Fotara?
- How to view submission history

### **Developer Documentation:**

**3. EFOTARA_DEVELOPER_GUIDE.md**
- Architecture overview
- Database schema
- Edge Function API
- Data mapping logic
- Security considerations
- Testing procedures

**4. EFOTARA_API_REFERENCE.md**
- Edge Function endpoints
- Request/response formats
- Error codes
- Rate limits
- Authentication

### **Support Documentation:**

**5. EFOTARA_TROUBLESHOOTING.md**
- Common error messages and solutions
- How to check submission status
- How to retry failed submissions
- Contact information for Jordan Tax support

---

## 🚀 Deployment Plan

### **Stage 1: Development (Week 1-2)**
- Set up database schema
- Develop Edge Functions
- Build UI components
- Write unit tests

**Checklist:**
- [ ] All code written and reviewed
- [ ] Unit tests passing
- [ ] TypeScript type checking passing
- [ ] Documentation complete

### **Stage 2: Staging (Week 3)**
- Deploy to test environment
- Test with mock e-Fotara API (if possible)
- Integration testing
- Security audit

**Checklist:**
- [ ] Staging deployment successful
- [ ] All tests passing in staging
- [ ] Security review complete
- [ ] Test data cleanup working

### **Stage 3: Beta (Week 4-5)**
- Select 5-10 Jordanian users for beta
- Enable feature flag
- Monitor closely for issues
- Gather feedback

**Checklist:**
- [ ] Beta users selected and onboarded
- [ ] Monitoring dashboard set up
- [ ] Support team trained
- [ ] Feedback mechanism in place

### **Stage 4: Gradual Rollout (Week 6-8)**
- Enable for all Jordanian users
- Monitor metrics
- Respond to feedback
- Iterate on UX

**Checklist:**
- [ ] Feature enabled for all JO users
- [ ] Success metrics tracked
- [ ] Support documentation live
- [ ] No critical issues reported

### **Stage 5: Optimization (Ongoing)**
- Performance improvements
- Feature enhancements
- Bug fixes
- Documentation updates

---

## ⏱️ Detailed Timeline

### **Week 1: Foundation**
- **Days 1-2:** Database schema and migrations
- **Days 3-4:** Profile settings UI
- **Day 5:** Review and testing

**Deliverables:** Database ready, settings UI working

### **Week 2: Core Integration**
- **Days 1-3:** Edge Function development (e-Fotara client)
- **Day 4:** Invoice service integration
- **Day 5:** Basic UI updates (status badges)

**Deliverables:** End-to-end submission working

### **Week 3: Testing & Polish**
- **Days 1-2:** Comprehensive testing
- **Day 3:** Bug fixes
- **Days 4-5:** Documentation and deployment prep

**Deliverables:** Production-ready code

### **Week 4-5: Beta Testing**
- **Week 4:** Beta launch, monitoring, quick fixes
- **Week 5:** Feedback integration, optimization

**Deliverables:** Validated working system

### **Week 6-8: Full Rollout**
- **Week 6:** Gradual rollout to all Jordanian users
- **Week 7-8:** Support, monitoring, iterations

**Deliverables:** Stable feature in production

### **Total Timeline:** 6-8 weeks from start to full rollout

---

## 💰 Cost Considerations

### **Development Costs:**
- ~3-4 weeks of senior full-stack developer time
- ~1 week of QA/testing time
- ~0.5 week of DevOps for deployment

### **Infrastructure Costs:**
- **Edge Functions:** Free tier covers most usage
- **Database Storage:** Minimal (~1MB per 1000 submissions)
- **API Calls:** Free (outbound to e-Fotara)

### **Ongoing Costs:**
- Support and maintenance
- Monitoring and logging
- Jordan Tax Department API fees (if any)

**Estimated:** $0 infrastructure, ~40-60 hours development

---

## 🔐 Security Checklist

- [ ] Credentials encrypted at rest (AES-256-GCM)
- [ ] Encryption key stored securely (Edge Function secrets)
- [ ] RLS policies restrict access to own data
- [ ] Edge Functions use service role key (not anon key)
- [ ] No sensitive data in client-side code
- [ ] API rate limiting implemented
- [ ] Comprehensive audit logging
- [ ] Error messages don't expose sensitive info
- [ ] SSL/TLS for all API communications
- [ ] Input validation on all user inputs
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitized outputs)

---

## 📞 Support Resources

### **Jordan Tax Department:**
- e-Fotara Portal: [Insert actual URL]
- Support Hotline: [Insert phone]
- Email: [Insert email]

### **Technical References:**
- jofotara SDK: https://github.com/jafar-albadarneh/jofotara
- UBL 2.1 Specification: [Insert link]
- Jordan Tax Law: [Insert legal reference]

### **Internal:**
- Ruzma Support Email: support@ruzma.co
- Developer Slack: #efotara-integration
- Documentation: /docs/EFOTARA_SETUP_GUIDE.md

---

## 🎉 Launch Checklist

**Pre-Launch:**
- [ ] All code merged to main branch
- [ ] Database migrations applied to production
- [ ] Edge Functions deployed
- [ ] Environment variables configured
- [ ] Security audit passed
- [ ] Documentation published
- [ ] Support team trained
- [ ] Beta testing completed successfully

**Launch Day:**
- [ ] Feature flag enabled
- [ ] Monitoring dashboard active
- [ ] Support team on standby
- [ ] Announcement sent to Jordanian users
- [ ] Social media posts (if applicable)

**Post-Launch (First Week):**
- [ ] Monitor error rates daily
- [ ] Respond to support tickets promptly
- [ ] Gather user feedback
- [ ] Track success metrics
- [ ] Quick bug fixes as needed

**Post-Launch (First Month):**
- [ ] Analyze adoption rates
- [ ] Review and iterate on UX
- [ ] Optimize performance
- [ ] Plan Phase 2 features

---

## 🤝 Stakeholders

**Product Owner:** [Your Name]
**Lead Developer:** [Developer Name]
**QA Lead:** [QA Name]
**Support Lead:** [Support Name]

**External:**
- Jordan Tax Department (compliance)
- Beta users (feedback)
- Legal counsel (if needed for tax law)

---

## 📝 Notes & Assumptions

1. **API Documentation:** Assuming Jordan e-Fotara API follows similar patterns to jofotara SDK
2. **Authentication:** Assuming OAuth 2.0 client credentials flow
3. **XML Format:** Assuming UBL 2.1 standard as implemented in jofotara
4. **Rate Limits:** Conservative estimate of 100 submissions/day per user
5. **Testing:** Production-only testing with past dates and credit invoice reversals
6. **Currency:** Assuming JOD required for all submissions
7. **Legal:** Assuming e-Fotara is optional for freelancers (confirm with legal)
8. **Timeline:** Assuming no major blockers or API access issues

---

## 🔄 Next Steps

**Immediate (This Week):**
1. Review and approve this plan
2. Get test credentials from Jordan Tax Department
3. Set up development environment
4. Create database migration

**Short-term (Next 2 Weeks):**
1. Implement Phase 1 (database + profile UI)
2. Build Edge Function
3. Basic integration testing

**Medium-term (Next Month):**
1. Complete MVP
2. Beta testing with real users
3. Iterate based on feedback

**Long-term (Months 2-3):**
1. Full rollout
2. Phase 2 features
3. Optimization and scaling

---

**Last Updated:** 2025-01-11
**Next Review:** After Phase 1 completion
**Status:** ✅ Ready for Implementation

---

## 🔗 References

- **jofotara SDK:** https://github.com/jafar-albadarneh/jofotara
- **Ruzma Codebase:** /Users/osamakhalil/ruzma
- **Jordan e-Fotara Portal:** [Insert official URL]
- **UBL 2.1 Specification:** https://docs.oasis-open.org/ubl/
- **Supabase Edge Functions:** https://supabase.com/docs/guides/functions
- **Deno Documentation:** https://deno.land/manual

---

**Document prepared for:** Osama Khalil, Ruzma Product Owner
**Purpose:** Complete implementation plan for Jordan e-Fotara tax invoice integration
**Scope:** Voluntary opt-in feature for Jordanian freelancers using Ruzma platform
