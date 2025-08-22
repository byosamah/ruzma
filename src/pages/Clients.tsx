
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useClients } from '@/hooks/useClients';
import { useAuth } from '@/hooks/core/useAuth';
import { useProfileQuery } from '@/hooks/core/useProfileQuery';
import ClientsHeader from '@/components/Clients/ClientsHeader';
import ClientsStats from '@/components/Clients/ClientsStats';
import ClientsSection from '@/components/Clients/ClientsSection';
import AddClientDialog from '@/components/Clients/AddClientDialog';
import EditClientDialog from '@/components/Clients/EditClientDialog';
import DeleteClientDialog from '@/components/Clients/DeleteClientDialog';
import ClientDetailsDialog from '@/components/Clients/ClientDetailsDialog';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { ClientWithProjectCount } from '@/types/client';
import { useT } from '@/lib/i18n';

const Clients: React.FC = () => {
  const navigate = useNavigate();
  const t = useT();
  const { user, loading: authLoading, authChecked } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfileQuery(user);
  const { clients, loading: clientsLoading, createClient, updateClient, deleteClient } = useClients(user);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientWithProjectCount | null>(null);

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

  // Show loading while auth is being checked with better styling
  if (!authChecked || authLoading) {
    return (
      <Layout user={profile || user}>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <LoadingSpinner 
            size="md" 
            message="Checking authentication..." 
            className="min-h-[40vh] justify-center"
          />
        </div>
      </Layout>
    );
  }

  // Redirect to login if not authenticated (only after auth check is complete)
  if (authChecked && !user) {
    navigate('/login');
    return null;
  }

  // Show loading only when actually loading data
  if (clientsLoading) {
    return (
      <Layout user={profile || user}>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <ClientsHeader />
          <LoadingSpinner 
            size="md" 
            message="Loading your clients..." 
            className="min-h-[40vh] justify-center"
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={profile || user}>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8">
        <ClientsHeader />
        <ClientsStats clients={clients} />
        <ClientsSection
          clients={clients}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewDetails={handleViewDetails}
          onAddClient={() => setShowAddDialog(true)}
        />

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
