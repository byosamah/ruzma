# 🧪 **COMPREHENSIVE SUBSCRIPTION TESTING GUIDE**

## **Testing Overview**
This guide covers testing every aspect of the subscription system to ensure 100% reliability.

## **Phase 1: Database Testing**

### **Test 1: Verify Database Migration**
```sql
-- Run in Supabase SQL Editor to verify migration was successful

-- Check if new columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'subscriptions' 
AND column_name IN ('grace_period_ends_at', 'payment_grace_ends_at', 'retry_count', 'last_retry_at');

-- Expected: 4 rows returned

-- Test grace period functions
SELECT public.calculate_trial_grace_end(NOW(), 3) as trial_grace;
SELECT public.calculate_payment_grace_end(NOW(), 7) as payment_grace;

-- Expected: Both should return timestamps 3 and 7 days in future
```

### **Test 2: Subscription Events Logging**
```sql
-- Test subscription event logging
SELECT public.log_subscription_event(
  gen_random_uuid(),  -- subscription_id
  auth.uid(),         -- user_id  
  'test_event',       -- event_type
  'old_status',       -- old_status
  'new_status',       -- new_status
  '{"test": true}'::jsonb  -- metadata
);

-- Check if event was logged
SELECT * FROM subscription_events WHERE event_type = 'test_event';
```

---

## **Phase 2: Function Testing**

### **Test 3: Webhook Function**
```bash
# Test lemon-squeezy-webhook function
curl -X POST https://***REMOVED***.supabase.co/functions/v1/lemon-squeezy-webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -d '{
    "meta": {
      "event_name": "subscription_created"
    },
    "data": {
      "type": "subscriptions",
      "id": "123456",
      "attributes": {
        "status": "on_trial",
        "trial_ends_at": "2024-01-20T00:00:00Z",
        "product_name": "Ruzma Plus"
      }
    }
  }'

# Expected Response: {"received": true, "processed": true}
```

### **Test 4: Cancel Subscription Function**
```bash
# Test cancel-subscription function
curl -X POST https://***REMOVED***.supabase.co/functions/v1/cancel-subscription \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "subscription_id": "123456"
  }'

# Expected Response: {"success": true, "cancelled": true}
```

### **Test 5: Process Expired Subscriptions Function**
```bash
# Test process-expired-subscriptions function  
curl -X POST https://***REMOVED***.supabase.co/functions/v1/process-expired-subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"

# Expected Response: {"success": true, "processed": 0, "downgraded": 0}
```

### **Test 6: Send Notification Function**
```bash
# Test send-payment-notification function
curl -X POST https://***REMOVED***.supabase.co/functions/v1/send-payment-notification \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -d '{
    "user_id": "YOUR_USER_ID",
    "notification_type": "trial_ending_soon",
    "days_remaining": 3
  }'

# Expected Response: {"success": true, "sent": true}
```

---

## **Phase 3: Frontend Integration Testing**

### **Test 7: Subscription Validation**
Open browser console on your app and run:
```javascript
// Test subscription validator with different scenarios
const testValidation = async () => {
  // You'll need to get a real user_id from your app
  const userId = 'your-user-id-here';
  
  console.log('Testing subscription validation...');
  
  // This should work if subscriptionValidator.ts is properly imported
  const result = await validateSubscriptionAccess(userId);
  console.log('Validation result:', result);
  
  // Expected: Should not throw errors and return proper validation object
};

testValidation();
```

### **Test 8: Frontend Error Handling**
1. Open browser and go to your app: http://localhost:8080/
2. Open DevTools Console (F12)
3. Look for these specific errors that should NOT appear:
   ```
   ❌ 400 Bad Request (subscription queries)
   ❌ subscriptions is not defined
   ❌ Invalid API key errors
   ❌ Database connection errors
   ```

### **Test 9: Subscription UI Components**
Test these UI flows:
1. **Upgrade Flow**: Click upgrade button → Should redirect to Lemon Squeezy
2. **Cancel Flow**: Go to settings → Cancel subscription → Should show confirmation
3. **Grace Period UI**: (If in grace period) Should show warning messages
4. **Feature Restrictions**: Try accessing pro features as free user

---

## **Phase 4: Complete User Journey Testing**

### **Test Scenario A: New User Trial**
1. **Create New Account** → Should be `user_type: 'free'`
2. **Click Upgrade** → Should redirect to Lemon Squeezy checkout
3. **Complete Payment** → Webhook should update subscription status
4. **Verify Premium Access** → Should have pro/plus features enabled
5. **Check Database** → Should have subscription record with `status: 'on_trial'`

### **Test Scenario B: Trial Expiration with Payment**
1. **Simulate Trial End** → Manually update `trial_ends_at` to past date
2. **Simulate Payment Success** → Send webhook with payment_success event
3. **Verify Status Change** → Should become `status: 'active'`
4. **Check Continued Access** → Should maintain premium features

