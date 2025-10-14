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
    const { storeId, variantId } = await req.json()

    if (!storeId || !variantId) {
      return new Response(
        JSON.stringify({ error: 'Missing storeId or variantId' }),
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

    // Get user profile for email
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('email, full_name')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Failed to get profile:', profileError)
    }

    // Create Lemon Squeezy checkout
    const checkoutResponse = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${lemonSqueezyApiKey}`,
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              email: profile?.email || user.email,
              name: profile?.full_name || '',
              custom: {
                user_id: user.id,
              },
            },
          },
          relationships: {
            store: {
              data: {
                type: 'stores',
                id: storeId.toString(),
              },
            },
            variant: {
              data: {
                type: 'variants',
                id: variantId.toString(),
              },
            },
          },
        },
      }),
    })

    if (!checkoutResponse.ok) {
      const errorText = await checkoutResponse.text()
      console.error('Lemon Squeezy API error:', errorText)
      throw new Error(`Lemon Squeezy API error: ${checkoutResponse.status} - ${errorText}`)
    }

    const checkoutData = await checkoutResponse.json()
    const checkoutUrl = checkoutData.data?.attributes?.url

    if (!checkoutUrl) {
      throw new Error('No checkout URL received from Lemon Squeezy')
    }

    console.log(`Checkout created for user ${user.id}: ${checkoutUrl}`)

    return new Response(
      JSON.stringify({ checkout_url: checkoutUrl }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error creating checkout:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create checkout' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
