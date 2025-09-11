import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  clientEmail: string
  projectName: string
  freelancerName: string
  clientToken: string
  userId?: string
  language?: 'en' | 'ar'
  inviteMessage?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const {
      clientEmail,
      projectName,
      freelancerName,
      clientToken,
      language = 'en',
      inviteMessage
    }: RequestBody = await req.json()

    if (!clientEmail || !projectName || !freelancerName || !clientToken) {
      throw new Error('Missing required parameters')
    }

    // Generate project URL
    const baseUrl = Deno.env.get('APP_BASE_URL') || 'https://app.ruzma.co'
    const projectUrl = `${baseUrl}/client/${clientToken}`

    // Prepare email data
    const emailData = {
      to: clientEmail,
      subject: `Project Invitation - ${projectName}`,
      html: generateClientInviteHTML({
        projectName,
        clientName: clientEmail.split('@')[0], // Fallback to email prefix
        freelancerName,
        projectUrl,
        inviteMessage,
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
    console.error('Error in send-client-link:', error)
    
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

function generateClientInviteHTML(data: {
  projectName: string
  clientName: string
  freelancerName: string
  projectUrl: string
  inviteMessage?: string
  language: 'en' | 'ar'
}): string {
  const content = data.language === 'ar' ? {
    greeting: `مرحباً ${data.clientName}،`,
    title: 'دعوة للمشروع',
    intro: `يسرني أن أدعوك للعمل معي على مشروع "${data.projectName}".`,
    dashboardTitle: 'لوحة تحكم المشروع:',
    features: [
      'متابعة تقدم المشروع في الوقت الفعلي',
      'التواصل المباشر والتعليق على المعالم',
      'مراجعة وتحميل الملفات والنتائج',
      'إدارة المدفوعات والفواتير',
      'الموافقة على عقود المشروع'
    ],
    ctaButton: 'الوصول إلى لوحة التحكم',
    note: 'ملاحظة: رابط الوصول آمن ومخصص لك فقط. إذا كان لديك أي أسئلة، يرجى الرد على هذا البريد الإلكتروني.',
    regards: 'مع أطيب التحيات،',
    poweredBy: 'مدعوم بواسطة'
  } : {
    greeting: `Hello ${data.clientName},`,
    title: 'Project Invitation',
    intro: `I'm excited to invite you to collaborate on the "${data.projectName}" project.`,
    dashboardTitle: 'Your Project Dashboard:',
    features: [
      'Track project progress in real-time',
      'Communicate directly and comment on milestones',
      'Review and download files and deliverables',
      'Manage payments and invoices',
      'Approve project contracts'
    ],
    ctaButton: 'Access Your Dashboard',
    note: 'Note: This access link is secure and personal to you. If you have any questions, please reply to this email.',
    regards: 'Best regards,',
    poweredBy: 'Powered by'
  }

  const featuresHTML = content.features.map(feature => `
    <li style="margin: 8px 0; color: #374151;">${feature}</li>
  `).join('')

  return `
<!DOCTYPE html>
<html ${data.language === 'ar' ? 'dir="rtl" lang="ar"' : 'lang="en"'}>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Project Invitation - ${data.projectName}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px; ${data.language === 'ar' ? 'direction: rtl; text-align: right;' : ''}">
  
  <!-- Header -->
  <div style="text-align: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px;">
    <h1 style="color: #3B82F6; margin: 0; font-size: 28px;">Ruzma</h1>
  </div>

  <!-- Greeting -->
  <p style="font-size: 16px; margin-bottom: 24px;">
    ${content.greeting}
  </p>

  <!-- Title -->
  <h2 style="color: #3B82F6; font-size: 24px; margin-bottom: 16px;">
    ${content.title}
  </h2>

  <!-- Introduction -->
  <p style="margin-bottom: 20px;">
    ${content.intro}
  </p>

  <!-- Custom Message -->
  ${data.inviteMessage ? `
    <div style="background: #f0f9ff; border-left: 4px solid #3B82F6; padding: 16px 20px; margin: 24px 0; ${data.language === 'ar' ? 'border-left: none; border-right: 4px solid #3B82F6;' : ''}">
      <p style="margin: 0; color: #374151; font-style: italic;">
        "${data.inviteMessage}"
      </p>
    </div>
  ` : ''}

  <!-- Dashboard Features -->
  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin: 24px 0;">
    <h3 style="color: #3B82F6; margin: 0 0 16px 0; font-size: 18px;">
      ${content.dashboardTitle}
    </h3>
    
    <ul style="margin: 16px 0; padding-${data.language === 'ar' ? 'right' : 'left'}: 20px;">
      ${featuresHTML}
    </ul>
  </div>

  <!-- CTA Button -->
  <div style="text-align: center; margin: 32px 0;">
    <a href="${data.projectUrl}" style="background-color: #3B82F6; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
      ${content.ctaButton}
    </a>
  </div>

  <!-- Note -->
  <p style="color: #64748b; font-style: italic; font-size: 14px; margin: 32px 0;">
    ${content.note}
  </p>

  <!-- Signature -->
  <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; margin-top: 32px;">
    <p style="margin-bottom: 8px;">${content.regards}</p>
    <p style="color: #3B82F6; font-weight: 600; margin: 0;">${data.freelancerName}</p>
  </div>

  <!-- Footer -->
  <div style="text-align: center; margin-top: 40px; color: #94a3b8; font-size: 14px;">
    <p>${content.poweredBy} <a href="https://ruzma.co" style="color: #3B82F6; text-decoration: none;">Ruzma</a></p>
  </div>

</body>
</html>
  `
}