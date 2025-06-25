
import { InvoiceFormData } from '../types';
import { toast } from 'sonner';

export const useInvoiceValidation = (invoiceData: InvoiceFormData) => {
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
      toast.success('Invoice saved as draft');
    }
  };

  const handleSend = () => {
    if (validateForSending()) {
      toast.success('Invoice sent successfully');
    }
  };

  return {
    handleSave,
    handleSend
  };
};
