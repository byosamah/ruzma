
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const body = await req.json()
    console.log('Webhook received:', JSON.stringify(body, null, 2))

    const { meta, data } = body
    const eventName = meta?.event_name

    if (!eventName) {
      console.log('No event name found')
      return new Response('OK', { status: 200, headers: corsHeaders })
    }

    // Handle subscription events
    if (eventName === 'subscription_created' || eventName === 'subscription_updated') {
      const subscription = data
      
      // Get user_id from meta.custom_data (not from subscription attributes)
      const customData = meta?.custom_data
      
      if (!customData?.user_id) {
        console.log('No user_id in meta custom data')
        return new Response('OK', { status: 200, headers: corsHeaders })
      }

      const userId = customData.user_id
      const status = subscription.attributes?.status
      const variantId = subscription.attributes?.variant_id?.toString()

      console.log('Processing subscription event:', {
        eventName,
        userId,
        status,
        variantId
      })

      // Determine user type based on variant ID
      let userType = 'free'
      if (variantId === '697231') {
        userType = 'plus'
      } else if (variantId === '697237') {
        userType = 'pro'
      }

      console.log('Determined user type:', userType)

      // Update or insert subscription record
      const { error: subError } = await supabase
        .from('subscriptions')
        .upsert({
          lemon_squeezy_id: subscription.id,
          user_id: userId,
          status: status,
          product_id: subscription.attributes?.product_id?.toString(),
          variant_id: variantId,
          expires_at: subscription.attributes?.renews_at ? new Date(subscription.attributes.renews_at) : null,
          updated_at: new Date().toISOString()
        })

      if (subError) {
        console.error('Error updating subscription:', subError)
      } else {
        console.log('Subscription record updated successfully')
      }

      // Update user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          user_type: userType,
          subscription_status: status,
          subscription_id: subscription.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (profileError) {
        console.error('Error updating profile:', profileError)
      } else {
        console.log(`Successfully updated user ${userId} to ${userType} plan with status ${status}`)
      }
    }

    // Handle subscription cancellation
    if (eventName === 'subscription_cancelled') {
      const subscription = data
      const customData = meta?.custom_data
      
      if (customData?.user_id) {
        const userId = customData.user_id

        console.log('Processing subscription cancellation for user:', userId)

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
          console.error('Error updating cancelled subscription:', subError)
        }

        // Update user profile back to free
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            user_type: 'free',
            subscription_status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)

        if (profileError) {
          console.error('Error updating profile after cancellation:', profileError)
        } else {
          console.log(`User ${userId} subscription cancelled - reverted to free plan`)
        }
      }
    }

    return new Response('OK', { status: 200, headers: corsHeaders })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Internal Server Error', { status: 500, headers: corsHeaders })
  }
})
