import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import { DatabaseProject } from './projectTypes';

export function useMilestoneActions(
  user: User | null,
  projects: DatabaseProject[],
  fetchProjects: () => Promise<void>
) {
  const updateMilestoneStatus = async (
    milestoneId: string,
    status: 'pending' | 'payment_submitted' | 'approved' | 'rejected'
  ) => {
    if (!user) {
      toast.error('You must be logged in to update milestone status');
      return false;
    }
    try {
      const { error } = await supabase
        .from('milestones')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', milestoneId);

      if (error) {
        console.error('Error updating milestone status:', error);
        toast.error('Failed to update milestone status');
        return false;
      }

      await fetchProjects();
      return true;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update milestone status');
      return false;
    }
  };

  const updateMilestoneWatermark = async (milestoneId: string, watermarkText: string) => {
    if (!user) {
      toast.error('You must be logged in to update watermark');
      return false;
    }
    try {
      const { error } = await supabase
        .from('milestones')
        .update({ watermark_text: watermarkText, updated_at: new Date().toISOString() })
        .eq('id', milestoneId);
      if (error) {
        toast.error('Failed to update watermark');
        return false;
      }
      await fetchProjects();
      toast.success('Watermark updated');
      return true;
    } catch (e) {
      toast.error('Update failed');
      return false;
    }
  };

  const uploadPaymentProof = async (milestoneId: string, file: File) => {
    try {
      console.log('Starting payment proof upload (via edge function):', {
        milestoneId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      // Step 1: Generate unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${milestoneId}-${Date.now()}.${fileExt}`;
      const filePath = `${milestoneId}/${fileName}`;

      // Step 2: Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
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

      // Step 3: Get public URL for the uploaded file
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

      // Step 4: Call the Edge Function to update the milestone record
      const { data: edgeData, error: edgeError } = await supabase.functions.invoke('submit-payment-proof', {
        body: {
          milestoneId,
          paymentProofUrl: publicUrl,
        },
      });

      if (edgeError || (edgeData && edgeData.error)) {
        console.error("Edge Function error:", edgeError, edgeData?.error || "");
        // Clean up uploaded file if edge function fails
        await supabase.storage.from('payment-proofs').remove([filePath]);
        toast.error(edgeData?.error || edgeError?.message || 'Payment proof submission failed.');
        return false;
      }

      toast.success('Payment proof submitted successfully!');
      await fetchProjects();
      return true;

    } catch (error) {
      console.error('Unexpected error during payment proof upload:', error);
      toast.error('Failed to upload payment proof');
      return false;
    }
  };

  const uploadDeliverable = async (milestoneId: string, file: File, watermarkText?: string) => {
    if (!user) {
      toast.error('You must be logged in to upload deliverables');
      return false;
    }

    try {
      console.log('Uploading deliverable for milestone:', milestoneId, 'File:', file.name, 'Size:', file.size);

      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${user.id}/${milestoneId}/${fileName}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('deliverables')
        .upload(filePath, file, {
          upsert: false,
          contentType: file.type
        });

      if (uploadError) {
        console.error('Error uploading file to storage:', uploadError);
        toast.error('Failed to upload file');
        return false;
      }

      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('deliverables')
        .getPublicUrl(filePath);

      // Update milestone with deliverable info in database, including watermark text
      const { data: updatedMilestone, error: updateError } = await supabase
        .from('milestones')
        .update({
          deliverable_name: file.name,
          deliverable_size: file.size,
          deliverable_url: publicUrl,
          updated_at: new Date().toISOString(),
          watermark_text: watermarkText || null
        })
        .eq('id', milestoneId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating milestone with deliverable info:', updateError);
        toast.error('Failed to update milestone in database');
        // Clean up uploaded file if database update fails
        await supabase.storage.from('deliverables').remove([filePath]);
        return false;
      }

      // Verify the data was saved by fetching it back
      const { data: verifyData, error: verifyError } = await supabase
        .from('milestones')
        .select('deliverable_name, deliverable_url, deliverable_size')
        .eq('id', milestoneId)
        .single();

      if (verifyError) {
        console.error('Error verifying database update:', verifyError);
      } else {
        console.log('Verified database data:', verifyData);
      }

      toast.success('Deliverable uploaded successfully');
      await fetchProjects(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error uploading deliverable:', error);
      toast.error('Failed to upload deliverable');
      return false;
    }
  };

  const downloadDeliverable = async (milestoneId: string) => {
    try {
      // Find the milestone
      const milestone = projects
        .flatMap(p => p.milestones)
        .find(m => m.id === milestoneId);

      if (!milestone || !milestone.deliverable_name || !milestone.deliverable_url) {
        toast.error('Deliverable not found');
        return false;
      }

      if (milestone.status !== 'approved') {
        toast.error('Payment must be approved before downloading');
        return false;
      }

      console.log('Attempting to download deliverable:', {
        milestoneId,
        deliverable_name: milestone.deliverable_name,
        deliverable_url: milestone.deliverable_url
      });

      // Extract file path from the deliverable_url
      let filePath = '';
      try {
        // Handle both public URL format and storage paths
        if (milestone.deliverable_url.includes('/object/deliverables/')) {
          const urlParts = milestone.deliverable_url.split('/object/deliverables/');
          if (urlParts.length > 1) {
            filePath = decodeURIComponent(urlParts[1]);
          }
        } else if (milestone.deliverable_url.includes('/storage/v1/object/public/deliverables/')) {
          const urlParts = milestone.deliverable_url.split('/storage/v1/object/public/deliverables/');
          if (urlParts.length > 1) {
            filePath = decodeURIComponent(urlParts[1]);
          }
        } else {
          // Assume the URL is the file path itself if it doesn't match expected formats
          filePath = milestone.deliverable_url;
        }

        console.log('Extracted file path:', filePath);
      } catch (e) {
        console.error('Error extracting file path:', e);
        toast.error('Could not locate file path for download');
        return false;
      }

      if (!filePath) {
        toast.error('Invalid file path');
        return false;
      }

      // Generate signed URL for download
      const { data, error } = await supabase
        .storage
        .from('deliverables')
        .createSignedUrl(filePath, 60); // Signed URL valid for 60 seconds

      console.log('Signed URL response:', { data, error });

      if (error) {
        console.error('Error generating signed URL:', error);
        toast.error(`Download failed: ${error.message}`);
        return false;
      }

      if (!data?.signedUrl) {
        toast.error('Could not generate download link');
        return false;
      }

      // Download using the signed URL
      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = milestone.deliverable_name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Downloaded ${milestone.deliverable_name}`);
      return true;
    } catch (error) {
      console.error('Error downloading deliverable:', error);
      toast.error('Failed to download deliverable');
      return false;
    }
  };

  return {
    updateMilestoneStatus,
    uploadPaymentProof,
    uploadDeliverable,
    downloadDeliverable,
    updateMilestoneWatermark,
  };
}
