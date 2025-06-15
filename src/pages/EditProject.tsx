
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useProjects, DatabaseProject } from '@/hooks/useProjects';
import { MilestoneFormData } from '@/components/EditProject/types';
import { ProjectForm } from '@/components/EditProject/ProjectForm';

const EditProject: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [project, setProject] = useState<DatabaseProject | null>(null);
  const [name, setName] = useState('');
  const [brief, setBrief] = useState('');
  const [milestones, setMilestones] = useState<MilestoneFormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const { projects, updateProject } = useProjects(user);

  useEffect(() => {
    const checkAuthAndLoadProject = async () => {
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

    checkAuthAndLoadProject();
  }, [projectId, navigate]);

  useEffect(() => {
    if (projects.length > 0 && projectId) {
      const projectToEdit = projects.find(p => p.id === projectId);
      if (projectToEdit) {
        setProject(projectToEdit);
        setName(projectToEdit.name);
        setBrief(projectToEdit.brief);
        setMilestones(projectToEdit.milestones.map(m => ({
          id: m.id,
          title: m.title,
          description: m.description,
          price: m.price,
          status: m.status,
        })));
      }
    }
  }, [projects, projectId]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleMilestoneChange = (index: number, field: keyof MilestoneFormData, value: string | number) => {
    const newMilestones = [...milestones];
    const milestoneToUpdate = { ...newMilestones[index] };

    if (field === 'price') {
      milestoneToUpdate[field] = parseFloat(value as string) || 0;
    } else {
      (milestoneToUpdate as any)[field] = value;
    }
    newMilestones[index] = milestoneToUpdate;
    setMilestones(newMilestones);
  };

  const handleAddMilestone = () => {
    setMilestones([
      ...milestones,
      {
        title: '',
        description: '',
        price: 0,
        status: 'pending',
      },
    ]);
  };

  const handleDeleteMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !projectId) return;

    for (const milestone of milestones) {
      if (!milestone.title.trim() || !milestone.description.trim()) {
        alert('Milestone title and description cannot be empty.');
        return;
      }
    }

    setUpdating(true);
    
    const success = await updateProject(projectId, {
      name,
      brief,
      milestones,
    });

    if (success) {
      navigate('/dashboard');
    }
    
    setUpdating(false);
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

  if (!user || !project) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-slate-600">Project not found or access denied.</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">
            Return to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={profile || user} onSignOut={handleSignOut}>
      <Button
        variant="ghost"
        size="sm"
        className="mb-6 flex items-center"
        onClick={() => navigate("/dashboard")}
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Dashboard
      </Button>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Edit Project</CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectForm
              name={name}
              brief={brief}
              milestones={milestones}
              updating={updating}
              onNameChange={setName}
              onBriefChange={setBrief}
              onMilestoneChange={handleMilestoneChange}
              onAddMilestone={handleAddMilestone}
              onDeleteMilestone={handleDeleteMilestone}
              onSubmit={handleSubmit}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default EditProject;
