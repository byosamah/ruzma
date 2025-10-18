# Payment & Subscription System Analysis

**Date**: 2025-10-18
**Status**: 🟢 Mostly Complete - Need to verify and test user journeys

## 📊 Current Implementation

### ✅ What's Already Built

#### 1. Subscription Plans
**File**: `src/hooks/subscription/planUtils.ts`

Three plans configured:
```typescript
Free Plan:
- Price: $0
- Projects: 1
- Clients: 5
- Invoices: 5
- Storage: 100MB
- Features: Basic features only

Plus Plan:
- Price: $19/month (Store: 148628, Variant: 697231)
- Projects: Unlimited
- Clients: Unlimited
- Invoices: Unlimited
- Storage: 10GB
- Features: All premium features + AI assistant
- Trial: 7 days

Pro Plan (Lifetime):
- Price: $349 one-time (Store: 148628, Variant: 697237)
- Projects: Unlimited
- Clients: Unlimited
- Invoices: Unlimited
- Storage: 100GB
- Features: All Plus features (except AI) + lifetime access
```

#### 2. Frontend UI
**Files**:
- `/src/pages/Plans.tsx` - Plans page
- `/src/components/Subscription/SubscriptionPlans.tsx` - Plans grid
- `/src/components/Subscription/SubscriptionCard.tsx` - Individual plan card

**Features**:
✅ Responsive design (mobile/tablet/desktop)
✅ Current plan highlighting
✅ Popular plan badge
✅ Multi-currency support (USD, EUR, GBP, SAR, etc.)
✅ Bilingual (English/Arabic)
✅ Loading states
✅ Error handling with toast notifications

#### 3. Payment Integration (Lemon Squeezy)
**Edge Functions**:
- `create-checkout` - Creates Lemon Squeezy checkout session
- `cancel-subscription` - Cancels active subscription
- `lemon-squeezy-webhook` - Handles payment webhooks

**Service Layer**:
- `src/hooks/subscription/subscriptionService.ts`

**Checkout Flow**:
1. User clicks "Select Plan" button
2. `createCheckoutSession()` called with plan ID
3. Edge Function creates Lemon Squeezy checkout
4. User redirected to Lemon Squeezy payment page
5. Webhook handles successful payment
6. User profile updated with new plan

#### 4. Database Schema
**Tables**:
- `profiles` - User data with subscription info
  - `user_type`: 'free' | 'plus' | 'pro'
  - `subscription_status`: 'active' | 'cancelled' | 'expired' | etc.
  - `subscription_id`: Lemon Squeezy subscription ID

- `subscriptions` (optional) - Detailed subscription data
  - `lemon_squeezy_id`: External subscription ID
  - `variant_id`: Product variant (maps to plan)
  - `status`: Current status
  - `expires_at`: Expiration date

#### 5. Subscription Status Tracking
**Hook**: `useSubscriptionStatus()`
**File**: `src/hooks/subscription/useSubscription.ts`

Provides:
- Current plan status
- Active/cancelled/expired state
- Expiration date
- Auto-refresh on changes

## 🎯 User Journeys to Test

### Journey 1: Free → Plus Upgrade 💳

**User Story**: "As a free user, I want to upgrade to Plus to create unlimited projects"

**Steps**:
1. ✅ User logs in with free account
2. ✅ Views dashboard showing "1/1 projects used"
3. ✅ Clicks "Upgrade" or navigates to `/plans`
4. ✅ Sees 3 plan cards (Free, Plus, Pro)
5. ✅ Plus plan shows "Most Popular" badge
6. ✅ Clicks "Select Plan" on Plus
7. 🔴 **TO TEST**: Redirected to Lemon Squeezy checkout
8. 🔴 **TO TEST**: Enters payment details
9. 🔴 **TO TEST**: Completes payment
10. 🔴 **TO TEST**: Webhook updates `profiles.user_type` to 'plus'
11. 🔴 **TO TEST**: Redirected back to app
12. 🔴 **TO TEST**: Dashboard shows "Unlimited projects"

**Edge Cases**:
- [ ] What if payment fails?
- [ ] What if webhook is delayed?
- [ ] What if user closes checkout before completing?
- [ ] What if user already has Plus plan?

