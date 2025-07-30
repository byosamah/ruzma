
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/hooks/dashboard/useAuth';
import { useUserProfile } from '@/hooks/dashboard/useUserProfile';
import { useInvoiceContext } from '@/contexts/InvoiceContext';
import InvoiceForm from '@/components/CreateInvoice/InvoiceForm';
import InvoicePreview from '@/components/CreateInvoice/InvoicePreview';
import { InvoiceFormData } from '@/components/CreateInvoice/types';
import { useT } from '@/lib/i18n';

const CreateInvoice: React.FC = () => {
  const t = useT();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const { user, loading: authLoading, authChecked } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile(user);
  const { generateInvoiceId } = useInvoiceContext();

  const [invoiceData, setInvoiceData] = useState<InvoiceFormData>({
    invoiceId: '',
    invoiceDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    purchaseOrder: '',
    paymentTerms: '',
    billedTo: {
      name: '',
      address: ''
    },
    payTo: {
      name: '',
      address: ''
    },
    currency: 'USD',
    lineItems: [
      {
        id: '1',
        description: '',
        quantity: 1,
        amount: 0
      }
    ],
    subtotal: 0,
    tax: 0,
    total: 0,
    logoUrl: null
  });

  // Auto-generate invoice ID and pre-fill user data when component mounts
  useEffect(() => {
    if (profile || user) {
      setInvoiceData(prev => ({
        ...prev,
        invoiceId: prev.invoiceId || generateInvoiceId(),
        payTo: {
          name: profile?.full_name || user?.user_metadata?.full_name || '',
          address: profile?.business_address || ''
        },
        currency: profile?.currency || 'USD'
      }));
    }
  }, [profile, user, generateInvoiceId]);

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

  // Redirect to login if not authenticated
  if (authChecked && !user) {
    navigate('/login');
    return null;
  }

  // Show loading for other data
  if (profileLoading) {
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
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('createInvoice')}</h1>
          <p className="text-gray-600 mt-1">{t('createInvoiceDescription')}</p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <InvoiceForm 
            invoiceData={invoiceData}
            setInvoiceData={setInvoiceData}
          />

          {/* Preview Section */}
          <InvoicePreview 
            invoiceData={invoiceData}
          />
        </div>
      </div>
    </Layout>
  );
};

export default CreateInvoice;
