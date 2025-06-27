
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Invoice, InvoiceStatus } from '@/hooks/useInvoices';
import { useT } from '@/lib/i18n';
import InvoiceFilters from './InvoiceFilters';
import InvoiceTable from './InvoiceTable';

interface InvoicesSectionProps {
  invoices: Invoice[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: InvoiceStatus | 'all';
  setStatusFilter: (value: InvoiceStatus | 'all') => void;
  handleDownloadPDF: (id: string) => Promise<void>;
  handleSendToClient: (id: string) => void;
  handleDeleteInvoice: (id: string) => void;
}

const InvoicesSection: React.FC<InvoicesSectionProps> = ({
  invoices,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  handleDownloadPDF,
  handleSendToClient,
  handleDeleteInvoice
}) => {
  const t = useT();

  return (
    <Card className="border-0 shadow-none bg-white">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">{t('allInvoices')}</h2>
        </div>
        
        <InvoiceFilters 
          searchTerm={searchTerm} 
          onSearchChange={setSearchTerm} 
          statusFilter={statusFilter} 
          onStatusChange={setStatusFilter} 
        />
        
        <InvoiceTable 
          invoices={invoices} 
          onDownloadPDF={handleDownloadPDF} 
          onSendToClient={handleSendToClient} 
          onDeleteInvoice={handleDeleteInvoice} 
        />
      </CardContent>
    </Card>
  );
};

export default InvoicesSection;
