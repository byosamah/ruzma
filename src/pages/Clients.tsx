
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Mail, FolderOpen } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { useAuth } from '@/hooks/dashboard/useAuth';
import { useUserProfile } from '@/hooks/dashboard/useUserProfile';
import ClientFilters from '@/components/Clients/ClientFilters';
import ClientTable from '@/components/Clients/ClientTable';
import AddClientDialog from '@/components/Clients/AddClientDialog';
import EditClientDialog from '@/components/Clients/EditClientDialog';
import DeleteClientDialog from '@/components/Clients/DeleteClientDialog';
import ClientDetailsDialog from '@/components/Clients/ClientDetailsDialog';
import { ClientWithProjectCount } from '@/types/client';

const Clients: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, authChecked } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile(user);
  const { clients, loading: clientsLoading, createClient, updateClient, deleteClient } = useClients(user);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientWithProjectCount | null>(null);

  // Filter clients based on search term
  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return clients;
    
    const term = searchTerm.toLowerCase();
    return clients.filter(client => 
      client.name.toLowerCase().includes(term) ||
      client.email.toLowerCase().includes(term)
    );
  }, [clients, searchTerm]);

  // Calculate stats
  const totalClients = clients.length;
  const totalProjects = clients.reduce((sum, client) => sum + client.project_count, 0);
  const averageProjectsPerClient = totalClients > 0 ? (totalProjects / totalClients).toFixed(1) : '0';

  const handleEdit = (client: ClientWithProjectCount) => {
    setSelectedClient(client);
    setShowEditDialog(true);
  };

  const handleDelete = (client: ClientWithProjectCount) => {
    setSelectedClient(client);
    setShowDeleteDialog(true);
  };

  const handleViewDetails = (client: ClientWithProjectCount) => {
    setSelectedClient(client);
    setShowDetailsDialog(true);
  };

  const handleDeleteConfirm = async (clientId: string) => {
    return await deleteClient(clientId);
  };

  // Show loading while auth is being checked
  if (!authChecked || authLoading) {
    return (
      <Layout user={profile || user}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  // Redirect to login if not authenticated (only after auth check is complete)
  if (authChecked && !user) {
    navigate('/login');
    return null;
  }

  // Show loading for other data
  if (profileLoading || clientsLoading) {
    return (
      <Layout user={profile || user}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={profile || user}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-1">Manage your client relationships and projects</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Clients</p>
                  <p className="text-2xl font-bold text-gray-900">{totalClients}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FolderOpen className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{totalProjects}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Mail className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg Projects/Client</p>
                  <p className="text-2xl font-bold text-gray-900">{averageProjectsPerClient}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Clients Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Clients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ClientFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onAddClient={() => setShowAddDialog(true)}
            />
            
            <ClientTable
              clients={filteredClients}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewDetails={handleViewDetails}
            />
          </CardContent>
        </Card>

        {/* Dialogs */}
        <AddClientDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onSubmit={createClient}
        />

        <EditClientDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          client={selectedClient}
          onSubmit={updateClient}
        />

        <DeleteClientDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          client={selectedClient}
          onConfirm={handleDeleteConfirm}
        />

        <ClientDetailsDialog
          open={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
          client={selectedClient}
        />
      </div>
    </Layout>
  );
};

export default Clients;
