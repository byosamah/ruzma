import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Get user from auth token
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    const { projectId } = await req.json();

    if (!projectId) {
      throw new Error('Project ID is required');
    }

    // Get project details with client information
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*, clients(email)')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      console.error('Project fetch error:', projectError);
      throw new Error('Project not found or access denied');
    }

    // Get freelancer profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError);
      throw new Error('Freelancer profile not found');
    }

    // Determine client email (from project directly or from linked client)
    let clientEmail = project.client_email;
    if (!clientEmail && project.clients?.email) {
      clientEmail = project.clients.email;
    }

    if (!clientEmail) {
      throw new Error('Client email not found for this project');
    }

    console.log('Resending contract for project:', projectId, 'to client:', clientEmail, 'from freelancer:', profile.full_name);

    // Update contract_sent_at timestamp
    const { error: updateError } = await supabase
      .from('projects')
      .update({ contract_sent_at: new Date().toISOString() })
      .eq('id', projectId);

    if (updateError) {
      console.error('Update error:', updateError);
      throw new Error('Failed to update contract timestamp');
    }

    // Call the send-contract-approval function with all required parameters
    const { error: sendError } = await supabase.functions.invoke('send-contract-approval', {
      body: { 
        projectId,
        clientEmail,
        freelancerName: profile.full_name
      }
    });

    if (sendError) {
      console.error('Send contract error:', sendError);
      throw new Error('Failed to send contract approval email: ' + sendError.message);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Contract resent successfully' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in resend-contract function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});