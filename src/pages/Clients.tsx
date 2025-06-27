
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Mail, FolderOpen } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { useAuth } from '@/hooks/dashboard/useAuth';
import { useUserProfile } from '@/hooks/dashboard/useUserProfile';
import { useT } from '@/lib/i18n';
import ClientFilters from '@/components/Clients/ClientFilters';
import ClientTable from '@/components/Clients/ClientTable';
import AddClientDialog from '@/components/Clients/AddClientDialog';
import EditClientDialog from '@/components/Clients/EditClientDialog';
import DeleteClientDialog from '@/components/Clients/DeleteClientDialog';
import ClientDetailsDialog from '@/components/Clients/ClientDetailsDialog';
import { ClientWithProjectCount } from '@/types/client';

const Clients: React.FC = () => {
  const navigate = useNavigate();
  const t = useT();
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
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-medium text-gray-900">{t('clients')}</h1>
          <p className="text-sm text-gray-500">{t('manageClientRelationships')}</p>
        </div>

        {/* Stats Cards - Minimal Design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50/50 rounded-lg p-4 border border-gray-100/50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                <Users className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">{t('totalClients')}</p>
                <p className="text-xl font-medium text-gray-900">{totalClients}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50/50 rounded-lg p-4 border border-gray-100/50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                <FolderOpen className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">{t('totalProjects')}</p>
                <p className="text-xl font-medium text-gray-900">{totalProjects}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50/50 rounded-lg p-4 border border-gray-100/50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                <Mail className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">{t('avgProjectsPerClient')}</p>
                <p className="text-xl font-medium text-gray-900">{averageProjectsPerClient}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Clients Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">{t('allClients')}</h2>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200/60">
            <div className="p-4 border-b border-gray-100">
              <ClientFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onAddClient={() => setShowAddDialog(true)}
              />
            </div>
            
            <div className="p-4">
              <ClientTable
                clients={filteredClients}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewDetails={handleViewDetails}
              />
            </div>
          </div>
        </div>

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
