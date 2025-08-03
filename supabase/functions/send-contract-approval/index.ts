import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContractApprovalRequest {
  projectId: string;
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

    const { projectId }: ContractApprovalRequest = await req.json();

    console.log('Processing contract approval request for project:', projectId);

    // Get project details with milestones and user profile for currency
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
        ),
        profiles!user_id(full_name, currency)
      `)
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      console.error('Error fetching project:', projectError);
      throw new Error('Project not found');
    }

    if (!project.client_email) {
      throw new Error('Project does not have a client email');
    }

    const clientEmail = project.client_email;
    const freelancerName = project.profiles?.full_name || 'Your freelancer';

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

    // Get user's preferred currency
    const userCurrency = project.freelancer_currency || project.profiles?.currency || 'USD';
    
    // Currency formatting function
    const formatCurrency = (amount: number, currency: string) => {
      const currencySymbols: { [key: string]: string } = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥',
        'CAD': 'C$',
        'AUD': 'A$',
        'CHF': 'CHF',
        'CNY': '¥',
        'SEK': 'kr',
        'NZD': 'NZ$',
        'MXN': '$',
        'SGD': 'S$',
        'HKD': 'HK$',
        'NOK': 'kr',
        'TRY': '₺',
        'RUB': '₽',
        'INR': '₹',
        'BRL': 'R$',
        'ZAR': 'R',
        'KRW': '₩',
        'PLN': 'zł',
        'THB': '฿',
        'IDR': 'Rp',
        'HUF': 'Ft',
        'CZK': 'Kč',
        'ILS': '₪',
        'CLP': '$',
        'PHP': '₱',
        'AED': 'AED',
        'COP': '$',
        'SAR': 'SAR',
        'MYR': 'RM',
        'RON': 'lei'
      };
      
      const symbol = currencySymbols[currency] || currency;
      return `${symbol}${amount.toLocaleString()}`;
    };

    // Calculate total project value
    const totalValue = project.milestones.reduce((sum: number, milestone: any) => sum + Number(milestone.price), 0);

    // Create client project URL using the custom domain
    const baseUrl = 'https://hub.ruzma.co';
    const approvalUrl = `${baseUrl}/client/project/${project.client_access_token}`;

    // Format contract terms for email
    const formatTermsForEmail = (terms: string | null) => {
      if (!terms) return '';
      return terms.split('\n').map(line => `<p style="margin: 5px 0; color: #333;">${line}</p>`).join('');
    };

    // Send contract approval email with freelancer name as sender
    const emailResponse = await resend.emails.send({
      from: `${freelancerName} <notifications@ruzma.co>`,
      to: clientEmail,
      subject: `Contract Approval Required: ${project.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; background: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4B72E5; margin: 0; font-size: 28px; font-weight: bold;">
              Contract Approval Required
            </h1>
            <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">
              Project: ${project.name}
            </p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4B72E5;">
            <p style="margin: 0; font-size: 16px; color: #333;">
              Hello! <strong>${freelancerName}</strong> has prepared a project contract for your review and is requesting your approval to proceed.
            </p>
          </div>

          <div style="background: #fff; border: 1px solid #e9ecef; padding: 25px; border-radius: 8px; margin: 25px 0;">
            <h2 style="color: #333; margin-top: 0; border-bottom: 2px solid #f1f3f4; padding-bottom: 10px;">
              📋 Project Overview
            </h2>
            <div style="display: grid; gap: 15px;">
              <div>
                <strong style="color: #495057;">Project Name:</strong>
                <span style="color: #333; margin-left: 10px;">${project.name}</span>
              </div>
              <div>
                <strong style="color: #495057;">Description:</strong>
                <div style="margin-top: 5px; color: #333; line-height: 1.6;">${project.brief}</div>
              </div>
              <div>
                <strong style="color: #495057;">Total Value:</strong>
                <span style="color: #28a745; font-size: 18px; font-weight: bold; margin-left: 10px;">${formatCurrency(totalValue, userCurrency)}</span>
              </div>
              ${project.start_date ? `
              <div>
                <strong style="color: #495057;">Timeline:</strong>
                <span style="color: #333; margin-left: 10px;">
                  ${new Date(project.start_date).toLocaleDateString()} - ${project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Ongoing'}
                </span>
              </div>
              ` : ''}
            </div>
          </div>

          <div style="background: #fff; border: 1px solid #e9ecef; padding: 25px; border-radius: 8px; margin: 25px 0;">
            <h3 style="color: #333; margin-top: 0; border-bottom: 2px solid #f1f3f4; padding-bottom: 10px;">
              🎯 Project Milestones & Payment Schedule
            </h3>
            ${project.milestones.map((milestone: any, index: number) => `
              <div style="border: 1px solid #f1f3f4; padding: 20px; margin: 15px 0; border-radius: 6px; background: #fafafa;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                  <h4 style="margin: 0; color: #495057; font-size: 16px;">Milestone ${index + 1}: ${milestone.title}</h4>
                  <span style="background: #4B72E5; color: white; padding: 4px 12px; border-radius: 15px; font-size: 14px; font-weight: bold;">
                    ${formatCurrency(Number(milestone.price), userCurrency)}
                  </span>
                </div>
                <p style="margin: 10px 0; color: #6c757d; line-height: 1.5;">${milestone.description}</p>
                ${milestone.start_date ? `
                <p style="margin: 5px 0; color: #666; font-size: 14px;">
                  <strong>Timeline:</strong> ${new Date(milestone.start_date).toLocaleDateString()} - ${milestone.end_date ? new Date(milestone.end_date).toLocaleDateString() : 'Ongoing'}
                </p>
                ` : ''}
              </div>
            `).join('')}
          </div>

          ${project.contract_terms ? `
          <div style="background: #fff; border: 1px solid #e9ecef; padding: 25px; border-radius: 8px; margin: 25px 0;">
            <h3 style="color: #333; margin-top: 0; border-bottom: 2px solid #f1f3f4; padding-bottom: 10px;">
              📄 Contract Terms & Conditions
            </h3>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
              ${formatTermsForEmail(project.contract_terms)}
            </div>
          </div>
          ` : ''}

          ${project.payment_terms ? `
          <div style="background: #fff; border: 1px solid #e9ecef; padding: 25px; border-radius: 8px; margin: 25px 0;">
            <h3 style="color: #333; margin-top: 0; border-bottom: 2px solid #f1f3f4; padding-bottom: 10px;">
              💳 Payment Terms
            </h3>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
              ${formatTermsForEmail(project.payment_terms)}
            </div>
          </div>
          ` : ''}

          ${project.project_scope ? `
          <div style="background: #fff; border: 1px solid #e9ecef; padding: 25px; border-radius: 8px; margin: 25px 0;">
            <h3 style="color: #333; margin-top: 0; border-bottom: 2px solid #f1f3f4; padding-bottom: 10px;">
              🎯 Project Scope
            </h3>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
              ${formatTermsForEmail(project.project_scope)}
            </div>
          </div>
          ` : ''}

          ${project.revision_policy ? `
          <div style="background: #fff; border: 1px solid #e9ecef; padding: 25px; border-radius: 8px; margin: 25px 0;">
            <h3 style="color: #333; margin-top: 0; border-bottom: 2px solid #f1f3f4; padding-bottom: 10px;">
              🔄 Revision Policy
            </h3>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
              ${formatTermsForEmail(project.revision_policy)}
            </div>
          </div>
          ` : ''}

          <div style="text-align: center; margin: 40px 0; padding: 30px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 10px;">
            <p style="font-size: 18px; margin-bottom: 25px; color: #333; font-weight: 500;">
              Ready to approve this contract and get started?
            </p>
            
            <a href="${approvalUrl}" 
               style="background: linear-gradient(135deg, #4B72E5 0%, #3B5BDB 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(75, 114, 229, 0.3); transition: all 0.3s ease;">
              📝 Review & Approve Contract
            </a>
            
            <p style="margin-top: 15px; font-size: 14px; color: #666;">
              Click the button above to review all details and provide your approval or feedback
            </p>
          </div>

          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <p style="margin: 0; font-size: 14px; color: #856404;">
              <strong>⚠️ Important:</strong> This contract approval is required before work can begin on your project. 
              Once approved, you'll receive access to track project progress, milestones, and communicate directly with ${freelancerName}.
            </p>
          </div>

          <div style="margin-top: 40px; padding-top: 25px; border-top: 2px solid #e9ecef; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #6c757d;">
              Best regards,<br>
              <strong style="color: #4B72E5;">The Ruzma Team</strong>
            </p>
            <p style="margin: 15px 0 0 0; font-size: 12px; color: #adb5bd;">
              If you have any questions about this contract, please contact <strong>${freelancerName}</strong> directly or reply to this email.
            </p>
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