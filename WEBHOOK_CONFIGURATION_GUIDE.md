# 🔗 **WEBHOOK & ENVIRONMENT CONFIGURATION GUIDE**

## **Step 1: Lemon Squeezy Webhook Configuration**

### **Webhook URL Setup**
1. **Login to Lemon Squeezy Dashboard**: https://app.lemonsqueezy.com/
2. **Navigate to**: Settings → Webhooks
3. **Set Webhook URL to**:
   ```
   https://***REMOVED***.supabase.co/functions/v1/lemon-squeezy-webhook
   ```

### **Required Webhook Events**
Enable these events (CRITICAL):
- ✅ `subscription_created`
- ✅ `subscription_updated` 
- ✅ `subscription_cancelled`
- ✅ `subscription_resumed`
- ✅ `subscription_expired`
- ✅ `subscription_paused`
- ✅ `subscription_unpaused`
- ✅ `subscription_payment_failed`
- ✅ `subscription_payment_success`
- ✅ `subscription_payment_recovered`

### **Webhook Security (Optional but Recommended)**
- Set webhook secret and add to environment variables as `LEMON_SQUEEZY_WEBHOOK_SECRET`

---

## **Step 2: Supabase Environment Variables**

### **Navigate to Supabase Dashboard**
1. Go to: https://supabase.com/dashboard/project/***REMOVED***
2. Click: Settings → Edge Functions
3. Add these environment variables:

### **Required Variables**
```bash
# Lemon Squeezy Integration
LEMON_SQUEEZY_API_KEY=lemon_squeezy_api_key_here

# Email Service (Resend)
RESEND_API_KEY=resend_api_key_here

# Supabase Service Role (for admin operations)
SUPABASE_SERVICE_ROLE_KEY=supabase_service_role_key_here

# Optional: Webhook Security
LEMON_SQUEEZY_WEBHOOK_SECRET=webhook_secret_here
```

### **How to Get These Keys**

#### **Lemon Squeezy API Key**
1. Login to Lemon Squeezy Dashboard
2. Go to Settings → API
3. Create new API key with these permissions:
   - Read subscriptions
   - Update subscriptions
   - Read customers

#### **Resend API Key**
1. Login to Resend Dashboard: https://resend.com/dashboard
2. Go to API Keys
3. Create new API key for domain: `ruzma.com` or your domain

#### **Supabase Service Role Key**
1. In Supabase Dashboard → Settings → API
2. Copy the `service_role` key (NOT the anon key)
3. This key has admin privileges - keep it secret

---

## **Step 3: Webhook Testing**

### **Test Webhook Endpoint**
```bash
# Test if webhook endpoint is accessible
curl -X POST https://***REMOVED***.supabase.co/functions/v1/lemon-squeezy-webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### **Expected Response**
```json
{
  "received": true,
  "message": "Webhook received successfully"
}
```

---

## **Step 4: Verification Checklist**

### **Environment Variables Verification**
- [ ] `LEMON_SQUEEZY_API_KEY` - Set in Supabase Edge Functions
- [ ] `RESEND_API_KEY` - Set in Supabase Edge Functions  
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Set in Supabase Edge Functions
- [ ] `LEMON_SQUEEZY_WEBHOOK_SECRET` - Set in Supabase Edge Functions (optional)

### **Webhook Configuration Verification**
- [ ] Webhook URL points to correct Supabase function
- [ ] All subscription events are enabled
- [ ] Webhook secret is set (if using)
- [ ] Test webhook responds successfully

### **Function Deployment Verification**
- [ ] `lemon-squeezy-webhook` - Deployed and active
- [ ] `cancel-subscription` - Deployed and active
- [ ] `send-payment-notification` - Deployed and active
- [ ] `process-expired-subscriptions` - Deployed and active

---

## **Step 5: Function Logs Monitoring**

### **Check Function Logs**
1. Go to Supabase Dashboard → Edge Functions
2. Click on each function to view logs
3. Look for any deployment errors or runtime issues

### **Common Issues to Watch For**
- Missing environment variables
- API key authentication failures
- Database connection issues
- Webhook signature verification failures

---

## **Quick Configuration Commands**

### **Set Environment Variables via CLI (Alternative)**
```bash
# Set environment variables using Supabase CLI
supabase secrets set LEMON_SQUEEZY_API_KEY=your_key_here
supabase secrets set RESEND_API_KEY=your_key_here  
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_key_here
supabase secrets set LEMON_SQUEEZY_WEBHOOK_SECRET=your_secret_here
```

### **Test Functions Locally (Optional)**
```bash
# Start local Supabase (if needed)
supabase start

# Test function locally
supabase functions serve lemon-squeezy-webhook --no-verify-jwt
```

---

## **Success Indicators**

After completing these steps, you should see:
1. ✅ **Webhook Endpoint**: Responds to test requests
2. ✅ **Environment Variables**: All set in Supabase dashboard
3. ✅ **Function Logs**: No errors, successful execution
4. ✅ **Lemon Squeezy**: Webhook events being sent successfully
5. ✅ **Database**: Subscription events being logged

---

This configuration is CRITICAL for the subscription system to work properly. Without these webhooks and environment variables, users won't be able to subscribe, cancel, or have their subscriptions processed correctly.