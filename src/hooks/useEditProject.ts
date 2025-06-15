
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useProjects, DatabaseProject } from '@/hooks/useProjects';
import { MilestoneFormData } from '@/components/EditProject/types';

export const useEditProject = (projectId: string | undefined) => {
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

  return {
    user,
    profile,
    project,
    name,
    brief,
    milestones,
    loading,
    updating,
    handleSignOut,
    handleMilestoneChange,
    handleAddMilestone,
    handleDeleteMilestone,
    handleSubmit,
    setName,
    setBrief,
  };
};

