# Lemon Squeezy Webhook Configuration Guide

**Last Updated**: 2025-10-19

This guide explains how to properly configure Lemon Squeezy webhooks for the Ruzma payment system.

## 🎯 Overview

Ruzma uses Lemon Squeezy for payment processing with two types of products:
- **Plus Plan**: Recurring subscription ($19/month) → triggers `subscription_*` events
- **Pro Plan**: One-time purchase ($349 lifetime) → triggers `order_*` events

**Both event types MUST be configured** for the system to work correctly.

## 📋 Webhook Configuration Steps

### Step 1: Access Webhook Settings

1. Go to Lemon Squeezy Dashboard: https://app.lemonsqueezy.com/
2. Navigate to: **Settings → Webhooks**
3. URL: https://app.lemonsqueezy.com/settings/webhooks

### Step 2: Create or Edit Webhook

**Webhook URL** (MUST be exactly this):
```
https://***REMOVED***.supabase.co/functions/v1/lemon-squeezy-webhook
```

### Step 3: Select Events

**CRITICAL**: Enable ALL of these events:

#### Order Events (for Pro plan - one-time purchases):
- ✅ `order_created` ← **CRITICAL for Pro purchases**
- ✅ `order_refunded`

#### Subscription Events (for Plus plan - recurring):
- ✅ `subscription_created`
- ✅ `subscription_updated`
- ✅ `subscription_cancelled`
- ✅ `subscription_expired`
- ✅ `subscription_payment_success`
- ✅ `subscription_payment_failed`

### Step 4: Get Signing Secret

1. After saving the webhook, Lemon Squeezy generates a "Signing Secret"
2. Copy this secret (starts with something like `whsec_...`)
3. Keep it safe - you'll need it for Step 5

### Step 5: Set Webhook Secret in Supabase

The webhook secret must be configured in Supabase Edge Functions:

```bash
# Set the secret
npx supabase secrets set LEMON_SQUEEZY_WEBHOOK_SECRET=whsec_your_secret_here

# Verify it's set
npx supabase secrets list
```

### Step 6: Test the Webhook

#### Option A: Send Test Event (Recommended)

1. In Lemon Squeezy webhook settings, click "Send test event"
2. Select `order_created` event type
3. Click "Send test"
4. Check Supabase logs for successful processing:
   ```
   https://supabase.com/dashboard/project/***REMOVED***/functions/lemon-squeezy-webhook
   ```
5. Look for: `Webhook received: order_created` in the logs

#### Option B: Make Test Purchase

1. Create a test account in your app
2. Purchase the Plus or Pro plan
3. Check webhook delivery in Lemon Squeezy
4. Check Supabase logs for processing
5. Verify user account was upgraded

### Step 7: Monitor Webhook Deliveries

**Always monitor webhook deliveries** after making real purchases:

1. Go to Lemon Squeezy → Settings → Webhooks
2. Click on your webhook
3. Go to "Recent deliveries" tab
4. Check for:
   - ✅ Green checkmark = Success (200 response)
   - ❌ Red X = Failed (check error message)

## 🔍 Troubleshooting

### Webhook Not Receiving Events

**Problem**: Lemon Squeezy shows event sent, but Supabase shows no logs

**Solutions**:
1. Verify webhook URL is EXACTLY: `https://***REMOVED***.supabase.co/functions/v1/lemon-squeezy-webhook`
2. Check Edge Function is deployed: `npx supabase functions list`
3. Check Edge Function logs for errors
4. Try redelivering the webhook from Lemon Squeezy

### Signature Verification Failed

**Problem**: Webhook returns 401 error "Invalid signature"

**Solutions**:
1. Check `LEMON_SQUEEZY_WEBHOOK_SECRET` is set correctly
2. Verify secret matches what's shown in Lemon Squeezy webhook settings
3. Redeploy the Edge Function after setting the secret:
   ```bash
   npx supabase functions deploy lemon-squeezy-webhook
   ```

### Events Not Processing

**Problem**: Webhook receives event but doesn't update user account

**Solutions**:
1. Check `custom_data.user_id` was passed in checkout creation
2. Verify variant_id (697231 or 697237) is in the payload
3. Check Supabase database for RLS policy issues
4. Look for error messages in Edge Function logs

