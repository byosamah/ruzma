/**
 * Clients App Component
 *
 * macOS Contacts-style window for managing clients.
 * Features:
 * - Client list with search
 * - Client details panel
 * - Add/Edit/Delete dialogs
 * - Client statistics
 *
 * This replaces the Clients page in macOS mode.
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useClients } from '@/hooks/useClients';
import { useAuth } from '@/hooks/core/useAuth';
import { useT } from '@/lib/i18n';
import ClientsHeader from '@/components/Clients/ClientsHeader';
import ClientsStats from '@/components/Clients/ClientsStats';
import ClientsSection from '@/components/Clients/ClientsSection';
import AddClientDialog from '@/components/Clients/AddClientDialog';
import EditClientDialog from '@/components/Clients/EditClientDialog';
import DeleteClientDialog from '@/components/Clients/DeleteClientDialog';
import ClientDetailsDialog from '@/components/Clients/ClientDetailsDialog';
import { ClientWithProjectCount } from '@/types/client';

// =============================================================================
// TYPES
// =============================================================================

interface ClientsAppProps {
  /** Window ID (passed by WindowRenderer) */
  windowId?: string;
  /** Optional data passed when opening window */
  data?: Record<string, unknown>;
}

// =============================================================================
// LOADING COMPONENT
// =============================================================================

function ClientsLoading() {
  const t = useT();
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4" />
      <p className="text-sm text-gray-500">{t('loadingClients') || 'Loading clients...'}</p>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ClientsApp({ windowId, data }: ClientsAppProps) {
  const { dir } = useLanguage();
  const t = useT();
  const isRTL = dir === 'rtl';

  // Auth & data
  const { user } = useAuth();
  const { clients, loading, createClient, updateClient, deleteClient } = useClients(user);

  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientWithProjectCount | null>(null);

  // Handlers
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

  // Show loading state
  if (loading) {
    return <ClientsLoading />;
  }

  return (
    <div
      className={cn(
        'clients-app h-full overflow-y-auto',
        'bg-white/50',
        isRTL && 'text-right'
      )}
      style={{ direction: dir }}
    >
      <div className="p-4 space-y-4">
        {/* Header */}
        <ClientsHeader />

        {/* Statistics */}
        <ClientsStats clients={clients} />

        {/* Clients List/Table */}
        <ClientsSection
          clients={clients}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewDetails={handleViewDetails}
          onAddClient={() => setShowAddDialog(true)}
        />
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
  );
}

export default ClientsApp;
