import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger, getRequestIdFromHeaders } from "../_shared/logger.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  const requestId = getRequestIdFromHeaders(req.headers);
  const logger = createLogger('cancel-subscription', requestId);
  
  logger.info('Cancel subscription request received', { method: req.method, url: req.url });

  if (req.method === 'OPTIONS') {
    logger.debug('CORS preflight request handled');
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    logger.info('Function started');

    const body = await req.json();
    const { subscriptionId } = body;

    logger.info('Request body parsed', { subscriptionId });

    if (!subscriptionId) {
      throw new Error('Missing required field: subscriptionId');
    }

    // Get the current user from the auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    logger.info('User authenticated', { userId: user.id, email: user.email });

    const lemonSqueezyApiKey = Deno.env.get('LEMON_SQUEEZY_API_KEY');
    if (!lemonSqueezyApiKey) {
      throw new Error('LEMON_SQUEEZY_API_KEY is not set');
    }

    logger.info('Lemon Squeezy API key verified');

    // Verify user owns this subscription
    const { data: subscription, error: verifyError } = await supabase
      .from('subscriptions')
      .select('lemon_squeezy_id, user_id, expires_at')
      .eq('lemon_squeezy_id', subscriptionId)
      .eq('user_id', user.id)
      .single();

    if (verifyError || !subscription) {
      logger.error('Subscription not found or unauthorized', { subscriptionId, userId: user.id });
      throw new Error('Subscription not found or unauthorized');
    }

    logger.info('Subscription verified', { subscriptionId, userId: user.id });

    // Cancel subscription with Lemon Squeezy API
    // Use PATCH method to update subscription status to cancelled
    const response = await fetch(`https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}`, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${lemonSqueezyApiKey}`,
      },
      body: JSON.stringify({
        data: {
          type: 'subscriptions',
          id: subscriptionId,
          attributes: {
            cancelled: true
          }
        }
      })
    });

    logger.info('Lemon Squeezy API call made', { status: response.status });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Lemon Squeezy API error', { status: response.status, error: errorText });
      throw new Error(`Lemon Squeezy API error: ${response.status} - ${errorText}`);
    }

    // Update local subscription record to cancelled
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('lemon_squeezy_id', subscriptionId)
      .eq('user_id', user.id);

    if (updateError) {
      logger.error('Failed to update local subscription record', updateError, { subscriptionId });
    } else {
      logger.info('Local subscription record updated to cancelled', { subscriptionId });
    }

    // Update user profile status but KEEP current plan until subscription expires
    // The process-expired-subscriptions function will handle the actual downgrade
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'cancelled',
        updated_at: new Date().toISOString()
        // NOTE: NOT changing user_type here - user keeps access until expires_at
      })
      .eq('id', user.id);

    if (profileError) {
      logger.error('Failed to update user profile status', profileError, { userId: user.id });
    } else {
      logger.info('User profile status updated to cancelled (access maintained until expiration)', { userId: user.id });
    }

    // Log the cancellation event for audit trail
    try {
      await supabase.rpc('log_subscription_event', {
        p_subscription_id: subscriptionId,
        p_user_id: user.id,
        p_event_type: 'user_cancelled',
        p_old_status: 'active',
        p_new_status: 'cancelled',
        p_metadata: {
          cancelled_by: 'user',
          cancelled_at: new Date().toISOString(),
          maintains_access_until: subscription.expires_at || 'period_end'
        }
      });
    } catch (logError) {
      logger.warn('Failed to log cancellation event', logError);
    }

    logger.info('Subscription cancelled successfully', { 
      subscriptionId, 
      userId: user.id,
      duration: logger.getDuration() 
    });

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Subscription cancelled successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error('ERROR', { message: errorMessage, duration: logger.getDuration() });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});