import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const formData = await req.formData();
    const token = formData.get('token') as string;
    const milestoneId = formData.get('milestoneId') as string;
    const file = formData.get('file') as File;

    if (!token || !milestoneId || !file) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('Uploading revision image for milestone:', milestoneId);

    // Verify the token belongs to a valid project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('client_access_token', token)
      .single();

    if (projectError || !project) {
      console.error('Project not found or invalid token:', projectError);
      return new Response(
        JSON.stringify({ error: 'Invalid project token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `revision-images/${milestoneId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    // Upload the file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('deliverables')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload image' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('deliverables')
      .getPublicUrl(fileName);

    console.log('Image uploaded successfully:', publicUrl);

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: publicUrl 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in upload-revision-image function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});