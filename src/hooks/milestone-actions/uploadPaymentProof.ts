import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { trackPaymentProofUploaded } from '@/lib/analytics';

export const uploadPaymentProofAction = async (milestoneId: string, file: File) => {
  try {
    console.log('Starting payment proof upload (via edge function):', {
      milestoneId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    // Get current user to check storage limits
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('You must be logged in to upload payment proof');
      return false;
    }

    // Check storage limits before uploading
    const { data: limitCheck, error: limitError } = await supabase
      .rpc('check_user_limits', {
        _user_id: user.id,
        _action: 'storage',
        _size: file.size
      });

    if (limitError) {
      console.error('Error checking storage limits:', limitError);
      toast.error('Failed to check storage limits');
      return false;
    }

    if (!limitCheck) {
      toast.error('Storage limit reached. Please upgrade your plan or delete some files to free up space.');
      return false;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${milestoneId}-${Date.now()}.${fileExt}`;
    const filePath = `${milestoneId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('payment-proofs')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      toast.error(`Failed to upload file: ${uploadError.message}`);
      return false;
    }

    const { data: urlData } = supabase.storage
      .from('payment-proofs')
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      console.error('Failed to get public URL');
      toast.error('Failed to get file URL');
      return false;
    }

    const publicUrl = urlData.publicUrl;
    console.log('Generated public URL:', publicUrl);

    const { data: edgeData, error: edgeError } = await supabase.functions.invoke('submit-payment-proof', {
      body: {
        milestoneId,
        paymentProofUrl: publicUrl,
      },
    });

    if (edgeError || (edgeData && edgeData.error)) {
      console.error("Edge Function error:", edgeError, edgeData?.error || "");
      await supabase.storage.from('payment-proofs').remove([filePath]);
      toast.error(edgeData?.error || edgeError?.message || 'Payment proof submission failed.');
      return false;
    }

    // Get project ID for tracking
    const { data: milestone } = await supabase
      .from('milestones')
      .select('project_id')
      .eq('id', milestoneId)
      .single();

    if (milestone) {
      trackPaymentProofUploaded(milestoneId, milestone.project_id);
    }

    // Update storage usage
    const { error: storageUpdateError } = await supabase
      .rpc('update_user_storage', {
        _user_id: user.id,
        _size_change: file.size
      });

    if (storageUpdateError) {
      console.error('Error updating storage usage:', storageUpdateError);
    }

    toast.success('Payment proof submitted successfully!');
    return true;

  } catch (error) {
    console.error('Unexpected error during payment proof upload:', error);
    toast.error('Failed to upload payment proof');
    return false;
  }
};
