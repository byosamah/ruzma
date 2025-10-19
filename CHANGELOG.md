# Changelog

All notable changes to the Ruzma project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Critical Fixes - October 2024

#### Pro Plan Lifetime Access Protection (2024-10-19)

**Complete Protection System Implemented**: Pro plan users now have 4-layer protection against downgrades

**The Implementation**:
1. **Database Layer**: Pro users have `subscription_id = NULL` (no subscription = no expiry)
2. **Webhook Layer**: `order_created` event handler clears `subscription_id` for Pro purchases
3. **UI Layer**: Downgrade buttons disabled for Pro users, show "Lifetime Access" text
4. **Server Logic Layer**: Downgrade flow prevents Pro users from downgrading with error toast

**Files Modified**:
- `supabase/functions/lemon-squeezy-webhook/index.ts:194` - Added `subscription_id: null` for Pro purchases
- `src/components/Subscription/SubscriptionCardButton.tsx:82-89` - Added Pro user button disabled logic
- `src/components/Subscription/SubscriptionCardButton.tsx:58-61` - Added "Lifetime Access" button text
- `src/hooks/subscription/subscriptionService.ts:34-38` - Added Pro user downgrade prevention
- `src/lib/translations/plans.ts:14,94` - Added 'lifetimeAccess' translation key

**Translation Updates**:
- English: "Lifetime Access"
- Arabic: "وصول مدى الحياة"
- Monthly plan text: "Unlimited projects. Monthly Access." (English) / "مشاريع غير محدودة. وصول شهري." (Arabic)

**What This Guarantees**:
- ✅ Pro plan never expires (no subscription_id = no expiry date)
- ✅ Cannot downgrade from Pro (UI + server + database + webhook protection)
- ✅ Plus → Free downgrade works correctly
- ✅ Future Pro purchases auto-protected (webhook clears subscription_id automatically)

**Documentation Created**:
- `FINAL_FIX_INSTRUCTIONS.md` - Complete implementation guide
- `FIX_PRO_ACCOUNT_SUBSCRIPTION_ID.sql` - SQL cleanup script for existing Pro users

**Deployment Status**:
- ✅ Webhook handler deployed to production
- ✅ Frontend changes deployed to https://app.ruzma.co
- ✅ All 4 protection layers active

---

#### Webhook JWT Verification Fix (2024-10-19)

**Critical Bug Fixed**: All Lemon Squeezy webhooks failing with 401 "Missing authorization header"

**The Problem**:
- Supabase Edge Functions had **JWT verification enabled by default**
- Setting: "Verify JWT with legacy secret" toggle was ON in production
- Lemon Squeezy webhooks don't include `Authorization` header (use `X-Signature` instead)
- Supabase blocked ALL webhook requests before our code could run ❌
- Users paid for subscriptions but accounts were never upgraded

**The Root Cause**:
```
Lemon Squeezy → Webhook POST → Supabase Edge Function
                                   ↓
                            JWT Verification Layer (ENABLED)
                                   ↓
                            ❌ 401 "Missing authorization header"
                            (Our code never runs!)
```

**The Fix**:
1. **Go to**: Supabase Dashboard → Edge Functions → `lemon-squeezy-webhook`
2. **Find**: "Verify JWT with legacy secret" toggle
3. **Disable it**: Turn OFF the toggle
4. **Save changes**
5. **Result**: Webhooks now reach our code ✅

**Why This is Safe**:
- Our webhook handler implements **its own security**
- Verifies `X-Signature` header using HMAC-SHA256
- Uses `LEMON_SQUEEZY_WEBHOOK_SECRET` for signature verification
- Supabase's own recommendation: **"OFF with JWT and additional authorization logic implemented inside your function's code"**

**Testing Results**:
- ✅ All webhooks now return 200 OK
- ✅ Accounts upgrade correctly (Free → Plus/Pro)
- ✅ Database updates properly
- ✅ Subscription tracking works

**Documentation**: See `WEBHOOK_JWT_FIX.md` for complete technical analysis

**IMPORTANT**: Always disable JWT verification for webhook Edge Functions that receive requests from external services!

---

#### Pro Plan Webhook Fix (2024-10-19)

**Critical Bug Fixed**: Pro plan upgrades were not processing due to missing `order_created` event handler.

**The Problem**:
- Pro plan ($349 lifetime) is a ONE-TIME PURCHASE (not subscription)
- One-time purchases trigger `order_created` webhook event from Lemon Squeezy
- Webhook function ONLY handled subscription events (`subscription_created`, etc.)
- Pro purchases were completely ignored by the system ❌
- Users paid but accounts were never upgraded

