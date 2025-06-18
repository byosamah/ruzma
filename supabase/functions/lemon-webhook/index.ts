
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature',
}

interface WebhookPayload {
  meta: {
    event_name: string;
  };
  data: {
    id: string;
    attributes: {
      user_id?: string;
      status: string;
      variant_id: string;
      product_id: string;
      ends_at?: string;
      cancelled_at?: string;
    };
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const signature = req.headers.get('X-Signature')
    const body = await req.text()
    
    // Verify webhook signature
    const webhookSecret = '201410136'
    const expectedSignature = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(webhookSecret + body)
    )
    const expectedHex = Array.from(new Uint8Array(expectedSignature))
      .map(b => b.toString(16).padStart(2, '0')).join('')

    if (signature !== `sha256=${expectedHex}`) {
      console.error('Invalid webhook signature')
      return new Response('Unauthorized', { status: 401 })
    }

    const payload: WebhookPayload = JSON.parse(body)
    const { event_name } = payload.meta
    const subscriptionData = payload.data.attributes

    console.log('Webhook received:', event_name, subscriptionData)

    // Get user from custom_data or subscription
    const userId = subscriptionData.user_id
    if (!userId) {
      console.error('No user_id found in webhook payload')
      return new Response('No user_id found', { status: 400 })
    }

    // Handle different webhook events
    switch (event_name) {
      case 'subscription_created':
      case 'subscription_payment_success':
        // Upgrade user to plus
        await supabase
          .from('profiles')
          .update({
            user_type: 'plus',
            subscription_id: payload.data.id,
            subscription_status: subscriptionData.status,
            grace_period_end: null
          })
          .eq('id', userId)

        // Create/update subscription record
        await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            lemon_squeezy_id: payload.data.id,
            status: subscriptionData.status,
            variant_id: subscriptionData.variant_id,
            product_id: subscriptionData.product_id,
            updated_at: new Date().toISOString()
          })
        break

      case 'subscription_cancelled':
      case 'subscription_payment_failed':
      case 'subscription_expired':
        // Start 7-day grace period
        const gracePeriodEnd = new Date()
        gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7)

        await supabase
          .from('profiles')
          .update({
            subscription_status: subscriptionData.status,
            grace_period_end: gracePeriodEnd.toISOString()
          })
          .eq('id', userId)

        // Update subscription record
        await supabase
          .from('subscriptions')
          .update({
            status: subscriptionData.status,
            cancelled_at: subscriptionData.cancelled_at || new Date().toISOString(),
            expires_at: subscriptionData.ends_at,
            updated_at: new Date().toISOString()
          })
          .eq('lemon_squeezy_id', payload.data.id)
        break

      case 'subscription_updated':
        // Handle subscription updates
        await supabase
          .from('subscriptions')
          .update({
            status: subscriptionData.status,
            updated_at: new Date().toISOString()
          })
          .eq('lemon_squeezy_id', payload.data.id)
        break
    }

    return new Response('OK', {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
})
