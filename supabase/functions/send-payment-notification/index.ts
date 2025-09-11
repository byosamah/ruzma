import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  clientEmail: string
  projectName: string
  projectId: string
  clientToken: string
  isApproved: boolean
  milestoneName: string
  language?: 'en' | 'ar'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const {
      clientEmail,
      projectName,
      projectId,
      clientToken,
      isApproved,
      milestoneName,
      language = 'en'
    }: RequestBody = await req.json()

    if (!clientEmail || !projectName || !projectId || !milestoneName) {
      throw new Error('Missing required parameters')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch project data
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(`
        *,
        client:clients(*),
        freelancer:profiles!user_id(*),
        milestones(*)
      `)
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      throw new Error('Project not found')
    }

    // Find the milestone
    const milestone = project.milestones?.find(m => m.title === milestoneName)
    const milestoneAmount = milestone?.price || 0

    // Generate project URL
    const baseUrl = Deno.env.get('APP_BASE_URL') || 'https://app.ruzma.co'
    const projectUrl = `${baseUrl}/client/${clientToken}`

    // Prepare email data
    const emailData = {
      to: clientEmail,
      subject: `Payment ${isApproved ? 'Approved' : 'Update'} - ${projectName}`,
      html: generatePaymentNotificationHTML({
        projectName,
        clientName: project.client?.name || 'Client',
        freelancerName: project.freelancer?.full_name || 'Freelancer',
        freelancerCompany: project.freelancer?.company,
        milestoneName,
        amount: milestoneAmount,
        currency: project.currency || 'USD',
        isApproved,
        projectUrl,
        language
      })
    }

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
        ...emailData,
        from: 'Ruzma <noreply@ruzma.co>',
      })
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      throw new Error(`Failed to send email: ${errorText}`)
    }

    const result = await emailResponse.json()

    return new Response(
      JSON.stringify({ success: true, emailId: result.id }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in send-payment-notification:', error)
    
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

function generatePaymentNotificationHTML(data: {
  projectName: string
  clientName: string
  freelancerName: string
  freelancerCompany?: string
  milestoneName: string
  amount: number
  currency: string
  isApproved: boolean
  projectUrl: string
  language: 'en' | 'ar'
}): string {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: data.currency,
    }).format(amount)
  }

  const statusColor = data.isApproved ? '#10B981' : '#F59E0B'
  const statusText = data.isApproved ? 'Approved' : 'Pending Review'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment ${statusText} - ${data.projectName}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <!-- Header -->
  <div style="text-align: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px;">
    <h1 style="color: #3B82F6; margin: 0; font-size: 28px;">Ruzma</h1>
  </div>

  <!-- Greeting -->
  <p style="font-size: 16px; margin-bottom: 24px;">
    Hello ${data.clientName},
  </p>

  <!-- Title -->
  <h2 style="color: #3B82F6; font-size: 24px; margin-bottom: 16px;">
    Payment ${statusText}
  </h2>

  <!-- Status Badge -->
  <div style="text-align: center; margin: 24px 0;">
    <span style="background-color: ${statusColor}; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px;">
      ${statusText}
    </span>
  </div>

  <!-- Payment Details -->
  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin: 20px 0;">
    <h3 style="color: #3B82F6; margin: 0 0 16px 0; font-size: 18px;">Payment Details:</h3>
    
    <div style="margin-bottom: 12px;">
      <strong>Project:</strong> ${data.projectName}
    </div>
    <div style="margin-bottom: 12px;">
      <strong>Milestone:</strong> ${data.milestoneName}
    </div>
    <div style="margin-bottom: 0;">
      <strong>Amount:</strong> <span style="color: ${statusColor}; font-weight: 600;">${formatCurrency(data.amount)}</span>
    </div>
  </div>

  <!-- Message -->
  <div style="background: #fefefe; border-left: 4px solid ${statusColor}; padding: 16px 20px; margin: 24px 0;">
    ${data.isApproved 
      ? `<p style="margin: 0; color: #374151;">
          Great news! Your milestone "${data.milestoneName}" has been approved and payment has been processed.
        </p>`
      : `<p style="margin: 0; color: #374151;">
          Your milestone "${data.milestoneName}" is currently under review. You'll receive another notification once the payment is approved.
        </p>`
    }
  </div>

  <!-- CTA Button -->
  <div style="text-align: center; margin: 32px 0;">
    <a href="${data.projectUrl}" style="background-color: #3B82F6; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
      View Project Details
    </a>
  </div>

  <!-- Note -->
  <p style="color: #64748b; font-style: italic; font-size: 14px; margin: 32px 0;">
    If you have any questions about this payment, please reply to this email or contact your project manager.
  </p>

  <!-- Signature -->
  <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; margin-top: 32px;">
    <p style="margin-bottom: 8px;">Best regards,</p>
    <p style="color: #3B82F6; font-weight: 600; margin-bottom: 4px;">${data.freelancerName}</p>
    ${data.freelancerCompany ? `<p style="color: #64748b; margin: 0;">${data.freelancerCompany}</p>` : ''}
  </div>

  <!-- Footer -->
  <div style="text-align: center; margin-top: 40px; color: #94a3b8; font-size: 14px;">
    <p>Powered by <a href="https://ruzma.co" style="color: #3B82F6; text-decoration: none;">Ruzma</a></p>
  </div>

</body>
</html>
  `
}