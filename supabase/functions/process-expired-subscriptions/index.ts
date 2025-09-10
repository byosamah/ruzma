import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createLogger, getRequestIdFromHeaders } from "../_shared/logger.ts";
import { createServiceRoleSupabaseClient } from "../_shared/supabase-client.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExpiredSubscription {
  id: string;
  user_id: string;
  lemon_squeezy_id: string;
  status: string;
  subscription_plan: string;
  trial_ends_at: string | null;
  grace_period_ends_at: string | null;
  payment_grace_ends_at: string | null;
  retry_count: number;
}

serve(async (req) => {
  const requestId = getRequestIdFromHeaders(req.headers);
  const logger = createLogger('process-expired-subscriptions', requestId);
  
  logger.info('Processing expired subscriptions', { method: req.method, url: req.url });

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    logger.debug('CORS preflight request handled');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createServiceRoleSupabaseClient();
    const now = new Date();
    let processedCount = 0;
    let errorCount = 0;

    // Find subscriptions with expired grace periods
    const { data: expiredSubscriptions, error: findError } = await supabase
      .from('subscriptions')
      .select(`
        id,
        user_id,
        lemon_squeezy_id,
        status,
        subscription_plan,
        trial_ends_at,
        grace_period_ends_at,
        payment_grace_ends_at,
        retry_count
      `)
      .or(
        `and(status.eq.on_trial,grace_period_ends_at.lt.${now.toISOString()}),` +
        `and(status.eq.unpaid,payment_grace_ends_at.lt.${now.toISOString()})`
      );

    if (findError) {
      logger.error('Failed to find expired subscriptions', findError);
      throw new Error('Failed to query expired subscriptions');
    }

    if (!expiredSubscriptions || expiredSubscriptions.length === 0) {
      logger.info('No expired subscriptions found');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No expired subscriptions found',
        processed: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    logger.info('Found expired subscriptions', { count: expiredSubscriptions.length });

    // Process each expired subscription
    for (const subscription of expiredSubscriptions as ExpiredSubscription[]) {
      const operation = logger.startOperation(`process_expired_${subscription.id}`);
      
      try {
        operation.step('Processing expired subscription', {
          subscriptionId: subscription.id,
          userId: subscription.user_id,
          status: subscription.status,
          plan: subscription.subscription_plan
        });

        // Determine the type of expiration
        let expirationType: string;
        let gracePeriodType: string;
        
        if (subscription.status === 'on_trial' && subscription.grace_period_ends_at) {
          expirationType = 'trial_grace_expired';
          gracePeriodType = 'trial';
        } else if (subscription.status === 'unpaid' && subscription.payment_grace_ends_at) {
          expirationType = 'payment_grace_expired';
          gracePeriodType = 'payment';
        } else {
          operation.step('Skipping - no valid expiration type');
          continue;
        }

        // Update subscription to expired status
        const { error: updateSubError } = await supabase
          .from('subscriptions')
          .update({
            status: 'expired',
            updated_at: now.toISOString()
          })
          .eq('id', subscription.id);

        if (updateSubError) {
          logger.error('Failed to update subscription status', updateSubError, {
            subscriptionId: subscription.id
          });
          errorCount++;
          continue;
        }

        // Check if user has any other active subscriptions
        const { data: activeSubscriptions, error: activeSubError } = await supabase
          .from('subscriptions')
          .select('id, status, subscription_plan')
          .eq('user_id', subscription.user_id)
          .in('status', ['active', 'on_trial'])
          .neq('id', subscription.id);

        if (activeSubError) {
          logger.error('Failed to check for active subscriptions', activeSubError, {
            userId: subscription.user_id
          });
        }

        // Only downgrade to free if no other active subscriptions
        if (!activeSubscriptions || activeSubscriptions.length === 0) {
          operation.step('Downgrading user to free plan');
          
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              user_type: 'free',
              subscription_status: 'expired',
              updated_at: now.toISOString()
            })
            .eq('id', subscription.user_id);

          if (profileError) {
            logger.error('Failed to downgrade user to free plan', profileError, {
              userId: subscription.user_id
            });
            errorCount++;
            continue;
          }

          // Send downgrade notification
          try {
            await supabase.functions.invoke('send-payment-notification', {
              body: {
                userId: subscription.user_id,
                type: 'subscription_expired',
                subscriptionId: subscription.lemon_squeezy_id,
                gracePeriodType: gracePeriodType
              }
            });
            logger.info('Downgrade notification sent', { userId: subscription.user_id });
          } catch (notificationError) {
            logger.warn('Failed to send downgrade notification', notificationError, {
              userId: subscription.user_id
            });
          }

          operation.success('User downgraded to free plan', {
            userId: subscription.user_id,
            expirationType
          });
        } else {
          logger.info('User still has active subscriptions, not downgrading', {
            userId: subscription.user_id,
            activeCount: activeSubscriptions.length
          });
        }

        // Log subscription event
        try {
          await supabase.rpc('log_subscription_event', {
            p_subscription_id: subscription.id,
            p_user_id: subscription.user_id,
            p_event_type: expirationType,
            p_old_status: subscription.status,
            p_new_status: 'expired',
            p_metadata: {
              grace_period_type: gracePeriodType,
              processed_at: now.toISOString(),
              retry_count: subscription.retry_count
            }
          });
        } catch (logError) {
          logger.warn('Failed to log subscription event', logError);
        }

        processedCount++;
        
      } catch (error) {
        operation.failure(error as Error, 'Failed to process expired subscription', {
          subscriptionId: subscription.id
        });
        errorCount++;
      }
    }

    // Also check for subscriptions that need reminder emails (3 days before expiration)
    const reminderDate = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000)); // 3 days from now
    
    const { data: reminderSubscriptions, error: reminderError } = await supabase
      .from('subscriptions')
      .select('user_id, lemon_squeezy_id, subscription_plan, trial_ends_at, grace_period_ends_at')
      .eq('status', 'on_trial')
      .gte('trial_ends_at', now.toISOString())
      .lte('trial_ends_at', reminderDate.toISOString());

    if (!reminderError && reminderSubscriptions && reminderSubscriptions.length > 0) {
      logger.info('Sending trial ending reminders', { count: reminderSubscriptions.length });
      
      for (const reminderSub of reminderSubscriptions) {
        try {
          await supabase.functions.invoke('send-payment-notification', {
            body: {
              userId: reminderSub.user_id,
              type: 'trial_ending_soon',
              subscriptionId: reminderSub.lemon_squeezy_id
            }
          });
        } catch (reminderSendError) {
          logger.warn('Failed to send trial reminder', reminderSendError, {
            userId: reminderSub.user_id
          });
        }
      }
    }

    const summary = {
      success: true,
      message: `Processed ${processedCount} expired subscriptions`,
      processed: processedCount,
      errors: errorCount,
      totalFound: expiredSubscriptions.length,
      duration: logger.getDuration()
    };

    logger.info('Expired subscriptions processing completed', summary);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error('Failed to process expired subscriptions', error as Error, { 
      duration: logger.getDuration() 
    });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});