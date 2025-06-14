
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Project, Milestone } from '@/components/ProjectCard';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

const EditProject: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [name, setName] = useState('');
  const [brief, setBrief] = useState('');
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

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

      // Load project from localStorage
      const projectsFromStorage = JSON.parse(localStorage.getItem('projects') || '[]');
      const projectToEdit = projectsFromStorage.find((p: Project) => p.id === projectId);

      if (projectToEdit) {
        setProject(projectToEdit);
        setName(projectToEdit.name);
        setBrief(projectToEdit.brief);
        setMilestones(projectToEdit.milestones);
      } else {
        toast.error('Project not found.');
        navigate('/dashboard');
      }
      
      setLoading(false);
    };

    checkAuthAndLoadProject();
  }, [projectId, navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleMilestoneChange = (index: number, field: keyof Milestone, value: string | number) => {
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
        id: `new-${Date.now()}`,
        title: '',
        description: '',
        price: 0,
        status: 'pending',
      },
    ]);
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestones(milestones.filter(m => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    for (const milestone of milestones) {
      if (!milestone.title.trim() || !milestone.description.trim()) {
        toast.error('Milestone title and description cannot be empty.');
        return;
      }
    }

    const updatedProject = { ...project, name, brief, milestones };

    const projectsFromStorage: Project[] = JSON.parse(localStorage.getItem('projects') || '[]');
    const updatedProjects = projectsFromStorage.map(p =>
      p.id === projectId ? updatedProject : p
    );

    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    toast.success('Project has been updated successfully.');
    navigate('/dashboard');
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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-slate-700">Project Name</label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. E-commerce Website Design"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="brief" className="text-sm font-medium text-slate-700">Project Brief</label>
                <Textarea
                  id="brief"
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  placeholder="A short description of the project."
                  required
                  rows={4}
                />
              </div>

              <div className="space-y-4 pt-6 border-t">
                <h3 className="text-lg font-medium text-slate-800">Milestones</h3>
                <div className="space-y-4">
                  {milestones.map((milestone, index) => (
                    <div key={milestone.id} className="p-4 border rounded-md space-y-3 bg-slate-50 relative">
                       <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7 text-slate-500 hover:bg-red-100 hover:text-red-600"
                        onClick={() => handleDeleteMilestone(milestone.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <div className="space-y-2">
                        <label htmlFor={`milestone-title-${index}`} className="text-sm font-medium text-slate-700">Title</label>
                        <Input
                          id={`milestone-title-${index}`}
                          value={milestone.title}
                          onChange={(e) => handleMilestoneChange(index, 'title', e.target.value)}
                          placeholder="e.g. Phase 1: Discovery"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor={`milestone-desc-${index}`} className="text-sm font-medium text-slate-700">Description</label>
                        <Textarea
                          id={`milestone-desc-${index}`}
                          value={milestone.description}
                          onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)}
                          placeholder="Briefly describe this milestone"
                          required
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor={`milestone-price-${index}`} className="text-sm font-medium text-slate-700">Price ($)</label>
                        <Input
                          id={`milestone-price-${index}`}
                          type="number"
                          value={milestone.price}
                          onChange={(e) => handleMilestoneChange(index, 'price', e.target.value)}
                          placeholder="e.g. 500"
                          required
                          min="0"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddMilestone}
                  className="w-full flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Milestone
                </Button>
              </div>

              <div className="flex justify-end">
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default EditProject;
