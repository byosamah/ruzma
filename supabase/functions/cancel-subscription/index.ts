import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get environment variables
    const lemonSqueezyApiKey = Deno.env.get('LEMON_SQUEEZY_API_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    if (!lemonSqueezyApiKey) {
      throw new Error('LEMON_SQUEEZY_API_KEY not configured')
    }

    // Get request body
    const { subscriptionId } = await req.json()

    if (!subscriptionId) {
      return new Response(
        JSON.stringify({ error: 'Missing subscriptionId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get authenticated user from Supabase
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)
    const authHeader = req.headers.get('Authorization')

    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify subscription belongs to user
    const { data: subscription, error: subError } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('lemon_squeezy_id', subscriptionId)
      .eq('user_id', user.id)
      .single()

    if (subError || !subscription) {
      return new Response(
        JSON.stringify({ error: 'Subscription not found or unauthorized' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Cancel subscription in Lemon Squeezy
    const cancelResponse = await fetch(
      `https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}`,
      {
        method: 'DELETE',
        headers: {
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json',
          'Authorization': `Bearer ${lemonSqueezyApiKey}`,
        },
      }
    )

    if (!cancelResponse.ok) {
      const errorText = await cancelResponse.text()
      console.error('Lemon Squeezy API error:', errorText)
      throw new Error(`Lemon Squeezy API error: ${cancelResponse.status} - ${errorText}`)
    }

    const cancelData = await cancelResponse.json()

    // Update subscription status in database
    const { error: updateError } = await supabaseClient
      .from('subscriptions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('lemon_squeezy_id', subscriptionId)

    if (updateError) {
      console.error('Failed to update subscription status:', updateError)
      // Don't throw - cancellation already succeeded in Lemon Squeezy
    }

    // Update user profile
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({
        subscription_status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (profileError) {
      console.error('Failed to update profile:', profileError)
    }

    console.log(`Subscription ${subscriptionId} cancelled for user ${user.id}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Subscription cancelled successfully',
        subscription: cancelData.data,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to cancel subscription' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
