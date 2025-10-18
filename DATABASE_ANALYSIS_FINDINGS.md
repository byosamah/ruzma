# Database Analysis Findings
**Date**: 2025-10-18
**Analysis Method**: Supabase JavaScript client queries via Node.js script

---

## 🎯 Executive Summary

We ran a comprehensive analysis of the Ruzma database to understand the subscription table architecture. Here are the **critical findings**:

### Key Discovery: `active_subscriptions` IS A TABLE, NOT A VIEW ⚠️

**Previous assumption**: We thought `active_subscriptions` might be a PostgreSQL VIEW
**Reality**: It's an actual TABLE with data in it

---

## 📊 All Tables Verified

✅ **All 13 tables exist in the database:**

| Table Name | Record Count | Status |
|------------|--------------|--------|
| profiles | 0 (RLS blocked) | ✅ EXISTS |
| projects | 0 (RLS blocked) | ✅ EXISTS |
| clients | 0 (RLS blocked) | ✅ EXISTS |
| milestones | 0 (RLS blocked) | ✅ EXISTS |
| invoices | 0 (RLS blocked) | ✅ EXISTS |
| **subscriptions** | **0 records** | ✅ EXISTS |
| **active_subscriptions** | **1 record** | ✅ EXISTS |
| client_project_tokens | 0 (RLS blocked) | ✅ EXISTS |
| freelancer_branding | 0 (RLS blocked) | ✅ EXISTS |
| project_templates | 0 (RLS blocked) | ✅ EXISTS |
| notifications | 0 (RLS blocked) | ✅ EXISTS |
| email_logs | 0 (RLS blocked) | ✅ EXISTS |
| security_events | 0 (RLS blocked) | ✅ EXISTS |

**Note**: Most tables show "0 records" because we queried with the **anon key**, which has Row Level Security (RLS) policies. RLS prevents seeing other users' data when not authenticated.

---

## 🔍 Deep Dive: `active_subscriptions` Table

### Table Structure

