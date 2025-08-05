
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
import { useAuth } from '@/hooks/core/useAuth';
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
  const projectIdFromUrl = React.useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('projectId');
  }, []);

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

  const handleClientEmailChange = (email: string) => {
    setInvoiceData(prev => ({
      ...prev,
      selectedClientEmail: email
    }));
  };

  // Single effect to handle all project auto-population
  useEffect(() => {
    console.log('=== INVOICE AUTO-POPULATION DEBUG ===');
    console.log('URL:', window.location.href);
    console.log('URL Search:', window.location.search);
    console.log('projectIdFromUrl:', projectIdFromUrl);
    console.log('invoiceData.projectId:', invoiceData.projectId);
    console.log('projects.length:', projects.length);
    console.log('invoiceData.lineItems.length:', invoiceData.lineItems.length);
    
    // Determine which project to populate from
    const targetProjectId = projectIdFromUrl || invoiceData.projectId;
    console.log('targetProjectId:', targetProjectId);
    
    if (!targetProjectId) {
      console.log('❌ No target project ID found');
      return;
    }
    
    if (projects.length === 0) {
      console.log('❌ No projects loaded yet, waiting...');
      return;
    }

    const selectedProject = projects.find(p => p.id === targetProjectId);
    if (!selectedProject) {
      console.log('❌ Project not found:', targetProjectId);
      console.log('Available projects:', projects.map(p => ({ id: p.id, name: p.name })));
      return;
    }

    console.log('✅ Found project:', selectedProject.name);
    console.log('Project data:', {
      id: selectedProject.id,
      name: selectedProject.name,
      client_email: selectedProject.client_email,
      start_date: selectedProject.start_date,
      end_date: selectedProject.end_date,
      milestones: selectedProject.milestones?.length || 0
    });

    // Calculate project dates from milestones
    const projectDates = calculateProjectDates(selectedProject.milestones || []);
    console.log('Calculated project dates:', projectDates);
    
    // Enhanced client name extraction
    let clientName = '';
    console.log('Raw client_email from project:', selectedProject.client_email);
    if (selectedProject.client_email) {
      const emailPrefix = selectedProject.client_email.split('@')[0];
      clientName = emailPrefix
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
        .trim();
      console.log('Processed client name:', clientName);
    } else {
      console.log('❌ No client email found in project');
    }
    
    // Create milestone line items
    const milestoneLineItems = selectedProject.milestones?.map((milestone) => ({
      id: milestone.id,
      description: milestone.title,
      quantity: 1,
      amount: Number(milestone.price) || 0
    })) || [];
    
    console.log('✅ Creating milestone line items:', milestoneLineItems);
    
    // Calculate totals
    const subtotal = milestoneLineItems.reduce((sum, item) => sum + (item.quantity * item.amount), 0);
    console.log('Calculated subtotal:', subtotal);
    
    // Enhanced date logic with fallbacks
    let invoiceDate = new Date();
    let dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    if (projectDates.start_date) {
      invoiceDate = new Date(projectDates.start_date);
      console.log('✅ Using milestone start date:', projectDates.start_date);
    } else if (selectedProject.start_date) {
      invoiceDate = new Date(selectedProject.start_date);
      console.log('✅ Using project start date:', selectedProject.start_date);
    } else {
      console.log('⚠️ Using default invoice date (today)');
    }
    
    if (projectDates.end_date) {
      dueDate = new Date(projectDates.end_date);
      console.log('✅ Using milestone end date:', projectDates.end_date);
    } else if (selectedProject.end_date) {
      dueDate = new Date(selectedProject.end_date);
      console.log('✅ Using project end date:', selectedProject.end_date);
    } else {
      console.log('⚠️ Using default due date (+30 days)');
    }
    
    console.log('Final dates:', { invoiceDate, dueDate });
    
    // Update invoice data - prioritize user's preferred currency
    const newInvoiceData = {
      ...invoiceData,
      projectId: targetProjectId,
      invoiceDate,
      dueDate,
      // Keep the user's preferred currency instead of overriding with project currency
      billedTo: {
        ...invoiceData.billedTo,
        name: clientName || selectedProject.client_email || ''
      },
      lineItems: milestoneLineItems.length > 0 ? milestoneLineItems : invoiceData.lineItems,
      subtotal,
      total: subtotal + invoiceData.tax
    };
    
    console.log('🚀 UPDATING INVOICE DATA:');
    console.log('  - projectId:', newInvoiceData.projectId);
    console.log('  - invoiceDate:', newInvoiceData.invoiceDate);
    console.log('  - dueDate:', newInvoiceData.dueDate);
    console.log('  - billedTo name:', newInvoiceData.billedTo.name);
    console.log('  - lineItems count:', newInvoiceData.lineItems.length);
    console.log('  - currency:', newInvoiceData.currency);
    setInvoiceData(newInvoiceData);
    console.log('=== END AUTO-POPULATION DEBUG ===');
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
        onClientEmailChange={handleClientEmailChange}
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
