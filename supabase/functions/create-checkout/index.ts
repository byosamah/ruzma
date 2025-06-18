
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

// Helper logging function
const logStep = (step: string, details?: any) => {
  const timestamp = new Date().toISOString();
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[${timestamp}] [CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Function started');

    if (!LEMON_SQUEEZY_API_KEY) {
      logStep('ERROR: LEMON_SQUEEZY_API_KEY is not configured');
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

    logStep('API key verified');

    const requestBody = await req.json();
    logStep('Received request body', requestBody);

    const { storeId, variantId, customData }: CheckoutRequest = requestBody;

    // Validate required fields
    if (!storeId || !variantId) {
      logStep('ERROR: Missing required fields', { storeId, variantId });
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

    logStep('Creating checkout with', { storeId, variantId, customData });

    // Lemon Squeezy checkout payload format - simplified without custom data first
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
          expires_at: null,
          preview: true,
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

    // Add custom data only if provided, in the correct array format
    if (customData) {
      const customArray: Array<{ key: string; value: string }> = [];
      Object.entries(customData).forEach(([key, value]) => {
        customArray.push({
          key: key,
          value: String(value)
        });
      });
      
      if (customArray.length > 0) {
        checkoutData.data.attributes.checkout_data = customArray;
        logStep('Added custom data to checkout', customArray);
      }
    }

    logStep("Sending Lemon Squeezy payload", checkoutData);

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
    logStep('Lemon Squeezy Response', { status: response.status, body: responseText });

    if (!response.ok) {
      logStep('ERROR: LemonSqueezy API error', { status: response.status, response: responseText });
      
      // Try to parse error details
      let errorDetails = responseText;
      try {
        const errorData = JSON.parse(responseText);
        errorDetails = errorData.errors || errorData.message || responseText;
      } catch (parseError) {
        logStep('Could not parse error response');
      }

      return new Response(
        JSON.stringify({ 
          error: `LemonSqueezy API error: ${response.status}`,
          details: errorDetails,
          debugInfo: {
            apiKeyPresent: !!LEMON_SQUEEZY_API_KEY,
            storeId,
            variantId,
            hasCustomData: !!customData
          }
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
      logStep('ERROR: Failed to parse Lemon Squeezy response', parseError);
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

    logStep('Parsed LemonSqueezy result', result);

    if (!result.data?.attributes?.url) {
      logStep('ERROR: No checkout URL in response', result);
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

    logStep('Checkout created successfully', { 
      checkoutId: result.data.id, 
      url: result.data.attributes.url 
    });

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
    logStep('ERROR: Unexpected error in create-checkout', { 
      message: error.message, 
      stack: error.stack 
    });
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to create checkout',
        stack: error.stack,
        timestamp: new Date().toISOString()
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
