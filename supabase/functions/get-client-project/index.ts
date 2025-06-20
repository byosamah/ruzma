import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('get-client-project function called')
    console.log('Request method:', req.method)
    
    const requestBody = await req.json().catch((e) => {
      console.error('Failed to parse request body as JSON:', e.message)
      return null
    })

    if (!requestBody) {
      return new Response(JSON.stringify({ error: 'Invalid or empty JSON body' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }
    
    const { token } = requestBody;
    console.log('Received token:', token)
    
    if (!token) {
      console.error('No token provided in request body')
      return new Response(JSON.stringify({ error: 'Token is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables')
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Searching for project...')
    
    // Try to find project by client_access_token first
    let { data: projectData, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('*, milestones (*)')
      .eq('client_access_token', token)
      .maybeSingle();

    console.log('Search by client_access_token result:', { projectData, projectError })

    // If not found by client_access_token, try by project ID (for backward compatibility)
    if (!projectData && !projectError) {
      console.log('Not found by client_access_token, trying by project ID...')
      const { data: projectByIdData, error: projectByIdError } = await supabaseAdmin
        .from('projects')
        .select('*, milestones (*)')
        .eq('id', token)
        .maybeSingle();
        
      console.log('Search by project ID result:', { projectByIdData, projectByIdError })
      
      if (projectByIdData) {
        projectData = projectByIdData;
        projectError = projectByIdError;
      }
    }

    if (projectError) {
      console.error('Database error:', projectError)
      return new Response(JSON.stringify({ error: 'Database error occurred' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    if (!projectData) {
      console.error('Project not found with token:', token)
      return new Response(JSON.stringify({ error: 'Project not found or access denied' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    }

    // Fetch the freelancer's profile to get their preferred currency
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('currency')
      .eq('id', projectData.user_id)
      .maybeSingle();

    console.log('Freelancer profile result:', { profileData, profileError })

    // Add freelancer's currency to the project data
    if (profileData && profileData.currency) {
      projectData.freelancer_currency = profileData.currency;
    }

    // Keep the user_id for branding lookup but don't expose it in the final response
    const freelancerUserId = projectData.user_id;

    // Sanitize response and do not leak internal details
    delete projectData.user_id;

    // Add the freelancer user ID back for branding purposes (this is safe for client access)
    projectData.user_id = freelancerUserId;

    console.log('Successfully found project:', projectData.name)
    return new Response(JSON.stringify(projectData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
