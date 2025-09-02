// Lazy-loaded PDF generator to reduce initial bundle size
// PDF libraries (html2canvas + jspdf) are ~120KB combined

import { Invoice } from '@/hooks/invoices/types';

export interface InvoicePDFData {
  invoice: Invoice;
  billedTo: {
    name: string;
    address: string;
  };
  payTo: {
    name: string;
    address: string;
  };
  logoUrl?: string;
  currency: string;
  language: 'en' | 'ar';
}

// Lazy loading wrapper for PDF generation
export const generateInvoicePDFLazy = async (data: InvoicePDFData): Promise<void> => {
  try {
    // Dynamically import the PDF generator module
    const { generateInvoicePDF } = await import('./pdfGenerator');
    
    // Call the actual PDF generation function
    return generateInvoicePDF(data);
  } catch (error) {
    // Error is thrown to parent for proper handling
    throw new Error('PDF generation temporarily unavailable. Please try again.');
  }
};

export const generateInvoicePDFBlobLazy = async (data: InvoicePDFData): Promise<Blob> => {
  try {
    // Dynamically import the PDF generator module
    const { generateInvoicePDFBlob } = await import('./pdfGenerator');
    
    // Call the actual PDF generation function
    return generateInvoicePDFBlob(data);
  } catch (error) {
    // Error is thrown to parent for proper handling
    throw new Error('PDF generation temporarily unavailable. Please try again.');
  }
};