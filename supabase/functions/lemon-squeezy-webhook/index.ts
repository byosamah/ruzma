import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature',
}

// Map variant IDs to user types
const VARIANT_TO_USER_TYPE: { [key: string]: string } = {
  '697231': 'plus',  // Plus plan
  '697237': 'pro',   // Pro plan
}

// Verify webhook signature
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = createHmac('sha256', secret)
  hmac.update(payload)
  const digest = hmac.digest('hex')
  return digest === signature
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get environment variables
    const webhookSecret = Deno.env.get('LEMON_SQUEEZY_WEBHOOK_SECRET')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    if (!webhookSecret) {
      throw new Error('LEMON_SQUEEZY_WEBHOOK_SECRET not configured')
    }

    // Get signature from header
    const signature = req.headers.get('x-signature')
    if (!signature) {
      console.error('Missing webhook signature')
      return new Response(
        JSON.stringify({ error: 'Missing signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get raw body for signature verification
    const rawBody = await req.text()

    // Verify signature
    if (!verifySignature(rawBody, signature, webhookSecret)) {
      console.error('Invalid webhook signature')
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse webhook payload
    const payload = JSON.parse(rawBody)
    const eventName = payload.meta?.event_name
    const dataAttributes = payload.data?.attributes
    const customData = payload.meta?.custom_data

    console.log(`Webhook received: ${eventName}`, {
      dataId: payload.data?.id,
      dataType: payload.data?.type,
      userId: customData?.user_id,
    })

    // Create Supabase client
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

    // Get user ID from custom data
    const userId = customData?.user_id
    if (!userId) {
      console.error('No user_id in webhook custom data')
      return new Response(
        JSON.stringify({ error: 'Missing user_id in custom data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Handle different webhook events
    switch (eventName) {
      case 'order_created': {
        // Handle one-time purchases (e.g., Pro lifetime plan)
        console.log('Processing order_created event', {
          orderId: payload.data?.id,
          orderAttributes: dataAttributes
        })

        // Extract variant_id from first_order_item
        const firstOrderItem = dataAttributes?.first_order_item
        const variantId = firstOrderItem?.variant_id?.toString()

        if (!variantId) {
          console.error('No variant_id found in order', { firstOrderItem })
          throw new Error('Missing variant_id in order')
        }

        const userType = VARIANT_TO_USER_TYPE[variantId]

        if (!userType) {
          console.error(`Unknown variant_id: ${variantId}`)
          throw new Error(`Unknown variant_id: ${variantId}`)
        }

        console.log(`Order for variant ${variantId} → user_type: ${userType}`)

        // For Pro (lifetime) purchases, cancel existing subscriptions
        if (userType === 'pro') {
          console.log('Pro purchase detected - cancelling existing subscriptions')

          // Get user's active subscriptions
          const { data: existingSubs } = await supabaseClient
            .from('subscriptions')
            .select('lemon_squeezy_id, status')
            .eq('user_id', userId)
            .in('status', ['active', 'on_trial'])

          if (existingSubs && existingSubs.length > 0) {
            console.log(`Found ${existingSubs.length} active subscription(s) to cancel`)

            // Mark subscriptions as cancelled in our DB
            const { error: cancelError } = await supabaseClient
              .from('subscriptions')
              .update({
                status: 'cancelled',
                updated_at: new Date().toISOString(),
              })
              .eq('user_id', userId)
              .in('status', ['active', 'on_trial'])

            if (cancelError) {
              console.error('Failed to cancel subscriptions in DB:', cancelError)
            }
          }
        }

        // Update user profile
        const { error: profileError } = await supabaseClient
          .from('profiles')
          .update({
            user_type: userType,
            subscription_status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)

        if (profileError) {
          console.error('Failed to update profile:', profileError)
          throw profileError
        }

        // Log security event
        await supabaseClient
          .from('security_events')
          .insert({
            user_id: userId,
            event_type: 'order_completed',
            details: {
              order_id: payload.data?.id,
              variant_id: variantId,
              user_type: userType,
              order_number: dataAttributes?.order_number,
              total: dataAttributes?.total,
              currency: dataAttributes?.currency,
            },
            created_at: new Date().toISOString(),
          })

        console.log(`Order processed - User ${userId} upgraded to ${userType}`)
        break
      }

      case 'subscription_created':
      case 'subscription_updated': {
        const variantId = dataAttributes?.variant_id?.toString()
        const userType = VARIANT_TO_USER_TYPE[variantId] || 'free'

        // Upsert subscription record
        const { error: subError } = await supabaseClient
          .from('subscriptions')
          .upsert({
            user_id: userId,
            lemon_squeezy_id: dataAttributes.id.toString(),
            status: dataAttributes.status,
            variant_id: variantId,
            created_at: dataAttributes.created_at,
            updated_at: new Date().toISOString(),
            expires_at: dataAttributes.renews_at || dataAttributes.ends_at || null,
          }, {
            onConflict: 'lemon_squeezy_id'
          })

        if (subError) {
          console.error('Failed to upsert subscription:', subError)
          throw subError
        }

        // Update user profile
        const { error: profileError } = await supabaseClient
          .from('profiles')
          .update({
            user_type: userType,
            subscription_status: dataAttributes.status,
            subscription_id: dataAttributes.id.toString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)

        if (profileError) {
          console.error('Failed to update profile:', profileError)
          throw profileError
        }

        console.log(`Subscription ${eventName} processed for user ${userId}`)
        break
      }

      case 'subscription_cancelled':
      case 'subscription_expired': {
        // Update subscription status
        const { error: subError } = await supabaseClient
          .from('subscriptions')
          .update({
            status: dataAttributes.status,
            updated_at: new Date().toISOString(),
          })
          .eq('lemon_squeezy_id', dataAttributes.id.toString())

        if (subError) {
          console.error('Failed to update subscription:', subError)
        }

        // Update user profile to free plan
        const { error: profileError } = await supabaseClient
          .from('profiles')
          .update({
            user_type: 'free',
            subscription_status: dataAttributes.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)

        if (profileError) {
          console.error('Failed to update profile:', profileError)
          throw profileError
        }

        console.log(`Subscription ${eventName} processed for user ${userId}`)
        break
      }

      case 'subscription_payment_success': {
        // Payment succeeded - ensure subscription is active
        const { error: profileError } = await supabaseClient
          .from('profiles')
          .update({
            subscription_status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)

        if (profileError) {
          console.error('Failed to update profile:', profileError)
        }

        console.log(`Payment success processed for user ${userId}`)
        break
      }

      case 'subscription_payment_failed': {
        // Payment failed - update status
        const { error: profileError } = await supabaseClient
          .from('profiles')
          .update({
            subscription_status: 'unpaid',
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)

        if (profileError) {
          console.error('Failed to update profile:', profileError)
        }

        console.log(`Payment failure processed for user ${userId}`)
        break
      }

      default:
        console.log(`Unhandled webhook event: ${eventName}`)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to process webhook' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
