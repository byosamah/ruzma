
import { useLanguageNavigation } from '@/hooks/useLanguageNavigation';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
// Icons replaced with emojis
import { useInvoices } from '@/hooks/useInvoices';
import { useAuth } from '@/hooks/core/useAuth';
import { useProfileQuery } from '@/hooks/core/useProfileQuery';
import { useT } from '@/lib/i18n';
import { UserProfile } from '@/types/profile';
import InvoicesHeader from '@/components/Invoices/InvoicesHeader';
import InvoicesStats from '@/components/Invoices/InvoicesStats';
import InvoicesSection from '@/components/Invoices/InvoicesSection';

const Invoices = () => {
  const { navigate } = useLanguageNavigation();
  const t = useT();
  const {
    user,
    loading: authLoading,
    authChecked
  } = useAuth();
  const {
    data: profile,
    isLoading: profileLoading
  } = useProfileQuery(user);
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
    return <Layout user={user}>
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
    return <Layout user={user}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
        </div>
      </Layout>;
  }

  const handleCreateInvoice = () => {
    navigate('/create-invoice');
  };

  return (
    <Layout user={user}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <InvoicesHeader />
          <Button onClick={handleCreateInvoice} className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-3 sm:py-2 rounded-lg mobile-touch-target">
            <span className="text-lg mr-2">🧾</span>
            {t('newInvoice')}
          </Button>
        </div>

        <InvoicesStats invoices={invoices} profile={profile as UserProfile} />

        <InvoicesSection
          invoices={invoices}
          profile={profile as UserProfile}
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
