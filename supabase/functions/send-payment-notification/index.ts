
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clientEmail, projectName, projectId, clientToken, isApproved, milestoneName }: EmailRequest = await req.json();

    const clientProjectUrl = `${Deno.env.get("SUPABASE_URL")?.replace('supabase.co', 'lovable.app')}/client/${projectId}?token=${clientToken}`;
    
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
      from: "Ruzma <notifications@resend.dev>",
      to: [clientEmail],
      subject: subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-payment-notification function:", error);
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
