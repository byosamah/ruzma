
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
    console.log('Request headers:', Object.fromEntries(req.headers.entries()))
    
    let requestBody;
    try {
      const text = await req.text();
      console.log('Raw request body:', text);
      requestBody = text ? JSON.parse(text) : {};
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }
    
    const { token } = requestBody;
    console.log('Received token:', token)
    
    if (!token) {
      console.error('No token provided')
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

    console.log('Searching for project with token:', token)
    
    // First try to find by client_access_token
    let { data: projectData, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('*, milestones (*)')
      .eq('client_access_token', token)
      .single()

    // If not found by token, try by project ID (as fallback)
    if (projectError || !projectData) {
      console.log('Project not found by token, trying by ID:', token)
      const { data: projectByIdData, error: projectByIdError } = await supabaseAdmin
        .from('projects')
        .select('*, milestones (*)')
        .eq('id', token)
        .single()
      
      if (projectByIdError || !projectByIdData) {
        console.error('Error fetching project by ID:', projectByIdError)
        return new Response(JSON.stringify({ error: 'Project not found' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        })
      }
      
      projectData = projectByIdData;
    }

    if (!projectData) {
      console.error('No project data found')
      return new Response(JSON.stringify({ error: 'Project not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    }

    console.log('Project found:', projectData)

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
