
import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // This is needed for CORS preflight requests.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { milestoneId, paymentProofUrl } = await req.json()

    if (!milestoneId || !paymentProofUrl) {
      return new Response(JSON.stringify({ error: 'Missing milestoneId or paymentProofUrl' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }
    
    // The environment variables are automatically set by the platform.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: updatedMilestone, error: updateError } = await supabaseAdmin
      .from('milestones')
      .update({
        payment_proof_url: paymentProofUrl,
        status: 'payment_submitted',
        updated_at: new Date().toISOString()
      })
      .eq('id', milestoneId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating milestone:', updateError)
      throw updateError
    }

    return new Response(JSON.stringify(updatedMilestone), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
