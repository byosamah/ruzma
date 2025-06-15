
import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const milestoneId = formData.get('milestoneId') as string | null

    if (!file || !milestoneId) {
      return new Response(JSON.stringify({ error: 'File and milestoneId are required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Verify milestone exists
    const { data: milestone, error: milestoneError } = await supabaseAdmin
      .from('milestones')
      .select('id')
      .eq('id', milestoneId)
      .single()

    if (milestoneError || !milestone) {
        return new Response(JSON.stringify({ error: 'Milestone not found' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
        })
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `${milestoneId}/${fileName}`

    // Upload file
    const { error: uploadError } = await supabaseAdmin.storage
      .from('payment-proofs')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      throw uploadError
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('payment-proofs')
      .getPublicUrl(filePath)

    // Update milestone
    const { error: updateError } = await supabaseAdmin
      .from('milestones')
      .update({
        payment_proof_url: urlData.publicUrl,
        status: 'payment_submitted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', milestoneId)

    if (updateError) {
      // If DB update fails, remove the file from storage to avoid orphans
      await supabaseAdmin.storage.from('payment-proofs').remove([filePath])
      throw updateError
    }

    return new Response(JSON.stringify({ success: true, url: urlData.publicUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return new Response(JSON.stringify({ error: 'Failed to upload payment proof' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

