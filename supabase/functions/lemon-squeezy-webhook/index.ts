
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

      console.log('Determined user type:', userType, 'for variant:', variantId)

      // For subscription_updated events, handle potential cancellation of old subscriptions
      if (eventName === 'subscription_updated') {
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
          console.error('Error cancelling old subscriptions:', cancelOldError)
        } else {
          console.log('Cancelled old subscriptions for user:', userId)
        }
      }

      // Update or insert subscription record with better error handling
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
          console.log('Subscription already exists, updating instead')
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
              status: status,
              expires_at: subscription.attributes?.renews_at ? new Date(subscription.attributes.renews_at) : null,
              updated_at: new Date().toISOString()
            })
            .eq('lemon_squeezy_id', subscription.id)

          if (updateError) {
            console.error('Error updating existing subscription:', updateError)
          } else {
            console.log('Existing subscription record updated successfully')
          }
        } else {
          console.error('Error inserting subscription:', insertError)
        }
      } else {
        console.log('New subscription record created successfully')
      }

      // Always update user profile with the new subscription status
      const profileData = {
        user_type: userType,
        subscription_status: status,
        subscription_id: subscription.id,
        updated_at: new Date().toISOString()
      }

      console.log('Updating profile with data:', profileData)

      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId)

      if (profileError) {
        console.error('Error updating profile:', profileError)
        // Try to create profile if it doesn't exist
        const { error: insertProfileError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            ...profileData
          })
        
        if (insertProfileError) {
          console.error('Error creating profile:', insertProfileError)
        } else {
          console.log('Profile created successfully with user_type:', userType)
        }
      } else {
        console.log(`Successfully updated user ${userId} to ${userType} plan with status ${status}`)
      }

      // Double check - verify the profile was updated
      const { data: verifyProfile, error: verifyError } = await supabase
        .from('profiles')
        .select('user_type, subscription_status')
        .eq('id', userId)
        .single()

      if (verifyError) {
        console.error('Error verifying profile update:', verifyError)
      } else {
        console.log('Profile verification - user_type:', verifyProfile.user_type, 'status:', verifyProfile.subscription_status)
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
        } else {
          console.log('Subscription marked as cancelled')
        }

        // Check if user has any other active subscriptions before downgrading
        const { data: activeSubscriptions, error: activeSubError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active')

        if (activeSubError) {
          console.error('Error checking for active subscriptions:', activeSubError)
        }

        // Only downgrade to free if no other active subscriptions
        if (!activeSubscriptions || activeSubscriptions.length === 0) {
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
        } else {
          console.log(`User ${userId} still has ${activeSubscriptions.length} active subscriptions, not downgrading`)
        }
      }
    }

    return new Response('OK', { status: 200, headers: corsHeaders })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Internal Server Error', { status: 500, headers: corsHeaders })
  }
})