### Journey 2: Plus → Pro Upgrade 🚀

**User Story**: "As a Plus user, I want to upgrade to Pro for lifetime access"

**Steps**:
1. ✅ User has active Plus subscription
2. ✅ Views `/plans` page
3. ✅ Pro plan shows "Upgrade Now" badge
4. ✅ Clicks "Upgrade to Pro"
5. 🔴 **TO TEST**: System cancels Plus subscription
6. 🔴 **TO TEST**: Creates Pro checkout (one-time $349)
7. 🔴 **TO TEST**: User pays
8. 🔴 **TO TEST**: Webhook updates to Pro
9. 🔴 **TO TEST**: Plus subscription cancelled
10. 🔴 **TO TEST**: User has lifetime Pro access

**Edge Cases**:
- [ ] What if Plus cancellation fails?
- [ ] Pro-rata refund for remaining Plus period?
- [ ] Can user downgrade from Pro to Plus?

### Journey 3: Subscription Cancellation 🛑

**User Story**: "As a Plus user, I want to cancel my subscription"

**Steps**:
1. ✅ User has active Plus subscription
2. ✅ Navigates to `/plans`
3. ✅ Clicks "Cancel Subscription" or selects "Free" plan
4. 🔴 **TO TEST**: Confirmation dialog shown
5. 🔴 **TO TEST**: User confirms cancellation
6. 🔴 **TO TEST**: `cancel-subscription` Edge Function called
7. 🔴 **TO TEST**: Lemon Squeezy cancels subscription
8. 🔴 **TO TEST**: `profiles.subscription_status` → 'cancelled'
9. 🔴 **TO TEST**: User retains access until period end
10. 🔴 **TO TEST**: After period ends, downgraded to Free

**Edge Cases**:
- [ ] Immediate cancellation vs end-of-period?
- [ ] Can user resubscribe before period ends?
- [ ] What happens to data exceeding free limits?

### Journey 4: Subscription Renewal 🔄

**User Story**: "My Plus subscription renews automatically"

**Steps**:
1. 🔴 **TO TEST**: Plus subscription nears expiration
2. 🔴 **TO TEST**: Lemon Squeezy processes renewal payment
3. 🔴 **TO TEST**: Webhook received with renewal event
4. 🔴 **TO TEST**: `expires_at` updated to next billing cycle
5. 🔴 **TO TEST**: User continues with Plus access
6. 🔴 **TO TEST**: Email notification sent (optional)

**Edge Cases**:
- [ ] What if renewal payment fails?
- [ ] How many retry attempts?
- [ ] Grace period before downgrade?

### Journey 5: Free Trial (Plus Plan) 🎁

**User Story**: "I want to try Plus plan for 7 days free"

**Steps**:
1. ✅ Free user views plans page
2. ✅ Plus plan shows "7-day trial" badge
3. ✅ Clicks "Start Trial"
4. 🔴 **TO TEST**: Lemon Squeezy checkout with trial
5. 🔴 **TO TEST**: Payment method added (not charged yet)
6. 🔴 **TO TEST**: Trial starts immediately
7. 🔴 **TO TEST**: `subscription_status` → 'on_trial'
8. 🔴 **TO TEST**: 7 days later, first charge processed
9. 🔴 **TO TEST**: Status → 'active'

**Edge Cases**:
- [ ] Can user cancel during trial?
- [ ] Is trial only for new users?
- [ ] What if payment fails after trial?

## 🔍 Identified Issues & Gaps

### 🔴 Critical Issues

#### 1. Missing Subscription Management UI
**Problem**: No UI for users to:
- View current subscription details
- See next billing date
- Manage payment method
- View invoice history
- Cancel subscription (must select "Free" plan)

**Solution**: Create `/profile/subscription` page with:
- Current plan display
- Billing cycle information
- Payment method management (link to Lemon Squeezy portal)
- Invoice history
- Cancel subscription button

#### 2. Webhook Configuration Not Documented
**Problem**: Lemon Squeezy webhook URL not clearly documented

