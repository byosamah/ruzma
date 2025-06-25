
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InvoiceFormData } from '../types';
import { useInvoiceContext } from '@/contexts/InvoiceContext';
import { toast } from 'sonner';

export const useInvoiceValidation = (invoiceData: InvoiceFormData) => {
  const [isLoading, setIsLoading] = useState(false);
  const { addInvoice } = useInvoiceContext();
  const navigate = useNavigate();

  const validateBasicFields = () => {
    if (!invoiceData.invoiceId.trim()) {
      toast.error('Please enter an invoice ID');
      return false;
    }
    if (!invoiceData.billedTo.name.trim()) {
      toast.error('Please enter client name');
      return false;
    }
    return true;
  };

  const validateForSending = () => {
    if (!validateBasicFields()) return false;
    
    if (invoiceData.lineItems.every(item => !item.description.trim())) {
      toast.error('Please add at least one line item with description');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateBasicFields()) return;
    
    setIsLoading(true);
    try {
      addInvoice(invoiceData, 'draft');
      // Navigate to invoices page after successful save
      setTimeout(() => {
        navigate('/invoices');
      }, 1000);
    } catch (error) {
      toast.error('Failed to save invoice');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!validateForSending()) return;
    
    setIsLoading(true);
    try {
      addInvoice(invoiceData, 'sent');
      // Navigate to invoices page after successful send
      setTimeout(() => {
        navigate('/invoices');
      }, 1000);
    } catch (error) {
      toast.error('Failed to send invoice');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleSave,
    handleSend,
    isLoading
  };
};
