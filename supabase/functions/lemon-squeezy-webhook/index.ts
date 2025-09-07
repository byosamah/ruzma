
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import type { LemonSqueezyWebhookPayload } from "../_shared/types.ts"
import { createLogger, getRequestIdFromHeaders } from "../_shared/logger.ts"
import { createServiceRoleSupabaseClient } from "../_shared/supabase-client.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  const requestId = getRequestIdFromHeaders(req.headers);
  const logger = createLogger('lemon-squeezy-webhook', requestId);
  
  logger.info('Webhook request received', { method: req.method, url: req.url });

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    logger.debug('CORS preflight request handled');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createServiceRoleSupabaseClient();

    const body = await req.json()
    const { meta, data } = body
    const eventName = meta?.event_name

    logger.info('Webhook payload received', { eventName, hasData: !!data });

    if (!eventName) {
      logger.warn('No event name in webhook payload');
      return new Response('OK', { status: 200, headers: corsHeaders })
    }

    // Handle subscription events
    if (eventName === 'subscription_created' || eventName === 'subscription_updated') {
      const operation = logger.startOperation(`handle_${eventName}`);
      const subscription = data
      
      // Get user_id from meta.custom_data (not from subscription attributes)
      const customData = meta?.custom_data
      
      if (!customData?.user_id) {
        logger.warn('No user_id in custom_data, skipping subscription event');
        return new Response('OK', { status: 200, headers: corsHeaders })
      }

      const userId = customData.user_id
      const status = subscription.attributes?.status
      const variantId = subscription.attributes?.variant_id?.toString()

      operation.step('Extracted subscription data', { userId, status, variantId });

      // Determine user type based on variant ID with enhanced logging
      let userType = 'free'
      if (variantId === '697231') {
        userType = 'plus'
        logger.debug('Subscription mapped to plus plan', { variantId });
      } else if (variantId === '697237') {
        userType = 'pro'
        logger.debug('Subscription mapped to pro plan', { variantId });
      } else {
        logger.debug('Subscription defaulted to free plan', { variantId });
      }

      // For subscription_updated events, handle potential cancellation of old subscriptions
      if (eventName === 'subscription_updated') {
        operation.step('Cancelling old subscriptions');
        
        // Update all existing subscriptions for this user to cancelled (except the current one)
        const { error: cancelOldError } = await supabase
          .from('subscriptions')
          .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .neq('lemon_squeezy_id', subscription.id)
          .in('status', ['active', 'on_trial'])

        if (cancelOldError) {
          logger.error('Failed to cancel old subscriptions', cancelOldError, { userId });
        } else {
          logger.info('Old subscriptions cancelled successfully', { userId });
        }
      }

      // Update or insert subscription record with better error handling
      operation.step('Upserting subscription record');
      
      const subscriptionData = {
        lemon_squeezy_id: subscription.id,
        user_id: userId,
        status: status,
        product_id: subscription.attributes?.product_id?.toString(),
        variant_id: variantId,
        expires_at: subscription.attributes?.renews_at ? new Date(subscription.attributes.renews_at) : null,
        updated_at: new Date().toISOString()
      }

      // Try insert first, then update if duplicate
      const { error: insertError } = await supabase
        .from('subscriptions')
        .insert(subscriptionData)

      if (insertError) {
        if (insertError.code === '23505') { // Duplicate key error
          logger.debug('Subscription already exists, updating instead');
          
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
              status: status,
              expires_at: subscription.attributes?.renews_at ? new Date(subscription.attributes.renews_at) : null,
              updated_at: new Date().toISOString()
            })
            .eq('lemon_squeezy_id', subscription.id)

          if (updateError) {
            logger.error('Failed to update existing subscription', updateError, { subscriptionId: subscription.id });
          } else {
            logger.info('Subscription updated successfully', { subscriptionId: subscription.id });
          }
        } else {
          logger.error('Failed to insert subscription', insertError, { subscriptionId: subscription.id });
        }
      } else {
        logger.info('Subscription created successfully', { subscriptionId: subscription.id });
      }

      // Always update user profile with the new subscription status
      operation.step('Updating user profile');
      
      const profileData = {
        user_type: userType,
        subscription_status: status,
        subscription_id: subscription.id,
        updated_at: new Date().toISOString()
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId)

      if (profileError) {
        logger.error('Failed to update profile', profileError, { userId });
        
        // Try to create profile if it doesn't exist
        const { error: insertProfileError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            ...profileData
          })
        
        if (insertProfileError) {
          logger.error('Failed to create profile', insertProfileError, { userId });
        } else {
          logger.info('Profile created successfully', { userId, userType });
        }
      } else {
        logger.info('Profile updated successfully', { userId, userType });
      }

      // Double check - verify the profile was updated
      const { data: verifyProfile, error: verifyError } = await supabase
        .from('profiles')
        .select('user_type, subscription_status, subscription_id')
        .eq('id', userId)
        .single()

      if (verifyError) {
        logger.error('Failed to verify profile update', verifyError, { userId });
      } else {
        if (verifyProfile.user_type === userType) {
          operation.success('Subscription event processed successfully', { userId, userType, verified: true });
        } else {
          logger.warn('Profile verification failed - user_type mismatch', { 
            expected: userType, 
            actual: verifyProfile.user_type,
            userId 
          });
        }
      }
    }

    // Handle subscription cancellation
    if (eventName === 'subscription_cancelled') {
      const operation = logger.startOperation('handle_subscription_cancelled');
      const subscription = data
      const customData = meta?.custom_data
      
      if (customData?.user_id) {
        const userId = customData.user_id
        operation.step('Processing cancellation', { userId });

        // Update subscription record
        const { error: subError } = await supabase
          .from('subscriptions')
          .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('lemon_squeezy_id', subscription.id)

        if (subError) {
          logger.error('Failed to update subscription to cancelled', subError, { subscriptionId: subscription.id });
        } else {
          logger.info('Subscription cancelled successfully', { subscriptionId: subscription.id });
        }

        // Check if user has any other active subscriptions before downgrading
        const { data: activeSubscriptions, error: activeSubError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active')

        if (activeSubError) {
          logger.error('Failed to check for active subscriptions', activeSubError, { userId });
        }

        // Only downgrade to free if no other active subscriptions
        if (!activeSubscriptions || activeSubscriptions.length === 0) {
          operation.step('Downgrading user to free plan');
          
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              user_type: 'free',
              subscription_status: 'cancelled',
              updated_at: new Date().toISOString()
            })
            .eq('id', userId)

          if (profileError) {
            operation.failure(profileError, 'Failed to downgrade user to free plan', { userId });
          } else {
            operation.success('User downgraded to free plan', { userId });
          }
        } else {
          logger.info('User still has active subscriptions, not downgrading', { 
            userId, 
            activeCount: activeSubscriptions.length 
          });
        }
      } else {
        logger.warn('No user_id in custom_data for cancellation event');
      }
    }

    logger.info('Webhook processed successfully', { duration: logger.getDuration() });
    return new Response('OK', { status: 200, headers: corsHeaders })
  } catch (error) {
    logger.error('Webhook processing failed', error as Error, { 
      duration: logger.getDuration(),
      requestId: logger.getRequestId()
    });
    return new Response('Internal Server Error', { status: 500, headers: corsHeaders })
  }
})
