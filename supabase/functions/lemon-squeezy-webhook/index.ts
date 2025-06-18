
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const webhookSecret = Deno.env.get('LEMON_SQUEEZY_WEBHOOK_SECRET');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const timestamp = new Date().toISOString();
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[${timestamp}] [WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Webhook received', { method: req.method, url: req.url });
    
    if (!supabaseUrl || !supabaseServiceKey) {
      logStep('ERROR: Missing Supabase configuration');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify webhook signature if secret is provided
    if (webhookSecret) {
      const signature = req.headers.get('x-signature');
      logStep('Webhook signature check', { hasSignature: !!signature, hasSecret: !!webhookSecret });
      // TODO: Implement signature verification for production
    }

    // Parse request body with better error handling
    let payload;
    let rawBody;
    try {
      rawBody = await req.text();
      logStep('Raw webhook body received', { bodyLength: rawBody.length });
      payload = JSON.parse(rawBody);
    } catch (parseError) {
      logStep('ERROR: Failed to parse request body', { 
        error: parseError.message, 
        bodyPreview: rawBody ? rawBody.substring(0, 200) : 'No body' 
      });
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        { 
          status: 400,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    logStep('Webhook payload parsed', { 
      eventName: payload.meta?.event_name,
      dataType: payload.data?.type,
      dataId: payload.data?.id,
      hasData: !!payload.data,
      hasMeta: !!payload.meta,
      payloadKeys: Object.keys(payload || {})
    });

    const { meta, data } = payload;
    const eventName = meta?.event_name;

    // Enhanced validation of required fields
    if (!eventName) {
      logStep('ERROR: Missing event_name in payload', { meta, availableKeys: Object.keys(payload || {}) });
      return new Response(
        JSON.stringify({ 
          error: 'Missing event_name in payload',
          received: { meta, dataKeys: Object.keys(payload || {}) }
        }),
        { 
          status: 400,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    if (!data || !data.id) {
      logStep('ERROR: Missing data or data.id in payload', { 
        hasData: !!data, 
        dataId: data?.id,
        dataKeys: data ? Object.keys(data) : 'No data object'
      });
      return new Response(
        JSON.stringify({ 
          error: 'Missing data or data.id in payload',
          received: { hasData: !!data, dataId: data?.id }
        }),
        { 
          status: 400,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    logStep('Processing webhook event', { eventName, dataId: data.id, dataType: data.type });

    // Process different webhook events
    switch (eventName) {
      case 'subscription_created':
      case 'subscription_updated':
        await handleSubscriptionChange(supabase, data, 'active');
        break;
      
      case 'subscription_cancelled':
      case 'subscription_expired':
        await handleSubscriptionChange(supabase, data, 'cancelled');
        break;
      
      case 'order_created':
        await handleOrderCreated(supabase, data);
        break;

      default:
        logStep(`Unhandled event: ${eventName}`, { supportedEvents: [
          'subscription_created', 
          'subscription_updated', 
          'subscription_cancelled', 
          'subscription_expired', 
          'order_created'
        ]});
    }

    logStep('Webhook processed successfully', { eventName, dataId: data.id });

    return new Response(
      JSON.stringify({ 
        received: true, 
        event: eventName,
        processed_at: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    logStep('Webhook error', { 
      error: error.message, 
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
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

async function handleSubscriptionChange(supabase: any, data: any, status: string) {
  logStep('Handling subscription change', { 
    subscriptionId: data.id, 
    status, 
    dataType: data.type,
    hasAttributes: !!data.attributes 
  });
  
  try {
    // Enhanced validation of data structure
    if (!data.attributes) {
      logStep('ERROR: Missing data.attributes', { 
        dataKeys: Object.keys(data || {}),
        dataId: data.id 
      });
      return;
    }

    // Multiple strategies to find the user
    let userId = null;
    let userEmail = null;
    
    logStep('Starting user lookup process', { 
      hasCustomData: !!data.attributes?.first_subscription_item?.meta?.custom_data,
      hasOrderCustom: !!data.attributes?.order?.custom,
      customerEmail: data.attributes?.customer?.email 
    });

    // Method 1: Check for custom data in checkout_data array format
    if (data.attributes?.checkout_data) {
      logStep('Found checkout_data', { checkoutData: data.attributes.checkout_data });
      
      // Handle array format
      if (Array.isArray(data.attributes.checkout_data)) {
        const userIdField = data.attributes.checkout_data.find((field: any) => field.key === 'user_id');
        const userEmailField = data.attributes.checkout_data.find((field: any) => field.key === 'user_email');
        
        if (userIdField) {
          userId = userIdField.value;
          userEmail = userEmailField?.value;
          logStep('Found user from checkout_data array', { userId, userEmail });
        }
      }
      // Handle object format (fallback)
      else if (typeof data.attributes.checkout_data === 'object') {
        userId = data.attributes.checkout_data.user_id;
        userEmail = data.attributes.checkout_data.user_email;
        logStep('Found user from checkout_data object', { userId, userEmail });
      }
    }
    
    // Method 2: Check for custom data in subscription meta
    if (!userId && data.attributes?.first_subscription_item?.meta?.custom_data) {
      const customData = data.attributes.first_subscription_item.meta.custom_data;
      userId = customData.user_id;
      userEmail = customData.user_email;
      logStep('Found user from subscription custom data', { userId, userEmail });
    }
    
    // Method 3: Check order custom fields
    if (!userId && data.attributes?.order?.custom) {
      const customFields = data.attributes.order.custom;
      const userIdField = customFields.find((field: any) => field.option_name === 'user_id');
      const userEmailField = customFields.find((field: any) => field.option_name === 'user_email');
      
      if (userIdField) {
        userId = userIdField.option_value;
        userEmail = userEmailField?.option_value;
        logStep('Found user from order custom fields', { userId, userEmail });
      }
    }
    
    // Method 4: Try to find user by customer email
    if (!userId && data.attributes?.customer?.email) {
      userEmail = data.attributes.customer.email;
      logStep('Attempting user lookup by email', { userEmail });
      
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userEmail)
        .single();
        
      if (profileData && !error) {
        userId = profileData.id;
        logStep('Found user by email lookup', { userId, userEmail });
      } else {
        logStep('Failed to find user by email', { userEmail, error: error?.message });
      }
    }
    
    if (!userId) {
      logStep('ERROR: No user ID found in subscription data', { 
        checkedMethods: [
          'checkout_data',
          'subscription_custom_data', 
          'order_custom_fields',
          'customer_email_lookup'
        ],
        customerEmail: data.attributes?.customer?.email,
        availableDataKeys: Object.keys(data.attributes || {})
      });
      return;
    }

    // Determine subscription tier based on variant/price
    let subscriptionTier = 'plus'; // default
    const variantId = data.attributes?.variant?.id || data.relationships?.variant?.data?.id;
    
    logStep('Determining subscription tier', { variantId });
    
    if (variantId === '697231') {
      subscriptionTier = 'plus';
    } else if (variantId === '697237') {
      subscriptionTier = 'pro';
    }
    
    logStep('Determined subscription tier', { variantId, subscriptionTier });

    // Update user's subscription status
    const updateData = {
      user_type: status === 'active' ? subscriptionTier : 'free',
      subscription_id: data.id,
      subscription_status: data.attributes?.status || status,
      updated_at: new Date().toISOString(),
    };

    logStep('Updating user profile', { userId, updateData });

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      logStep('ERROR updating user subscription', { 
        error: error.message, 
        userId, 
        updateData,
        errorCode: error.code 
      });
      throw error;
    } else {
      logStep('Successfully updated user subscription', { userId, updateData });
    }
  } catch (error) {
    logStep('ERROR in handleSubscriptionChange', { 
      error: error.message, 
      stack: error.stack,
      subscriptionId: data.id 
    });
    throw error;
  }
}

async function handleOrderCreated(supabase: any, data: any) {
  logStep('Handling order created', { orderId: data.id, dataType: data.type });
  
  try {
    // Validate required data fields
    if (!data.attributes) {
      logStep('ERROR: Missing data.attributes in order', { 
        dataKeys: Object.keys(data || {}),
        orderId: data.id 
      });
      return;
    }

    // Extract user information from order
    let userId = null;
    let userEmail = null;
    
    logStep('Starting user lookup for order', {
      hasCustomFields: !!data.attributes?.custom,
      customerEmail: data.attributes?.customer?.email,
      availableKeys: Object.keys(data.attributes || {})
    });
    
    // Check custom fields in the order
    if (data.attributes?.custom) {
      const userIdField = data.attributes.custom.find((field: any) => field.option_name === 'user_id');
      const userEmailField = data.attributes.custom.find((field: any) => field.option_name === 'user_email');
      
      userId = userIdField?.option_value;
      userEmail = userEmailField?.option_value;
      logStep('Found user from order custom fields', { userId, userEmail });
    }
    
    // Try to find user by customer email if no custom data
    if (!userId && data.attributes?.customer?.email) {
      userEmail = data.attributes.customer.email;
      logStep('Attempting user lookup by customer email', { userEmail });
      
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userEmail)
        .single();
        
      if (profileData && !error) {
        userId = profileData.id;
        logStep('Found user by email lookup', { userId, userEmail });
      } else {
        logStep('Failed to find user by email', { userEmail, error: error?.message });
      }
    }
    
    if (userId) {
      logStep('Order processed for user', { userId, orderId: data.id, userEmail });
      // Additional order processing logic can be added here
    } else {
      logStep('No user found for order', { 
        orderId: data.id,
        customerEmail: data.attributes?.customer?.email,
        checkedMethods: ['order_custom_fields', 'customer_email_lookup']
      });
    }
  } catch (error) {
    logStep('ERROR in handleOrderCreated', { 
      error: error.message, 
      stack: error.stack,
      orderId: data.id 
    });
    throw error;
  }
}
