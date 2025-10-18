import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { render } from 'https://esm.sh/@react-email/render@0.0.15'
import { MarketingPromoTemplate } from '../_shared/email-templates/marketing-promo.tsx'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface RequestBody {
  recipientEmail: string
  recipientName: string
  promoTitle: string
  promoDescription: string
  ctaText: string
  ctaUrl: string
  promoImageUrl?: string
  language?: 'en' | 'ar'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const {
      recipientEmail,
      recipientName,
      promoTitle,
      promoDescription,
      ctaText,
      ctaUrl,
      promoImageUrl,
      language = 'en'
    }: RequestBody = await req.json()

    // Validate required parameters
    if (!recipientEmail || !recipientName || !promoTitle || !promoDescription || !ctaText || !ctaUrl) {
      throw new Error('Missing required parameters')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if user has marketing emails enabled
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('notification_settings, full_name')
      .eq('email', recipientEmail)
      .single()

    // Check notification preferences
    const notificationSettings = userProfile?.notification_settings as any
    if (notificationSettings && notificationSettings.marketing === false) {
      console.log('User has disabled marketing emails')
      return new Response(
        JSON.stringify({ success: true, message: 'Marketing emails disabled by user' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Use profile name if available, otherwise use provided name
    const userName = userProfile?.full_name || recipientName

    // Render email HTML from React template
    const emailHtml = render(
      MarketingPromoTemplate({
        userName,
        userEmail: recipientEmail,
        promoTitle,
        promoDescription,
        ctaText,
        ctaUrl,
        promoImageUrl,
        language,
        brandingColor: '#3B82F6',
        companyName: 'Ruzma',
        companyLogo: undefined
      })
    )

    // Prepare email subject
    const emailSubject = promoTitle

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
        to: recipientEmail,
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
        template: 'marketing',
        recipient: recipientEmail,
        status: 'sent',
        metadata: {
          promo_title: promoTitle,
          cta_url: ctaUrl
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
    console.error('Error in send-marketing-email:', error)

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
