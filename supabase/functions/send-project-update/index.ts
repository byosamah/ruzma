import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { render } from 'https://esm.sh/@react-email/render@0.0.15'
import { ProjectUpdateTemplate } from '../_shared/email-templates/project-update.tsx'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface RequestBody {
  projectId: string
  clientEmail: string
  updateType: 'status_change' | 'milestone_added' | 'timeline_change' | 'general'
  updateDetails: string
  language?: 'en' | 'ar'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    console.log('✅ Received request body:', JSON.stringify(body, null, 2))

    const {
      projectId,
      clientEmail,
      updateType,
      updateDetails,
      language = 'en'
    }: RequestBody = body

    // Validate required parameters
    if (!projectId || !clientEmail || !updateType || !updateDetails) {
      console.error('❌ Missing parameters:', { projectId, clientEmail, updateType, updateDetails })
      throw new Error(`Missing required parameters. Received: projectId=${!!projectId}, clientEmail=${!!clientEmail}, updateType=${!!updateType}, updateDetails=${!!updateDetails}`)
    }

    console.log('✅ All parameters validated')

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('✅ Supabase client initialized')

    // First, try to fetch just the basic project data
    console.log('📝 Fetching project with ID:', projectId)
    const { data: basicProject, error: basicError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (basicError) {
      console.error('❌ Error fetching basic project:', basicError)
      throw new Error(`Failed to fetch project: ${basicError.message}`)
    }

    if (!basicProject) {
      console.error('❌ Project not found with ID:', projectId)
      throw new Error('Project not found')
    }

    console.log('✅ Found project:', basicProject.name)

    // Now fetch related data separately to avoid complex join issues
    const { data: client } = await supabase
      .from('clients')
      .select('*')
      .eq('id', basicProject.client_id)
      .maybeSingle()

    console.log('✅ Client data fetched:', client ? 'found' : 'none')

    const { data: freelancer } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', basicProject.user_id)
      .single()

    console.log('✅ Freelancer data fetched')

    const { data: tokens } = await supabase
      .from('client_project_tokens')
      .select('token')
      .eq('project_id', projectId)
      .limit(1)

    console.log('✅ Token data fetched:', tokens ? tokens.length : 0)

    // Combine the data
    const project = {
      ...basicProject,
      client,
      freelancer,
      client_project_tokens: tokens || []
    }

    console.log('✅ Project data assembled successfully')

    // Check if client has project update notifications enabled
    const { data: clientProfile } = await supabase
      .from('profiles')
      .select('notification_settings')
      .eq('email', clientEmail)
      .single()

    // Check notification preferences
    const notificationSettings = clientProfile?.notification_settings as any
    if (notificationSettings && notificationSettings.projectUpdates === false) {
      console.log('Client has disabled project update notifications')
      return new Response(
        JSON.stringify({ success: true, message: 'Notification disabled by user' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Get or create client token for project URL
    let clientToken = project.client_project_tokens?.[0]?.token

    if (!clientToken) {
      console.log('📝 No token found, generating new client token...')

      // Generate a unique token
      clientToken = crypto.randomUUID()

      // Store the token in the database with 90-day expiry
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 90)

      const { error: tokenError } = await supabase
        .from('client_project_tokens')
        .insert({
          project_id: projectId,
          token: clientToken,
          client_email: clientEmail,
          expires_at: expiresAt.toISOString(),
          is_active: true
        })

      if (tokenError) {
        console.error('❌ Failed to create client token:', tokenError)
        throw new Error('Failed to create client access token')
      }

      console.log('✅ Client token generated:', clientToken)
    } else {
      console.log('✅ Using existing token:', clientToken)
    }

    // Generate project URL
    const baseUrl = Deno.env.get('APP_BASE_URL') || 'https://app.ruzma.co'
    const projectUrl = `${baseUrl}/client/project/${clientToken}`

    // Fetch freelancer branding
    const { data: branding } = await supabase
      .from('freelancer_branding')
      .select('primary_color, logo_url')
      .eq('user_id', project.user_id)
      .single()

    // Render email HTML from React template
    const emailHtml = render(
      ProjectUpdateTemplate({
        projectName: project.name,
        clientName: project.client?.name || 'Client',
        freelancerName: project.freelancer?.full_name || 'Freelancer',
        freelancerCompany: project.freelancer?.company,
        updateType,
        updateDetails,
        projectUrl,
        language,
        brandingColor: branding?.primary_color || '#3B82F6',
        companyName: project.freelancer?.company || 'Ruzma',
        companyLogo: branding?.logo_url
      })
    )

    // Prepare email data
    const emailSubject = language === 'ar'
      ? `تحديث المشروع - ${project.name}`
      : `Project Update - ${project.name}`

    // Send email via Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('Resend API key not configured')
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Ruzma <noreply@ruzma.co>',
        to: clientEmail,
        subject: emailSubject,
        html: emailHtml
      })
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      throw new Error(`Failed to send email: ${errorText}`)
    }

    const result = await emailResponse.json()

    // Log email send to database
    await supabase
      .from('email_logs')
      .insert({
        template: 'project_update',
        recipient: clientEmail,
        status: 'sent',
        metadata: {
          project_id: projectId,
          update_type: updateType
        }
      })

    return new Response(
      JSON.stringify({ success: true, emailId: result.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in send-project-update:', error)

    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
