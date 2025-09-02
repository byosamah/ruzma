
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  clientEmail: string;
  projectName: string;
  projectId: string;
  clientToken: string;
  isApproved: boolean;
  milestoneName: string;
  userId?: string; // Add userId to get freelancer info
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Resend and Supabase
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("Email service not configured");
    }

    const resend = new Resend(resendApiKey);
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    const { clientEmail, projectName, projectId, clientToken, isApproved, milestoneName, userId }: EmailRequest = await req.json();

    // Get freelancer information
    let freelancerName = "Your freelancer";
    if (projectId) {
      try {
        // First get the project to get user_id if not provided
        let actualUserId = userId;
        if (!actualUserId) {
          const { data: project } = await supabase
            .from('projects')
            .select('user_id')
            .eq('id', projectId)
            .single();
          actualUserId = project?.user_id;
        }

        if (actualUserId) {
          // Get freelancer branding and profile
          const [brandingResult, profileResult] = await Promise.all([
            supabase
              .from('freelancer_branding')
              .select('freelancer_name')
              .eq('user_id', actualUserId)
              .single(),
            supabase
              .from('profiles')
              .select('full_name')
              .eq('id', actualUserId)
              .single()
          ]);

          freelancerName = brandingResult.data?.freelancer_name || 
                          profileResult.data?.full_name || 
                          "Your freelancer";
        }
      } catch (error) {
        // Continue with default name
      }
    }

    // Generate the correct client project URL using the new domain
    const origin = req.headers.get('origin') || req.headers.get('referer');
    // Use app.ruzma.co as the base URL
    let baseUrl = 'https://app.ruzma.co';
    
    if (origin && origin.includes('lovable.app')) {
      // If the request comes from a lovable.app domain, still use app.ruzma.co
      baseUrl = 'https://app.ruzma.co';
    }
    
    const clientProjectUrl = `${baseUrl}/client/project/${clientToken}`;
    
    let subject: string;
    let htmlContent: string;

    if (isApproved) {
      subject = `Payment Approved - ${projectName}`;
      htmlContent = `
        <h2>Great news! Your payment has been approved</h2>
        <p>Hello,</p>
        <p>We're pleased to inform you that your payment for the milestone "<strong>${milestoneName}</strong>" in project "<strong>${projectName}</strong>" has been approved by the freelancer.</p>
        <p>You can now download the deliverables from your project page:</p>
        <p><a href="${clientProjectUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Project & Download Deliverables</a></p>
        <p>Thank you for using Ruzma!</p>
        <p>Best regards,<br>The Ruzma Team</p>
      `;
    } else {
      subject = `Payment Proof Rejected - ${projectName}`;
      htmlContent = `
        <h2>Payment proof requires attention</h2>
        <p>Hello,</p>
        <p>We need to inform you that the payment proof you submitted for the milestone "<strong>${milestoneName}</strong>" in project "<strong>${projectName}</strong>" has been rejected by the freelancer.</p>
        <p>Please review and upload a new payment proof on your project page:</p>
        <p><a href="${clientProjectUrl}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Upload New Payment Proof</a></p>
        <p>If you have any questions, please contact the freelancer directly.</p>
        <p>Best regards,<br>The Ruzma Team</p>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: `${freelancerName} <notifications@ruzma.co>`,
      to: [clientEmail],
      subject: subject,
      html: htmlContent,
    });

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
