import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContractApprovalRequest {
  projectId: string;
  clientEmail: string;
  freelancerName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    const { projectId, clientEmail, freelancerName }: ContractApprovalRequest = await req.json();

    console.log('Processing contract approval request for project:', projectId);

    // Get project details with milestones
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .select(`
        *,
        milestones (
          id,
          title,
          description,
          price,
          start_date,
          end_date
        )
      `)
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      console.error('Error fetching project:', projectError);
      throw new Error('Project not found');
    }

    // Update project with contract sent timestamp
    const { error: updateError } = await supabaseClient
      .from('projects')
      .update({ 
        contract_sent_at: new Date().toISOString(),
        contract_status: 'pending'
      })
      .eq('id', projectId);

    if (updateError) {
      console.error('Error updating project:', updateError);
      throw new Error('Failed to update project status');
    }

    // Calculate total project value
    const totalValue = project.milestones.reduce((sum: number, milestone: any) => sum + Number(milestone.price), 0);

    // Create approval URL
    const approvalUrl = `${Deno.env.get('SUPABASE_URL')?.replace('//', '//').replace('supabase.co', 'lovable.app')}/contract/approve/${project.contract_approval_token}`;

    // Send contract approval email
    const emailResponse = await resend.emails.send({
      from: 'Ruzma <noreply@ruzma.app>',
      to: [clientEmail],
      subject: `Contract Approval Required: ${project.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; border-bottom: 2px solid #4B72E5; padding-bottom: 10px;">
            Project Contract Approval
          </h1>
          
          <p>Hello,</p>
          
          <p><strong>${freelancerName}</strong> has created a project proposal for you and is requesting your approval to proceed.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">Project Details</h2>
            <p><strong>Project Name:</strong> ${project.name}</p>
            <p><strong>Description:</strong> ${project.brief}</p>
            <p><strong>Total Value:</strong> $${totalValue.toLocaleString()}</p>
            <p><strong>Start Date:</strong> ${project.start_date ? new Date(project.start_date).toLocaleDateString() : 'To be determined'}</p>
            <p><strong>End Date:</strong> ${project.end_date ? new Date(project.end_date).toLocaleDateString() : 'To be determined'}</p>
          </div>

          <div style="background: #fff; border: 1px solid #e9ecef; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Project Milestones</h3>
            ${project.milestones.map((milestone: any, index: number) => `
              <div style="border-bottom: 1px solid #f1f3f4; padding: 15px 0; ${index === project.milestones.length - 1 ? 'border-bottom: none;' : ''}">
                <h4 style="margin: 0 0 10px 0; color: #495057;">${milestone.title}</h4>
                <p style="margin: 5px 0; color: #6c757d;">${milestone.description}</p>
                <p style="margin: 5px 0;"><strong>Price:</strong> $${Number(milestone.price).toLocaleString()}</p>
                ${milestone.start_date ? `<p style="margin: 5px 0;"><strong>Timeline:</strong> ${new Date(milestone.start_date).toLocaleDateString()} - ${milestone.end_date ? new Date(milestone.end_date).toLocaleDateString() : 'Ongoing'}</p>` : ''}
              </div>
            `).join('')}
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              Please review the project details and milestones above. Click the button below to approve or provide feedback.
            </p>
            
            <a href="${approvalUrl}" 
               style="background-color: #4B72E5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Review & Approve Contract
            </a>
          </div>

          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 30px;">
            <p style="margin: 0; font-size: 14px; color: #6c757d;">
              <strong>Note:</strong> This contract approval is required before work can begin on your project. 
              Once approved, you'll receive access to track project progress and milestones.
            </p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 12px; color: #6c757d;">
            <p>Best regards,<br>The Ruzma Team</p>
            <p>If you have any questions, please contact ${freelancerName} directly or reply to this email.</p>
          </div>
        </div>
      `,
    });

    console.log('Contract approval email sent successfully:', emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Contract approval email sent successfully',
      approvalUrl 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in send-contract-approval function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);