**Solution**:
- Webhook URL: `https://***REMOVED***.supabase.co/functions/v1/lemon-squeezy-webhook`
- Must be configured in Lemon Squeezy Dashboard → Settings → Webhooks
- Requires `LEMON_SQUEEZY_WEBHOOK_SECRET` environment variable

#### 3. Trial Period Not Clearly Displayed
**Problem**: 7-day trial for Plus plan not prominently shown

**Solution**: Update `SubscriptionCard.tsx` to show:
- "Start 7-day free trial" button text
- "Then $19/month" under price
- Trial period countdown if active

#### 4. Downgrade Flow Incomplete
**Problem**: Downgrading from Plus → Free is rough:
- Just updates profile
- Doesn't properly cancel Lemon Squeezy subscription
- Fallback message says "contact support"

**Solution**: Properly implement cancellation flow with:
- Confirm dialog
- Call `cancel-subscription` Edge Function
- Update Lemon Squeezy subscription
- Show "access until [date]" message

### 🟡 Medium Priority Issues

#### 5. No Loading State During Checkout Creation
**Problem**: User clicks "Select Plan" and waits with no feedback

**Solution**: Add loading spinner and disable button

#### 6. Currency Not Persisted
**Problem**: User's currency preference from profile not used consistently

**Solution**:
- Get currency from `profiles.currency`
- Pass to Lemon Squeezy checkout
- Show correct currency in plan cards

#### 7. No Subscription Status in Dashboard
**Problem**: User can't see plan status from dashboard

**Solution**: Add subscription indicator to dashboard header:
- "Free Plan" badge
- "Plus Plan - Renews Oct 25" badge
- "Upgrade" quick action

#### 8. Missing Email Notifications
**Problem**: No emails sent for:
- Subscription activation
- Payment success
- Payment failed
- Subscription cancelled
- Trial ending soon

**Solution**: Integrate with email notification system (already built!)

### 🟢 Nice-to-Have Enhancements

#### 9. Usage Warnings Before Limits
**Problem**: Users hit limits without warning

**Solution**: Add proactive notifications:
- "You've used 4/5 invoices on Free plan"
- "Upgrade to Plus for unlimited invoices"

#### 10. Plan Comparison Table
**Problem**: Hard to compare plans side-by-side

**Solution**: Add comparison table above plan cards showing all features

#### 11. Annual Billing Option
**Problem**: Only monthly billing for Plus

**Solution**: Add annual option (e.g., $190/year = save 17%)

#### 12. Referral Program
**Problem**: No user acquisition incentive

**Solution**: "Refer a friend, get 1 month free"

## 📋 Testing Checklist

### Setup (One-Time)
- [ ] Verify Lemon Squeezy account access
- [ ] Check Store ID: 148628
- [ ] Verify variant IDs: Plus (697231), Pro (697237)
- [ ] Configure webhook URL in Lemon Squeezy
- [ ] Set `LEMON_SQUEEZY_API_KEY` in Supabase Edge Functions
- [ ] Set `LEMON_SQUEEZY_WEBHOOK_SECRET` in Supabase Edge Functions
- [ ] Deploy all 3 Edge Functions (create-checkout, cancel-subscription, lemon-squeezy-webhook)

### Free → Plus Upgrade
- [ ] Click "Select Plan" on Plus card
- [ ] Verify redirected to Lemon Squeezy checkout
- [ ] Verify email pre-filled
- [ ] Complete test payment (use Lemon Squeezy test mode)
- [ ] Verify webhook received
- [ ] Verify `profiles.user_type` updated to 'plus'
- [ ] Verify `profiles.subscription_status` = 'active'
- [ ] Verify redirected back to app
- [ ] Verify dashboard shows unlimited projects
- [ ] Verify can create >1 project

### Plus → Pro Upgrade
- [ ] From Plus account, click "Upgrade to Pro"
- [ ] Verify existing Plus subscription cancelled
- [ ] Complete Pro purchase
- [ ] Verify upgraded to Pro
- [ ] Verify Plus subscription no longer shows in Lemon Squeezy

