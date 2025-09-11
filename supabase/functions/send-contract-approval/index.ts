import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  projectId: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { projectId }: RequestBody = await req.json()

    if (!projectId) {
      throw new Error('Project ID is required')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch project data with client and freelancer info
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

    if (!project.client_email) {
      throw new Error('Project does not have a client email')
    }

    // Generate contract URL
    const baseUrl = Deno.env.get('APP_BASE_URL') || 'https://app.ruzma.co'
    const contractUrl = `${baseUrl}/contract/${project.contract_approval_token}`

    // Prepare email data
    const emailData = {
      to: project.client_email,
      subject: `Contract Approval Required - ${project.name}`,
      html: generateContractApprovalHTML({
        projectName: project.name,
        projectBrief: project.brief,
        clientName: project.client?.name || 'Client',
        freelancerName: project.freelancer?.full_name || 'Freelancer',
        freelancerCompany: project.freelancer?.company,
        contractUrl,
        totalAmount: project.total_amount || 0,
        currency: project.currency || 'USD',
        milestones: project.milestones || []
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
    console.error('Error in send-contract-approval:', error)
    
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

function generateContractApprovalHTML(data: {
  projectName: string
  projectBrief: string
  clientName: string
  freelancerName: string
  freelancerCompany?: string
  contractUrl: string
  totalAmount: number
  currency: string
  milestones: Array<{
    title: string
    description: string
    price: number
  }>
}): string {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: data.currency,
    }).format(amount)
  }

  const milestonesHTML = data.milestones.map(milestone => `
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin: 12px 0;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div style="flex: 1;">
          <h4 style="margin: 0 0 4px 0; color: #374151; font-size: 16px; font-weight: 600;">
            ${milestone.title}
          </h4>
          <p style="margin: 0; color: #64748b; font-size: 14px;">
            ${milestone.description}
          </p>
        </div>
        <div style="margin-left: 16px; color: #3B82F6; font-weight: 600;">
          ${formatCurrency(milestone.price)}
        </div>
      </div>
    </div>
  `).join('')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contract Approval Required - ${data.projectName}</title>
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
    Project Contract Review & Approval
  </h2>

  <!-- Introduction -->
  <p style="margin-bottom: 20px;">
    We're pleased to present the "<strong>${data.projectName}</strong>" project contract for your review and approval.
  </p>

  <!-- Project Details -->
  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin: 20px 0;">
    <h3 style="color: #3B82F6; margin: 0 0 16px 0; font-size: 18px;">Project Details:</h3>
    
    <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 16px; font-weight: 600;">
      ${data.projectName}
    </h4>
    <p style="margin: 0 0 16px 0; color: #64748b; font-size: 14px;">
      ${data.projectBrief}
    </p>
    <p style="margin: 0; color: #3B82F6; font-weight: 600; font-size: 16px;">
      Total Amount: ${formatCurrency(data.totalAmount)}
    </p>
  </div>

  <!-- Milestones -->
  ${data.milestones.length > 0 ? `
    <div style="margin: 32px 0;">
      <h3 style="color: #3B82F6; margin: 0 0 16px 0; font-size: 18px;">Project Milestones:</h3>
      ${milestonesHTML}
    </div>
  ` : ''}

  <!-- Instructions -->
  <div style="margin: 32px 0;">
    <h3 style="color: #3B82F6; margin: 0 0 16px 0; font-size: 18px;">How to approve:</h3>
    <ol style="margin: 16px 0; padding-left: 20px;">
      <li style="margin: 8px 0;">Click the "Review Contract" button below</li>
      <li style="margin: 8px 0;">Carefully review the project details and terms</li>
      <li style="margin: 8px 0;">Click "Approve" if you agree to the terms</li>
      <li style="margin: 8px 0;">You'll receive an email confirmation after approval</li>
    </ol>
  </div>

  <!-- CTA Button -->
  <div style="text-align: center; margin: 32px 0;">
    <a href="${data.contractUrl}" style="background-color: #3B82F6; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
      Review & Approve Contract
    </a>
  </div>

  <!-- Note -->
  <p style="color: #64748b; font-style: italic; font-size: 14px; margin: 32px 0;">
    Note: This link is valid for 30 days. If you have any questions, please reply to this email.
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