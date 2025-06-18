
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    logStep('Function started');

    const body = await req.json();
    const { storeId, variantId } = body;

    logStep('Request body parsed', { storeId, variantId });

    if (!storeId || !variantId) {
      throw new Error('Missing required fields: storeId and variantId');
    }

    // Get the current user from the auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    logStep('User authenticated', { userId: user.id, email: user.email });

    const lemonSqueezyApiKey = Deno.env.get('LEMON_SQUEEZY_API_KEY');
    if (!lemonSqueezyApiKey) {
      throw new Error('LEMON_SQUEEZY_API_KEY is not set');
    }

    logStep('Lemon Squeezy API key verified');

    // Create checkout session with Lemon Squeezy API
    const checkoutData = {
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email: user.email,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            custom: {
              user_id: user.id // This is crucial for the webhook to identify the user
            }
          }
        },
        relationships: {
          store: {
            data: {
              type: 'stores',
              id: storeId.toString()
            }
          },
          variant: {
            data: {
              type: 'variants',
              id: variantId.toString()
            }
          }
        }
      }
    };

    logStep('Checkout data prepared', checkoutData);

    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${lemonSqueezyApiKey}`,
      },
      body: JSON.stringify(checkoutData),
    });

    logStep('Lemon Squeezy API call made', { status: response.status });

    if (!response.ok) {
      const errorText = await response.text();
      logStep('Lemon Squeezy API error', { status: response.status, error: errorText });
      throw new Error(`Lemon Squeezy API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    logStep('Lemon Squeezy response received', result);

    const checkoutUrl = result.data?.attributes?.url;
    
    if (!checkoutUrl) {
      logStep('No checkout URL in response', result);
      throw new Error('No checkout URL returned from Lemon Squeezy');
    }

    logStep('Checkout URL extracted', { checkoutUrl });

    return new Response(JSON.stringify({ checkout_url: checkoutUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logStep('ERROR', { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
