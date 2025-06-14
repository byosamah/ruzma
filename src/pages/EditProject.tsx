import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Project, Milestone } from '@/components/ProjectCard';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from 'react-i18next';

const EditProject: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [name, setName] = useState('');
  const [brief, setBrief] = useState('');
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [user, setUser] = useState<any>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));

    const projectsFromStorage = JSON.parse(localStorage.getItem('projects') || '[]');
    const projectToEdit = projectsFromStorage.find((p: Project) => p.id === projectId);

    if (projectToEdit) {
      setProject(projectToEdit);
      setName(projectToEdit.name);
      setBrief(projectToEdit.brief);
      setMilestones(projectToEdit.milestones);
    } else {
      toast({
        title: "Error",
        description: "Project not found.",
        variant: "destructive",
      })
      navigate('/dashboard');
    }
  }, [projectId, navigate, toast]);

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
        toast({
          title: 'Validation Error',
          description: 'Milestone title and description cannot be empty.',
          variant: 'destructive',
        });
        return;
      }
    }

    const updatedProject = { ...project, name, brief, milestones };

    const projectsFromStorage: Project[] = JSON.parse(localStorage.getItem('projects') || '[]');
    const updatedProjects = projectsFromStorage.map(p =>
      p.id === projectId ? updatedProject : p
    );

    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    toast({
      title: "Success!",
      description: "Project has been updated successfully.",
    });
    navigate('/dashboard');
  };

  if (!project) {
    return (
      <Layout user={user}>
        <div>Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout user={user}>
      <Button
        variant="ghost"
        size="sm"
        className="mb-6 flex items-center"
        onClick={() => navigate("/dashboard")}
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        {t('editProject.backToDashboard')}
      </Button>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{t('editProject.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-slate-700">{t('editProject.projectName')}</label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('editProject.projectNamePlaceholder')}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="brief" className="text-sm font-medium text-slate-700">{t('editProject.projectBrief')}</label>
                <Textarea
                  id="brief"
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  placeholder={t('editProject.projectBriefPlaceholder')}
                  required
                  rows={4}
                />
              </div>

              <div className="space-y-4 pt-6 border-t">
                <h3 className="text-lg font-medium text-slate-800">{t('editProject.milestonesTitle')}</h3>
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
                        <label htmlFor={`milestone-title-${index}`} className="text-sm font-medium text-slate-700">{t('editProject.milestoneTitle')}</label>
                        <Input
                          id={`milestone-title-${index}`}
                          value={milestone.title}
                          onChange={(e) => handleMilestoneChange(index, 'title', e.target.value)}
                          placeholder={t('editProject.milestoneTitlePlaceholder')}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor={`milestone-desc-${index}`} className="text-sm font-medium text-slate-700">{t('editProject.milestoneDescription')}</label>
                        <Textarea
                          id={`milestone-desc-${index}`}
                          value={milestone.description}
                          onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)}
                          placeholder={t('editProject.milestoneDescriptionPlaceholder')}
                          required
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor={`milestone-price-${index}`} className="text-sm font-medium text-slate-700">{t('editProject.milestonePrice')}</label>
                        <Input
                          id={`milestone-price-${index}`}
                          type="number"
                          value={milestone.price}
                          onChange={(e) => handleMilestoneChange(index, 'price', e.target.value)}
                          placeholder={t('editProject.milestonePricePlaceholder')}
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
                  {t('editProject.addMilestone')}
                </Button>
              </div>
              <div className="flex justify-end">
                <Button type="submit">{t('editProject.saveChanges')}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default EditProject;
