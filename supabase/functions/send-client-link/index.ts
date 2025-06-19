
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendClientLinkRequest {
  clientEmail: string;
  projectName: string;
  freelancerName: string;
  clientToken: string;
  userId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clientEmail, projectName, freelancerName, clientToken, userId }: SendClientLinkRequest = await req.json();

    console.log('Sending client link email:', { clientEmail, projectName, freelancerName });

    // Get freelancer name from profile if userId is provided
    let actualFreelancerName = freelancerName;
    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single();
      
      if (profile?.full_name) {
        actualFreelancerName = profile.full_name;
      }
    }

    // Use the correct app domain
    const clientUrl = `https://hub.ruzma.co/client/project/${clientToken}`;

    const emailResponse = await resend.emails.send({
      from: "Ruzma <notifications@ruzma.co>",
      to: [clientEmail],
      subject: `Your Project Dashboard - ${projectName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Your Project Dashboard is Ready!</h2>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            Hello,
          </p>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            <strong>${actualFreelancerName}</strong> has created a project dashboard for you to easily track the work progress and receive deliverables for "<strong>${projectName}</strong>".
          </p>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 30px;">
            Through this dashboard, you'll be able to:
          </p>
          
          <ul style="color: #555; line-height: 1.6; margin-bottom: 30px; padding-left: 20px;">
            <li>Track project milestones and progress</li>
            <li>Submit payment confirmations</li>
            <li>Download completed deliverables</li>
            <li>Stay updated on project status</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${clientUrl}" 
               style="background-color: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Access Your Project Dashboard
            </a>
          </div>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            You can bookmark this link for easy access to your project dashboard at any time.
          </p>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            If you have any questions about your project, please don't hesitate to contact ${actualFreelancerName} directly.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #888; font-size: 12px; line-height: 1.4;">
            This email was sent from Ruzma, a professional project management platform. 
            If you believe you received this email in error, please contact support.
          </p>
        </div>
      `,
    });

    console.log("Client link email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-client-link function:", error);
    
    // Handle Resend domain verification error specifically
    if (error.message && error.message.includes('verify a domain')) {
      return new Response(
        JSON.stringify({ 
          error: 'Domain verification required. Please verify ruzma.co domain in Resend settings.',
          details: error.message 
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
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
