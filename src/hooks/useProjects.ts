import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';

export interface DatabaseProject {
  id: string;
  user_id: string;
  name: string;
  brief: string;
  created_at: string;
  updated_at: string;
  milestones: DatabaseMilestone[];
}

export interface DatabaseMilestone {
  id: string;
  project_id: string;
  title: string;
  description: string;
  price: number;
  status: 'pending' | 'payment_submitted' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  deliverable_name?: string;
  deliverable_url?: string;
  deliverable_size?: number;
  payment_proof_url?: string;
}

export const useProjects = (user: User | null) => {
  const [projects, setProjects] = useState<DatabaseProject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch projects with their milestones
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          milestones (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        toast.error('Failed to load projects');
        return;
      }

      // Type assertion to ensure proper typing
      const typedProjects = (projectsData || []).map(project => ({
        ...project,
        milestones: project.milestones.map((milestone: any) => ({
          ...milestone,
          status: milestone.status as 'pending' | 'payment_submitted' | 'approved' | 'rejected'
        }))
      })) as DatabaseProject[];

      setProjects(typedProjects);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: {
    name: string;
    brief: string;
    milestones: Array<{
      title: string;
      description: string;
      price: number;
    }>;
  }) => {
    if (!user) {
      toast.error('You must be logged in to create a project');
      return null;
    }

    try {
      // Create the project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: projectData.name,
          brief: projectData.brief,
        })
        .select()
        .single();

      if (projectError) {
        console.error('Error creating project:', projectError);
        toast.error('Failed to create project');
        return null;
      }

      // Create the milestones
      if (projectData.milestones.length > 0) {
        const milestonesToInsert = projectData.milestones.map(milestone => ({
          project_id: project.id,
          title: milestone.title,
          description: milestone.description,
          price: milestone.price,
        }));

        const { error: milestonesError } = await supabase
          .from('milestones')
          .insert(milestonesToInsert);

        if (milestonesError) {
          console.error('Error creating milestones:', milestonesError);
          toast.error('Project created but failed to create milestones');
        }
      }

      toast.success('Project created successfully');
      await fetchProjects(); // Refresh the list
      return project;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to create project');
      return null;
    }
  };

  const updateProject = async (projectId: string, projectData: {
    name: string;
    brief: string;
    milestones: Array<{
      id?: string;
      title: string;
      description: string;
      price: number;
      status: 'pending' | 'payment_submitted' | 'approved' | 'rejected';
    }>;
  }) => {
    if (!user) {
      toast.error('You must be logged in to update a project');
      return false;
    }

    try {
      // Update the project
      const { error: projectError } = await supabase
        .from('projects')
        .update({
          name: projectData.name,
          brief: projectData.brief,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (projectError) {
        console.error('Error updating project:', projectError);
        toast.error('Failed to update project');
        return false;
      }

      // Handle milestones - delete existing ones and create new ones
      const { error: deleteError } = await supabase
        .from('milestones')
        .delete()
        .eq('project_id', projectId);

      if (deleteError) {
        console.error('Error deleting old milestones:', deleteError);
        toast.error('Failed to update milestones');
        return false;
      }

      // Create new milestones
      if (projectData.milestones.length > 0) {
        const milestonesToInsert = projectData.milestones.map(milestone => ({
          project_id: projectId,
          title: milestone.title,
          description: milestone.description,
          price: milestone.price,
          status: milestone.status,
        }));

        const { error: milestonesError } = await supabase
          .from('milestones')
          .insert(milestonesToInsert);

        if (milestonesError) {
          console.error('Error creating new milestones:', milestonesError);
          toast.error('Project updated but failed to update milestones');
          return false;
        }
      }

      toast.success('Project updated successfully');
      await fetchProjects(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update project');
      return false;
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!user) {
      toast.error('You must be logged in to delete a project');
      return false;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting project:', error);
        toast.error('Failed to delete project');
        return false;
      }

      toast.success('Project deleted successfully');
      await fetchProjects(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to delete project');
      return false;
    }
  };

  const updateMilestoneStatus = async (milestoneId: string, status: 'pending' | 'payment_submitted' | 'approved' | 'rejected') => {
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

      await fetchProjects(); // Refresh the list
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
      console.log('Starting payment proof upload:', {
        milestoneId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        userId: user?.id || 'anonymous'
      });

      // Compose file path - use milestoneId as primary folder for anonymous uploads
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = user?.id 
        ? `${user.id}/${milestoneId}/${fileName}` 
        : `anonymous/${milestoneId}/${fileName}`;
      console.log('Upload path:', filePath);

      // Upload to bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(filePath, file, {
          upsert: false,
          contentType: file.type
        });

      if (uploadError) {
        console.error('Upload error details:', {
          message: uploadError.message,
          error: uploadError
        });
        toast.error(`Failed to upload payment proof: ${uploadError.message}`);
        return false;
      }

      // Retrieve the public URL
      const { data: publicUrlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(filePath);

      // Always use only the .publicUrl if and only if it's a real HTTP URL
      const paymentProofUrl: string | null =
        publicUrlData?.publicUrl && publicUrlData.publicUrl.startsWith('http')
          ? publicUrlData.publicUrl
          : null;

      if (!paymentProofUrl) {
        console.error('Could not get a valid public URL for uploaded file:', publicUrlData);
        toast.error('Upload succeeded but failed to get file URL');
        // Clean up failed upload if possible
        await supabase.storage.from('payment-proofs').remove([filePath]);
        return false;
      }
      console.log('Generated public URL for payment proof:', paymentProofUrl);

      // Update the milestone in the database
      const { data: updatedMilestone, error: updateError } = await supabase
        .from('milestones')
        .update({
          payment_proof_url: paymentProofUrl,
          status: 'payment_submitted',
          updated_at: new Date().toISOString()
        })
        .eq('id', milestoneId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating milestone with payment proof:', updateError);
        toast.error('Failed to update milestone in database');
        // Remove uploaded file to prevent orphan files
        await supabase.storage.from('payment-proofs').remove([filePath]);
        return false;
      }

      console.log('Milestone updated successfully with payment proof:', updatedMilestone);

      toast.success('Payment proof uploaded successfully');
      await fetchProjects();
      return true;
    } catch (error) {
      console.error('Error uploading payment proof:', error);
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

  useEffect(() => {
    fetchProjects();
  }, [user]);

  return {
    projects,
    loading,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    updateMilestoneStatus,
    uploadPaymentProof,
    uploadDeliverable,
    downloadDeliverable,
    updateMilestoneWatermark,
  };
};
