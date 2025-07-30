
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
      
      // Enhanced client name extraction
      let clientName = '';
      if (selectedProject.client_email) {
        const emailPrefix = selectedProject.client_email.split('@')[0];
        clientName = emailPrefix
          .replace(/[._-]/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase())
          .trim();
      }
      
      // Create milestone line items
      const milestoneLineItems = selectedProject.milestones?.map((milestone) => ({
        id: milestone.id,
        description: milestone.title,
        quantity: 1,
        amount: Number(milestone.price) || 0
      })) || [];
      
      // Calculate totals
      const subtotal = milestoneLineItems.reduce((sum, item) => sum + (item.quantity * item.amount), 0);
      
      // Enhanced date logic with fallbacks
      let invoiceDate = new Date();
      let dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days default
      
      // Try milestone dates first
      if (projectDates.start_date) {
        invoiceDate = new Date(projectDates.start_date);
      } else if (selectedProject.start_date) {
        // Fallback to project-level start date
        invoiceDate = new Date(selectedProject.start_date);
      }
      
      if (projectDates.end_date) {
        dueDate = new Date(projectDates.end_date);
      } else if (selectedProject.end_date) {
        // Fallback to project-level end date
        dueDate = new Date(selectedProject.end_date);
      }
      
      // Update invoice data
      setInvoiceData(prev => ({
        ...prev,
        projectId,
        invoiceDate,
        dueDate,
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
