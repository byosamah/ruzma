
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Invoice } from '@/hooks/invoices/types';
import { format } from 'date-fns';

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
}

export const generateInvoicePDF = async (invoiceData: InvoicePDFData): Promise<void> => {
  try {
    console.log('Starting PDF generation with data:', invoiceData);
    
    // Validate input data
    if (!invoiceData.invoice || !invoiceData.billedTo || !invoiceData.payTo) {
      throw new Error('Missing required invoice data');
    }

    if (!invoiceData.lineItems || invoiceData.lineItems.length === 0) {
      throw new Error('No line items provided');
    }

    // Create a temporary container for the invoice
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '800px';
    container.style.minHeight = '1000px';
    container.style.backgroundColor = '#ffffff';
    container.style.color = '#000000';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.fontSize = '14px';
    container.style.lineHeight = '1.4';
    container.style.padding = '40px';
    container.style.boxSizing = 'border-box';

    // Generate HTML content for the invoice using table-based layout
    const htmlContent = generateInvoiceHTML(invoiceData);
    console.log('Generated HTML content');
    
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
      // Check if any pixel is not white (not 255) except for alpha channel
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

    // Generate filename and download
    const filename = `Invoice-${invoiceData.invoice.transactionId}-${format(invoiceData.invoice.date, 'yyyy-MM-dd')}.pdf`;
    console.log('Saving PDF as:', filename);
    pdf.save(filename);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF invoice: ${error.message}`);
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

const generateInvoiceHTML = (data: InvoicePDFData): string => {
  console.log('Generating HTML for invoice data:', data);
  
  const subtotal = data.lineItems.reduce((sum, item) => sum + (item.quantity * item.amount), 0);
  const tax = 0; // You can add tax calculation here if needed
  const total = subtotal + tax;

  // Use table-based layout for better compatibility with html2canvas
  const html = `
    <div style="width: 100%; background: #ffffff; color: #000000; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.4;">
      <!-- Header Table -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 40px;">
        <tr>
          <td width="60%" style="vertical-align: top;">
            <h1 style="font-size: 36px; font-weight: bold; margin: 0 0 30px 0; color: #000000;">Invoice</h1>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="color: #666666; width: 140px; padding: 4px 0;">Invoice ID:</td>
                <td style="color: #f97316; font-weight: 500; padding: 4px 0;">${data.invoice.transactionId}</td>
              </tr>
              <tr>
                <td style="color: #666666; width: 140px; padding: 4px 0;">Invoice Date:</td>
                <td style="color: #000000; padding: 4px 0;">${format(data.invoice.date, 'MM/dd/yyyy')}</td>
              </tr>
              <tr>
                <td style="color: #666666; width: 140px; padding: 4px 0;">Due date:</td>
                <td style="color: #000000; padding: 4px 0;">${format(new Date(data.invoice.date.getTime() + 30 * 24 * 60 * 60 * 1000), 'MM/dd/yyyy')}</td>
              </tr>
            </table>
          </td>
          <td width="40%" style="text-align: right; vertical-align: top;">
            ${data.logoUrl ? `
              <img src="${data.logoUrl}" alt="Logo" style="max-width: 100px; max-height: 100px; border-radius: 8px;" />
            ` : `
              <div style="width: 100px; height: 100px; background: #f3f4f6; border-radius: 8px; display: inline-block; text-align: center; line-height: 100px; color: #9ca3af;">
                Logo
              </div>
            `}
          </td>
        </tr>
      </table>

      <!-- Billing Information Table -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 40px;">
        <tr>
          <td width="50%" style="vertical-align: top; padding-right: 20px;">
            <h3 style="font-weight: 600; margin: 0 0 12px 0; font-size: 16px; color: #000000;">Billed to:</h3>
            <div style="color: #000000; font-weight: 500; margin-bottom: 4px;">${data.billedTo.name}</div>
            <div style="color: #666666; white-space: pre-line;">${data.billedTo.address}</div>
          </td>
          <td width="50%" style="vertical-align: top; padding-left: 20px;">
            <h3 style="font-weight: 600; margin: 0 0 12px 0; font-size: 16px; color: #000000;">Pay to:</h3>
            <div style="color: #000000; font-weight: 500; margin-bottom: 4px;">${data.payTo.name}</div>
            <div style="color: #666666; white-space: pre-line;">${data.payTo.address}</div>
          </td>
        </tr>
      </table>

      <!-- Currency -->
      <div style="text-align: right; margin-bottom: 30px;">
        <span style="color: #666666; margin-right: 16px;">CURRENCY</span>
        <span style="background: #f3f4f6; padding: 4px 12px; border-radius: 4px; color: #000000;">${data.currency}</span>
      </div>

      <!-- Line Items Table -->
      <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse; margin-bottom: 40px;">
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <th style="text-align: left; color: #666666; font-weight: 500; padding: 12px 8px;">DESCRIPTION</th>
          <th style="text-align: center; color: #666666; font-weight: 500; padding: 12px 8px; width: 100px;">QUANTITY</th>
          <th style="text-align: right; color: #666666; font-weight: 500; padding: 12px 8px; width: 120px;">AMOUNT</th>
        </tr>
        ${data.lineItems.map(item => `
          <tr>
            <td style="color: #000000; padding: 8px; border-bottom: 1px solid #f3f4f6;">${item.description}</td>
            <td style="color: #000000; padding: 8px; text-align: center; border-bottom: 1px solid #f3f4f6;">${item.quantity}</td>
            <td style="color: #000000; padding: 8px; text-align: right; border-bottom: 1px solid #f3f4f6;">${(item.quantity * item.amount).toFixed(2)}</td>
          </tr>
        `).join('')}
      </table>

      <!-- Totals Table -->
      <table width="300" cellpadding="8" cellspacing="0" style="margin-left: auto; border-collapse: collapse;">
        <tr>
          <td style="color: #666666; text-align: left; padding: 4px 0;">SUBTOTAL</td>
          <td style="color: #000000; text-align: right; padding: 4px 0;">${subtotal.toFixed(2)} ${data.currency}</td>
        </tr>
        ${tax > 0 ? `
          <tr>
            <td style="color: #666666; text-align: left; padding: 4px 0;">TAX</td>
            <td style="color: #000000; text-align: right; padding: 4px 0;">${tax.toFixed(2)} ${data.currency}</td>
          </tr>
        ` : ''}
        <tr style="border-top: 1px solid #e5e7eb;">
          <td style="font-weight: 600; font-size: 16px; color: #000000; text-align: left; padding: 12px 0;">TOTAL</td>
          <td style="font-size: 20px; font-weight: bold; color: #000000; text-align: right; padding: 12px 0;">${total.toFixed(2)} ${data.currency}</td>
        </tr>
      </table>
    </div>
  `;
  
  console.log('Generated HTML with length:', html.length);
  return html;
};
