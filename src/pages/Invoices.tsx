
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n';
import { useInvoices } from '@/hooks/useInvoices';
import InvoiceTable from '@/components/Invoices/InvoiceTable';
import InvoiceFilters from '@/components/Invoices/InvoiceFilters';

const Invoices = () => {
  const t = useT();
  const {
    invoices,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    downloadPDF,
    resendInvoice,
    deleteInvoice,
    createInvoice
  } = useInvoices();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('invoices')}</h1>
              <p className="text-gray-600 mt-1">Manage and track your invoices</p>
            </div>
            <Button onClick={createInvoice} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {t('createInvoice')}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <InvoiceFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        {/* Table */}
        <InvoiceTable
          invoices={invoices}
          onDownloadPDF={downloadPDF}
          onResendInvoice={resendInvoice}
          onDeleteInvoice={deleteInvoice}
        />
      </div>
    </div>
  );
};

export default Invoices;
