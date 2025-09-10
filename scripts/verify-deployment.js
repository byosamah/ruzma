#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Run this after applying the database migration to verify everything is working
 */

import { createClient } from '@supabase/supabase-js';

// Configuration
const SUPABASE_URL = 'https://***REMOVED***.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY environment variable is required');
  console.log('Run: export SUPABASE_SERVICE_KEY=your_service_role_key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function verifyDeployment() {
  console.log('🚀 Starting deployment verification...\n');
  
  let allPassed = true;
  const results = [];

  // Test 1: Check if new columns exist in subscriptions table
  console.log('📋 Test 1: Verifying subscriptions table columns...');
  try {
    const { data, error } = await supabase
      .rpc('exec', {
        sql: `
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'subscriptions' 
          AND column_name IN ('grace_period_ends_at', 'payment_grace_ends_at', 'retry_count', 'last_retry_at')
          ORDER BY column_name;
        `
      });
    
    if (error) throw error;
    
    const expectedColumns = ['grace_period_ends_at', 'last_retry_at', 'payment_grace_ends_at', 'retry_count'];
    const foundColumns = data?.map(row => row.column_name) || [];
    
    const hasAllColumns = expectedColumns.every(col => foundColumns.includes(col));
    
    if (hasAllColumns) {
      console.log('✅ All new columns found in subscriptions table');
      results.push({ test: 'Subscriptions columns', status: 'PASS' });
    } else {
      console.log('❌ Missing columns in subscriptions table');
      console.log('   Expected:', expectedColumns);
      console.log('   Found:', foundColumns);
      results.push({ test: 'Subscriptions columns', status: 'FAIL' });
      allPassed = false;
    }
  } catch (error) {
    console.log('❌ Failed to check subscriptions table:', error.message);
    results.push({ test: 'Subscriptions columns', status: 'ERROR', error: error.message });
    allPassed = false;
  }

  // Test 2: Check if subscription_events table exists
  console.log('\n📋 Test 2: Verifying subscription_events table...');
  try {
    const { data, error } = await supabase
      .from('subscription_events')
      .select('id')
      .limit(1);
    
    if (error && error.code === 'PGRST116') {
      console.log('❌ subscription_events table does not exist');
      results.push({ test: 'Subscription events table', status: 'FAIL' });
      allPassed = false;
    } else {
      console.log('✅ subscription_events table exists and accessible');
      results.push({ test: 'Subscription events table', status: 'PASS' });
    }
  } catch (error) {
    console.log('❌ Error checking subscription_events table:', error.message);
    results.push({ test: 'Subscription events table', status: 'ERROR', error: error.message });
    allPassed = false;
  }

  // Test 3: Check if notification_queue table exists
  console.log('\n📋 Test 3: Verifying notification_queue table...');
  try {
    const { data, error } = await supabase
      .from('notification_queue')
      .select('id')
      .limit(1);
    
    if (error && error.code === 'PGRST116') {
      console.log('❌ notification_queue table does not exist');
      results.push({ test: 'Notification queue table', status: 'FAIL' });
      allPassed = false;
    } else {
      console.log('✅ notification_queue table exists and accessible');
      results.push({ test: 'Notification queue table', status: 'PASS' });
    }
  } catch (error) {
    console.log('❌ Error checking notification_queue table:', error.message);
    results.push({ test: 'Notification queue table', status: 'ERROR', error: error.message });
    allPassed = false;
  }

  // Test 4: Test grace period calculation functions
  console.log('\n📋 Test 4: Testing grace period functions...');
  try {
    const { data: trialGrace, error: trialError } = await supabase
      .rpc('calculate_trial_grace_end', { trial_ends_at: new Date().toISOString(), grace_days: 3 });
    
    const { data: paymentGrace, error: paymentError } = await supabase
      .rpc('calculate_payment_grace_end', { payment_failed_at: new Date().toISOString(), grace_days: 7 });
    
    if (trialError || paymentError) {
      throw new Error(trialError?.message || paymentError?.message);
    }
    
    if (trialGrace && paymentGrace) {
      console.log('✅ Grace period calculation functions working');
      console.log(`   Trial grace end: ${trialGrace}`);
      console.log(`   Payment grace end: ${paymentGrace}`);
      results.push({ test: 'Grace period functions', status: 'PASS' });
    } else {
      console.log('❌ Grace period functions returned null');
      results.push({ test: 'Grace period functions', status: 'FAIL' });
      allPassed = false;
    }
  } catch (error) {
    console.log('❌ Grace period functions test failed:', error.message);
    results.push({ test: 'Grace period functions', status: 'FAIL', error: error.message });
    allPassed = false;
  }

  // Test 5: Test subscription validation with new fields
  console.log('\n📋 Test 5: Testing subscription validation...');
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        status, 
        trial_ends_at, 
        expires_at, 
        subscription_plan,
        grace_period_ends_at,
        payment_grace_ends_at,
        retry_count
      `)
      .limit(1);
    
    if (error) {
      console.log('❌ Subscription validation query failed:', error.message);
      results.push({ test: 'Subscription validation', status: 'FAIL', error: error.message });
      allPassed = false;
    } else {
      console.log('✅ Subscription validation query successful');
      console.log(`   Found ${data?.length || 0} subscription records`);
      results.push({ test: 'Subscription validation', status: 'PASS' });
    }
  } catch (error) {
    console.log('❌ Subscription validation test failed:', error.message);
    results.push({ test: 'Subscription validation', status: 'ERROR', error: error.message });
    allPassed = false;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 DEPLOYMENT VERIFICATION SUMMARY');
  console.log('='.repeat(60));
  
  results.forEach(result => {
    const statusIcon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${statusIcon} ${result.test}: ${result.status}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log('='.repeat(60));
  
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED! Deployment verification successful.');
    console.log('✅ Your subscription system is ready for production.');
  } else {
    console.log('⚠️  SOME TESTS FAILED. Please check the errors above.');
    console.log('📝 Refer to DEPLOYMENT_INSTRUCTIONS.md for troubleshooting.');
  }
  
  console.log('\n🚀 Next steps:');
  console.log('1. Deploy Edge Functions (if not done yet)');
  console.log('2. Test subscription flows in your app');
  console.log('3. Verify no console errors in browser');
  
  return allPassed;
}

// Run verification
verifyDeployment()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Verification script crashed:', error);
    process.exit(1);
  });