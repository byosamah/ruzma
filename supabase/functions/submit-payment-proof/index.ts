
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // This is needed for CORS preflight requests.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { milestoneId, paymentProofUrl } = await req.json();

    if (!milestoneId || !paymentProofUrl) {
      return new Response(JSON.stringify({
        error: 'Missing milestoneId or paymentProofUrl',
        details: { milestoneId, paymentProofUrl }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Check environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({
        error: 'Server configuration error',
        details: { supabaseUrl, serviceRoleKey }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: existingMilestone, error: selectError } = await supabaseAdmin
      .from('milestones')
      .select('id, status, payment_proof_url')
      .eq('id', milestoneId)
      .single();

    if (selectError || !existingMilestone) {
      return new Response(JSON.stringify({
        error: 'Milestone not found',
        details: selectError?.message || 'No milestone with this ID exists',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    // Extra: Prevent repeat updates if payment_proof_url is identical
    if (existingMilestone.payment_proof_url && existingMilestone.payment_proof_url === paymentProofUrl) {
      return new Response(JSON.stringify(existingMilestone), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const { data: updatedMilestone, error: updateError } = await supabaseAdmin
      .from('milestones')
      .update({
        payment_proof_url: paymentProofUrl,
        status: 'payment_submitted',
        updated_at: new Date().toISOString()
      })
      .eq('id', milestoneId)
      .select();

    if (updateError) {
      return new Response(JSON.stringify({
        error: 'Database update failed',
        details: updateError,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    if (!updatedMilestone || updatedMilestone.length === 0) {
      return new Response(JSON.stringify({
        error: 'Update failed - no rows affected',
        details: { milestoneId, paymentProofUrl }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    return new Response(JSON.stringify(updatedMilestone[0]), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    // Always expose error.message and the full error for diagnostics
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error && (error.message || error),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})
