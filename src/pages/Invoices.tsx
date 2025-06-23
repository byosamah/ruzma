
import React from 'react';
import Layout from '@/components/Layout';
import { useT } from '@/lib/i18n';
import { useInvoices } from '@/hooks/useInvoices';
import InvoiceFilters from '@/components/Invoices/InvoiceFilters';
import InvoiceTable from '@/components/Invoices/InvoiceTable';
import { useAuth } from '@/hooks/dashboard/useAuth';

const Invoices: React.FC = () => {
  const t = useT();
  const { user } = useAuth();
  const {
    invoices,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    handleDownloadPDF,
    handleResendInvoice,
    handleDeleteInvoice,
    handleCreateInvoice
  } = useInvoices();

  return (
    <Layout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('invoices')}</h1>
          <p className="text-gray-600 mt-2">
            Manage and track all your invoices in one place.
          </p>
        </div>

        <InvoiceFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          onCreateInvoice={handleCreateInvoice}
        />

        <InvoiceTable
          invoices={invoices}
          onDownloadPDF={handleDownloadPDF}
          onResendInvoice={handleResendInvoice}
          onDeleteInvoice={handleDeleteInvoice}
        />
      </div>
    </Layout>
  );
};

export default Invoices;
