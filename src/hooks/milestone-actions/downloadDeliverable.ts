
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DatabaseProject } from '@/hooks/projectTypes';

export const downloadDeliverableAction = async (
  projects: DatabaseProject[],
  milestoneId: string,
  paymentProofRequired: boolean = true
) => {
  try {
    const milestone = projects
      .flatMap(p => p.milestones)
      .find(m => m.id === milestoneId);

    if (!milestone || !milestone.deliverable_name || !milestone.deliverable_url) {
      toast.error('Deliverable not found');
      return false;
    }

    // Only check payment approval if payment proof is required
    if (paymentProofRequired && milestone.status !== 'approved') {
      toast.error('Payment must be approved before downloading');
      return false;
    }
    
    let filePath = '';
    try {
      if (milestone.deliverable_url.includes('/object/public/deliverables/')) {
        filePath = milestone.deliverable_url.split('/object/public/deliverables/')[1];
      } else if (milestone.deliverable_url.includes('/storage/v1/object/public/deliverables/')) {
        const urlParts = milestone.deliverable_url.split('/storage/v1/object/public/deliverables/');
        if (urlParts.length > 1) {
          filePath = decodeURIComponent(urlParts[1]);
        }
      } else {
        filePath = milestone.deliverable_url;
      }
    } catch (e) {
      console.error('Error extracting file path:', e);
      toast.error('Could not locate file path for download');
      return false;
    }

    if (!filePath) {
      toast.error('Invalid file path');
      return false;
    }

    const { data, error } = await supabase
      .storage
      .from('deliverables')
      .createSignedUrl(filePath, 60);

    if (error) {
      console.error('Error generating signed URL:', error);
      toast.error(`Download failed: ${error.message}`);
      return false;
    }

    if (!data?.signedUrl) {
      toast.error('Could not generate download link');
      return false;
    }

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
