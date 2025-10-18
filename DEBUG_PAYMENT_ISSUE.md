# Debug Payment Issue for designbattlefield@gmail.com

**Date**: 2025-10-18
**Issue**: Paid for Plus plan but account not upgraded

## 🔍 Payment Flow Analysis

### Expected Flow:
1. ✅ User clicks "Select Plan" for Plus
2. ✅ `createCheckoutSession('plus')` called
3. ✅ Edge Function creates Lemon Squeezy checkout
4. ✅ User redirected to Lemon Squeezy payment page
5. ✅ User completes payment (CONFIRMED - user paid)
6. ❓ **Lemon Squeezy sends webhook to our server**
7. ❓ **Webhook updates user profile to 'plus'**

### Possible Issues:

#### Issue 1: Webhook URL Not Configured in Lemon Squeezy ⚠️ **MOST LIKELY**
**Problem**: Lemon Squeezy doesn't know where to send the webhook

**How to Check**:
1. Go to Lemon Squeezy Dashboard: https://app.lemonsqueezy.com/
2. Navigate to: Settings → Webhooks
3. Check if this URL is configured:
   ```
   https://***REMOVED***.supabase.co/functions/v1/lemon-squeezy-webhook
   ```

**How to Fix**:
1. Go to: https://app.lemonsqueezy.com/settings/webhooks
2. Click "+" to add new webhook
3. Enter URL: `https://***REMOVED***.supabase.co/functions/v1/lemon-squeezy-webhook`
4. Select events to send:
   - ✅ `subscription_created`
   - ✅ `subscription_updated`
   - ✅ `subscription_cancelled`
   - ✅ `subscription_expired`
   - ✅ `subscription_payment_success`
   - ✅ `subscription_payment_failed`
5. Copy the "Signing secret" that's generated
6. Add it to Supabase Edge Function secrets (see below)

#### Issue 2: Webhook Secret Not Set ⚠️
**Problem**: Webhook signature verification fails

**How to Fix**:
1. Get the signing secret from Lemon Squeezy webhook settings
2. Set it in Supabase:
   ```bash
   npx supabase secrets set LEMON_SQUEEZY_WEBHOOK_SECRET=your_secret_here
   ```

**Current Status**:
- Run this to check: `npx supabase secrets list`

#### Issue 3: Subscriptions Table Doesn't Exist ⚠️
**Problem**: Webhook tries to insert into `subscriptions` table but it might not exist

**How to Check**:
Run this SQL in Supabase SQL Editor:
```sql
SELECT * FROM information_schema.tables
WHERE table_name = 'subscriptions';
```

**How to Fix** (if table doesn't exist):
```sql
CREATE TABLE subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lemon_squeezy_id TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL,
    variant_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own subscriptions
CREATE POLICY "Users can view own subscriptions"
    ON subscriptions FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Service role can manage all subscriptions
CREATE POLICY "Service role can manage subscriptions"
    ON subscriptions FOR ALL
    USING (auth.role() = 'service_role');
```

#### Issue 4: User ID Not Passed in Custom Data
**Problem**: The checkout creation might not be passing user_id correctly

**Check the create-checkout function** - Line 82-84 should have:
```typescript
custom: {
  user_id: user.id,  // ✅ This must be present
},
```

## 🔧 Immediate Fix: Manual Account Upgrade

While we debug the webhook, let's manually upgrade your account:

### SQL to Run in Supabase SQL Editor:
```sql
-- Find the user first
SELECT id, email, user_type, subscription_status
FROM profiles
WHERE email = 'designbattlefield@gmail.com';

-- Upgrade to Plus
UPDATE profiles
SET
  user_type = 'plus',
  subscription_status = 'active',
  updated_at = NOW()
WHERE email = 'designbattlefield@gmail.com';

-- Verify the update
SELECT id, email, user_type, subscription_status
FROM profiles
WHERE email = 'designbattlefield@gmail.com';
```

## 📊 How to Check Webhook Logs

### 1. Check Lemon Squeezy Webhook Delivery
1. Go to: https://app.lemonsqueezy.com/settings/webhooks
2. Click on your webhook
3. Go to "Recent deliveries" tab
4. Look for the payment event
5. Check:
   - ✅ Was the webhook sent?
   - ✅ What was the response code? (should be 200)
   - ✅ What was the response body?
   - ❌ Did it fail? What was the error?

### 2. Check Supabase Edge Function Logs
1. Go to: https://supabase.com/dashboard/project/***REMOVED***/functions/lemon-squeezy-webhook
2. Click "Logs" tab
3. Look for logs around the time you made the payment
4. Check for:
   - ✅ "Webhook received: subscription_created"
   - ✅ "Subscription subscription_created processed for user ..."
   - ❌ Any errors (signature verification, missing user_id, database errors)

## ✅ Testing Checklist

After fixing the webhook configuration:

### Test 1: Webhook Test from Lemon Squeezy
1. In Lemon Squeezy webhook settings, use "Send test webhook"
2. Send a `subscription_created` event
3. Check Supabase logs for successful processing

### Test 2: Test Payment
1. Create a new test account (or use existing)
2. Try to upgrade to Plus
3. Complete payment
4. Wait 5-10 seconds
5. Refresh the page
6. Check if user_type changed to 'plus'

### Test 3: Manual Webhook Replay
If webhook was sent but failed:
1. Find the failed webhook in Lemon Squeezy
2. Click "Redeliver"
3. Check Supabase logs
4. Verify account upgraded

## 🎯 Root Cause (Most Likely)

**Webhook URL not configured in Lemon Squeezy**

When you paid, Lemon Squeezy successfully processed the payment and charged your card. However, it didn't notify our application because:
1. No webhook URL configured → Lemon Squeezy doesn't send events
2. OR webhook URL wrong → Events sent to wrong endpoint
3. OR webhook secret wrong → Events rejected by our function

## 🚀 Action Plan

### Step 1: Manual Fix (5 minutes)
Run the SQL above to upgrade your account immediately

### Step 2: Configure Webhook (10 minutes)
1. Add webhook URL in Lemon Squeezy
2. Set webhook secret in Supabase
3. Create subscriptions table if missing

### Step 3: Test (5 minutes)
Send test webhook from Lemon Squeezy to verify it works

### Step 4: Future Payments (Automatic)
All future payments will work automatically once webhook is configured

---

**Next**: Run the manual SQL to upgrade your account, then we'll fix the webhook configuration so this doesn't happen again.
