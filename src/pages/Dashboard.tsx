
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';
import ProjectCard, { Project } from '@/components/ProjectCard';
import { Plus, Briefcase, DollarSign, Clock, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));

    // Load projects from localStorage or use demo projects as fallback
    const storedProjects = localStorage.getItem('projects');
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects));
    } else {
      // Load demo projects
      const demoProjects: Project[] = [
        {
          id: '1',
          name: 'E-commerce Website Design',
          brief: 'Complete e-commerce platform with payment integration and admin dashboard.',
          milestones: [
            {
              id: '1',
              title: 'UI/UX Design',
              description: 'Wireframes and high-fidelity mockups',
              price: 800,
              status: 'approved'
            },
            {
              id: '2',
              title: 'Frontend Development',
              description: 'React-based responsive frontend',
              price: 1200,
              status: 'payment_submitted'
            },
            {
              id: '3',
              title: 'Backend & Deployment',
              description: 'API development and hosting setup',
              price: 1000,
              status: 'pending'
            }
          ],
          createdAt: '2024-01-15',
          clientUrl: `/client/project/1`
        },
        {
          id: '2',
          name: 'Brand Identity Package',
          brief: 'Complete brand identity including logo, colors, and style guide.',
          milestones: [
            {
              id: '4',
              title: 'Logo Design',
              description: 'Primary logo and variations',
              price: 500,
              status: 'approved'
            },
            {
              id: '5',
              title: 'Brand Guidelines',
              description: 'Color palette, typography, usage guidelines',
              price: 300,
              status: 'approved'
            }
          ],
          createdAt: '2024-01-10',
          clientUrl: `/client/project/2`
        }
      ];
      setProjects(demoProjects);
      localStorage.setItem('projects', JSON.stringify(demoProjects));
    }
  }, [navigate]);

  const handleSignOut = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const handleEditProject = (project: Project) => {
    navigate(`/edit-project/${project.id}`);
  };

  const handleDeleteProject = (projectId: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      const updatedProjects = projects.filter(p => p.id !== projectId);
      setProjects(updatedProjects);
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
    }
  };

  // Calculate stats
  const totalProjects = projects.length;
  const totalMilestones = projects.reduce((sum, project) => sum + project.milestones.length, 0);
  const completedMilestones = projects.reduce((sum, project) => 
    sum + project.milestones.filter(m => m.status === 'approved').length, 0);
  const pendingPayments = projects.reduce((sum, project) => 
    sum + project.milestones.filter(m => m.status === 'payment_submitted').length, 0);
  const totalEarnings = projects.reduce((sum, project) => 
    sum + project.milestones.filter(m => m.status === 'approved').reduce((mSum, m) => mSum + m.price, 0), 0);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Layout user={user} onSignOut={handleSignOut}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Welcome back, {user.name}!</h1>
            <p className="text-slate-600 mt-1">Manage your freelance projects and track payments</p>
          </div>
          <Button onClick={() => navigate('/create-project')} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            New Project
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-secondary text-secondary-foreground">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Briefcase className="w-4 h-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProjects}</div>
              <p className="text-xs">Active projects</p>
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="w-4 h-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalEarnings.toLocaleString()}</div>
              <p className="text-xs">From completed milestones</p>
            </CardContent>
          </Card>

          <Card className="bg-accent text-accent-foreground">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <Clock className="w-4 h-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingPayments}</div>
              <p className="text-xs">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card className="bg-secondary text-secondary-foreground">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="w-4 h-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedMilestones}/{totalMilestones}</div>
              <p className="text-xs">Milestones completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Projects Grid */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800">Your Projects</h2>
            {projects.length === 0 && (
              <Button onClick={() => navigate('/create-project')} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Project
              </Button>
            )}
          </div>

          {projects.length === 0 ? (
            <Card className="text-center py-12 bg-white/80 backdrop-blur-sm">
              <CardContent>
                <Briefcase className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">No Projects Yet</h3>
                <p className="text-slate-600 mb-6">Create your first project to start managing client deliverables</p>
                <Button onClick={() => navigate('/create-project')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={handleEditProject}
                  onDelete={handleDeleteProject}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
