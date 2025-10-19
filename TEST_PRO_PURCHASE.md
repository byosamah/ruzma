# Test Pro Purchase Flow - Complete Guide

**Date**: 2025-10-19
**Purpose**: Verify Pro upgrade works automatically with the webhook fix

---

## 🎯 **What We're Testing**

This test will verify the COMPLETE Pro purchase flow works end-to-end:

1. ✅ New user creates account
2. ✅ User purchases Pro plan ($349 or with test mode)
3. ✅ Lemon Squeezy sends `order_created` webhook
4. ✅ Webhook signature verification PASSES
5. ✅ Webhook handler processes the order
6. ✅ User account automatically upgraded to Pro
7. ✅ No manual intervention needed!

---

## 📋 **Pre-Test Checklist**

Before starting the test, verify these are complete:

### ✅ **Webhook Configuration**
- [ ] Only 1 webhook active in Lemon Squeezy
- [ ] Webhook URL: `https://***REMOVED***.supabase.co/functions/v1/lemon-squeezy-webhook`
- [ ] Webhook secret: `rzm_webhook_23983@#FKL)9L!1`
- [ ] Events enabled include: `order_created` ✅

### ✅ **Edge Function Status**
- [ ] Webhook function deployed successfully
- [ ] Secret updated in Supabase
- [ ] Function accessible (check dashboard)

### ✅ **Test Mode**
Decision: Do you want to test with:
- **Test Mode ON** (no real charge, but webhooks work)
- **Real Purchase** (actual $349 charge or discount code)

**Recommendation**: Use Test Mode first!

---

## 🚀 **Step-by-Step Testing Process**

### **STEP 1: Create Test Account (2 min)**

1. **Open your app** in incognito/private browser window

2. **Sign up** with a test email:
   - Email: `test-pro-{timestamp}@example.com`
   - Example: `test-pro-20251019@example.com`
   - Password: Something you'll remember

3. **Verify** you're logged in
   - Should see Free plan (1/1 projects)
   - Dashboard shows Free tier limits

4. **Note the User ID** (for tracking):
   - Check browser console or network tab
   - Or check Supabase → Authentication → Users
   - Save this for verification later

---

### **STEP 2: Enable Test Mode in Lemon Squeezy (if testing)**

**If you want to test without real charge:**

1. Go to Lemon Squeezy Store Settings:
   👉 https://app.lemonsqueezy.com/settings/store/148628

2. **Enable Test Mode**:
   - Toggle "Test mode" to ON
   - This allows test purchases without real charges

3. **Get Test Card Details** (for checkout):
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/25`)
   - CVC: Any 3 digits (e.g., `123`)

**If doing real purchase:**
- Skip this step
- Use real payment method
- Consider using a discount code if available

---

### **STEP 3: Purchase Pro Plan (5 min)**

1. **In your test account**, go to Plans page:
   - URL: `https://app.ruzma.co/en/plans`
   - Or click "Upgrade" button

2. **Click "Select Plan"** on Pro card:
   - Should see: "Lifetime - $349"
   - Click the button

3. **Redirected to Lemon Squeezy checkout**:
   - Verify email is pre-filled (test account email)
   - Verify product shows "Ruzma Pro - Lifetime"
   - Verify price shows $349 (or $0 if discount)

4. **Complete Payment**:
   - **Test Mode**: Use `4242 4242 4242 4242`
   - **Real Purchase**: Use real card
   - Fill in name, card details
   - Click "Subscribe" or "Pay"

5. **After Payment**:
   - Should see success message
   - Should be redirected back to your app
   - **DO NOT REFRESH YET** - give webhook 5-10 seconds

---

### **STEP 4: Verify Webhook Delivery (2 min)**

**While waiting**, check if webhook was sent:

1. **Go to Lemon Squeezy** → Settings → Webhooks:
   👉 https://app.lemonsqueezy.com/settings/webhooks

2. **Click on your webhook** (the active one)

3. **Go to "Recent deliveries" tab**

4. **Look for latest delivery** (should be within last minute):
   - Event: `order_created`
   - Status: Should be ✅ 200 (success)
   - User: Your test email

