# Webhook JWT Verification Fix

**Date**: 2025-10-19
**Issue**: Lemon Squeezy webhooks failing with 401 "Missing authorization header"
**Status**: ✅ RESOLVED

---

## 🚨 The Problem

After deploying the Lemon Squeezy webhook integration, all webhook events were failing with:

```json
{
  "code": 401,
  "message": "Missing authorization header"
}
```

### What We Tested

User purchased Plus plan ($19/month) and Lemon Squeezy sent 4 webhook events:
1. ✅ `order_created` - Payload perfect, `custom_data.user_id` present
2. ✅ `subscription_created` - Payload perfect, `variant_id: 697231` correct
3. ✅ `subscription_payment_success` - Payload perfect
4. ✅ `subscription_updated` - Payload perfect

**All webhooks failed with 401 error** ❌

### What Was Working

- ✅ Webhook payloads were correct (included `meta.custom_data.user_id`)
- ✅ Variant ID mapping was correct (`697231` → `'plus'`)
- ✅ Webhook secret was configured correctly
- ✅ Webhook signature verification code was correct
- ✅ Edge Function code was correct

---

## 🔍 Root Cause Analysis

The 401 error was **NOT** from our webhook handler code. It was from **Supabase's infrastructure layer** before our code even executed.

### The Issue

**Supabase Edge Functions** had **JWT verification enabled by default** in production:
- Setting: **"Verify JWT with legacy secret"** toggle was **ON**
- Location: Supabase Dashboard → Edge Functions → `lemon-squeezy-webhook` → Function Configuration
- Effect: Required `Authorization` header with valid JWT before executing function code

### Why This Broke Webhooks

1. Lemon Squeezy sends webhooks with `X-Signature` header (not `Authorization`)
2. Supabase blocked requests **before** our signature verification code could run
3. Returned 401 error with "Missing authorization header"
4. User paid for subscription but account never upgraded

---

## ✅ The Solution

### Step 1: Disable JWT Verification

1. Go to: **Supabase Dashboard** → **Edge Functions** → **lemon-squeezy-webhook**
2. Navigate to: **Function Configuration** section
3. Find: **"Verify JWT with legacy secret"** toggle
4. **Turn OFF** the toggle (disable it)
5. Click: **"Save changes"**

### Step 2: Verify the Fix

Test the webhook endpoint:
```bash
curl -X POST \
  https://***REMOVED***.supabase.co/functions/v1/lemon-squeezy-webhook \
  -H "Content-Type: application/json" \
  -H "x-signature: test123" \
  -d '{"test":"data"}'
```

**Before fix**: `{"code":401,"message":"Missing authorization header"}`
**After fix**: `{"error":"Invalid signature"}` ✅ (This is correct - our code is running!)

### Step 3: Retry Failed Webhooks

1. Go to: **Lemon Squeezy Dashboard** → **Settings** → **Webhooks** → **Recent Deliveries**
2. Find the failed webhook deliveries
3. Click **"Retry"** on each failed webhook
4. All should now return **200 OK** ✅

### Step 4: Verify Account Upgrade

After retrying webhooks:
- ✅ User account shows "Plus" plan in app
- ✅ Database `profiles.user_type` = `'plus'`
- ✅ Database `profiles.subscription_status` = `'active'`
- ✅ `subscriptions` table populated with subscription data

---

## 🛡️ Security Considerations

### Why Disabling JWT is Safe

Our webhook handler implements **its own security**:

1. **Webhook Signature Verification** (lines 54-60):
   - Verifies `X-Signature` header from Lemon Squeezy
   - Uses HMAC-SHA256 with `LEMON_SQUEEZY_WEBHOOK_SECRET`
   - Rejects requests with invalid signatures

2. **Custom Data Validation** (lines 78-129):
   - Validates `user_id` exists in payload
   - Fallback: Looks up user by email if `user_id` missing
   - Rejects webhooks without valid user identification

3. **Service Role Key** (line 34):
   - Uses Supabase service role key (not exposed to client)
   - Required for database operations in Edge Functions

