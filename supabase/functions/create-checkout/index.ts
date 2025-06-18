
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

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const lemonSqueezyApiKey = Deno.env.get('LEMON_SQUEEZY_API_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the user from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: corsHeaders }
      )
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: corsHeaders }
      )
    }

    const { storeId, variantId } = await req.json()

    if (!storeId || !variantId) {
      return new Response(
        JSON.stringify({ error: 'Missing storeId or variantId' }),
        { status: 400, headers: corsHeaders }
      )
    }

    // Get user profile for additional info
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    // Create checkout with Lemon Squeezy
    const checkoutData = {
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email: user.email,
            name: profile?.full_name || user.email,
            custom: {
              user_id: user.id,
              user_email: user.email
            }
          }
        },
        relationships: {
          store: {
            data: {
              type: 'stores',
              id: storeId
            }
          },
          variant: {
            data: {
              type: 'variants',
              id: variantId
            }
          }
        }
      }
    }

    console.log('Creating checkout with data:', JSON.stringify(checkoutData, null, 2))

    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lemonSqueezyApiKey}`,
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json',
      },
      body: JSON.stringify(checkoutData)
    })

    const result = await response.json()
    console.log('Lemon Squeezy response:', JSON.stringify(result, null, 2))

    if (!response.ok) {
      console.error('Lemon Squeezy API error:', result)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create checkout',
          details: result
        }),
        { status: response.status, headers: corsHeaders }
      )
    }

    const checkoutUrl = result.data?.attributes?.url
    if (!checkoutUrl) {
      return new Response(
        JSON.stringify({ error: 'No checkout URL received' }),
        { status: 500, headers: corsHeaders }
      )
    }

    return new Response(
      JSON.stringify({ checkout_url: checkoutUrl }),
      { status: 200, headers: corsHeaders }
    )

  } catch (error) {
    console.error('Checkout creation error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: corsHeaders }
    )
  }
})