5. **Click on the delivery** to see details:
   ```json
   Request: {
     "meta": {
       "event_name": "order_created",
       "custom_data": {
         "user_id": "..." ← Your test user ID
       }
     },
     "data": {
       "attributes": {
         "user_email": "test-pro-...",
         "first_order_item": {
           "variant_id": 697237  ← Pro variant
         }
       }
     }
   }

   Response: {
     "success": true,
     "message": "Webhook processed"
   }
   ```

6. **Expected Result**:
   - ✅ Status: 200 (not 401, not 500)
   - ✅ Response shows success
   - ✅ No "Invalid signature" error

**If you see 200 response → WEBHOOK WORKED!** 🎉

---

### **STEP 5: Check Supabase Edge Function Logs (2 min)**

Let's verify the webhook processed correctly:

1. **Go to Supabase Edge Function Logs**:
   👉 https://supabase.com/dashboard/project/***REMOVED***/functions/lemon-squeezy-webhook

2. **Click "Logs" tab**

3. **Look for recent logs** (within last 2 minutes):

4. **Expected log messages**:
   ```
   ✅ Webhook received: order_created
   ✅ Processing order_created event
   ✅ Order for variant 697237 → user_type: pro
   ✅ Pro purchase detected - cancelling existing subscriptions
   ✅ Order processed - User {user_id} upgraded to pro
   ```

5. **Check for errors**:
   - ❌ "Invalid signature" → Secret still wrong
   - ❌ "Missing variant_id" → Payload issue
   - ❌ "Failed to update profile" → Database issue

**If you see "Order processed - User upgraded to pro" → SUCCESS!** 🎉

---

### **STEP 6: Verify Account Upgraded (2 min)**

Now check if the test account actually has Pro access:

#### **Option A: Check in App (Easiest)**

1. **Refresh your app** (the test account browser)
2. **Check dashboard**:
   - Should show "Pro Plan" (not Free)
   - Should show "Unlimited projects" (not 1/1)
   - Storage shows 100GB (not 100MB)
3. **Try creating multiple projects**:
   - Create Project #1 → Should work ✅
   - Create Project #2 → Should work ✅ (Free would block this)
   - Create Project #3 → Should work ✅

#### **Option B: Check Database (Most Accurate)**

1. **Go to Supabase SQL Editor**:
   👉 https://supabase.com/dashboard/project/***REMOVED***/sql/new

2. **Run this query** (replace email):
   ```sql
   SELECT
       id,
       email,
       user_type,
       subscription_status,
       created_at,
       updated_at
   FROM profiles
   WHERE email = 'test-pro-20251019@example.com';  -- Your test email
   ```

3. **Expected result**:
   ```
   user_type: 'pro'  ✅
   subscription_status: 'active'  ✅
   updated_at: (recent timestamp within last 5 minutes)  ✅
   ```

#### **Option C: Check Security Events**

1. **In Supabase SQL Editor**, run:
   ```sql
   SELECT
       event_type,
       details,
       created_at
   FROM security_events
   WHERE user_id = (
       SELECT id FROM profiles
       WHERE email = 'test-pro-20251019@example.com'
   )
   ORDER BY created_at DESC
   LIMIT 5;
   ```

2. **Expected result**:
   ```
   event_type: 'order_completed'
   details: {
       "order_id": "...",
       "variant_id": "697237",
       "user_type": "pro",
       "total": "34900" or "0" (if discount)
   }
   ```

---

## ✅ **Success Criteria**

The test is SUCCESSFUL if ALL of these are true:

### **Lemon Squeezy:**
- ✅ Webhook delivery shows 200 response
- ✅ No "Invalid signature" error
- ✅ Response body shows `"success": true`

### **Supabase Logs:**
- ✅ Shows "Webhook received: order_created"
- ✅ Shows "Order processed - User upgraded to pro"
- ✅ No error messages

### **Database:**
- ✅ `profiles.user_type` = 'pro'
- ✅ `profiles.subscription_status` = 'active'
- ✅ `security_events` has 'order_completed' entry

### **User Experience:**
- ✅ App shows "Pro Plan"
- ✅ Can create unlimited projects
- ✅ All Pro features accessible
- ✅ No manual intervention was needed!

**If ALL checkboxes above are ✅ → COMPLETE SUCCESS!** 🎊

---

## 🐛 **Troubleshooting Guide**

### **Issue: Webhook returns 401 "Invalid signature"**

**Cause**: Secret still doesn't match

