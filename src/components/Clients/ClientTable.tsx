
import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, MoreHorizontal, Users } from 'lucide-react';
import { ClientWithProjectCount } from '@/types/client';
import { useT } from '@/lib/i18n';
import { useLanguage } from '@/contexts/LanguageContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/shared';

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
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  if (clients.length === 0) {
    return (
      <div className="text-center py-16">
        <EmptyState
          icon={Users}
          title={t('noClientsFound')}
          description={t('getStartedByAdding')}
        />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-100">
            <TableHead className={`text-xs font-medium text-gray-500 uppercase tracking-wide ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('clientName')}
            </TableHead>
            <TableHead className={`text-xs font-medium text-gray-500 uppercase tracking-wide ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('clientEmail')}
            </TableHead>
            <TableHead className={`text-xs font-medium text-gray-500 uppercase tracking-wide ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('connectedProjects')}
            </TableHead>
            <TableHead className={`text-xs font-medium text-gray-500 uppercase tracking-wide ${isRTL ? 'text-left' : 'text-right'}`}>
              {t('actions')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id} className="border-gray-50 hover:bg-gray-50/50">
              <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                <div className="flex items-center gap-3">
                  <div className="client-avatar">
                    <span className="text-xs font-medium text-secondary">
                      {client.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium text-gray-900">{client.name}</span>
                </div>
              </TableCell>
              <TableCell className={`text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>
                {client.email}
              </TableCell>
              <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                  {client.project_count} {client.project_count === 1 ? t('project') : t('projects')}
                </Badge>
              </TableCell>
              <TableCell className={isRTL ? 'text-left' : 'text-right'}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="w-40">
                    <DropdownMenuItem onClick={() => onViewDetails(client)}>
                      <Eye className="w-4 h-4 mr-2" />
                      {t('view')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(client)}>
                      <Edit className="w-4 h-4 mr-2" />
                      {t('edit')}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(client)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t('delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClientTable;
