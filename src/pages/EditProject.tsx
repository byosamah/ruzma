
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Project } from '@/components/ProjectCard';
import { ArrowLeft } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast"

const EditProject: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [name, setName] = useState('');
  const [brief, setBrief] = useState('');
  const [user, setUser] = useState<any>(null);

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
    } else {
      toast({
        title: "Error",
        description: "Project not found.",
        variant: "destructive",
      })
      navigate('/dashboard');
    }
  }, [projectId, navigate, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    const updatedProject = { ...project, name, brief };

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