**Solution**:
1. Check exact secret in Lemon Squeezy webhook settings
2. Verify it matches what we set: `rzm_webhook_23983@#FKL)9L!1`
3. If different, update again:
   ```bash
   npx supabase secrets set LEMON_SQUEEZY_WEBHOOK_SECRET="correct_secret"
   npx supabase functions deploy lemon-squeezy-webhook
   ```
4. Redeliver webhook from Lemon Squeezy

---

### **Issue: Webhook returns 400 "Missing user_id"**

**Cause**: `custom_data.user_id` not passed during checkout

**Check**:
1. Go to `src/hooks/subscription/subscriptionService.ts`
2. Verify `createCheckoutSession` passes user ID:
   ```typescript
   custom: {
     user_id: user.id  // Must be present
   }
   ```

**If missing**, I'll help you fix the checkout creation code.

---

### **Issue: Webhook succeeds but account not upgraded**

**Cause**: Possible database error or RLS policy blocking

**Check Logs**:
1. Look for "Failed to update profile" in Edge Function logs
2. Check the error message
3. Might be RLS policy issue

**Manual Fix**:
```sql
-- Check if user exists
SELECT * FROM profiles WHERE email = 'test-email@example.com';

-- If exists but not upgraded, run manual update
UPDATE profiles
SET user_type = 'pro', subscription_status = 'active'
WHERE email = 'test-email@example.com';
```

---

### **Issue: Account upgraded but app still shows Free**

**Cause**: Frontend caching issue

**Solution**:
1. Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. Clear browser cache
3. Log out and log back in
4. Check browser console for errors

---

### **Issue: Test Mode purchase doesn't send webhook**

**Cause**: Test mode webhooks might be disabled

**Solution**:
1. Check Lemon Squeezy webhook settings
2. Verify "Send webhooks in test mode" is enabled
3. If disabled, enable it
4. Try test purchase again

---

## 📊 **Test Results Template**

After testing, document your results:

```markdown
### Test Results - {Date/Time}

**Test Account**: test-pro-{timestamp}@example.com
**User ID**: {user_id}
**Test Mode**: [ON/OFF]
**Payment**: [Test Card / Real / Discount]

**Results**:
- [ ] Checkout completed successfully
- [ ] Webhook delivery: [200 Success / Failed with error]
- [ ] Edge Function logs: [Show success / Show error]
- [ ] Database updated: [Yes / No]
- [ ] App shows Pro: [Yes / No]
- [ ] Can create unlimited projects: [Yes / No]

**Overall**: [✅ SUCCESS / ❌ FAILED]

**Notes**: {Any observations or issues}
```

---

## 🎉 **After Successful Test**

If the test succeeds:

1. **Clean up test account** (optional):
   ```sql
   -- Delete test account and all data
   DELETE FROM profiles WHERE email = 'test-pro-...@example.com';
   ```

2. **Disable Test Mode** (if you enabled it):
   - Go to Lemon Squeezy Store Settings
   - Toggle "Test mode" to OFF

3. **Document success**:
   - Add entry to `CLAUDE.md` under Recent Updates
   - Note the test date and results
   - Mark the Pro upgrade flow as verified ✅

4. **Celebrate!** 🎊
   - The entire Pro upgrade flow is now working automatically
   - Future customers will get instant upgrades
   - No manual intervention needed!

---

## 📝 **Quick Test Checklist**

**For quick re-testing**, just check these:

1. [ ] Create test account
2. [ ] Purchase Pro (test mode or real)
3. [ ] Check Lemon Squeezy webhook delivery (200?)
4. [ ] Check Supabase logs (success message?)
5. [ ] Refresh app (shows Pro?)
6. [ ] Create 2+ projects (works?)

**All ✅? → Test passed!** 🎉

---

## 🔗 **Quick Links**

- **Lemon Squeezy Webhooks**: https://app.lemonsqueezy.com/settings/webhooks
- **Supabase Function Logs**: https://supabase.com/dashboard/project/***REMOVED***/functions/lemon-squeezy-webhook
- **Supabase SQL Editor**: https://supabase.com/dashboard/project/***REMOVED***/sql/new
- **App Plans Page**: https://app.ruzma.co/en/plans
- **Store Settings**: https://app.lemonsqueezy.com/settings/store/148628

---

**Ready to test?** Follow the steps above and let me know the results! 🚀

**Need help during testing?** Just ping me and I'll help troubleshoot! 💪