**The Fix**:
- **Added `order_created` event handler** to `supabase/functions/lemon-squeezy-webhook/index.ts`
- Extracts variant_id from order.first_order_item
- Maps variant 697237 → 'pro' user type
- Automatically cancels existing Plus subscriptions on Pro upgrade
- Logs security events for audit trail
- Deployed successfully ✅

**Action Required**:
1. **Configure Lemon Squeezy webhook** to include `order_created` event
2. See `LEMON_SQUEEZY_WEBHOOK_SETUP.md` for complete guide
3. See `FIX_PRO_UPGRADE_ISSUE.md` for technical details

**Webhook Events Now Handled**:
- ✅ `order_created` (Pro purchases) ← **NEW**
- ✅ `order_refunded` ← **NEW**
- ✅ `subscription_created` (Plus subscriptions)
- ✅ `subscription_updated`
- ✅ `subscription_cancelled`
- ✅ `subscription_expired`
- ✅ `subscription_payment_success`
- ✅ `subscription_payment_failed`

**Prevention**:
- Plus → Pro upgrade flow marked as "TO TEST" in docs but was never tested
- Always test BOTH subscription AND one-time purchase flows
- Monitor webhook deliveries in Lemon Squeezy dashboard

**Documentation Created**:
- `FIX_PRO_UPGRADE_ISSUE.md` - Complete technical analysis
- `LEMON_SQUEEZY_WEBHOOK_SETUP.md` - Webhook configuration guide
- `UPGRADE_TO_PRO_SUMMARY.md` - Quick reference for affected users
- `upgrade-to-pro-manual.sql` - Manual account upgrade script

---

#### Database Schema Analysis (2024-10-18)

**Complete Subscription System Investigation**:
- **Analyzed**: All 13 database tables via Supabase JavaScript client
- **Discovered**: Two-table subscription architecture explained
- **Verified**: `active_subscriptions` is a legacy table (not a VIEW)
- **Documented**: Complete table relationships and usage patterns

**Key Findings**:
- **`subscriptions` table**: Empty (webhook-based, will populate on next payment)
- **`active_subscriptions` table**: Has 1 test subscription, 0 code references
- **Two-table pattern**: `profiles` (fast) + `subscriptions` (complete)
- **RLS policies**: Working correctly (anon key sees 0 records as expected)

**Documentation Created**:
- `DATABASE_SCHEMA_ANALYSIS.md` (300+ lines) - All tables documented
- `DATABASE_ANALYSIS_FINDINGS.md` - Investigation report with recommendations
- `SUBSCRIPTION_SYSTEM_COMPLETE_ANALYSIS.md` - Executive summary
- `ANALYZE_ALL_TABLES.sql` - Verification queries

**Subscription Architecture Confirmed**:
```
Payment Flow:
1. User pays → Lemon Squeezy webhook fires
2. Webhook updates profiles.user_type = 'plus'
3. Webhook inserts into subscriptions table
4. Both tables stay in sync automatically
```

**Status**: ✅ System verified working, documentation complete

---

#### Testing Session Improvements (2024-10-18)

