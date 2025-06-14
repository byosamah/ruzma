
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';
import { Plus, Trash2, Upload } from 'lucide-react';
import { Milestone } from '@/components/ProjectCard';

const CreateProject = () => {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    brief: ''
  });
  const [milestones, setMilestones] = useState<Milestone[]>([{
    id: '1',
    title: '',
    description: '',
    price: 0,
    status: 'pending' as const
  }]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleMilestoneChange = (index: number, field: keyof Milestone, value: any) => {
    setMilestones(prev => prev.map((milestone, i) => 
      i === index ? { ...milestone, [field]: value } : milestone
    ));
  };

  const addMilestone = () => {
    const newMilestone: Milestone = {
      id: Date.now().toString(),
      title: '',
      description: '',
      price: 0,
      status: 'pending'
    };
    setMilestones(prev => [...prev, newMilestone]);
  };

  const removeMilestone = (index: number) => {
    if (milestones.length > 1) {
      setMilestones(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleFileUpload = (index: number, file: File) => {
    setMilestones(prev => prev.map((milestone, i) => 
      i === index ? { ...milestone, deliverable: file } : milestone
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate form
    if (!formData.name.trim() || !formData.brief.trim()) {
      alert('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    if (milestones.some(m => !m.title.trim() || !m.description.trim() || m.price <= 0)) {
      alert('Please complete all milestone details');
      setIsLoading(false);
      return;
    }

    // Simulate project creation
    setTimeout(() => {
      console.log('Creating project:', { formData, milestones });
      navigate('/dashboard');
    }, 1000);
  };

  const handleSignOut = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Layout user={user} onSignOut={handleSignOut}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Create New Project</h1>
          <p className="text-slate-600 mt-2">Set up your project milestones and deliverables</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Project Details */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter project name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brief">Project Brief *</Label>
                <Textarea
                  id="brief"
                  name="brief"
                  placeholder="Describe the project scope and objectives"
                  value={formData.brief}
                  onChange={handleFormChange}
                  rows={4}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Project Milestones</CardTitle>
                <Button type="button" onClick={addMilestone} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Milestone
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {milestones.map((milestone, index) => (
                <div key={milestone.id} className="p-4 border border-slate-200 rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-slate-800">Milestone {index + 1}</h3>
                    {milestones.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMilestone(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Milestone Title *</Label>
                      <Input
                        placeholder="Enter milestone title"
                        value={milestone.title}
                        onChange={(e) => handleMilestoneChange(index, 'title', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Price (USD) *</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={milestone.price || ''}
                        onChange={(e) => handleMilestoneChange(index, 'price', parseFloat(e.target.value) || 0)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description *</Label>
                    <Textarea
                      placeholder="Describe what will be delivered in this milestone"
                      value={milestone.description}
                      onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Deliverable File (Optional)</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        className="hidden"
                        id={`deliverable-${index}`}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(index, file);
                        }}
                      />
                      <label htmlFor={`deliverable-${index}`}>
                        <Button asChild type="button" variant="outline" size="sm">
                          <span className="cursor-pointer flex items-center">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload File
                          </span>
                        </Button>
                      </label>
                      {milestone.deliverable && (
                        <span className="text-sm text-slate-600">{milestone.deliverable.name}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateProject;
