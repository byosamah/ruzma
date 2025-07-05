
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Invoice } from '@/hooks/invoices/types';
import { format } from 'date-fns';
import { generateInvoiceHTML, SharedInvoiceData } from './shared/invoice/template';

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
  lineItems: Array<{
    description: string;
    quantity: number;
    amount: number;
  }>;
  currency: string;
  logoUrl?: string;
  purchaseOrder?: string;
  paymentTerms?: string;
  tax: number;
  invoiceDate: Date;
  dueDate: Date;
}

const generatePDFFromHTML = async (invoiceData: InvoicePDFData): Promise<jsPDF> => {
  // Validate input data
  if (!invoiceData.invoice || !invoiceData.billedTo || !invoiceData.payTo) {
    throw new Error('Missing required invoice data');
  }

  if (!invoiceData.lineItems || invoiceData.lineItems.length === 0) {
    throw new Error('No line items provided');
  }

  // Convert to shared data format
  const sharedData: SharedInvoiceData = {
    invoice: invoiceData.invoice,
    billedTo: invoiceData.billedTo,
    payTo: invoiceData.payTo,
    lineItems: invoiceData.lineItems,
    currency: invoiceData.currency,
    logoUrl: invoiceData.logoUrl,
    purchaseOrder: invoiceData.purchaseOrder,
    paymentTerms: invoiceData.paymentTerms,
    tax: invoiceData.tax,
    invoiceDate: invoiceData.invoiceDate,
    dueDate: invoiceData.dueDate
  };

  // Generate HTML using shared template
  const htmlContent = generateInvoiceHTML(sharedData);
  console.log('Generated shared HTML template');

  // Create a temporary container for the invoice
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.innerHTML = htmlContent;
  document.body.appendChild(container);

  // Wait for any images to load
  if (invoiceData.logoUrl) {
    console.log('Waiting for logo to load:', invoiceData.logoUrl);
    await waitForImages(container);
  }

  // Give the browser time to render the content
  await new Promise(resolve => setTimeout(resolve, 500));

  console.log('Converting to canvas...');
  
  // Convert to canvas with optimized settings
  const canvas = await html2canvas(container, {
    scale: 1,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    width: 800,
    height: Math.max(container.scrollHeight, 1000),
    logging: false,
    removeContainer: false,
    foreignObjectRendering: false
  });

  console.log('Canvas created with dimensions:', canvas.width, 'x', canvas.height);

  // Remove temporary container
  document.body.removeChild(container);

  // Verify canvas has content
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const hasContent = imageData.data.some((pixel, index) => {
    return index % 4 !== 3 && pixel !== 255;
  });

  if (!hasContent) {
    throw new Error('Generated canvas is blank - content may not have rendered properly');
  }

  // Create PDF
  const imgData = canvas.toDataURL('image/png');
  console.log('Image data URL created');
  
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  const imgWidth = 210; // A4 width in mm
  const pageHeight = 295; // A4 height in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  // Add the image to PDF
  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

  return pdf;
};

export const generateInvoicePDF = async (invoiceData: InvoicePDFData): Promise<void> => {
  try {
    console.log('Starting PDF generation with shared template:', invoiceData);
    
    const pdf = await generatePDFFromHTML(invoiceData);

    // Generate filename and download
    const filename = `Invoice-${invoiceData.invoice.transactionId}-${format(invoiceData.invoice.date, 'yyyy-MM-dd')}.pdf`;
    console.log('Saving PDF as:', filename);
    pdf.save(filename);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF invoice: ${error.message}`);
  }
};

export const generateInvoicePDFBlob = async (invoiceData: InvoicePDFData): Promise<Blob> => {
  try {
    console.log('Starting PDF blob generation with shared template:', invoiceData);
    
    const pdf = await generatePDFFromHTML(invoiceData);

    // Return as blob for email sending
    const pdfBlob = pdf.output('blob');
    console.log('PDF blob generated successfully');
    
    return pdfBlob;

  } catch (error) {
    console.error('Error generating PDF blob:', error);
    throw new Error(`Failed to generate PDF invoice blob: ${error.message}`);
  }
};

const waitForImages = (container: HTMLElement): Promise<void> => {
  return new Promise((resolve) => {
    const images = container.getElementsByTagName('img');
    if (images.length === 0) {
      resolve();
      return;
    }

    let loadedCount = 0;
    const totalImages = images.length;

    const checkComplete = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        resolve();
      }
    };

    Array.from(images).forEach(img => {
      if (img.complete) {
        checkComplete();
      } else {
        img.onload = checkComplete;
        img.onerror = checkComplete;
      }
    });

    // Fallback timeout
    setTimeout(resolve, 3000);
  });
};