### Subscription Cancellation
- [ ] From Plus account, select "Free" plan
- [ ] Verify confirmation dialog
- [ ] Confirm cancellation
- [ ] Verify Edge Function called successfully
- [ ] Verify subscription cancelled in Lemon Squeezy
- [ ] Verify status shows "Cancelled - access until [date]"
- [ ] Wait for period to end (or manually expire)
- [ ] Verify downgraded to Free

### Trial Period
- [ ] Start new Free account
- [ ] Click "Start Trial" on Plus
- [ ] Verify 7-day trial starts
- [ ] Verify status = 'on_trial'
- [ ] Verify access to Plus features
- [ ] Test cancellation during trial
- [ ] Test conversion after trial ends

### Edge Cases
- [ ] Test payment failure scenario
- [ ] Test webhook delay (manual webhook replay)
- [ ] Test duplicate webhook (idempotency)
- [ ] Test invalid variant ID
- [ ] Test missing environment variables
- [ ] Test user closes checkout without completing

## 🚀 Implementation Plan

### Phase 1: Critical Fixes (Day 1)
1. **Test existing checkout flow** (2 hours)
   - Create test Lemon Squeezy account
   - Test Free → Plus upgrade
   - Verify webhook handling
   - Document any issues

2. **Fix downgrade flow** (3 hours)
   - Add confirmation dialog for cancellation
   - Properly call cancel-subscription Edge Function
   - Show "access until" message
   - Test cancellation flow

3. **Add subscription status to dashboard** (2 hours)
   - Show current plan badge
   - Show renewal date
   - Add "Upgrade" quick link

### Phase 2: User Experience (Day 2)
4. **Create Subscription Management page** (4 hours)
   - `/profile/subscription` route
   - Current plan details
   - Billing cycle info
   - Invoice history
   - Cancel subscription button
   - Link to Lemon Squeezy customer portal

5. **Improve trial UX** (2 hours)
   - Update button text to "Start 7-day trial"
   - Show trial period countdown
   - Add "Then $19/month" under price

6. **Add email notifications** (2 hours)
   - Subscription activated
   - Payment success
   - Subscription cancelled
   - Integrate with existing email system

### Phase 3: Polish (Day 3)
7. **Add plan comparison table** (3 hours)
   - Feature comparison matrix
   - Highlight differences
   - Mobile-responsive

8. **Usage warnings** (2 hours)
   - Proactive notifications when nearing limits
   - Upgrade prompts

9. **Loading states & error handling** (2 hours)
   - Checkout creation loading
   - Better error messages
   - Retry logic

## 📝 Environment Variables Checklist

### Supabase Edge Functions
```bash
# Already set:
✅ SUPABASE_URL
✅ SUPABASE_SERVICE_ROLE_KEY

# Need to verify:
🔴 LEMON_SQUEEZY_API_KEY
🔴 LEMON_SQUEEZY_WEBHOOK_SECRET
```

### Frontend (Vercel)
```bash
# Already set:
✅ VITE_SUPABASE_URL
✅ VITE_SUPABASE_ANON_KEY
✅ VITE_APP_BASE_URL
```

## 🔗 Useful Links

- Lemon Squeezy Dashboard: https://app.lemonsqueezy.com/
- Store 148628: https://app.lemonsqueezy.com/stores/148628
- Products: https://app.lemonsqueezy.com/stores/148628/products
- Webhooks: https://app.lemonsqueezy.com/settings/webhooks
- Supabase Functions: https://supabase.com/dashboard/project/***REMOVED***/functions
- API Documentation: https://docs.lemonsqueezy.com/api

## 💰 Pricing Strategy Notes

**Current Pricing**:
- Free: $0 (limited features)
- Plus: $19/month (7-day trial)
- Pro: $349 lifetime (one-time)

**Competitive Analysis**:
- Similar tools charge $20-30/month for comparable features
- Lifetime deal is attractive for long-term users
- 7-day trial reduces risk for new users

**Recommendations**:
- Consider annual option: $190/year (save $38 = 16.7%)
- Add "Most popular" badge to Plus (already done)
- Highlight savings: "Save $38/year with annual billing"
- Consider limited-time promotion for Pro: "$299 instead of $349"

---

**Next Steps**: Start with Phase 1 testing to verify the existing implementation works, then proceed with fixes and enhancements based on findings.
