
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
import { calculateProjectDates } from '@/lib/projectDateUtils';

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

  // Helper function to populate invoice data from project
  const populateInvoiceFromProject = (projectId: string, isFromUrl = false) => {
    const selectedProject = projects.find(p => p.id === projectId);
    if (selectedProject) {
      // Calculate project dates from milestones
      const projectDates = calculateProjectDates(selectedProject.milestones || []);
      
      // Extract client name from email or use email as fallback
      const clientName = selectedProject.client_email 
        ? selectedProject.client_email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        : '';
      
      // Create milestone line items
      const milestoneLineItems = selectedProject.milestones?.map((milestone) => ({
        id: milestone.id,
        description: milestone.title,
        quantity: 1,
        amount: Number(milestone.price) || 0
      })) || [];
      
      // Calculate totals
      const subtotal = milestoneLineItems.reduce((sum, item) => sum + (item.quantity * item.amount), 0);
      
      // Set invoice date and due date (only for URL-based population to avoid overriding user input)
      const invoiceDate = isFromUrl && projectDates.start_date 
        ? new Date(projectDates.start_date) 
        : invoiceData.invoiceDate;
      const dueDate = isFromUrl && projectDates.end_date 
        ? new Date(projectDates.end_date) 
        : invoiceData.dueDate;
      
      // Update invoice data
      setInvoiceData(prev => ({
        ...prev,
        projectId,
        ...(isFromUrl && { invoiceDate, dueDate }),
        currency: selectedProject.currency || selectedProject.freelancer_currency || prev.currency,
        billedTo: {
          ...prev.billedTo,
          name: clientName || selectedProject.client_email || ''
        },
        lineItems: milestoneLineItems,
        subtotal,
        total: subtotal + prev.tax
      }));
    }
  };

  // Auto-populate project data from URL parameter
  useEffect(() => {
    if (projectIdFromUrl && projects.length > 0 && !invoiceData.projectId) {
      populateInvoiceFromProject(projectIdFromUrl, true);
    }
  }, [projectIdFromUrl, projects, invoiceData.projectId]);

  // Auto-populate project data when user selects a project manually
  useEffect(() => {
    if (invoiceData.projectId && projects.length > 0 && !projectIdFromUrl) {
      populateInvoiceFromProject(invoiceData.projectId, false);
    }
  }, [invoiceData.projectId, projects]);

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