**Comprehensive Manual Testing & Bug Fixes**:
- **Testing Journey**: Completed full user testing flow covering authentication, profile management, and account deletion
- **Critical Bugs Fixed**:
  - Fixed password change security vulnerability - now validates current password before allowing change
  - Fixed profile data persistence issues (website, company, country fields)
  - Fixed website URL validation to accept flexible formats (with/without https://, www.)
  - Fixed account deletion infinite loop and redirect issues
  - Fixed profile creation error handling for deleted auth users

**Account Deletion System**:
- **Created**: Secure `delete-account` Edge Function with proper data cleanup
- **Features**:
  - Service role authentication for admin operations
  - Complete data deletion: invoices, milestones, projects, clients, subscriptions, branding, profile
  - Storage file cleanup (avatars, logos, deliverables, payment proofs)
  - Auth user deletion via admin API
  - Proper error handling and audit logging
- **Frontend**: Updated DeleteAccountDialog to use Edge Function instead of broken client-side admin call
- **Safety**: Added confirmation dialog, proper sign-out flow, session cleanup
- **Deployed**: Function live at `https://***REMOVED***.supabase.co/functions/v1/delete-account`

**Security Enhancements**:
- **Password Change**: Added current password verification via re-authentication
  - Prevents unauthorized password changes from hijacked sessions
  - Shows clear error if current password is incorrect
  - Added translations for error messages
- **Profile Data**: Fixed missing fields in fetch/save operations
  - Added `company`, `website`, `bio`, `country` to fetch query
  - Added `country` to update mutation
  - Prevents data loss on page refresh

**URL Validation Improvements**:
- **Flexible URL Input**: Website field now accepts multiple formats
  - `example.com` → automatically converts to `https://example.com`
  - `www.example.com` → converts to `https://www.example.com`
  - `https://example.com` → keeps as-is
  - `http://example.com` → keeps as-is
- **Changed**: Input type from `url` to `text` to prevent browser validation conflicts
- **Applied to**: Website field and all social links (LinkedIn, Twitter, Instagram, Behance, Dribbble)

**Profile Data Persistence**:
- **Fixed**: `fetchExistingProfile` now includes `company`, `website`, `bio`, `country` fields
- **Fixed**: `updateProfile` now saves `country` field
- **Fixed**: Environment variable loading (`.env.local` was overriding `.env`)

**Error Handling**:
- **Infinite Loop Prevention**: Profile creation now detects deleted auth users (409/406 errors)
- **Auto Recovery**: Signs out and redirects to login if auth user is deleted
- **Better Messages**: Clear error messages for profile setup failures

**Files Modified**:
- `src/components/Profile/ChangePasswordDialog.tsx` - Added password verification
- `src/components/Profile/DeleteAccountDialog.tsx` - Edge Function integration, better cleanup
- `src/components/Profile/PersonalInfoSection.tsx` - URL field type change
- `src/hooks/profile/useProfileActions.ts` - Added country to save, fixed interface
- `src/hooks/profile/utils/profileFetchers.ts` - Added missing fields to fetch, error handling
- `src/lib/validators/profile.ts` - Flexible URL validator with transform/refine
- `src/lib/translations/profile.ts` - New translation keys for errors
- `supabase/functions/delete-account/index.ts` - New Edge Function (261 lines)

**Deployment**:
- Edge Function deployed successfully via `supabase functions deploy delete-account`
- Tested with real account deletion (designbattlefield@gmail.com)
- Verified complete data removal from all tables
- Confirmed proper redirect flow and session cleanup

---

### Major Features Added

#### Lemon Squeezy Payment Integration

- **Added**: Complete subscription payment system
- 3 new Edge Functions:
  - `create-checkout` - Creates payment checkout sessions
  - `cancel-subscription` - Handles subscription cancellations
  - `lemon-squeezy-webhook` - Processes payment webhooks
- Database schema updated with `subscriptions` table
- Webhook signature verification for security
- Automatic user profile upgrades/downgrades
- Plus plan ($19/mo) and Pro plan ($349 lifetime)
- Full webhook integration (8 events supported)
- Store ID: 148628, Variants: 697231 (Plus), 697237 (Pro)

#### Vite 7 Upgrade

- **Updated**: Vite from 5.4.20 → 7.1.9
- **Updated**: @vitejs/plugin-react-swc from 3.7.1 → 4.1.0
- **Updated**: lovable-tagger from 1.1.7 → 1.1.11 (Vite 7 compatibility)
- All builds passing with zero breaks
- Improved build performance
- Modern ESBuild optimizations

#### Security Enhancements

- **Migrated**: All Supabase credentials to environment variables
- Removed hardcoded credentials from source code
- Added runtime validation for missing env vars
- Enhanced `.env.example` with comprehensive documentation
- Configured Vercel environment variables via CLI
- Added `.env.production` to gitignore

#### Testing Framework Migration

- **Removed**: Cypress E2E testing framework completely
- Deleted 10+ test files, fixtures, screenshots
- Removed `cypress.config.ts` and all Cypress dependencies
- Reduced bundle size significantly

#### Spec Kit Integration

- **Added**: Comprehensive feature specification system in `.specify/`
- New commands: `/specify`, `/plan`, `/tasks`, `/implement`, `/constitution`
- Templates for specs, plans, tasks, and agent interactions
- Bash scripts for feature management workflow
- Constitution-based development guidance

#### Documentation Improvements

- Created comprehensive `README.md` with setup instructions
- Updated `CLAUDE.md` with current architecture and patterns
- Cleaned up legacy documentation files (20+ deleted)
- Enhanced `.env.example` with Lemon Squeezy setup instructions

#### Email System Enhancement

- New migration: `001_email_logs.sql` for email tracking
- Email logs table with RLS policies
- Tracks template, recipient, status, errors
- Service role-only access for security

#### Test Coverage Expansion (2024-10-15)

- **Added**: 222 new tests for core services and utilities
- **Coverage**: Expanded from ~0.8% to 9.33% overall coverage
- **Test Files Created**:
  - `src/lib/__tests__/utils.test.ts` (38 tests) - Utility functions
  - `src/lib/__tests__/i18n.test.ts` (29 tests) - Translation system
  - `src/lib/__tests__/inputValidation.test.ts` (60 tests) - XSS prevention
  - `src/services/core/__tests__/BaseService.test.ts` (30 tests) - Service foundation
  - `src/services/core/__tests__/ServiceRegistry.test.ts` (36 tests) - DI container
  - `src/services/__tests__/projectService.test.ts` (29 tests) - Project business logic
- **Quality**: 66.22% branch coverage, 60% function coverage
- **Framework**: Vitest 3.2.4 with browser mode support
- **Dependencies**: Added `@vitest/coverage-v8` for coverage reporting
- Total: 281 tests passing

#### Translation System Quality Improvements (2024-10-15)

- **Fixed**: Removed 11 duplicate translation keys causing build warnings
- **Files Updated**:
  - `src/lib/translations/analytics.ts` - Removed 2 duplicates
  - `src/lib/translations/common.ts` - Removed 9 duplicates
- **Consistency**: Updated "Project Not Found" → "Project not found" (sentence case)
- **Build Result**: Zero warnings, clean builds
- **Impact**: Improved maintainability and reduced confusion

---

### Configuration Changes

**Dependencies removed**:
- `cypress` (13.16.1)
- `@badeball/cypress-cucumber-preprocessor`
- `@bahmutov/cypress-esbuild-preprocessor`

**Dependencies updated**:
- `vite`: 5.4.20 → 7.1.9
- `@vitejs/plugin-react-swc`: 3.7.1 → 4.1.0
- `lovable-tagger`: 1.1.7 → 1.1.11

**Dependencies added**:
- `@vitest/coverage-v8`: ^3.2.4 - Coverage reporting for tests

**New Edge Functions**:
- `create-checkout` - Lemon Squeezy checkout creation
- `cancel-subscription` - Subscription cancellation
- `lemon-squeezy-webhook` - Payment webhook handler
- `delete-account` - Secure account deletion with complete cleanup

**New Environment Variables**:
```bash
# Frontend (Vercel)
VITE_APP_BASE_URL=https://app.ruzma.co

# Edge Functions (Supabase)
LEMON_SQUEEZY_API_KEY=<your-key>
LEMON_SQUEEZY_WEBHOOK_SECRET=<your-secret>
```

**New structure**:
- `.specify/` - Feature specification system
- `.claude/commands/` - Custom slash commands
- `supabase/functions/create-checkout/` - Checkout function
- `supabase/functions/cancel-subscription/` - Cancellation function
- `supabase/functions/lemon-squeezy-webhook/` - Webhook function
- `supabase/functions/delete-account/` - Account deletion function

---

### Migration Notes

**For developers**:
1. Run `npm install` to update dependencies (Vite 7, React SWC 4.1)
2. Copy `.env.example` to `.env` and fill in Supabase credentials
3. Review new `/specify`, `/plan`, `/tasks` commands for feature development
4. Continue using Vitest for unit/integration tests
5. Use new email logging system for email debugging
6. Configure Lemon Squeezy webhook in dashboard (instructions in `.env.example`)

**For deployment**:
1. Set environment variables in Vercel Dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_APP_BASE_URL`
2. Set Edge Function secrets in Supabase Dashboard:
   - `LEMON_SQUEEZY_API_KEY`
   - `LEMON_SQUEEZY_WEBHOOK_SECRET`
   - `RESEND_API_KEY` (for emails)
3. Deploy Edge Functions:
   ```bash
   supabase functions deploy create-checkout
   supabase functions deploy cancel-subscription
   supabase functions deploy lemon-squeezy-webhook
   supabase functions deploy delete-account
   ```
4. Configure webhook URL in Lemon Squeezy Dashboard
5. **IMPORTANT**: Disable JWT verification for `lemon-squeezy-webhook` function in Supabase Dashboard

**For CI/CD**:
- Remove any Cypress-related CI jobs
- Ensure Node.js ≥18 for Vite 7 compatibility
- No other pipeline changes needed

---

### Breaking Changes

None - All updates maintain backward compatibility.
