import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { render } from 'https://esm.sh/@react-email/render@0.0.15'
import { MilestoneUpdateTemplate } from '../_shared/email-templates/milestone-update.tsx'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface RequestBody {
  milestoneId: string
  clientEmail: string
  oldStatus: 'pending' | 'in_progress' | 'review' | 'completed'
  newStatus: 'pending' | 'in_progress' | 'review' | 'completed'
  message?: string
  language?: 'en' | 'ar'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const {
      milestoneId,
      clientEmail,
      oldStatus,
      newStatus,
      message,
      language = 'en'
    }: RequestBody = await req.json()

    // Validate required parameters
    if (!milestoneId || !clientEmail || !oldStatus || !newStatus) {
      throw new Error('Missing required parameters')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch milestone with project and client data
    const { data: milestone, error: milestoneError } = await supabase
      .from('milestones')
      .select(`
        *,
        project:projects(
          *,
          client:clients(*),
          freelancer:profiles!user_id(*),
          client_project_tokens(token)
        )
      `)
      .eq('id', milestoneId)
      .single()

    if (milestoneError || !milestone || !milestone.project) {
      throw new Error('Milestone not found')
    }

    const project = milestone.project as any

    // Check if client has milestone update notifications enabled
    const { data: clientProfile } = await supabase
      .from('profiles')
      .select('notification_settings')
      .eq('email', clientEmail)
      .single()

    // Check notification preferences
    const notificationSettings = clientProfile?.notification_settings as any
    if (notificationSettings && notificationSettings.milestoneUpdates === false) {
      console.log('Client has disabled milestone update notifications')
      return new Response(
        JSON.stringify({ success: true, message: 'Notification disabled by user' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Get client token for project URL
    const clientToken = project.client_project_tokens?.[0]?.token
    if (!clientToken) {
      throw new Error('Client token not found')
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
      MilestoneUpdateTemplate({
        projectName: project.name,
        clientName: project.client?.name || 'Client',
        freelancerName: project.freelancer?.full_name || 'Freelancer',
        freelancerCompany: project.freelancer?.company,
        milestoneName: milestone.name,
        oldStatus,
        newStatus,
        message,
        projectUrl,
        language,
        brandingColor: branding?.primary_color || '#3B82F6',
        companyName: project.freelancer?.company || 'Ruzma',
        companyLogo: branding?.logo_url
      })
    )

    // Prepare email subject
    const emailSubject = language === 'ar'
      ? `تحديث المعلم - ${milestone.name}`
      : `Milestone Update - ${milestone.name}`

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
        template: 'milestone_update',
        recipient: clientEmail,
        status: 'sent',
        metadata: {
          milestone_id: milestoneId,
          project_id: project.id,
          old_status: oldStatus,
          new_status: newStatus
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
    console.error('Error in send-milestone-update:', error)

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
