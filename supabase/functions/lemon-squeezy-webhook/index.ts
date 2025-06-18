
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const webhookSecret = Deno.env.get('LEMON_SQUEEZY_WEBHOOK_SECRET');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify webhook signature if secret is provided
    if (webhookSecret) {
      const signature = req.headers.get('x-signature');
      // Add signature verification logic here
    }

    const payload = await req.json();
    console.log('Received webhook:', JSON.stringify(payload, null, 2));

    const { meta, data } = payload;
    const eventName = meta?.event_name;

    switch (eventName) {
      case 'subscription_created':
      case 'subscription_updated':
        await handleSubscriptionChange(supabase, data);
        break;
      
      case 'subscription_cancelled':
      case 'subscription_expired':
        await handleSubscriptionCancellation(supabase, data);
        break;
      
      case 'order_created':
        await handleOrderCreated(supabase, data);
        break;

      default:
        console.log(`Unhandled event: ${eventName}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
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

async function handleSubscriptionChange(supabase: any, data: any) {
  console.log('Handling subscription change:', data);
  
  const customData = data.attributes.first_subscription_item?.meta?.custom_data;
  const userId = customData?.user_id;
  
  if (!userId) {
    console.error('No user_id found in subscription data');
    return;
  }

  // Update user's subscription status
  const { error } = await supabase
    .from('profiles')
    .update({
      user_type: 'plus', // or determine from variant
      subscription_id: data.id,
      subscription_status: data.attributes.status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user subscription:', error);
  } else {
    console.log('Successfully updated user subscription');
  }
}

async function handleSubscriptionCancellation(supabase: any, data: any) {
  console.log('Handling subscription cancellation:', data);
  
  const customData = data.attributes.first_subscription_item?.meta?.custom_data;
  const userId = customData?.user_id;
  
  if (!userId) {
    console.error('No user_id found in subscription data');
    return;
  }

  // Update user's subscription status
  const { error } = await supabase
    .from('profiles')
    .update({
      user_type: 'free',
      subscription_status: data.attributes.status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user subscription cancellation:', error);
  } else {
    console.log('Successfully updated user subscription cancellation');
  }
}

async function handleOrderCreated(supabase: any, data: any) {
  console.log('Handling order created:', data);
  // Handle one-time purchases if needed
}
