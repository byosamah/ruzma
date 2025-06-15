import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import MilestoneCard from "@/components/MilestoneCard";
import { Milestone } from "@/components/ProjectCard";
import { ArrowLeft } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useProjects, DatabaseProject } from '@/hooks/useProjects';
import { useUserCurrency } from '@/hooks/useUserCurrency';

const ProjectManagement: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [project, setProject] = useState<DatabaseProject | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { projects, updateMilestoneStatus, uploadPaymentProof, uploadDeliverable, downloadDeliverable, updateMilestoneWatermark } = useProjects(user);
  const userCurrency = useUserCurrency(user);

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      setLoading(true);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.log('No user found, redirecting to login');
        navigate('/login');
        return;
      }

      setUser(user);
      
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      setProfile(profileData);
      setLoading(false);
    };

    checkAuthAndLoadData();
  }, [projectId, navigate]);

  useEffect(() => {
    if (projects.length > 0 && projectId) {
      const found = projects.find((p) => p.id === projectId);
      setProject(found || null);
    }
  }, [projects, projectId]);

  const handleUpdateMilestoneStatus = async (milestoneId: string, newStatus: Milestone["status"]) => {
    await updateMilestoneStatus(milestoneId, newStatus);
  };

  const handlePaymentUpload = async (milestoneId: string, file: File) => {
    await uploadPaymentProof(milestoneId, file);
  };

  const handleDeliverableUpload = async (milestoneId: string, file: File, watermarkText?: string) => {
    await uploadDeliverable(milestoneId, file, watermarkText);
  };

  const handleDeliverableDownload = async (milestoneId: string) => {
    await downloadDeliverable(milestoneId);
  };

  const handleUpdateWatermark = async (milestoneId: string, watermarkText: string) => {
    await updateMilestoneWatermark(milestoneId, watermarkText);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-600">Loading project...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) return <div>Loading...</div>;
  
  if (!project) {
    return (
      <Layout user={profile || user}>
        <div className="max-w-xl mx-auto text-center mt-20">
          <h2 className="text-2xl font-bold mb-2">Project not found</h2>
          <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={profile || user}>
      <Button
        variant="ghost"
        size="sm"
        className="mb-6 flex items-center"
        onClick={() => navigate("/dashboard")}
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Dashboard
      </Button>
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="p-5 rounded-lg bg-white/80 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">{project.name}</h1>
          <p className="text-slate-600 mb-4">{project.brief}</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Project ID: {project.id}</span>
            <span className="text-slate-500">
              Created: {new Date(project.created_at).toLocaleDateString()}
            </span>
          </div>
          <div className="mt-4">
            <a
              href={`/client/project/${project.id}`}
              target="_blank"
              className="text-blue-600 underline"
              rel="noopener noreferrer"
            >
              Open Client Page
            </a>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Milestones</h2>
          {project.milestones.length === 0 ? (
            <div className="text-slate-500 text-center">No milestones yet.</div>
          ) : (
            <div className="space-y-5">
              {project.milestones.map((milestone) => (
                <MilestoneCard
                  key={milestone.id}
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
                    paymentProofUrl: milestone.payment_proof_url,
                    watermarkText: milestone.watermark_text, // forward watermark
                  }}
                  onApprove={
                    milestone.status === "payment_submitted"
                      ? (mId) => handleUpdateMilestoneStatus(mId, "approved")
                      : undefined
                  }
                  onReject={
                    milestone.status === "payment_submitted"
                      ? (mId) => handleUpdateMilestoneStatus(mId, "rejected")
                      : undefined
                  }
                  onDeliverableUpload={handleDeliverableUpload}
                  onDeliverableDownload={handleDeliverableDownload}
                  onPaymentUpload={handlePaymentUpload}
                  currency={userCurrency}
                  onUpdateWatermark={handleUpdateWatermark}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProjectManagement;
