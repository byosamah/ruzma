
import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye } from 'lucide-react';
import { ClientWithProjectCount } from '@/types/client';
import { useT } from '@/lib/i18n';

interface ClientTableProps {
  clients: ClientWithProjectCount[];
  onEdit: (client: ClientWithProjectCount) => void;
  onDelete: (client: ClientWithProjectCount) => void;
  onViewDetails: (client: ClientWithProjectCount) => void;
}

const ClientTable: React.FC<ClientTableProps> = ({
  clients,
  onEdit,
  onDelete,
  onViewDetails
}) => {
  const t = useT();

  if (clients.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <div className="w-8 h-8 bg-gray-400 rounded-lg"></div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('noClientsFound')}</h3>
        <p className="text-gray-600">{t('getStartedByAdding')}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('clientName')}</TableHead>
            <TableHead>{t('clientEmail')}</TableHead>
            <TableHead>{t('connectedProjects')}</TableHead>
            <TableHead className="text-right">{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell className="font-medium">{client.name}</TableCell>
              <TableCell>{client.email}</TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {client.project_count} {client.project_count === 1 ? t('project') : t('projects')}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(client)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(client)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(client)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClientTable;
