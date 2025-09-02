
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Check if a string is a valid UUID
const isUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// Parse hybrid token format: slug-shorttoken
const parseHybridToken = (token: string): { slug?: string; shortToken: string; isHybrid: boolean } => {
  // Check if it's a full UUID (legacy format)
  if (isUUID(token)) {
    return { shortToken: token, isHybrid: false };
  }

  // Try to parse hybrid format
  const lastDashIndex = token.lastIndexOf('-');
  if (lastDashIndex === -1) {
    return { shortToken: token, isHybrid: false };
  }

  const potentialSlug = token.substring(0, lastDashIndex);
  const potentialShortToken = token.substring(lastDashIndex + 1);

  // Validate short token format (8 hex chars)
  const shortTokenRegex = /^[0-9a-f]{8}$/i;
  if (shortTokenRegex.test(potentialShortToken)) {
    return {
      slug: potentialSlug,
      shortToken: potentialShortToken,
      isHybrid: true
    };
  }

  return { shortToken: token, isHybrid: false };
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, isHybrid } = await req.json();
    
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Token is required" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Parse the token
    const parsedToken = parseHybridToken(token);
    let query;
    
    if (parsedToken.isHybrid && parsedToken.shortToken) {
      // For hybrid tokens, search by the short token prefix
      query = supabase
        .from('projects')
        .select(`
          *,
          milestones (*)
        `)
        .like('client_access_token', `${parsedToken.shortToken}%`);
    } else {
      // For legacy full tokens
      query = supabase
        .from('projects')
        .select(`
          *,
          milestones (*)
        `)
        .eq('client_access_token', parsedToken.shortToken);
    }

    const { data: projects, error } = await query;

    if (error) {
      return new Response(
        JSON.stringify({ error: "Database error occurred" }),
        { 
          status: 500, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    if (!projects || projects.length === 0) {
      return new Response(
        JSON.stringify({ error: "Project not found or access denied" }),
        { 
          status: 404, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    let project = projects[0];

    // If we have multiple matches (for hybrid tokens), validate the slug
    if (parsedToken.isHybrid && parsedToken.slug && projects.length > 1) {
      // Generate slug from project name and compare
      const projectWithMatchingSlug = projects.find(p => {
        const generatedSlug = p.name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '') || 'project';
        
        return generatedSlug === parsedToken.slug;
      });

      if (projectWithMatchingSlug) {
        project = projectWithMatchingSlug;
      }
    }

    // Get freelancer currency from profiles table separately
    const { data: profileData } = await supabase
      .from('profiles')
      .select('currency, full_name')
      .eq('id', project.user_id)
      .single();

    // Add freelancer currency from profile
    const projectWithCurrency = {
      ...project,
      freelancer_currency: profileData?.currency || null
    };

    return new Response(
      JSON.stringify(projectWithCurrency),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }
};

serve(handler);
