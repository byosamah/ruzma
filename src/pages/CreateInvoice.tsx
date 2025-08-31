
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/hooks/core/useAuth';
import { useProfileQuery } from '@/hooks/core/useProfileQuery';
import { useInvoiceContext } from '@/contexts/InvoiceContext';
import InvoiceForm from '@/components/CreateInvoice/InvoiceForm';
import InvoicePreview from '@/components/CreateInvoice/InvoicePreview';
import { InvoiceFormData } from '@/components/CreateInvoice/types';
import { useT } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';

const CreateInvoice: React.FC = () => {
  const t = useT();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const { user, loading: authLoading, authChecked } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfileQuery(user);
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
          address: ''
        },
        currency: profile?.currency || 'USD'
      }));
    }
  }, [profile, user, generateInvoiceId]);

  // Auto-fill client data when projectId is provided
  useEffect(() => {
    const fetchProjectClient = async () => {
      if (projectId && user) {
        try {
          const { data: project } = await supabase
            .from('projects')
            .select(`
              *,
              client:clients(name, email)
            `)
            .eq('id', projectId)
            .eq('user_id', user.id)
            .maybeSingle();

          if (project) {
            let clientName = '';
            
            // Case 1: Project has a client_id with valid relationship
            if (project.client) {
              clientName = project.client.name;
            }
            // Case 2: Project has client_email but no client_id, try to find client by email
            else if (project.client_email) {
              const { data: clientByEmail } = await supabase
                .from('clients')
                .select('name, email')
                .eq('email', project.client_email)
                .eq('user_id', user.id)
                .maybeSingle();
              
              clientName = clientByEmail?.name || project.client_email;
            }

            if (clientName) {
              setInvoiceData(prev => ({
                ...prev,
                billedTo: {
                  name: clientName,
                  address: ''
                },
                selectedClientEmail: project.client?.email || project.client_email || ''
              }));
            }
          }
        } catch (error) {
          // Error handled by react-query
        }
      }
    };

    fetchProjectClient();
  }, [projectId, user]);

  // Show loading while auth is being checked
  if (!authChecked || authLoading) {
    return (
      <Layout user={user}>
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
      <Layout user={user}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user}>
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
