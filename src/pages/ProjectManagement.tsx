
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import MilestoneCard from "@/components/MilestoneCard";
import { Project, Milestone } from "@/components/ProjectCard";
import { ArrowLeft } from "lucide-react";

const ProjectManagement: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [user, setUser] = useState<any>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(userData));

    // Load all projects from dashboard demo or storage
    // In a real app, fetch from an API or supabase
    let projects: Project[] = [];
    if (localStorage.getItem("projects")) {
      projects = JSON.parse(localStorage.getItem("projects")!);
    } else {
      // fallback to demo (same as Dashboard default)
      projects = [
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
    }
    setAllProjects(projects);
    const found = projects.find((p) => p.id === projectId);
    setProject(found || null);
  }, [projectId, navigate]);

  // Update project milestone status (approve/reject)
  const updateMilestoneStatus = (milestoneId: string, newStatus: Milestone["status"]) => {
    if (!project) return;
    const updatedMilestones = project.milestones.map(milestone =>
      milestone.id === milestoneId ? { ...milestone, status: newStatus } : milestone
    );
    const updatedProject = { ...project, milestones: updatedMilestones };
    setProject(updatedProject);

    // Persist to allProjects/localStorage for demo
    const updatedProjects = allProjects.map(p =>
      p.id === project.id ? updatedProject : p
    );
    setAllProjects(updatedProjects);
    localStorage.setItem("projects", JSON.stringify(updatedProjects));
  };

  if (!user) return <div>Loading...</div>;
  if (!project)
    return (
      <Layout user={user}>
        <div className="max-w-xl mx-auto text-center mt-20">
          <h2 className="text-2xl font-bold mb-2">Project not found</h2>
          <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
        </div>
      </Layout>
    );

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
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="p-5 rounded-lg bg-white/80 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">{project.name}</h1>
          <p className="text-slate-600 mb-4">{project.brief}</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Project ID: {project.id}</span>
            <span className="text-slate-500">
              Created: {project.createdAt}
            </span>
          </div>
          <div className="mt-4">
            <a
              href={project.clientUrl}
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
                  milestone={milestone}
                  onApprove={
                    milestone.status === "payment_submitted"
                      ? (mId) => updateMilestoneStatus(mId, "approved")
                      : undefined
                  }
                  onReject={
                    milestone.status === "payment_submitted"
                      ? (mId) => updateMilestoneStatus(mId, "rejected")
                      : undefined
                  }
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
