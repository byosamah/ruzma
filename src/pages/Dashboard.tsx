import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';
import ProjectCard from '@/components/ProjectCard';
import { Plus, Briefcase, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useProjects } from '@/hooks/useProjects';
import { useUserCurrency } from '@/hooks/useUserCurrency';
import { formatCurrency, getCurrencySymbol } from '@/lib/currency';
import { useT } from '@/lib/i18n';
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardStats from "@/components/dashboard/DashboardStats";
import DashboardProjectList from "@/components/dashboard/DashboardProjectList";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const t = useT();

  const { projects, loading: projectsLoading, deleteProject } = useProjects(user);
  const userCurrency = useUserCurrency(user);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      setLoading(true);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.log('No user found, redirecting to login');
        navigate('/login');
        return;
      }

      setUser(user);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || t('defaultUser')
          })
          .select()
          .single();
          
        if (createError) {
          console.error("Error creating profile:", createError);
          toast.error(t("profileSetupError"));
        } else {
          setProfile(newProfile);
        }
      } else {
        setProfile(profileData);
      }
      
      setLoading(false);
    };

    fetchUserAndProfile();
  }, [navigate, t]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleEditProject = (project: any) => {
    navigate(`/edit-project/${project.id}`);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (confirm(t('areYouSureDeleteProject'))) {
      await deleteProject(projectId);
    }
  };

  const convertedProjects = projects.map(project => ({
    id: project.id,
    name: project.name,
    brief: project.brief,
    milestones: project.milestones.map(milestone => ({
      id: milestone.id,
      title: milestone.title,
      description: milestone.description,
      price: milestone.price,
      status: milestone.status,
    })),
    createdAt: new Date(project.created_at).toLocaleDateString(),
    clientUrl: `/client/project/${project.id}`,
  }));

  const totalProjects = convertedProjects.length;
  const totalMilestones = convertedProjects.reduce((sum, project) => sum + project.milestones.length, 0);
  const completedMilestones = convertedProjects.reduce((sum, project) => 
    sum + project.milestones.filter(m => m.status === 'approved').length, 0);
  const pendingPayments = convertedProjects.reduce((sum, project) => 
    sum + project.milestones.filter(m => m.status === 'payment_submitted').length, 0);
  const totalEarnings = convertedProjects.reduce((sum, project) => 
    sum + project.milestones.filter(m => m.status === 'approved').reduce((mSum, m) => mSum + m.price, 0), 0);

  if (loading || projectsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-600">{t('loadingDashboard')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <div>{t('loadingDashboard')}</div>;
  }

  const displayName =
    profile?.full_name ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    t("defaultUser");

  return (
    <Layout user={profile || user} onSignOut={handleSignOut}>
      <div className="space-y-8">
        <DashboardHeader
          displayName={displayName}
          onNewProject={() => navigate("/create-project")}
        />
        <DashboardStats
          totalProjects={totalProjects}
          totalEarnings={totalEarnings}
          completedMilestones={completedMilestones}
          totalMilestones={totalMilestones}
          pendingPayments={pendingPayments}
          userCurrency={userCurrency}
        />
        <DashboardProjectList
          projects={convertedProjects}
          userCurrency={userCurrency}
          onEdit={handleEditProject}
          onDelete={handleDeleteProject}
          onNewProject={() => navigate("/create-project")}
        />
      </div>
    </Layout>
  );
};

export default Dashboard;
