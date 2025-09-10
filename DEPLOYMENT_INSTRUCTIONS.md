# 🚀 Manual Deployment Instructions

## ⚠️ IMPORTANT: Deploy in This Exact Order

### **Step 1: Database Migration (CRITICAL - Do This First)**

1. **Open Supabase Dashboard**: https://supabase.com/dashboard
2. **Navigate to**: Your project → SQL Editor
3. **Copy and paste** the entire content from: `/Users/osamakhalil/ruzma/scripts/apply-subscription-fixes.sql`
4. **Click "Run"** to execute the migration
5. **Verify success**: You should see "Subscription system fixes applied successfully!" message

### **Step 2: Test Database Migration**

Run this verification query in the SQL Editor:

```sql
-- Verify new columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'subscriptions' 
AND column_name IN ('grace_period_ends_at', 'payment_grace_ends_at', 'retry_count', 'last_retry_at');

-- Should return 4 rows showing the new columns
```

### **Step 3: Deploy Edge Functions**

**Option A: Using Supabase Dashboard (Recommended)**
1. Go to **Functions** section in your Supabase dashboard
2. For each function below, click "Create Function" or update existing:

#### **Function 1: cancel-subscription**
- **Name**: `cancel-subscription`
- **Code**: Copy from `/Users/osamakhalil/ruzma/supabase/functions/cancel-subscription/index.ts`

#### **Function 2: lemon-squeezy-webhook**  
- **Name**: `lemon-squeezy-webhook`
- **Code**: Copy from `/Users/osamakhalil/ruzma/supabase/functions/lemon-squeezy-webhook/index.ts`

#### **Function 3: send-payment-notification**
- **Name**: `send-payment-notification` 
- **Code**: Copy from `/Users/osamakhalil/ruzma/supabase/functions/send-payment-notification/index.ts`

#### **Function 4: process-expired-subscriptions** (NEW)
- **Name**: `process-expired-subscriptions`
- **Code**: Copy from `/Users/osamakhalil/ruzma/supabase/functions/process-expired-subscriptions/index.ts`

**Option B: Using Supabase CLI (If Available)**
```bash
supabase functions deploy cancel-subscription
supabase functions deploy lemon-squeezy-webhook  
supabase functions deploy send-payment-notification
supabase functions deploy process-expired-subscriptions
```

### **Step 4: Environment Variables**

In **Supabase Dashboard → Settings → Edge Functions**, ensure these variables are set:

```
LEMON_SQUEEZY_API_KEY=your_lemon_squeezy_api_key
RESEND_API_KEY=your_resend_email_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
LEMON_SQUEEZY_WEBHOOK_SECRET=your_webhook_secret_optional
```

### **Step 5: Update Lemon Squeezy Webhook URL (If Needed)**

1. **Login to Lemon Squeezy Dashboard**
2. **Go to Settings → Webhooks**
3. **Update webhook URL to**: `https://[your-project].supabase.co/functions/v1/lemon-squeezy-webhook`
4. **Ensure events are enabled**: subscription_created, subscription_updated, subscription_cancelled, subscription_payment_failed, etc.

### **Step 6: Verification Tests**

#### **Test 1: No Console Errors**
1. **Refresh your development app**: http://localhost:8080
2. **Open browser console**: Should be clean of 400 Bad Request errors
3. **Check subscription validation**: Should work without errors

#### **Test 2: Database Functions**
Run in SQL Editor:
```sql
-- Test grace period calculation
SELECT public.calculate_trial_grace_end(NOW(), 3);
SELECT public.calculate_payment_grace_end(NOW(), 7);

-- Check if subscription events table exists
SELECT COUNT(*) FROM public.subscription_events;
```

#### **Test 3: Edge Functions**
1. **Go to Functions → Logs** in Supabase dashboard
2. **Check for deployment errors**
3. **Test a subscription flow** in your app (if safe to do so)

---

## ✅ **Success Indicators**

After deployment, you should see:

1. **✅ Clean Console**: No more 400 Bad Request errors
2. **✅ New Database Tables**: subscription_events, notification_queue
3. **✅ New Columns**: grace_period_ends_at, payment_grace_ends_at, retry_count, last_retry_at
4. **✅ Working Functions**: All 4 Edge functions deployed successfully
5. **✅ Environment Variables**: All API keys properly configured

---

## 🚨 **Troubleshooting**

### **Database Migration Issues**
- If migration fails, check the error message
- Ensure you have proper permissions
- Try running smaller sections of the SQL file

### **Function Deployment Issues**
- Check function logs for specific errors
- Verify all environment variables are set
- Ensure function code copied completely

### **Still Getting 400 Errors**
- Migration wasn't applied properly
- Browser cache needs clearing
- Development server needs restart

---

## 🎯 **What This Deployment Accomplishes**

1. **✅ Fixes Console Errors**: 400 Bad Request issues resolved
2. **✅ Enables Grace Periods**: 3-day trial, 7-day payment grace
3. **✅ Auto-Downgrade System**: Hourly processing of expired subscriptions  
4. **✅ Enhanced Notifications**: Complete email cascade system
5. **✅ Audit Trail**: Full subscription event logging
6. **✅ Proper Cancellation**: Fixed Lemon Squeezy API integration

Your subscription system will be **production-ready** after these deployments! 🎉