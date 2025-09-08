import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExchangeRateAPI {
  rates: Record<string, number>;
  base: string;
  date: string;
}

const SUPPORTED_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'SAR', 'AED', 'JOD', 'EGP', 'KWD', 'QAR', 
  'BHD', 'OMR', 'LBP', 'MAD', 'TND', 'DZD', 'CAD', 'AUD', 'CHF', 'JPY'
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting exchange rate update...');

    // Fetch rates from exchange rate API
    const apiUrl = 'https://api.exchangerate-api.com/v4/latest/USD';
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data: ExchangeRateAPI = await response.json();
    
    if (!data.rates) {
      throw new Error('Invalid API response: missing rates');
    }

    console.log(`Fetched rates for ${Object.keys(data.rates).length} currencies`);

    // Prepare data for insertion
    const rateUpdates = [];
    
    // Add USD as base (rate = 1)
    rateUpdates.push({
      base_currency: 'USD',
      target_currency: 'USD',
      rate: 1.0
    });

    // Add rates for supported currencies
    for (const [currency, rate] of Object.entries(data.rates)) {
      if (SUPPORTED_CURRENCIES.includes(currency)) {
        rateUpdates.push({
          base_currency: 'USD',
          target_currency: currency,
          rate: rate
        });
      }
    }

    console.log(`Updating ${rateUpdates.length} exchange rates...`);

    // Batch upsert the rates
    const { data: upsertResult, error: upsertError } = await supabaseClient
      .from('exchange_rates')
      .upsert(rateUpdates, { 
        onConflict: 'base_currency,target_currency',
        ignoreDuplicates: false 
      });

    if (upsertError) {
      throw new Error(`Database upsert failed: ${upsertError.message}`);
    }

    // Clean up old rates (older than 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { error: cleanupError } = await supabaseClient
      .from('exchange_rates')
      .delete()
      .lt('updated_at', sevenDaysAgo.toISOString());

    if (cleanupError) {
      console.warn(`Cleanup failed: ${cleanupError.message}`);
    }

    // Log success
    console.log('Exchange rates updated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Exchange rates updated successfully',
        updated_count: rateUpdates.length,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error updating exchange rates:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});