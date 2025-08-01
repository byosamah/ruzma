import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import { DatabaseProject } from '@/hooks/projectTypes';
import { sendPaymentNotification } from '@/services/emailNotifications';
import { trackMilestoneApproved, trackPaymentProofUploaded, trackDeliverableUploaded } from '@/lib/analytics';

// Sanitize filename to remove invalid characters for Supabase Storage
const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace invalid characters with underscores
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
    .substring(0, 100); // Limit length
};

export class MilestoneService {
  constructor(private user: User | null) {}

  // Status Management
  async updateMilestoneStatus(
    projects: DatabaseProject[],
    milestoneId: string,
    status: 'approved' | 'rejected'
  ): Promise<boolean> {
    if (!this.user) {
      toast.error('You must be logged in to update milestone status');
      return false;
    }

    try {
      // First, get the milestone and project details
      const { data: milestone, error: milestoneError } = await supabase
        .from('milestones')
        .select(`
          *,
          projects!inner (
            id,
            name,
            client_email,
            client_access_token,
            user_id
          )
        `)
        .eq('id', milestoneId)
        .single();

      if (milestoneError || !milestone) {
        console.error('Error fetching milestone:', milestoneError);
        toast.error('Failed to fetch milestone details');
        return false;
      }

      // Verify user owns this project
      if (milestone.projects.user_id !== this.user.id) {
        toast.error('You do not have permission to update this milestone');
        return false;
      }

      // Update the milestone status
      const { error: updateError } = await supabase
        .from('milestones')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', milestoneId);

      if (updateError) {
        console.error('Error updating milestone status:', updateError);
        toast.error('Failed to update milestone status');
        return false;
      }

      // Track milestone approval
      if (status === 'approved') {
        trackMilestoneApproved(milestoneId, milestone.projects.id, milestone.price);
      }

      // Send email notification if client email exists
      if (milestone.projects.client_email) {
        try {
          await sendPaymentNotification({
            clientEmail: milestone.projects.client_email,
            projectName: milestone.projects.name,
            projectId: milestone.projects.id,
            clientToken: milestone.projects.client_access_token,
            isApproved: status === 'approved',
            milestoneName: milestone.title,
          });
          
          console.log('Email notification sent successfully');
        } catch (emailError) {
          console.error('Failed to send email notification:', emailError);
          // Don't fail the status update if email fails
          toast.error('Status updated but failed to send email notification');
        }
      }

      const statusText = status === 'approved' ? 'approved' : 'rejected';
      toast.success(`Payment proof ${statusText} successfully`);
      return true;
    } catch (error) {
      console.error('Error updating milestone status:', error);
      toast.error('Failed to update milestone status');
      return false;
    }
  }

  async updateMilestoneStatusGeneral(
    milestoneId: string,
    status: 'pending' | 'payment_submitted' | 'approved' | 'rejected'
  ): Promise<boolean> {
    if (!this.user) {
      toast.error('You must be logged in to update milestone status');
      return false;
    }

    try {
      console.log('Updating milestone status:', milestoneId, 'to', status);

      // First verify the user owns this milestone
      const { data: milestone, error: fetchError } = await supabase
        .from('milestones')
        .select(`
          *,
          projects!inner (
            user_id
          )
        `)
        .eq('id', milestoneId)
        .single();

      if (fetchError || !milestone) {
        console.error('Error fetching milestone:', fetchError);
        toast.error('Failed to fetch milestone details');
        return false;
      }

      // Verify user owns this project
      if (milestone.projects.user_id !== this.user.id) {
        toast.error('You do not have permission to update this milestone');
        return false;
      }

      // Update the milestone status
      const { error: updateError } = await supabase
        .from('milestones')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', milestoneId);

      if (updateError) {
        console.error('Error updating milestone status:', updateError);
        toast.error('Failed to update milestone status');
        return false;
      }

      console.log('Milestone status updated successfully');
      toast.success('Status updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating milestone status:', error);
      toast.error('Failed to update milestone status');
      return false;
    }
  }

