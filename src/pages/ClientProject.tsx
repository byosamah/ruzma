
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseProject } from '@/hooks/useProjects';
import { toast } from 'sonner';
import ProjectOverviewCard from "@/components/ProjectClient/ProjectOverviewCard";
import ProjectInstructionsCard from "@/components/ProjectClient/ProjectInstructionsCard";
import ProjectMilestonesList from "@/components/ProjectClient/ProjectMilestonesList";
import ProjectFooter from "@/components/ProjectClient/ProjectFooter";

const ClientProject = () => {
  const { token } = useParams();
  const [project, setProject] = useState<DatabaseProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = async () => {
    if (!token) {
      setError('No project token provided');
      setIsLoading(false);
      return;
    }
  
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('get-client-project', {
        body: { token },
      });
  
      if (invokeError || !data) {
        console.error('Error fetching project from edge function:', invokeError);
        setError(invokeError?.message || data?.error || 'Project not found');
        return;
      }
  
      const projectData = data;
  
      const typedProject = {
        ...projectData,
        milestones: projectData.milestones.map((milestone: any) => ({
          ...milestone,
          status: milestone.status as 'pending' | 'payment_submitted' | 'approved' | 'rejected'
        }))
      } as DatabaseProject;
  
      setProject(typedProject);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load project');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchProject();
  }, [token]);

  const handlePaymentUpload = async (milestoneId: string, file: File) => {
    console.log('Payment proof upload initiated for milestone:', milestoneId, file);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('milestoneId', milestoneId);

      toast.loading('Uploading payment proof...');
      const { data, error } = await supabase.functions.invoke('upload-client-payment-proof', {
        body: formData,
      });

      toast.dismiss();

      if (error || !data.success) {
        console.error("Upload error:", error, data?.error);
        toast.error(data?.error || 'Failed to upload payment proof.');
        return;
      }

      toast.success('Payment proof uploaded successfully!');
      
      // Refresh project data to show updated status
      await fetchProject();

    } catch (e) {
      toast.dismiss();
      console.error("Upload exception:", e);
      toast.error('An unexpected error occurred during upload.');
    }
  };

  const handleDeliverableDownload = async (milestoneId: string) => {
    try {
      const milestone = project?.milestones.find(m => m.id === milestoneId);
      
      if (!milestone) {
        toast.error('Milestone not found');
        return;
      }

      if (milestone.status !== 'approved') {
        toast.error('Payment must be approved before downloading');
        return;
      }

      if (!milestone.deliverable_name || !milestone.deliverable_url) {
        toast.error('No deliverable available');
        return;
      }

      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = milestone.deliverable_url;
      link.download = milestone.deliverable_name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Downloaded ${milestone.deliverable_name}`);
    } catch (error) {
      console.error('Error downloading deliverable:', error);
      toast.error('Failed to download deliverable');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-600 mt-2">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="pt-6">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Project Not Found</h1>
            <p className="text-slate-600">{error || "The project you're looking for doesn't exist or has been removed."}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalMilestones = project.milestones.length;
  const completedMilestones = project.milestones.filter(m => m.status === 'approved').length;
  const totalValue = project.milestones.reduce((sum, m) => sum + m.price, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Client Project Portal</h1>
              <p className="text-slate-600">Track your project progress and make payments</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <ProjectOverviewCard
          projectName={project.name}
          projectBrief={project.brief}
          totalValue={totalValue}
          totalMilestones={totalMilestones}
          completedMilestones={completedMilestones}
        />
        <ProjectInstructionsCard />
        <ProjectMilestonesList
          milestones={project.milestones}
          onPaymentUpload={handlePaymentUpload}
          onDeliverableDownload={handleDeliverableDownload}
        />
        <ProjectFooter />
      </div>
    </div>
  );
};

export default ClientProject;
