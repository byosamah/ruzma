
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const LEMON_SQUEEZY_API_KEY = Deno.env.get('LEMON_SQUEEZY_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckoutRequest {
  storeId: string;
  variantId: string;
  customData?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!LEMON_SQUEEZY_API_KEY) {
      console.error('LEMON_SQUEEZY_API_KEY is not configured');
      throw new Error('LEMON_SQUEEZY_API_KEY is not configured');
    }

    const requestBody = await req.json();
    console.log('Received request body:', JSON.stringify(requestBody, null, 2));

    const { storeId, variantId, customData }: CheckoutRequest = requestBody;

    if (!storeId || !variantId) {
      console.error('Missing required fields:', { storeId, variantId });
      throw new Error('storeId and variantId are required');
    }

    console.log('Creating checkout with:', { storeId, variantId, customData });

    // Simplified checkout data without checkout_data field
    const checkoutData = {
      data: {
        type: 'checkouts',
        attributes: {
          test_mode: Deno.env.get('ENVIRONMENT') !== 'production',
        },
        relationships: {
          store: {
            data: {
              type: 'stores',
              id: storeId,
            },
          },
          variant: {
            data: {
              type: 'variants',
              id: variantId,
            },
          },
        },
      },
    };

    console.log('Sending checkout data to LemonSqueezy:', JSON.stringify(checkoutData, null, 2));

    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LEMON_SQUEEZY_API_KEY}`,
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
      },
      body: JSON.stringify(checkoutData),
    });

    const responseText = await response.text();
    console.log('LemonSqueezy response status:', response.status);
    console.log('LemonSqueezy response:', responseText);

    if (!response.ok) {
      console.error('LemonSqueezy API error:', response.status, responseText);
      throw new Error(`LemonSqueezy API error: ${response.status} - ${responseText}`);
    }

    const result = JSON.parse(responseText);
    console.log('Parsed LemonSqueezy result:', JSON.stringify(result, null, 2));

    return new Response(
      JSON.stringify({
        checkout_url: result.data.attributes.url,
        checkout_id: result.data.id,
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error creating checkout:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to create checkout' 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
