import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }

    // Get request body
    const { confirmation } = await req.json()

    // Verify confirmation text
    if (confirmation !== 'DELETE') {
      return new Response(
        JSON.stringify({ error: 'Invalid confirmation. Please type DELETE to confirm.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get authenticated user from Bearer token
    const authHeader = req.headers.get('Authorization')

    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')

    // Create Supabase client with service role (for admin operations)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Get user from token
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized or invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Starting account deletion for user: ${user.id}`)

    // Track deleted items for response
    const deletedItems: Record<string, number> = {}

    // STEP 1: Delete invoices
    const { error: invoicesError, count: invoicesCount } = await supabaseAdmin
      .from('invoices')
      .delete({ count: 'exact' })
      .eq('user_id', user.id)

    if (invoicesError) {
      console.error('Error deleting invoices:', invoicesError)
      throw new Error(`Failed to delete invoices: ${invoicesError.message}`)
    }
    deletedItems.invoices = invoicesCount || 0

    // STEP 2: Delete milestones (will be deleted via cascade if FK is set, but we'll do it explicitly for safety)
    const { data: userProjects } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('user_id', user.id)

    if (userProjects && userProjects.length > 0) {
      const projectIds = userProjects.map(p => p.id)

      const { error: milestonesError, count: milestonesCount } = await supabaseAdmin
        .from('milestones')
        .delete({ count: 'exact' })
        .in('project_id', projectIds)

      if (milestonesError) {
        console.error('Error deleting milestones:', milestonesError)
        throw new Error(`Failed to delete milestones: ${milestonesError.message}`)
      }
      deletedItems.milestones = milestonesCount || 0
    } else {
      deletedItems.milestones = 0
    }

    // STEP 3: Delete projects
    const { error: projectsError, count: projectsCount } = await supabaseAdmin
      .from('projects')
      .delete({ count: 'exact' })
      .eq('user_id', user.id)

    if (projectsError) {
      console.error('Error deleting projects:', projectsError)
      throw new Error(`Failed to delete projects: ${projectsError.message}`)
    }
    deletedItems.projects = projectsCount || 0

    // STEP 4: Delete project templates
    const { error: templatesError, count: templatesCount } = await supabaseAdmin
      .from('project_templates')
      .delete({ count: 'exact' })
      .eq('user_id', user.id)

    if (templatesError) {
      console.error('Error deleting project templates:', templatesError)
      throw new Error(`Failed to delete project templates: ${templatesError.message}`)
    }
    deletedItems.project_templates = templatesCount || 0

    // STEP 5: Delete clients
    const { error: clientsError, count: clientsCount } = await supabaseAdmin
      .from('clients')
      .delete({ count: 'exact' })
      .eq('user_id', user.id)

    if (clientsError) {
      console.error('Error deleting clients:', clientsError)
      throw new Error(`Failed to delete clients: ${clientsError.message}`)
    }
    deletedItems.clients = clientsCount || 0

    // STEP 6: Delete notifications
    const { error: notificationsError, count: notificationsCount } = await supabaseAdmin
      .from('notifications')
      .delete({ count: 'exact' })
      .eq('user_id', user.id)

    if (notificationsError) {
      console.error('Error deleting notifications:', notificationsError)
      // Not critical - continue
    }
    deletedItems.notifications = notificationsCount || 0

    // STEP 7: Delete subscriptions
    const { error: subscriptionsError, count: subscriptionsCount } = await supabaseAdmin
      .from('subscriptions')
      .delete({ count: 'exact' })
      .eq('user_id', user.id)

    if (subscriptionsError) {
      console.error('Error deleting subscriptions:', subscriptionsError)
      throw new Error(`Failed to delete subscriptions: ${subscriptionsError.message}`)
    }
    deletedItems.subscriptions = subscriptionsCount || 0

    // STEP 8: Delete freelancer branding
    const { error: brandingError, count: brandingCount } = await supabaseAdmin
      .from('freelancer_branding')
      .delete({ count: 'exact' })
      .eq('user_id', user.id)

    if (brandingError) {
      console.error('Error deleting branding:', brandingError)
      throw new Error(`Failed to delete branding: ${brandingError.message}`)
    }
    deletedItems.freelancer_branding = brandingCount || 0

    // STEP 9: Delete storage files (optional but recommended)
    // Collect all file URLs from various tables
    try {
      const filesToDelete: string[] = []

      // Get profile avatar
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single()

      if (profile?.avatar_url) {
        filesToDelete.push(profile.avatar_url)
      }

      // Get branding logo
      const { data: branding } = await supabaseAdmin
        .from('freelancer_branding')
        .select('logo_url')
        .eq('user_id', user.id)
        .single()

      if (branding?.logo_url) {
        filesToDelete.push(branding.logo_url)
      }

      // Get milestone deliverables and payment proofs
      if (userProjects && userProjects.length > 0) {
        const projectIds = userProjects.map(p => p.id)

        const { data: milestones } = await supabaseAdmin
          .from('milestones')
          .select('deliverable_url, payment_proof_url')
          .in('project_id', projectIds)

        if (milestones) {
          milestones.forEach(m => {
            if (m.deliverable_url) filesToDelete.push(m.deliverable_url)
            if (m.payment_proof_url) filesToDelete.push(m.payment_proof_url)
          })
        }
      }

      // Delete files from storage
      let filesDeleted = 0
      for (const fileUrl of filesToDelete) {
        try {
          // Extract bucket and path from URL
          // Format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
          const urlParts = fileUrl.split('/storage/v1/object/public/')
          if (urlParts.length === 2) {
            const [bucket, ...pathParts] = urlParts[1].split('/')
            const filePath = pathParts.join('/')

            const { error: storageError } = await supabaseAdmin.storage
              .from(bucket)
              .remove([filePath])

            if (!storageError) {
              filesDeleted++
            }
          }
        } catch (storageError) {
          console.error('Error deleting file:', fileUrl, storageError)
          // Continue with other files
        }
      }

      deletedItems.storage_files = filesDeleted
    } catch (storageError) {
      console.error('Error during storage cleanup:', storageError)
      // Not critical - continue with account deletion
      deletedItems.storage_files = 0
    }

    // STEP 10: Delete profile
    const { error: profileError, count: profileCount } = await supabaseAdmin
      .from('profiles')
      .delete({ count: 'exact' })
      .eq('id', user.id)

    if (profileError) {
      console.error('Error deleting profile:', profileError)
      throw new Error(`Failed to delete profile: ${profileError.message}`)
    }
    deletedItems.profile = profileCount || 0

    // STEP 11: Delete auth user (requires service role - FINAL STEP)
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

    if (deleteUserError) {
      console.error('Error deleting auth user:', deleteUserError)
      throw new Error(`Failed to delete auth user: ${deleteUserError.message}`)
    }

    console.log(`Successfully deleted account for user ${user.id}:`, deletedItems)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Account deleted successfully',
        deleted: deletedItems,
        user_id: user.id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error deleting account:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to delete account',
        details: 'An error occurred while deleting your account. Please contact support if this issue persists.'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
