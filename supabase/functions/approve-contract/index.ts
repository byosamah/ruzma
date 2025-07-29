import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContractApprovalRequest {
  approvalToken: string;
  action: 'approve' | 'reject';
  rejectionReason?: string;
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

    const { approvalToken, action, rejectionReason }: ContractApprovalRequest = await req.json();

    console.log('Processing contract approval action:', action, 'for token:', approvalToken);

    // Find project by approval token
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .select(`
        *,
        profiles!projects_user_id_fkey (
          full_name,
          email
        )
      `)
      .eq('contract_approval_token', approvalToken)
      .single();

    if (projectError || !project) {
      console.error('Error fetching project:', projectError);
      throw new Error('Invalid approval token');
    }

    if (project.contract_status !== 'pending') {
      throw new Error('Contract has already been processed');
    }

    // Update project based on action
    const updateData: any = {
      contract_status: action === 'approve' ? 'approved' : 'rejected',
      updated_at: new Date().toISOString()
    };

    if (action === 'approve') {
      updateData.contract_approved_at = new Date().toISOString();
    } else if (rejectionReason) {
      updateData.contract_rejection_reason = rejectionReason;
    }

    const { error: updateError } = await supabaseClient
      .from('projects')
      .update(updateData)
      .eq('id', project.id);

    if (updateError) {
      console.error('Error updating project:', updateError);
      throw new Error('Failed to update contract status');
    }

    // Send notification email to freelancer
    const freelancerEmail = project.profiles?.email;
    const freelancerName = project.profiles?.full_name || 'Freelancer';

    if (freelancerEmail) {
      const subject = action === 'approve' 
        ? `Contract Approved: ${project.name}`
        : `Contract Feedback Required: ${project.name}`;

      const emailBody = action === 'approve' 
        ? `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #28a745;">🎉 Contract Approved!</h1>
            <p>Great news! Your client has approved the contract for <strong>${project.name}</strong>.</p>
            <p>You can now begin work on the project. The client will receive access to track progress.</p>
            <div style="background: #d4edda; padding: 15px; border-radius: 5px; border-left: 4px solid #28a745;">
              <p><strong>Next Steps:</strong></p>
              <ul>
                <li>Begin work on the first milestone</li>
                <li>Keep the client updated on progress</li>
                <li>Upload deliverables when ready</li>
              </ul>
            </div>
            <p>Best regards,<br>The Ruzma Team</p>
          </div>
        `
        : `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #dc3545;">Contract Requires Revision</h1>
            <p>Your client has requested changes to the contract for <strong>${project.name}</strong>.</p>
            ${rejectionReason ? `
              <div style="background: #f8d7da; padding: 15px; border-radius: 5px; border-left: 4px solid #dc3545;">
                <p><strong>Client Feedback:</strong></p>
                <p>${rejectionReason}</p>
              </div>
            ` : ''}
            <p>Please review their feedback and update the project details as needed, then resend the contract for approval.</p>
            <p>Best regards,<br>The Ruzma Team</p>
          </div>
        `;

      await resend.emails.send({
        from: 'Ruzma <noreply@ruzma.app>',
        to: [freelancerEmail],
        subject: subject,
        html: emailBody,
      });
    }

    // If approved, also send client their access link
    if (action === 'approve' && project.client_email) {
      const clientAccessUrl = `${Deno.env.get('SUPABASE_URL')?.replace('//', '//').replace('supabase.co', 'lovable.app')}/client/project/${project.client_access_token}`;
      
      await resend.emails.send({
        from: 'Ruzma <noreply@ruzma.app>',
        to: [project.client_email],
        subject: `Project Access: ${project.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #28a745;">Project Contract Approved!</h1>
            <p>Thank you for approving the contract for <strong>${project.name}</strong>.</p>
            <p>You now have access to track project progress, view milestones, and communicate with ${freelancerName}.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${clientAccessUrl}" 
                 style="background-color: #4B72E5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Access Your Project
              </a>
            </div>
            <p>Best regards,<br>The Ruzma Team</p>
          </div>
        `,
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Contract ${action}d successfully`,
      status: action === 'approve' ? 'approved' : 'rejected'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in approve-contract function:', error);
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