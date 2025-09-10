
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

    // Get the raw body for signature verification
    const rawBody = await req.text();
    const signature = req.headers.get('X-Signature');
    
    // Verify webhook signature
    const webhookSecret = Deno.env.get('LEMON_SQUEEZY_WEBHOOK_SECRET');
    if (webhookSecret && signature) {
      const expectedSignature = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(webhookSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      ).then(key =>
        crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody))
      ).then(signature =>
        'sha256=' + Array.from(new Uint8Array(signature))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')
      );

      if (signature !== expectedSignature) {
        logger.warn('Invalid webhook signature', { 
          received: signature?.substring(0, 20) + '...', 
          expected: expectedSignature?.substring(0, 20) + '...' 
        });
        return new Response('Invalid signature', { status: 401, headers: corsHeaders });
      }
      logger.info('Webhook signature verified');
    } else if (webhookSecret) {
      logger.warn('Webhook secret configured but no signature provided');
      return new Response('Missing signature', { status: 401, headers: corsHeaders });
    } else {
      logger.warn('No webhook secret configured - signature verification skipped');
    }

    const body = JSON.parse(rawBody);
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
      let subscriptionPlan = 'free'
      if (variantId === '697231') {
        userType = 'plus'
        subscriptionPlan = 'plus'
        logger.debug('Subscription mapped to plus plan', { variantId });
      } else if (variantId === '697237') {
        userType = 'pro'
        subscriptionPlan = 'pro'
        logger.debug('Subscription mapped to pro plan', { variantId });
      } else {
        logger.debug('Subscription defaulted to free plan', { variantId });
      }

      // Calculate trial end date based on plan
      const trialEndsAt = subscription.attributes?.trial_ends_at ? 
        new Date(subscription.attributes.trial_ends_at) : 
        (status === 'on_trial' && subscriptionPlan !== 'free' ? 
          new Date(Date.now() + (subscriptionPlan === 'plus' ? 7 : 14) * 24 * 60 * 60 * 1000) : 
          null);

      // Calculate grace period end dates
      const gracePeriodEndsAt = trialEndsAt && status === 'on_trial' ? 
        new Date(trialEndsAt.getTime() + (3 * 24 * 60 * 60 * 1000)) : null; // 3 days grace period

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
        subscription_plan: subscriptionPlan,
        trial_ends_at: trialEndsAt,
        expires_at: subscription.attributes?.renews_at ? new Date(subscription.attributes.renews_at) : null,
        grace_period_ends_at: gracePeriodEndsAt,
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

      // Log subscription event
      try {
        await supabase.rpc('log_subscription_event', {
          p_subscription_id: subscription.id,
          p_user_id: userId,
          p_event_type: eventName,
          p_old_status: null,
          p_new_status: status,
          p_metadata: {
            subscription_plan: subscriptionPlan,
            variant_id: variantId,
            trial_ends_at: trialEndsAt?.toISOString(),
            grace_period_ends_at: gracePeriodEndsAt?.toISOString(),
          }
        });
      } catch (logError) {
        logger.warn('Failed to log subscription event', logError);
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

    // Handle subscription payment failures
    if (eventName === 'subscription_payment_failed') {
      const operation = logger.startOperation('handle_subscription_payment_failed');
      const subscription = data
      const customData = meta?.custom_data
      
      if (customData?.user_id) {
        const userId = customData.user_id
        operation.step('Processing payment failure', { userId });

        // Update subscription status to unpaid with payment grace period
        const paymentGraceEndsAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)); // 7 days grace period
        
        const { error: subError } = await supabase
          .from('subscriptions')
          .update({
            status: 'unpaid',
            payment_grace_ends_at: paymentGraceEndsAt.toISOString(),
            retry_count: 0,
            last_retry_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('lemon_squeezy_id', subscription.id)

        if (subError) {
          logger.error('Failed to update subscription to unpaid', subError, { subscriptionId: subscription.id });
        } else {
          logger.info('Subscription marked as unpaid', { subscriptionId: subscription.id });
        }

        // Update user profile to indicate payment issue (but don't downgrade yet - grace period)
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            subscription_status: 'unpaid',
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)

        if (profileError) {
          logger.error('Failed to update profile payment status', profileError, { userId });
        } else {
          operation.success('Payment failure processed - user in grace period', { userId });
        }

        // Send payment failure notification
        try {
          await supabase.functions.invoke('send-payment-notification', {
            body: {
              userId: userId,
              type: 'payment_failed',
              subscriptionId: subscription.id
            }
          });
          logger.info('Payment failure notification sent', { userId });
        } catch (notificationError) {
          logger.error('Failed to send payment failure notification', notificationError, { userId });
        }
      } else {
        logger.warn('No user_id in custom_data for payment failure event');
      }
    }

    // Handle subscription expiration
    if (eventName === 'subscription_expired') {
      const operation = logger.startOperation('handle_subscription_expired');
      const subscription = data
      const customData = meta?.custom_data
      
      if (customData?.user_id) {
        const userId = customData.user_id
        operation.step('Processing subscription expiration', { userId });

        // Update subscription record
        const { error: subError } = await supabase
          .from('subscriptions')
          .update({
            status: 'expired',
            updated_at: new Date().toISOString()
          })
          .eq('lemon_squeezy_id', subscription.id)

        if (subError) {
          logger.error('Failed to update subscription to expired', subError, { subscriptionId: subscription.id });
        }

        // Check if user has any other active subscriptions before downgrading
        const { data: activeSubscriptions, error: activeSubError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .in('status', ['active', 'on_trial'])

        if (activeSubError) {
          logger.error('Failed to check for active subscriptions', activeSubError, { userId });
        }

        // Only downgrade to free if no other active subscriptions
        if (!activeSubscriptions || activeSubscriptions.length === 0) {
          operation.step('Downgrading expired user to free plan');
          
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              user_type: 'free',
              subscription_status: 'expired',
              updated_at: new Date().toISOString()
            })
            .eq('id', userId)

          if (profileError) {
            operation.failure(profileError, 'Failed to downgrade expired user to free plan', { userId });
          } else {
            operation.success('Expired user downgraded to free plan', { userId });
          }
        } else {
          logger.info('User still has active subscriptions, not downgrading', { 
            userId, 
            activeCount: activeSubscriptions.length 
          });
        }
      } else {
        logger.warn('No user_id in custom_data for expiration event');
      }
    }

    // Handle trial end
    if (eventName === 'subscription_trial_ended') {
      const operation = logger.startOperation('handle_subscription_trial_ended');
      const subscription = data
      const customData = meta?.custom_data
      
      if (customData?.user_id) {
        const userId = customData.user_id
        const status = subscription.attributes?.status
        operation.step('Processing trial end', { userId, newStatus: status });

        // Update subscription record
        const { error: subError } = await supabase
          .from('subscriptions')
          .update({
            status: status || 'active', // Should be active if payment succeeded, or cancelled if not
            updated_at: new Date().toISOString()
          })
          .eq('lemon_squeezy_id', subscription.id)

        if (subError) {
          logger.error('Failed to update subscription after trial end', subError, { subscriptionId: subscription.id });
        }

        // Update user profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            subscription_status: status || 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)

        if (profileError) {
          operation.failure(profileError, 'Failed to update profile after trial end', { userId });
        } else {
          operation.success('Trial end processed successfully', { userId, status });
        }

        // Send trial ended notification
        try {
          await supabase.functions.invoke('send-payment-notification', {
            body: {
              userId: userId,
              type: 'trial_ended',
              subscriptionId: subscription.id,
              newStatus: status
            }
          });
          logger.info('Trial ended notification sent', { userId });
        } catch (notificationError) {
          logger.error('Failed to send trial ended notification', notificationError, { userId });
        }
      } else {
        logger.warn('No user_id in custom_data for trial end event');
      }
    }

    // Handle subscription resume
    if (eventName === 'subscription_resumed') {
      const operation = logger.startOperation('handle_subscription_resumed');
      const subscription = data
      const customData = meta?.custom_data
      
      if (customData?.user_id) {
        const userId = customData.user_id
        const variantId = subscription.attributes?.variant_id?.toString()
        operation.step('Processing subscription resume', { userId, variantId });

        // Determine user type based on variant ID
        let userType = 'free'
        if (variantId === '697231') {
          userType = 'plus'
        } else if (variantId === '697237') {
          userType = 'pro'
        }

        // Update subscription record
        const { error: subError } = await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            expires_at: subscription.attributes?.renews_at ? new Date(subscription.attributes.renews_at) : null,
            updated_at: new Date().toISOString()
          })
          .eq('lemon_squeezy_id', subscription.id)

        if (subError) {
          logger.error('Failed to update subscription to active', subError, { subscriptionId: subscription.id });
        }

        // Update user profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            user_type: userType,
            subscription_status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)

        if (profileError) {
          operation.failure(profileError, 'Failed to update profile for resumed subscription', { userId });
        } else {
          operation.success('Subscription resumed successfully', { userId, userType });
        }
      } else {
        logger.warn('No user_id in custom_data for subscription resume event');
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