### Recommendation from Supabase

The Supabase Dashboard itself recommends:
> **"Recommendation: OFF with JWT and additional authorization logic implemented inside your function's code."**

This is exactly what we have! ✅

---

## 📝 Prevention for Future Edge Functions

### When to Disable JWT Verification

Disable JWT verification for Edge Functions that:
- ✅ Receive webhooks from external services (Lemon Squeezy, Stripe, etc.)
- ✅ Implement their own signature verification
- ✅ Are called by third-party services (not your frontend)

### When to Keep JWT Verification Enabled

Keep JWT verification for Edge Functions that:
- ✅ Are called from your frontend application
- ✅ Require user authentication
- ✅ Don't implement alternative auth mechanisms

### Checklist for New Webhooks

When adding a new webhook Edge Function:

- [ ] Deploy the function
- [ ] Go to Supabase Dashboard → Edge Functions → [Function Name]
- [ ] Check "Verify JWT with legacy secret" toggle
- [ ] **Disable it** if function receives external webhooks
- [ ] Test with external service (e.g., Lemon Squeezy "Send test webhook")
- [ ] Verify 200 OK response (not 401)

---

## 🔧 Enhanced Webhook Handler

As part of this fix, we also added:

### 1. Enhanced Logging (lines 68-82)
```typescript
console.log(`Webhook received: ${eventName}`, {
  dataId: payload.data?.id,
  dataType: payload.data?.type,
  userId: customData?.user_id,
  hasCustomData: !!customData,
  customDataKeys: customData ? Object.keys(customData) : [],
  variantId: dataAttributes?.variant_id,
  status: dataAttributes?.status,
})

// Log full payload if user_id is missing
if (!customData?.user_id) {
  console.error('DIAGNOSTIC: Full payload for missing user_id:', JSON.stringify(payload, null, 2))
}
```

### 2. Email Fallback Mechanism (lines 87-129)
If `custom_data.user_id` is missing, the webhook:
1. Extracts email from `user_email` or `customer_email`
2. Looks up user in `profiles` table by email
3. Uses that user ID to process the webhook
4. Logs the fallback success/failure

This provides redundancy in case Lemon Squeezy doesn't preserve custom data.

---

## 📊 Testing Results

### Before Fix
- ❌ All webhooks: 401 "Missing authorization header"
- ❌ User account stuck on "Free" plan
- ❌ Database not updated
- ❌ No subscription records created

### After Fix
- ✅ All webhooks: 200 OK
- ✅ User account upgraded to "Plus" plan
- ✅ Database `profiles.user_type` = `'plus'`
- ✅ Database `profiles.subscription_status` = `'active'`
- ✅ `subscriptions` table populated correctly
- ✅ Full webhook payload logged for debugging

---

## 🎯 Summary

**Root Cause**: Supabase Edge Function JWT verification blocked external webhooks
**Solution**: Disabled JWT verification toggle in Supabase Dashboard
**Result**: All webhooks now processing successfully ✅
**Time to Fix**: ~2 hours investigation, 2 seconds to fix 😅

---

## 📚 Related Documentation

- [CLAUDE.md](./CLAUDE.md) - Main project documentation
- [LEMON_SQUEEZY_WEBHOOK_SETUP.md](./LEMON_SQUEEZY_WEBHOOK_SETUP.md) - Webhook setup guide
- [FIX_PRO_UPGRADE_ISSUE.md](./FIX_PRO_UPGRADE_ISSUE.md) - Pro plan webhook fix
- [DEBUG_PAYMENT_ISSUE.md](./DEBUG_PAYMENT_ISSUE.md) - Payment debugging guide

---

## ✅ Verified By

- **Test User**: osama.k@meemain.org
- **Test Purchase**: Plus plan ($19/month)
- **Test Date**: 2025-10-19
- **Webhook Events**: 4 events retried successfully
- **Account Status**: Upgraded to Plus plan ✅
- **Database**: All tables updated correctly ✅
