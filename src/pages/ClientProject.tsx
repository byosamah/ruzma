import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MilestoneCard from '@/components/MilestoneCard';
import { CheckCircle, Clock, Briefcase } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseProject } from '@/hooks/useProjects';
import { toast } from 'sonner';

const ClientProject = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState<DatabaseProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    console.log('Payment proof uploaded for milestone:', milestoneId, file);
    
    try {
      // Update milestone status to payment_submitted
      const { error } = await supabase
        .from('milestones')
        .update({ 
          status: 'payment_submitted',
          payment_proof_url: `temp-payment-url-${milestoneId}`, // This would be the actual storage URL
          updated_at: new Date().toISOString()
        })
        .eq('id', milestoneId);

      if (error) {
        console.error('Error updating milestone status:', error);
        toast.error('Failed to upload payment proof');
        return;
      }

      toast.success('Payment proof uploaded successfully');

      // Update local state
      setProject(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          milestones: prev.milestones.map(m =>
            m.id === milestoneId ? { ...m, status: 'payment_submitted' as const } : m
          )
        };
      });
    } catch (error) {
      console.error('Error updating milestone:', error);
      toast.error('Failed to upload payment proof');
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
        {/* Project Overview */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <div>
                <CardTitle className="text-2xl text-slate-800">{project.name}</CardTitle>
                <p className="text-slate-600 mt-2">{project.brief}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-slate-800">${totalValue.toLocaleString()}</div>
                <div className="text-sm text-slate-600">Total Project Value</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{totalMilestones}</div>
                <div className="text-sm text-slate-600">Total Milestones</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{completedMilestones}</div>
                <div className="text-sm text-slate-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800">
                  {totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0}%
                </div>
                <div className="text-sm text-slate-600">Progress</div>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">Project Progress</span>
                <span className="text-sm text-slate-600">{completedMilestones}/{totalMilestones} milestones</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">How it works:</h3>
                <ol className="text-sm text-slate-700 space-y-1 list-decimal list-inside">
                  <li>Review each milestone below with its description and price</li>
                  <li>Upload proof of payment (screenshot, receipt, or transaction ID) for each milestone</li>
                  <li>Once payment is verified, you'll be able to download the deliverable</li>
                  <li>Milestones must be completed in order</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Milestones */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">Project Milestones</h2>
          
          <div className="space-y-4">
            {project.milestones.length === 0 ? (
              <Card className="text-center py-8">
                <CardContent>
                  <p className="text-slate-500">No milestones have been set up for this project yet.</p>
                </CardContent>
              </Card>
            ) : (
              project.milestones.map((milestone, index) => (
                <div key={milestone.id} className="relative">
                  {index > 0 && (
                    <div className="absolute -top-4 left-6 w-0.5 h-4 bg-slate-300"></div>
                  )}
                  <MilestoneCard
                    milestone={{
                      id: milestone.id,
                      title: milestone.title,
                      description: milestone.description,
                      price: milestone.price,
                      status: milestone.status,
                      deliverable: milestone.deliverable_name ? {
                        name: milestone.deliverable_name,
                        size: milestone.deliverable_size || 0,
                        url: milestone.deliverable_url
                      } : undefined,
                    }}
                    isClient={true}
                    onPaymentUpload={handlePaymentUpload}
                    onDeliverableDownload={handleDeliverableDownload}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <Card className="bg-slate-100 border-slate-200">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-slate-600">
              Questions about this project? Contact your freelancer directly.
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Powered by Ruzma - Professional Freelance Project Management
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientProject;
