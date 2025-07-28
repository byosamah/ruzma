import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RevisionRequestData {
  token: string;
  milestoneId: string;
  feedback: string;
  images: string[]; // Now these will be the uploaded image URLs
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: RevisionRequestData = await req.json();
    const { token, milestoneId, feedback, images } = body;

    if (!token || !milestoneId || !feedback) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('Processing revision request for milestone:', milestoneId);

    // Verify the token belongs to a valid project and get the milestone
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, milestones(*)')
      .eq('client_access_token', token)
      .single();

    if (projectError || !project) {
      console.error('Project not found or invalid token:', projectError);
      return new Response(
        JSON.stringify({ error: 'Invalid project token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Find the specific milestone
    const milestone = project.milestones.find((m: any) => m.id === milestoneId);
    if (!milestone) {
      return new Response(
        JSON.stringify({ error: 'Milestone not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Parse existing deliverable link to extract revision data
    let revisionData = {
      maxRevisions: null,
      usedRevisions: 0,
      requests: []
    };

    if (milestone.deliverable_link) {
      try {
        const parsed = JSON.parse(milestone.deliverable_link);
        if (parsed.revisionData) {
          revisionData = parsed.revisionData;
        }
      } catch (e) {
        console.log('Could not parse existing revision data, using defaults');
      }
    }

    // Check if revision can be requested
    if (revisionData.maxRevisions !== null && revisionData.usedRevisions >= revisionData.maxRevisions) {
      return new Response(
        JSON.stringify({ error: 'Revision limit reached' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Add new revision request
    const newRequest = {
      id: crypto.randomUUID(),
      feedback,
      images,
      requestedAt: new Date().toISOString(),
      status: 'pending'
    };

    revisionData.requests.push(newRequest);
    revisionData.usedRevisions++;

    // Reconstruct the deliverable link with updated revision data
    let newDeliverableLink;
    if (milestone.deliverable_link) {
      try {
        const parsed = JSON.parse(milestone.deliverable_link);
        parsed.revisionData = revisionData;
        newDeliverableLink = JSON.stringify(parsed);
      } catch (e) {
        // If parsing fails, create new structure
        newDeliverableLink = JSON.stringify({
          links: [],
          revisionData
        });
      }
    } else {
      newDeliverableLink = JSON.stringify({
        links: [],
        revisionData
      });
    }

    // Update the milestone
    const { error: updateError } = await supabase
      .from('milestones')
      .update({
        deliverable_link: newDeliverableLink,
        updated_at: new Date().toISOString()
      })
      .eq('id', milestoneId);

    if (updateError) {
      console.error('Error updating milestone:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to submit revision request' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('Revision request submitted successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Revision request submitted successfully',
        remainingRevisions: revisionData.maxRevisions !== null 
          ? revisionData.maxRevisions - revisionData.usedRevisions
          : null
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in submit-revision-request function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});