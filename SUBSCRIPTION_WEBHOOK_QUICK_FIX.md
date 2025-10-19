# Subscription Webhook - Quick Fix Guide

**Issue**: Webhooks failing with 401 error
**Solution**: Disable JWT verification in Supabase
**Time to Fix**: 30 seconds

---

## 🚨 If Webhooks Are Failing

### Symptoms
- ❌ Webhooks return: `{"code":401,"message":"Missing authorization header"}`
- ❌ Users pay but accounts don't upgrade
- ❌ Database not updating after payment

### The Fix (30 seconds)

1. **Go to**: [Supabase Dashboard](https://supabase.com/dashboard/project/***REMOVED***/functions/lemon-squeezy-webhook)

2. **Click**: "lemon-squeezy-webhook" function

3. **Find**: "Verify JWT with legacy secret" toggle

4. **Turn OFF** the toggle (should turn gray)

5. **Click**: "Save changes"

6. **Done!** ✅

### Verify It Works

Test the webhook:
```bash
curl -X POST https://***REMOVED***.supabase.co/functions/v1/lemon-squeezy-webhook \
  -H "Content-Type: application/json" \
  -H "x-signature: test" \
  -d '{"test":true}'
```

**Before**: `{"code":401,"message":"Missing authorization header"}` ❌
**After**: `{"error":"Invalid signature"}` ✅ (This is correct!)

### Retry Failed Webhooks

1. Go to: [Lemon Squeezy Webhooks](https://app.lemonsqueezy.com/settings/webhooks)
2. Click: Recent Deliveries
3. Find failed webhooks
4. Click: "Retry" on each one
5. Should all return 200 OK ✅

---

## 🛡️ Is This Safe?

**YES!** Our webhook code has its own security:
- ✅ Verifies Lemon Squeezy signature (`X-Signature` header)
- ✅ Uses HMAC-SHA256 with webhook secret
- ✅ Validates user_id in payload
- ✅ Rejects invalid/tampered requests

Supabase even recommends disabling JWT for webhooks!

---

## 📚 Full Documentation

For complete technical details, see:
- **WEBHOOK_JWT_FIX.md** - Complete technical analysis
- **CLAUDE.md** - Main project documentation
- **LEMON_SQUEEZY_WEBHOOK_SETUP.md** - Webhook setup guide

---

## ✅ Checklist

After fixing:
- [ ] Webhook test returns "Invalid signature" (not 401)
- [ ] Retried all failed webhooks in Lemon Squeezy
- [ ] All webhooks show 200 OK status
- [ ] Test user account shows "Plus" or "Pro" plan
- [ ] Database `profiles.user_type` updated correctly
- [ ] `subscriptions` table has subscription records

---

**Fixed on**: 2025-10-19
**Verified by**: osama.k@meemain.org ✅
