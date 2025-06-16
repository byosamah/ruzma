
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

    // First, let's check if ANY projects exist
    console.log('Checking if any projects exist...')
    const { data: allProjects, error: allProjectsError } = await supabaseAdmin
      .from('projects')
      .select('id, client_access_token')
      .limit(5);
    
    console.log('Sample projects in database:', allProjects)
    if (allProjectsError) {
      console.error('Error fetching sample projects:', allProjectsError)
    }

    // Now try to fetch the specific project
    console.log('Searching for project with client_access_token:', token)
    const { data: projectData, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('*, milestones (*)')
      .eq('client_access_token', token)
      .single();

    console.log('Project query result:', { projectData, projectError })

    if (projectError || !projectData) {
      console.error('Project not found or error fetching project by token:', projectError)
      
      // Try a different approach - search by converting token to string
      console.log('Trying alternative search method...')
      const { data: altProjectData, error: altProjectError } = await supabaseAdmin
        .from('projects')
        .select('*, milestones (*)')
        .eq('client_access_token::text', token);
        
      console.log('Alternative search result:', { altProjectData, altProjectError })
      
      if (altProjectError || !altProjectData || altProjectData.length === 0) {
        return new Response(JSON.stringify({ error: 'Project not found or access denied' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        })
      }
      
      // Use the alternative result
      const project = altProjectData[0];
      delete project.user_id;
      return new Response(JSON.stringify(project), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Sanitize response and do not leak internal details
    delete projectData.user_id;

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
