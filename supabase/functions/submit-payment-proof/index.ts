
import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // This is needed for CORS preflight requests.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { milestoneId, paymentProofUrl } = await req.json()

    console.log('Received request:', { milestoneId, paymentProofUrl })

    if (!milestoneId || !paymentProofUrl) {
      console.error('Missing required parameters:', { milestoneId, paymentProofUrl })
      return new Response(JSON.stringify({ error: 'Missing milestoneId or paymentProofUrl' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }
    
    // Check environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    console.log('Environment check:', { 
      hasUrl: !!supabaseUrl, 
      hasServiceKey: !!serviceRoleKey 
    })

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing environment variables')
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }
    
    // The environment variables are automatically set by the platform.
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    console.log('Attempting to update milestone:', milestoneId)

    // First check if milestone exists
    const { data: existingMilestone, error: selectError } = await supabaseAdmin
      .from('milestones')
      .select('id, status')
      .eq('id', milestoneId)
      .single()

    if (selectError || !existingMilestone) {
      console.error('Milestone not found:', { milestoneId, error: selectError })
      return new Response(JSON.stringify({ 
        error: 'Milestone not found', 
        details: selectError?.message || 'No milestone with this ID exists'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    }

    console.log('Found milestone:', existingMilestone)

    // Update the milestone
    const { data: updatedMilestone, error: updateError } = await supabaseAdmin
      .from('milestones')
      .update({
        payment_proof_url: paymentProofUrl,
        status: 'payment_submitted',
        updated_at: new Date().toISOString()
      })
      .eq('id', milestoneId)
      .select()

    if (updateError) {
      console.error('Database update error:', updateError)
      return new Response(JSON.stringify({ 
        error: 'Database update failed', 
        details: updateError.message 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    // Check if update actually happened
    if (!updatedMilestone || updatedMilestone.length === 0) {
      console.error('No rows were updated')
      return new Response(JSON.stringify({ 
        error: 'Update failed - no rows affected',
        details: 'The milestone update did not affect any rows'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    console.log('Successfully updated milestone:', updatedMilestone[0])

    return new Response(JSON.stringify(updatedMilestone[0]), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Function error:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      details: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
