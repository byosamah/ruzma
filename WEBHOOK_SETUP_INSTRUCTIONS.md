# 🔗 **LEMON SQUEEZY WEBHOOK CONFIGURATION**

## **URGENT: Configure These Settings Now**

### **Step 1: Set Webhook URL in Lemon Squeezy**

1. **Login to Lemon Squeezy Dashboard**: https://app.lemonsqueezy.com/
2. **Navigate to**: Settings → Webhooks
3. **Set Webhook URL to**:
   ```
   https://***REMOVED***.supabase.co/functions/v1/lemon-squeezy-webhook
   ```

### **Step 2: Enable Required Webhook Events**
**✅ CRITICAL: Enable these events:**
- `subscription_created`
- `subscription_updated` 
- `subscription_cancelled`
- `subscription_resumed`
- `subscription_expired`
- `subscription_paused`
- `subscription_unpaused`
- `subscription_payment_failed`
- `subscription_payment_success`
- `subscription_payment_recovered`
- `subscription_trial_ended`

### **Step 3: Set Environment Variables in Supabase**

Go to: https://supabase.com/dashboard/project/***REMOVED***/settings/edge-functions

**Add these environment variables:**

```bash
# Required for Lemon Squeezy API calls
LEMON_SQUEEZY_API_KEY=your_lemon_squeezy_api_key_here

# Required for sending email notifications
RESEND_API_KEY=your_resend_api_key_here

# Required for admin database operations
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rdGFydHdobHJwemlkb2pseXNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxODM5MjI5MSwiZXhwIjoyMDMzOTY4MjkxfQ.PBB_FzLVhFtQZqDfwZdTdKIJy1VzL3sTsWxVF8-Zc-Y

# Optional: For webhook signature verification
LEMON_SQUEEZY_WEBHOOK_SECRET=your_webhook_secret_if_using
```

### **Step 4: Get Your API Keys**

#### **Lemon Squeezy API Key**
1. In Lemon Squeezy Dashboard → Settings → API
2. Create new API key with permissions:
   - Read subscriptions
   - Update subscriptions
   - Read customers

#### **Resend API Key** 
1. Login to https://resend.com/dashboard
2. Create API key for your domain
3. Copy the key (starts with `re_`)

### **Step 5: Test Webhook Endpoint**

Test if the webhook is working:
```bash
curl -X POST https://***REMOVED***.supabase.co/functions/v1/lemon-squeezy-webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'
```

Expected response: Should return status 200 with "OK"

---

## **SUCCESS CHECKLIST**

After completing setup:
- [ ] Webhook URL configured in Lemon Squeezy
- [ ] All subscription events enabled  
- [ ] Environment variables set in Supabase
- [ ] Webhook endpoint responds to test calls
- [ ] API keys are valid and working

**Once this is complete, your subscription system will be able to:**
✅ Receive real-time updates from Lemon Squeezy
✅ Process subscription changes automatically
✅ Send notification emails
✅ Handle cancellations properly
✅ Manage grace periods correctly

This configuration is CRITICAL for the subscription system to function!