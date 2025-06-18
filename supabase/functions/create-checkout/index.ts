
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
      return new Response(
        JSON.stringify({ error: 'LEMON_SQUEEZY_API_KEY is not configured' }),
        { 
          status: 500,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    const requestBody = await req.json();
    console.log('Received request body:', JSON.stringify(requestBody, null, 2));

    const { storeId, variantId, customData }: CheckoutRequest = requestBody;

    // Validate required fields
    if (!storeId || !variantId) {
      console.error('Missing required fields:', { storeId, variantId });
      return new Response(
        JSON.stringify({ error: 'storeId and variantId are required' }),
        { 
          status: 400,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    console.log('Creating checkout with:', { storeId, variantId, customData });

    // According to Lemon Squeezy docs, checkout_data should be an object with custom fields
    // Each custom field should have a name and value
    const checkoutCustom: Record<string, string> = {};
    
    if (customData) {
      Object.entries(customData).forEach(([key, value]) => {
        checkoutCustom[key] = String(value);
      });
    }

    console.log('Formatted custom fields:', JSON.stringify(checkoutCustom, null, 2));

    // Lemon Squeezy checkout payload format
    const checkoutData = {
      data: {
        type: 'checkouts',
        attributes: {
          checkout_options: {
            embed: false,
            media: true,
            logo: true,
            desc: true,
            discount: true,
            skip_trial: false,
            subscription_preview: true,
          },
          checkout_data: checkoutCustom, // This should be an object, not an array
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

    console.log("Sending Lemon Squeezy payload:", JSON.stringify(checkoutData, null, 2));

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
    console.log('Lemon Squeezy Response:', response.status, responseText);

    if (!response.ok) {
      console.error('LemonSqueezy API error:', response.status, responseText);
      return new Response(
        JSON.stringify({ 
          error: `LemonSqueezy API error: ${response.status}`,
          details: responseText 
        }),
        { 
          status: response.status,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Lemon Squeezy response:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid response from LemonSqueezy' }),
        { 
          status: 500,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    console.log('Parsed LemonSqueezy result:', JSON.stringify(result, null, 2));

    if (!result.data?.attributes?.url) {
      console.error('No checkout URL in response:', result);
      return new Response(
        JSON.stringify({ error: 'No checkout URL received from LemonSqueezy' }),
        { 
          status: 500,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

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
        error: error.message || 'Failed to create checkout',
        stack: error.stack 
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
