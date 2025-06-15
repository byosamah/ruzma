
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const uploadPaymentProofAction = async (milestoneId: string, file: File) => {
  try {
    console.log('Starting payment proof upload (via edge function):', {
      milestoneId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

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

    toast.success('Payment proof submitted successfully!');
    return true;

  } catch (error) {
    console.error('Unexpected error during payment proof upload:', error);
    toast.error('Failed to upload payment proof');
    return false;
  }
};
