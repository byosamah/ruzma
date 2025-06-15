import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MilestoneCard from '@/components/MilestoneCard';
import { CheckCircle, Clock, Briefcase } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseProject, useProjects } from '@/hooks/useProjects';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import DeliverableWatermarkedPreview from '@/components/MilestoneCard/DeliverableWatermarkedPreview';
import MilestoneDeliverablePreview from "@/components/ProjectClient/MilestoneDeliverablePreview";
import ProjectOverviewCard from "@/components/ProjectClient/ProjectOverviewCard";
import ProjectInstructionsCard from "@/components/ProjectClient/ProjectInstructionsCard";
import ProjectMilestonesList from "@/components/ProjectClient/ProjectMilestonesList";
import ProjectFooter from "@/components/ProjectClient/ProjectFooter";

const ClientProject = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState<DatabaseProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const { uploadPaymentProof } = useProjects(user);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    const fetchProject = async () => {
      console.log('ClientProject: URL projectId:', projectId);
      if (!projectId) {
        setError('No project ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select(`
            *,
            milestones (*)
          `)
          .eq('id', projectId)
          .single();

        console.log('ClientProject: Supabase data:', projectData);
        console.log('ClientProject: Supabase error:', projectError);

        if (projectError || !projectData) {
          console.error('Error fetching project:', projectError);
          setError('Project not found');
          setIsLoading(false);
          return;
        }

        const typedProject = {
          ...projectData,
          milestones: projectData.milestones.map((milestone: any) => ({
            ...milestone,
            status: milestone.status as 'pending' | 'payment_submitted' | 'approved' | 'rejected'
          }))
        } as DatabaseProject;

        setProject(typedProject);
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to load project');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const handlePaymentUpload = async (milestoneId: string, file: File) => {
    console.log('Payment proof upload initiated for milestone:', milestoneId, file);
    
    const success = await uploadPaymentProof(milestoneId, file);
    
    if (success) {
      // Refresh project data to show updated status
      const { data: projectData } = await supabase
        .from('projects')
        .select(`
          *,
          milestones (*)
        `)
        .eq('id', projectId)
        .single();

      if (projectData) {
        const typedProject = {
          ...projectData,
          milestones: projectData.milestones.map((milestone: any) => ({
            ...milestone,
            status: milestone.status as 'pending' | 'payment_submitted' | 'approved' | 'rejected'
          }))
        } as DatabaseProject;
        setProject(typedProject);
      }
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

  // Track which milestone's preview (if any) is open, with a mapping of milestoneId -> boolean
  const [previewOpen, setPreviewOpen] = useState<{ [mid: string]: boolean }>({});

  const getDeliverableFileType = (deliverable?: { name: string, url?: string }) => {
    if (!deliverable || !deliverable.url) return '';
    const name = deliverable.name.toLowerCase();
    if (name.endsWith('.pdf')) return 'application/pdf';
    if (name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png')) return 'image/jpeg';
    return '';
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
