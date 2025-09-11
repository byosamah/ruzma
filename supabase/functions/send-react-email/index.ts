import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Import our email template renderer
import { renderEmailTemplate, validateTemplateData } from '../_shared/email-templates/index.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  template: 'contract-approval' | 'payment-notification' | 'client-invite'
  to: string
  language?: 'en' | 'ar'
  brandingColor?: string
  companyName?: string
  companyLogo?: string
  data: Record<string, any>
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    const emailRequest: EmailRequest = await req.json()
    
    // Validate required fields
    if (!emailRequest.template || !emailRequest.to || !emailRequest.data) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: template, to, data' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate template data
    if (!validateTemplateData(emailRequest.template, emailRequest.data)) {
      return new Response(
        JSON.stringify({ 
          error: `Invalid data for template: ${emailRequest.template}` 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Render email template
    const { html, subject } = await renderEmailTemplate({
      template: emailRequest.template,
      data: emailRequest.data,
      language: emailRequest.language || 'en',
      brandingColor: emailRequest.brandingColor,
      companyName: emailRequest.companyName,
      companyLogo: emailRequest.companyLogo,
    })

    // Get email service configuration from environment
    const emailService = Deno.env.get('EMAIL_SERVICE') || 'resend' // 'resend' or 'sendgrid'
    
    let emailResult
    
    if (emailService === 'resend') {
      emailResult = await sendWithResend(emailRequest.to, subject, html)
    } else {
      emailResult = await sendWithSendGrid(emailRequest.to, subject, html)
    }

    // Log successful email send to Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    await supabase
      .from('email_logs')
      .insert({
        template_name: emailRequest.template,
        recipient_email: emailRequest.to,
        language: emailRequest.language || 'en',
        status: 'sent',
        sent_at: new Date().toISOString(),
        email_service: emailService,
        subject: subject,
      })
      .single()

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        template: emailRequest.template,
        language: emailRequest.language || 'en'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error sending email:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send email', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Email service implementations
async function sendWithResend(to: string, subject: string, html: string) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY not configured')
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: Deno.env.get('FROM_EMAIL') || 'noreply@ruzma.co',
      to: [to],
      subject: subject,
      html: html,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Resend API error: ${error}`)
  }

  return await response.json()
}

async function sendWithSendGrid(to: string, subject: string, html: string) {
  const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY')
  if (!sendGridApiKey) {
    throw new Error('SENDGRID_API_KEY not configured')
  }

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${sendGridApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: to }],
          subject: subject,
        },
      ],
      from: {
        email: Deno.env.get('FROM_EMAIL') || 'noreply@ruzma.co',
        name: 'Ruzma',
      },
      content: [
        {
          type: 'text/html',
          value: html,
        },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`SendGrid API error: ${error}`)
  }

  return { success: true }
}