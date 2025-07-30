
import React, { useEffect } from 'react';
import { InvoiceFormData } from './types';
import InvoiceHeader from './InvoiceHeader';
import BillingInformation from './BillingInformation';
import CurrencySelection from './CurrencySelection';
import ProjectSelection from './ProjectSelection';
import LineItemsSection from './LineItemsSection';
import InvoiceActions from './InvoiceActions';
import { useInvoiceCalculations } from './hooks/useInvoiceCalculations';
import { useInvoiceValidation } from './hooks/useInvoiceValidation';
import { useAuth } from '@/hooks/dashboard/useAuth';
import { useProjects } from '@/hooks/useProjects';

interface InvoiceFormProps {
  invoiceData: InvoiceFormData;
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceFormData>>;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoiceData, setInvoiceData }) => {
  const [showTaxInput, setShowTaxInput] = React.useState(false);
  const { user } = useAuth();
  const { projects } = useProjects(user);
  
  // Get projectId from URL params if present
  const [searchParams] = React.useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return [urlParams];
  }, []);
  
  const projectIdFromUrl = searchParams.get('projectId');

  const updateField = (field: keyof InvoiceFormData, value: any) => {
    setInvoiceData(prev => ({ ...prev, [field]: value }));
  };

  const updateAddressField = (section: 'billedTo' | 'payTo', field: 'name' | 'address', value: string) => {
    setInvoiceData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Auto-populate project data from URL parameter
  useEffect(() => {
    if (projectIdFromUrl && projects.length > 0 && !invoiceData.projectId) {
      const selectedProject = projects.find(p => p.id === projectIdFromUrl);
      if (selectedProject) {
        // Set the project ID
        setInvoiceData(prev => ({ ...prev, projectId: projectIdFromUrl }));
        
        // Auto-populate client information if available
        if (selectedProject.client_email) {
          setInvoiceData(prev => ({
            ...prev,
            billedTo: {
              ...prev.billedTo,
              name: selectedProject.client_email || ''
            }
          }));
        }
      }
    }
  }, [projectIdFromUrl, projects, invoiceData.projectId, setInvoiceData]);

  // Populate line items with project milestones when project is selected
  useEffect(() => {
    if (invoiceData.projectId && projects.length > 0) {
      const selectedProject = projects.find(p => p.id === invoiceData.projectId);
      if (selectedProject && selectedProject.milestones && selectedProject.milestones.length > 0) {
        const milestoneLineItems = selectedProject.milestones.map((milestone) => ({
          id: milestone.id,
          description: milestone.title,
          quantity: 1,
          amount: Number(milestone.price) || 0
        }));
        
        // Calculate totals
        const subtotal = milestoneLineItems.reduce((sum, item) => sum + (item.quantity * item.amount), 0);
        
        setInvoiceData(prev => ({
          ...prev,
          lineItems: milestoneLineItems,
          subtotal,
          total: subtotal + prev.tax
        }));
      }
    }
  }, [invoiceData.projectId, projects, setInvoiceData]);

  const {
    updateLineItem,
    addLineItem,
    removeLineItem,
    updateTax
  } = useInvoiceCalculations(invoiceData, setInvoiceData);

  const { handleSend, isLoading } = useInvoiceValidation(invoiceData);

  return (
    <div className="space-y-6">
      <InvoiceHeader 
        invoiceData={invoiceData}
        updateField={updateField}
      />

      <BillingInformation 
        invoiceData={invoiceData}
        updateAddressField={updateAddressField}
      />

      <CurrencySelection 
        invoiceData={invoiceData}
        updateField={updateField}
      />

      <ProjectSelection 
        invoiceData={invoiceData}
        updateField={updateField}
      />

      <LineItemsSection 
        invoiceData={invoiceData}
        updateLineItem={updateLineItem}
        addLineItem={addLineItem}
        removeLineItem={removeLineItem}
        updateTax={updateTax}
        showTaxInput={showTaxInput}
        setShowTaxInput={setShowTaxInput}
      />

      <InvoiceActions 
        onSend={handleSend}
        isLoading={isLoading}
      />
    </div>
  );
};

export default InvoiceForm;
