
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/hooks/dashboard/useAuth';
import { useUserProfile } from '@/hooks/dashboard/useUserProfile';
import InvoiceForm from '@/components/CreateInvoice/InvoiceForm';
import InvoicePreview from '@/components/CreateInvoice/InvoicePreview';
import { InvoiceFormData } from '@/components/CreateInvoice/types';
import { InvoiceProvider, useInvoiceContext } from '@/contexts/InvoiceContext';

const CreateInvoiceContent: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, authChecked } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile(user);
  const { generateInvoiceId } = useInvoiceContext();

  const [invoiceData, setInvoiceData] = useState<InvoiceFormData>({
    invoiceId: '',
    invoiceDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    purchaseOrder: '',
    paymentTerms: 'Net 30',
    billedTo: {
      name: '',
      address: ''
    },
    payTo: {
      name: profile?.full_name || '',
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

  // Auto-generate invoice ID when component mounts
  useEffect(() => {
    if (!invoiceData.invoiceId) {
      setInvoiceData(prev => ({
        ...prev,
        invoiceId: generateInvoiceId()
      }));
    }
  }, [generateInvoiceId, invoiceData.invoiceId]);

  // Pre-fill user information when profile loads
  useEffect(() => {
    if (profile && !invoiceData.payTo.name) {
      setInvoiceData(prev => ({
        ...prev,
        payTo: {
          ...prev.payTo,
          name: profile.full_name || ''
        }
      }));
    }
  }, [profile, invoiceData.payTo.name]);

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
          <h1 className="text-3xl font-bold text-gray-900">Create Invoice</h1>
          <p className="text-gray-600 mt-1">Create and send professional invoices to your clients</p>
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

const CreateInvoice: React.FC = () => {
  return (
    <InvoiceProvider>
      <CreateInvoiceContent />
    </InvoiceProvider>
  );
};

export default CreateInvoice;
