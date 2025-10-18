import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { render } from 'https://esm.sh/@react-email/render@0.0.15'
import { PaymentReminderTemplate } from '../_shared/email-templates/payment-reminder.tsx'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface RequestBody {
  milestoneId: string
  clientEmail: string
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
      language = 'en'
    }: RequestBody = await req.json()

    // Validate required parameters
    if (!milestoneId || !clientEmail) {
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

    // Check if client has payment reminder notifications enabled
    const { data: clientProfile } = await supabase
      .from('profiles')
      .select('notification_settings')
      .eq('email', clientEmail)
      .single()

    // Check notification preferences
    const notificationSettings = clientProfile?.notification_settings as any
    if (notificationSettings && notificationSettings.paymentReminders === false) {
      console.log('Client has disabled payment reminder notifications')
      return new Response(
        JSON.stringify({ success: true, message: 'Notification disabled by user' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Calculate days until due
    const dueDate = new Date(milestone.due_date)
    const today = new Date()
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    // Format due date
    const formattedDueDate = dueDate.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

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
      PaymentReminderTemplate({
        projectName: project.name,
        clientName: project.client?.name || 'Client',
        freelancerName: project.freelancer?.full_name || 'Freelancer',
        freelancerCompany: project.freelancer?.company,
        milestoneName: milestone.name,
        amount: milestone.amount,
        currency: project.currency || 'USD',
        dueDate: formattedDueDate,
        daysUntilDue,
        projectUrl,
        language,
        brandingColor: branding?.primary_color || '#3B82F6',
        companyName: project.freelancer?.company || 'Ruzma',
        companyLogo: branding?.logo_url
      })
    )

    // Prepare email subject
    const dueStatus = daysUntilDue < 0
      ? (language === 'ar' ? 'متأخرة' : 'Overdue')
      : (language === 'ar' ? 'قادمة' : 'Due Soon')

    const emailSubject = language === 'ar'
      ? `تذكير بالدفعة - ${milestone.name} ${dueStatus}`
      : `Payment Reminder - ${milestone.name} ${dueStatus}`

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
        template: 'payment_reminder',
        recipient: clientEmail,
        status: 'sent',
        metadata: {
          milestone_id: milestoneId,
          project_id: project.id,
          days_until_due: daysUntilDue
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
    console.error('Error in send-payment-reminder:', error)

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
