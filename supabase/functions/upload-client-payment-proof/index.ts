
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const MAX_FILE_SIZE_MB = 5;
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const milestoneId = formData.get('milestoneId') as string | null
    const token = formData.get('token') as string | null

    if (!file || !milestoneId || !token) {
      return new Response(JSON.stringify({ error: 'File, milestoneId, and token are required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // --- SECURITY: Input Validation ---
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        return new Response(JSON.stringify({ error: `File size exceeds ${MAX_FILE_SIZE_MB}MB limit` }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 413, // Payload Too Large
        });
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return new Response(JSON.stringify({ error: `Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}` }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 415, // Unsupported Media Type
        });
    }
    // --- END SECURITY ---

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // --- SECURITY: Verify token and milestone ownership ---
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('client_access_token', token)
      .single()

    if (projectError || !project) {
        return new Response(JSON.stringify({ error: 'Project not found or access denied' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
        })
    }

    const { data: milestone, error: milestoneError } = await supabaseAdmin
      .from('milestones')
      .select('id')
      .eq('id', milestoneId)
      .eq('project_id', project.id)
      .single()

    if (milestoneError || !milestone) {
        return new Response(JSON.stringify({ error: 'Milestone not found or does not belong to this project' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
        })
    }
    // --- END SECURITY ---

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
    return new Response(JSON.stringify({ error: 'Failed to upload payment proof' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