### **Test Scenario C: Trial Expiration with Grace Period**
1. **Simulate Trial End** → Update `trial_ends_at` to past date
2. **Simulate Payment Failure** → Send webhook with payment_failed event
3. **Check Grace Period** → Should set `grace_period_ends_at` +3 days
4. **Verify Continued Access** → Should maintain access during grace
5. **Simulate Grace Expiry** → Run process-expired-subscriptions
6. **Check Downgrade** → Should become `user_type: 'free'`

### **Test Scenario D: Monthly Payment Failure**
1. **Active Subscription** → Start with `status: 'active'`
2. **Simulate Payment Failure** → Send payment_failed webhook
3. **Check Payment Grace** → Should set `payment_grace_ends_at` +7 days
4. **Verify Access Continues** → Premium features should still work
5. **Simulate Recovery** → Send payment_success webhook
6. **Verify Recovery** → Should return to `status: 'active'`

### **Test Scenario E: Subscription Cancellation**
1. **Active Subscription** → Start with `status: 'active'`
2. **User Cancels** → Click cancel in UI
3. **Check API Call** → Should use PATCH method to Lemon Squeezy
4. **Webhook Received** → Should receive subscription_cancelled event
5. **Update Status** → Should become `status: 'cancelled'`
6. **Access Until End** → Should maintain access until period_ends_at
7. **Auto-Downgrade** → After period ends, should downgrade to free

---

## **Phase 5: Performance & Load Testing**

### **Test 10: Webhook Performance**
```bash
# Send multiple webhook events rapidly
for i in {1..10}; do
  curl -X POST https://***REMOVED***.supabase.co/functions/v1/lemon-squeezy-webhook \
    -H "Content-Type: application/json" \
    -d "{\"meta\": {\"event_name\": \"test_$i\"}, \"data\": {}}" &
done
wait

# Check function logs for any failures or timeouts
```

### **Test 11: Database Performance**
```sql
-- Test query performance on subscriptions table
EXPLAIN ANALYZE 
SELECT * FROM subscriptions 
WHERE grace_period_ends_at < NOW() 
  AND status = 'on_trial';

-- Should use index and complete in <50ms
```

---

## **Phase 6: Monitoring & Alerting Testing**

### **Test 12: Function Logs**
1. Go to Supabase Dashboard → Edge Functions
2. Check logs for each function:
   - `lemon-squeezy-webhook`
   - `cancel-subscription`
   - `send-payment-notification`
   - `process-expired-subscriptions`
3. Look for errors, warnings, or performance issues

### **Test 13: Database Logs**
1. Check Supabase Dashboard → Database → Logs
2. Look for:
   - Slow queries (>1 second)
   - Connection errors
   - Permission denied errors
   - Deadlocks or timeouts

---

## **Automated Testing Script**

### **Create Test Runner**
```javascript
// test-subscription-system.js
const runAllTests = async () => {
  console.log('🚀 Starting comprehensive subscription system tests...\n');
  
  const tests = [
    () => testDatabaseMigration(),
    () => testWebhookFunction(),
    () => testCancelFunction(),
    () => testProcessFunction(),
    () => testSubscriptionValidation(),
    () => testFrontendIntegration()
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const [index, test] of tests.entries()) {
    try {
      console.log(`Test ${index + 1}: Running...`);
      await test();
      console.log(`✅ Test ${index + 1}: PASSED\n`);
      passed++;
    } catch (error) {
      console.log(`❌ Test ${index + 1}: FAILED - ${error.message}\n`);
      failed++;
    }
  }
  
  console.log(`\n📊 TEST RESULTS:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${(passed / tests.length * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log(`\n🎉 ALL TESTS PASSED! Subscription system is ready for production! 🚀`);
  } else {
    console.log(`\n⚠️ Some tests failed. Please fix issues before going to production.`);
  }
};

// Run the test suite
runAllTests();
```

---

## **Success Criteria**

For the subscription system to be considered "100% Complete", all these must pass:

### **Database Tests**
- ✅ All grace period columns exist
- ✅ All functions execute without errors
- ✅ Event logging works correctly

### **Function Tests**
- ✅ All 4 functions respond successfully
- ✅ Webhook processes events correctly
- ✅ Cancellation calls Lemon Squeezy API properly
- ✅ Expired subscriptions are processed

### **Frontend Tests**
- ✅ No console errors
- ✅ Subscription validation works
- ✅ UI flows work end-to-end

### **Integration Tests**
- ✅ Complete user journeys work
- ✅ Grace periods function properly
- ✅ Auto-downgrades execute correctly

### **Performance Tests**
- ✅ Functions respond in <5 seconds
- ✅ Database queries use indexes
- ✅ System handles concurrent requests

Once all these tests pass, your subscription system is production-ready! 🎯