  // File Operations
  async uploadPaymentProof(milestoneId: string, file: File): Promise<boolean> {
    try {
      console.log('Starting payment proof upload (via edge function):', {
        milestoneId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      if (!this.user) {
        toast.error('You must be logged in to upload payment proof');
        return false;
      }

      // Check storage limits before uploading
      const { data: limitCheck, error: limitError } = await supabase
        .rpc('check_user_limits', {
          _user_id: this.user.id,
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
          _user_id: this.user.id,
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
  }

  async uploadDeliverable(milestoneId: string, file: File): Promise<boolean> {
    if (!this.user) {
      toast.error('You must be logged in to upload deliverables');
      return false;
    }

    try {
      console.log('Starting deliverable upload for milestone:', milestoneId);

      // Check storage limits before uploading
      const { data: limitCheck, error: limitError } = await supabase
        .rpc('check_user_limits', {
          _user_id: this.user.id,
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

      // Sanitize the filename to avoid invalid key errors
      const sanitizedFileName = sanitizeFilename(file.name);
      const fileName = `${Date.now()}-${sanitizedFileName}`;
      const filePath = `${this.user.id}/${milestoneId}/${fileName}`;

      console.log('Sanitized file path:', filePath);

      const { error: uploadError } = await supabase.storage
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

      const { data: { publicUrl } } = supabase.storage
        .from('deliverables')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('milestones')
        .update({
          deliverable_url: publicUrl,
          deliverable_name: file.name, // Keep original filename for display
          deliverable_size: file.size,
          updated_at: new Date().toISOString()
        })
        .eq('id', milestoneId);

      if (updateError) {
        console.error('Error updating milestone with deliverable:', updateError);
        await supabase.storage.from('deliverables').remove([filePath]);
        toast.error('Failed to save deliverable information');
        return false;
      }

      // Get project ID for tracking
      const { data: milestone } = await supabase
        .from('milestones')
        .select('project_id')
        .eq('id', milestoneId)
        .single();

      if (milestone) {
        trackDeliverableUploaded(milestoneId, milestone.project_id, file.size);
      }

      // Update storage usage
      const { error: storageUpdateError } = await supabase
        .rpc('update_user_storage', {
          _user_id: this.user.id,
          _size_change: file.size
        });

      if (storageUpdateError) {
        console.error('Error updating storage usage:', storageUpdateError);
      }
      
      toast.success('Deliverable uploaded successfully!');
      return true;
    } catch (error) {
      console.error('Error uploading deliverable:', error);
      toast.error('Failed to upload deliverable');
      return false;
    }
  }

  async downloadDeliverable(
    projects: DatabaseProject[],
    milestoneId: string,
    paymentProofRequired: boolean = true
  ): Promise<boolean> {
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
  }

  // Link Management
  async updateDeliverableLink(milestoneId: string, link: string): Promise<boolean> {
    if (!this.user) {
      toast.error('You must be logged in to update deliverable links');
      return false;
    }

    try {
      console.log('Updating deliverable link for milestone:', milestoneId);

      const { error: updateError } = await supabase
        .from('milestones')
        .update({
          deliverable_link: link || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', milestoneId);

      if (updateError) {
        console.error('Error updating milestone with deliverable link:', updateError);
        toast.error('Failed to update deliverable link');
        return false;
      }

      console.log('Deliverable link updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating deliverable link:', error);
      toast.error('Failed to update deliverable link');
      return false;
    }
  }

  // Revision Management
  async updateRevisionData(milestoneId: string, newDeliverableLink: string): Promise<boolean> {
    if (!this.user) {
      toast.error('You must be logged in to update revision data');
      return false;
    }

    try {
      console.log('Updating revision data for milestone:', milestoneId);

      const { error: updateError } = await supabase
        .from('milestones')
        .update({
          deliverable_link: newDeliverableLink,
          updated_at: new Date().toISOString()
        })
        .eq('id', milestoneId);

      if (updateError) {
        console.error('Error updating milestone with revision data:', updateError);
        toast.error('Failed to update revision settings');
        return false;
      }

      console.log('Revision data updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating revision data:', error);
      toast.error('Failed to update revision settings');
      return false;
    }
  }

  async addRevisionRequest(milestoneId: string, newDeliverableLink: string): Promise<boolean> {
    if (!this.user) {
      toast.error('You must be logged in to request revisions');
      return false;
    }

    try {
      console.log('Adding revision request for milestone:', milestoneId);

      const { error: updateError } = await supabase
        .from('milestones')
        .update({
          deliverable_link: newDeliverableLink,
          updated_at: new Date().toISOString()
        })
        .eq('id', milestoneId);

      if (updateError) {
        console.error('Error adding revision request:', updateError);
        toast.error('Failed to submit revision request');
        return false;
      }

      console.log('Revision request added successfully');
      return true;
    } catch (error) {
      console.error('Error adding revision request:', error);
      toast.error('Failed to submit revision request');
      return false;
    }
  }
}