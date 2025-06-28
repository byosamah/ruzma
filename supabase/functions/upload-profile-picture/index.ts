
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Enhanced security configuration
const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 2 * 1024 * 1024, // 2MB for profile pictures
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  MAX_UPLOADS_PER_HOUR: 5,
  MAX_DIMENSION: 2048, // Max width/height in pixels
};

// Rate limiting storage (in production, use Redis or database)
const rateLimitStore = new Map<string, number[]>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  
  const userAttempts = rateLimitStore.get(userId) || [];
  const validAttempts = userAttempts.filter(time => now - time < oneHour);
  
  if (validAttempts.length >= UPLOAD_CONFIG.MAX_UPLOADS_PER_HOUR) {
    return false;
  }
  
  validAttempts.push(now);
  rateLimitStore.set(userId, validAttempts);
  return true;
}

function cleanupRateLimit() {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  
  for (const [userId, attempts] of rateLimitStore.entries()) {
    const validAttempts = attempts.filter(time => now - time < oneHour);
    if (validAttempts.length === 0) {
      rateLimitStore.delete(userId);
    } else {
      rateLimitStore.set(userId, validAttempts);
    }
  }
}

// Auto cleanup every 30 minutes
setInterval(cleanupRateLimit, 30 * 60 * 1000);

async function validateImageContent(imageBytes: ArrayBuffer): Promise<boolean> {
  try {
    // Basic image header validation
    const bytes = new Uint8Array(imageBytes.slice(0, 12));
    
    // Check for common image file signatures
    const signatures = [
      [0xFF, 0xD8, 0xFF], // JPEG
      [0x89, 0x50, 0x4E, 0x47], // PNG
      [0x47, 0x49, 0x46, 0x38], // GIF
      [0x52, 0x49, 0x46, 0x46] // WebP (RIFF header)
    ];
    
    return signatures.some(sig => 
      sig.every((byte, index) => bytes[index] === byte)
    );
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Enhanced authentication validation
    const authHeader = req.headers.get('Authorization');
    const clientInfo = req.headers.get('X-Client-Info');
    
    if (!authHeader) {
      console.log('Security: Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify client info for additional security
    if (clientInfo !== 'ruzma-web-app') {
      console.log('Security: Invalid client info:', clientInfo);
    }

    // Verify the user with enhanced validation
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.log('Security: Authentication failed:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting check
    if (!checkRateLimit(user.id)) {
      console.log('Security: Rate limit exceeded for user:', user.id);
      
      // Log to security events
      await supabase.rpc('log_security_event', {
        event_type: 'profile_upload_rate_limit',
        user_id: user.id,
        details: { timestamp: new Date().toISOString() }
      });
      
      return new Response(
        JSON.stringify({ error: 'Upload limit exceeded. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Enhanced file validation
    if (!UPLOAD_CONFIG.ALLOWED_TYPES.includes(file.type)) {
      console.log('Security: Invalid file type:', file.type);
      await supabase.rpc('log_security_event', {
        event_type: 'invalid_file_type_upload',
        user_id: user.id,
        details: { fileType: file.type, fileName: file.name }
      });
      
      return new Response(
        JSON.stringify({ error: 'Invalid file type. Only JPEG, PNG, WebP and GIF are allowed.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (file.size > UPLOAD_CONFIG.MAX_FILE_SIZE) {
      console.log('Security: File too large:', file.size);
      await supabase.rpc('log_security_event', {
        event_type: 'file_size_violation',
        user_id: user.id,
        details: { fileSize: file.size, maxSize: UPLOAD_CONFIG.MAX_FILE_SIZE }
      });
      
      return new Response(
        JSON.stringify({ error: 'File too large. Maximum size is 2MB for profile pictures.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get and validate image content
    const imageBytes = await file.arrayBuffer();
    
    // Validate actual image content
    if (!await validateImageContent(imageBytes)) {
      console.log('Security: Invalid image content');
      await supabase.rpc('log_security_event', {
        event_type: 'invalid_image_content',
        user_id: user.id,
        details: { fileName: file.name }
      });
      
      return new Response(
        JSON.stringify({ error: 'Invalid image file' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Generate secure filename with timestamp
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(7);
    const fileName = `${user.id}/${timestamp}_${randomSuffix}.webp`;

    // Clean up old profile pictures (security: prevent storage bloat)
    try {
      const { data: existingFiles } = await supabase.storage
        .from('profile-pictures')
        .list(user.id);

      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(f => `${user.id}/${f.name}`);
        await supabase.storage
          .from('profile-pictures')
          .remove(filesToDelete);
        
        console.log(`Cleaned up ${filesToDelete.length} old profile pictures`);
      }
    } catch (cleanupError) {
      console.warn('Cleanup failed (non-critical):', cleanupError);
    }

    // Upload new file with security settings
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload(fileName, imageBytes, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      await supabase.rpc('log_security_event', {
        event_type: 'profile_upload_failed',
        user_id: user.id,
        details: { error: uploadError.message }
      });
      
      return new Response(
        JSON.stringify({ error: 'Failed to upload file' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(fileName);

    // Update user profile with new avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        avatar_url: urlData.publicUrl,
        file_upload_count: (await supabase
          .from('profiles')
          .select('file_upload_count')
          .eq('id', user.id)
          .single()
        ).data?.file_upload_count + 1 || 1,
        last_upload_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Profile update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log successful upload
    console.log(`Secure profile picture upload successful for user: ${user.id}`);
    await supabase.rpc('log_security_event', {
      event_type: 'profile_upload_success',
      user_id: user.id,
      details: { 
        fileName: fileName,
        fileSize: file.size,
        timestamp: new Date().toISOString()
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: urlData.publicUrl,
        message: 'Profile picture updated successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