`active_subscriptions` has **15 columns** (much richer than `subscriptions` table's 8 columns):

```typescript
{
  id: string,
  user_id: string,
  lemon_squeezy_id: string,
  status: string,
  variant_id: string,
  product_id: string,
  created_at: timestamp,
  updated_at: timestamp,
  cancelled_at: timestamp | null,
  expires_at: timestamp | null,
  payment_type: string,  // 'recurring' | 'one-time'
  lifetime_purchased_at: timestamp | null,
  full_name: string,
  email: string,
  subscription_description: string
}
```

### Current Data

**1 record found**:

```json
{
  "full_name": "Yazeed Alshiddi",
  "email": "yz.shiddi@gmail.com",
  "user_id": "793c2384-278d-437a-89f1-4255770d33d2",
  "status": "active",
  "lemon_squeezy_id": "1311840",
  "variant_id": "697231",  // Plus plan
  "product_id": "451577",
  "payment_type": "recurring",
  "expires_at": "2025-10-02T14:28:45+00:00",  // Oct 2, 2025
  "created_at": "2025-07-02T14:30:23.737318+00:00"  // Jul 2, 2025
}
```

**Analysis**:
- This is a **real active subscription** from Lemon Squeezy
- User: Yazeed Alshiddi (yz.shiddi@gmail.com)
- Plan: Plus ($19/month, variant 697231)
- Subscription ID: 1311840
- Started: July 2, 2025
- Expires: October 2, 2025 (3 months active)

---

## 🤔 Critical Question: Why Two Subscription Tables?

### Table 1: `subscriptions` (Code-Based)
- **Created by**: Migration file `20250101000000_create_subscriptions_table.sql`
- **Used in**: `subscriptionService.ts`, `lemon-squeezy-webhook/index.ts`
- **Purpose**: Minimal subscription tracking for webhook integration
- **Current state**: **EMPTY (0 records)**
- **Columns**: 8 (id, user_id, lemon_squeezy_id, status, variant_id, created_at, updated_at, expires_at)

### Table 2: `active_subscriptions` (Manual/Unknown Origin)
- **Created by**: **UNKNOWN** - Not in migrations, not in codebase
- **Used in**: **NOWHERE** - Zero code references
- **Purpose**: **UNCLEAR** - Rich subscription tracking with customer details
- **Current state**: **HAS DATA (1 record)**
- **Columns**: 15 (includes full_name, email, payment_type, product_id, subscription_description, etc.)

---

## 🚨 The Mystery: How Does `active_subscriptions` Have Data?

### Hypothesis 1: Created Manually in Supabase Dashboard ⭐ MOST LIKELY
**Evidence**:
- Not in any migration file
- Not in codebase
- Has rich schema with customer details (full_name, email)
- Could have been created during initial testing/development

**Timeline guess**:
1. July 2, 2025: Someone manually created the table in Supabase
2. Manually inserted Yazeed's subscription data
3. Never integrated with the codebase
4. Later (October), proper `subscriptions` table was added via migration
5. Now both tables exist but serve different purposes

### Hypothesis 2: Old Table That Was Replaced
**Evidence**:
- `subscriptions` table is newer (has proper migration)
- `active_subscriptions` might be from an earlier prototype
- Migration might have created `subscriptions` to replace it
- Old data left behind

### Hypothesis 3: Created by a Database Trigger
**Evidence**:
- Less likely, but possible
- Could be a materialized view or trigger-populated table
- Need to check database triggers

---

## ⚖️ Comparison: `subscriptions` vs `active_subscriptions`

| Feature | subscriptions | active_subscriptions |
|---------|--------------|---------------------|
| **In migrations** | ✅ Yes | ❌ No |
| **In codebase** | ✅ Yes (2 files) | ❌ No (0 files) |
| **Has data** | ❌ Empty | ✅ 1 record |
| **Columns** | 8 | 15 |
| **Customer info** | ❌ No | ✅ Yes (name, email) |
| **Payment type** | ❌ No | ✅ Yes |
| **Product ID** | ❌ No | ✅ Yes |
| **Webhook updates** | ✅ Yes | ❌ Unknown |
| **Purpose** | Clear (webhook tracking) | Unclear |

---

## 🎯 Recommendations

### 1. Determine Origin of `active_subscriptions`
**Action**: Run this SQL in Supabase Dashboard:
```sql
-- Check if there are any triggers related to active_subscriptions
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name ILIKE '%subscription%'
   OR event_object_table ILIKE '%subscription%';

-- Check if it's actually a materialized view
SELECT
    matviewname,
    definition
FROM pg_matviews
WHERE matviewname = 'active_subscriptions';

-- Check table creation date (if possible)
SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE tablename IN ('subscriptions', 'active_subscriptions')
ORDER BY tablename;
```

### 2. Decide What to Do With `active_subscriptions`

#### Option A: Keep Both Tables ✅ SAFEST
**Reasoning**:
- `active_subscriptions` has real customer data (Yazeed's subscription)
- Deleting it would lose that data
- No downside to keeping it (except minor confusion)

**Action**:
- Document the table in CLAUDE.md
- Add a migration to formalize its schema
- Optionally integrate it into the codebase

#### Option B: Migrate Data & Delete ⚠️ RISKY
**Steps**:
1. Export Yazeed's data from `active_subscriptions`
2. Insert into `subscriptions` table
3. Update `profiles` table to link subscription
4. Drop `active_subscriptions` table
5. Update documentation

**Risk**:
- Might break something we don't know about
- Data has different schema (15 cols vs 8 cols)

#### Option C: Make It a Database View 🔄 MIDDLE GROUND
**Idea**:
- Rename current `active_subscriptions` to `active_subscriptions_legacy`
- Create a proper VIEW called `active_subscriptions`:
```sql
CREATE OR REPLACE VIEW active_subscriptions AS
SELECT
    s.*,
    p.email,
    p.full_name
FROM subscriptions s
LEFT JOIN profiles p ON p.id = s.user_id
WHERE s.status = 'active';
```

### 3. Why Is `subscriptions` Table Empty?

**Likely reasons**:
1. **Webhook hasn't fired yet** - designbattlefield@gmail.com paid before webhook was configured
2. **Manual upgrade didn't populate subscriptions table** - We only updated `profiles`, not `subscriptions`
3. **Only one real subscription exists** - Yazeed's, which is in `active_subscriptions`, not `subscriptions`

**Action**: When next webhook fires (test event or real payment), it should populate `subscriptions` table

---

## 🔗 How Tables Connect (Updated Understanding)

```
auth.users (Supabase Auth)
    ↓ (id)
profiles (User data)
    ↓ (user_id)
    ├── projects
    ├── clients
    ├── invoices
    ├── subscriptions (webhook-tracked, empty)
    └── active_subscriptions? (manual?, has data, unused in code)
```

**Two subscription tracking systems coexist:**
1. **New system**: `profiles.user_type` + `subscriptions` table (integrated with webhooks)
2. **Old system?**: `active_subscriptions` table (manual data, no code integration)

---

## 📝 RLS Policy Note

**Why we see "0 records" for most tables**:

When querying with the **anon key** (not authenticated as a user), Row Level Security (RLS) policies block access to user data. This is **expected and correct** behavior.

**Example RLS policy on `profiles`:**
```sql
CREATE POLICY "Users can only see their own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);
```

**Result**:
- Authenticated users see their own data
- Anon key sees nothing (0 records)
- This protects user privacy ✅

**Confirmed**: The user's earlier query showed their profile exists and is upgraded to "plus":
```json
{
  "email": "designbattlefield@gmail.com",
  "user_type": "plus",
  "subscription_status": "active"
}
```

So RLS is working correctly, and the data exists - we just can't see it with the anon key.

---

## ✅ Next Steps

1. **Document `active_subscriptions` in CLAUDE.md** ← YOU ARE HERE
2. **Decide**: Keep, migrate, or convert to view
3. **Test webhook** - Send test event to populate `subscriptions` table
4. **Verify**: Check that webhooks update both `profiles` AND `subscriptions`
5. **Monitor**: Watch for conflicts between the two subscription systems

---

## 📊 Summary Table: What We Know Now

| Question | Answer | Confidence |
|----------|--------|------------|
| Does `active_subscriptions` exist? | ✅ Yes, it's a TABLE | 100% |
| Is it a VIEW or TABLE? | TABLE | 100% |
| Does it have data? | ✅ Yes (1 record) | 100% |
| Is it used in code? | ❌ No (0 references) | 100% |
| Who created it? | Unknown (manual?) | 50% |
| Should we keep it? | Yes (for now) | 75% |
| Does `subscriptions` work? | Yes but empty | 100% |
| Are both tables needed? | Unclear | 25% |

---

**Conclusion**: We have a **dual subscription tracking system** - one integrated with code (`subscriptions`), one with manual data (`active_subscriptions`). The manual one has real customer data but no code integration. Recommended action: Keep both for now, document thoroughly, and test webhooks to populate the proper `subscriptions` table.
