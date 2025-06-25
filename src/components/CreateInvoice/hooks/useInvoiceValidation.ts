
import { InvoiceFormData } from '../types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useInvoiceContext } from '@/contexts/InvoiceContext';

export const useInvoiceValidation = (invoiceData: InvoiceFormData) => {
  const navigate = useNavigate();
  const { addInvoice } = useInvoiceContext();

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

  const handleSave = () => {
    if (validateBasicFields()) {
      const transactionId = addInvoice(invoiceData);
      toast.success(`Invoice ${transactionId} saved as draft`);
      setTimeout(() => {
        navigate('/invoices');
      }, 1500);
    }
  };

  const handleSend = () => {
    if (validateForSending()) {
      const transactionId = addInvoice(invoiceData);
      toast.success(`Invoice ${transactionId} sent successfully`);
      setTimeout(() => {
        navigate('/invoices');
      }, 1500);
    }
  };

  return {
    handleSave,
    handleSend
  };
};
