
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useInvoices } from '@/hooks/useInvoices';
import { useAuth } from '@/hooks/core/useAuth';
import { useUserProfile } from '@/hooks/core/useUserProfile';
import { useT } from '@/lib/i18n';
import InvoicesHeader from '@/components/Invoices/InvoicesHeader';
import InvoicesStats from '@/components/Invoices/InvoicesStats';
import InvoicesSection from '@/components/Invoices/InvoicesSection';

const Invoices: React.FC = () => {
  const navigate = useNavigate();
  const t = useT();
  const {
    user,
    loading: authLoading,
    authChecked
  } = useAuth();
  const {
    profile,
    loading: profileLoading
  } = useUserProfile(user);
  const {
    invoices,
    loading: invoicesLoading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    handleDownloadPDF,
    handleSendToClient,
    handleDeleteInvoice
  } = useInvoices();

  // Show loading while auth is being checked
  if (!authChecked || authLoading) {
    return <Layout user={profile || user}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
        </div>
      </Layout>;
  }

  // Redirect to login if not authenticated (only after auth check is complete)
  if (authChecked && !user) {
    navigate('/login');
    return null;
  }

  // Show loading for other data
  if (profileLoading || invoicesLoading) {
    return <Layout user={profile || user}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
        </div>
      </Layout>;
  }

  const handleCreateInvoice = () => {
    navigate('/create-invoice');
  };

  return (
    <Layout user={profile || user}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <InvoicesHeader />
          <Button onClick={handleCreateInvoice} className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg">
            <Plus className="w-4 h-4 mr-2" />
            {t('newInvoice')}
          </Button>
        </div>

        <InvoicesStats invoices={invoices} user={user} />

        <InvoicesSection
          invoices={invoices}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          handleDownloadPDF={handleDownloadPDF}
          handleSendToClient={handleSendToClient}
          handleDeleteInvoice={handleDeleteInvoice}
        />
      </div>
    </Layout>
  );
};

export default Invoices;