### Missing `order_created` Event

**Problem**: Pro purchases don't upgrade account

**Solutions**:
1. **This was the original bug!** Make sure `order_created` is enabled
2. Pro plan is a one-time purchase, NOT a subscription
3. Check webhook events list includes `order_created`
4. Test with "Send test event" → `order_created`

## 📊 Event Types Explained

### Subscription Events (Plus Plan)

| Event | When It Fires | What It Does |
|-------|--------------|--------------|
| `subscription_created` | User starts Plus subscription | Creates subscription record, upgrades to Plus |
| `subscription_updated` | Subscription modified (price, plan, etc.) | Updates subscription details |
| `subscription_cancelled` | User cancels subscription | Marks as cancelled, access until period end |
| `subscription_expired` | Subscription period ends | Downgrades to Free plan |
| `subscription_payment_success` | Monthly payment succeeds | Ensures subscription stays active |
| `subscription_payment_failed` | Monthly payment fails | Marks subscription as unpaid |

### Order Events (Pro Plan)

| Event | When It Fires | What It Does |
|-------|--------------|--------------|
| `order_created` | User completes Pro purchase | Upgrades to Pro, cancels Plus if exists |
| `order_refunded` | Pro purchase refunded | Could downgrade (not implemented yet) |

## 🔐 Security Best Practices

1. **Always verify webhook signatures** - prevents fake webhooks
2. **Use HTTPS only** - Lemon Squeezy requires HTTPS
3. **Keep webhook secret private** - store in environment variables, never in code
4. **Log all webhook events** - for debugging and audit trail
5. **Handle idempotency** - same webhook might be sent multiple times
6. **Validate user_id** - ensure user exists before updating

## 📝 Payload Examples

### Order Created (Pro Purchase)
```json
{
  "meta": {
    "event_name": "order_created",
    "custom_data": {
      "user_id": "abc123..."
    }
  },
  "data": {
    "type": "orders",
    "id": "123456",
    "attributes": {
      "order_number": "12345",
      "user_email": "user@example.com",
      "total": "349.00",
      "currency": "USD",
      "first_order_item": {
        "variant_id": "697237",
        "product_name": "Ruzma Pro",
        "variant_name": "Lifetime"
      }
    }
  }
}
```

### Subscription Created (Plus Purchase)
```json
{
  "meta": {
    "event_name": "subscription_created",
    "custom_data": {
      "user_id": "abc123..."
    }
  },
  "data": {
    "type": "subscriptions",
    "id": "789012",
    "attributes": {
      "variant_id": "697231",
      "status": "on_trial",
      "renews_at": "2025-11-01T00:00:00Z",
      "created_at": "2025-10-25T00:00:00Z"
    }
  }
}
```

## ✅ Final Checklist

Before going live with payments:

- [ ] Webhook URL configured: `https://***REMOVED***.supabase.co/functions/v1/lemon-squeezy-webhook`
- [ ] All 8 events enabled (2 order events + 6 subscription events)
- [ ] Signing secret set in Supabase
- [ ] Test event sent successfully
- [ ] Test purchase completed successfully
- [ ] Webhook deliveries show 200 responses
- [ ] User account upgraded after test purchase
- [ ] Edge Function logs show no errors

## 🔗 Useful Links

- **Lemon Squeezy Webhooks Dashboard**: https://app.lemonsqueezy.com/settings/webhooks
- **Supabase Edge Functions**: https://supabase.com/dashboard/project/***REMOVED***/functions
- **Lemon Squeezy Webhook Docs**: https://docs.lemonsqueezy.com/help/webhooks
- **Event Types Reference**: https://docs.lemonsqueezy.com/help/webhooks/event-types

## 📞 Support

If webhooks still aren't working:
1. Check "Recent deliveries" in Lemon Squeezy for error details
2. Check Supabase Edge Function logs for stack traces
3. Verify environment variables are set correctly
4. Try redelivering failed webhooks
5. Contact Lemon Squeezy support if issue persists

---

**Last Tested**: 2025-10-19
**Status**: ✅ Working (after adding `order_created` event handler)
