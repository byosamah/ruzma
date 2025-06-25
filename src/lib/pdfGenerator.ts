import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Invoice } from '@/hooks/useInvoices';
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
    // Create a temporary container for the invoice
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '800px';
    container.style.backgroundColor = 'white';
    container.style.padding = '40px';
    container.style.fontFamily = 'Arial, sans-serif';

    // Generate HTML content for the invoice
    container.innerHTML = generateInvoiceHTML(invoiceData);
    document.body.appendChild(container);

    // Wait for images to load if logo is present
    if (invoiceData.logoUrl) {
      await new Promise((resolve) => {
        const img = container.querySelector('img');
        if (img) {
          if (img.complete) {
            resolve(null);
          } else {
            img.onload = () => resolve(null);
            img.onerror = () => resolve(null);
            // Fallback timeout
            setTimeout(resolve, 2000);
          }
        } else {
          resolve(null);
        }
      });
    }

    // Convert to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      width: 800,
      height: container.scrollHeight,
      allowTaint: true,
      foreignObjectRendering: true
    });

    // Remove temporary container
    document.body.removeChild(container);

    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Generate filename and download
    const filename = `Invoice-${invoiceData.invoice.transactionId}-${format(invoiceData.invoice.date, 'yyyy-MM-dd')}.pdf`;
    pdf.save(filename);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF invoice');
  }
};

const generateInvoiceHTML = (data: InvoicePDFData): string => {
  const subtotal = data.lineItems.reduce((sum, item) => sum + (item.quantity * item.amount), 0);
  const tax = 0; // You can add tax calculation here if needed
  const total = subtotal + tax;

  return `
    <div style="max-width: 800px; margin: 0 auto; padding: 40px; background: white; color: #000;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
        <div>
          <h1 style="font-size: 36px; font-weight: bold; margin: 0 0 30px 0; color: #000;">Invoice</h1>
          <div style="font-size: 14px; line-height: 1.6;">
            <div style="margin-bottom: 8px;">
              <span style="color: #666; display: inline-block; width: 140px;">Invoice ID:</span>
              <span style="color: #f97316; font-weight: 500;">${data.invoice.transactionId}</span>
            </div>
            <div style="margin-bottom: 8px;">
              <span style="color: #666; display: inline-block; width: 140px;">Invoice Date:</span>
              <span>${format(data.invoice.date, 'MM/dd/yyyy')}</span>
            </div>
            <div style="margin-bottom: 8px;">
              <span style="color: #666; display: inline-block; width: 140px;">Due date:</span>
              <span>${format(new Date(data.invoice.date.getTime() + 30 * 24 * 60 * 60 * 1000), 'MM/dd/yyyy')}</span>
            </div>
          </div>
        </div>
        
        ${data.logoUrl ? `
          <div style="width: 100px; height: 100px; background: #f3f4f6; border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
            <img src="${data.logoUrl}" alt="Logo" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 8px;" crossorigin="anonymous" />
          </div>
        ` : `
          <div style="width: 100px; height: 100px; background: #f3f4f6; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
            <div style="text-align: center; color: #9ca3af; font-size: 12px;">
              <div style="width: 32px; height: 32px; background: #d1d5db; border-radius: 4px; margin: 0 auto 8px;"></div>
              Logo
            </div>
          </div>
        `}
      </div>

      <!-- Billing Information -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px;">
        <div>
          <h3 style="font-weight: 600; margin-bottom: 12px; font-size: 16px;">Billed to:</h3>
          <div style="color: #4b5563; font-size: 14px; line-height: 1.6;">
            <div style="margin-bottom: 4px; font-weight: 500;">${data.billedTo.name || 'Client name'}</div>
            <div style="white-space: pre-line;">${data.billedTo.address || 'Address'}</div>
          </div>
        </div>
        <div>
          <h3 style="font-weight: 600; margin-bottom: 12px; font-size: 16px;">Pay to:</h3>
          <div style="color: #4b5563; font-size: 14px; line-height: 1.6;">
            <div style="margin-bottom: 4px; font-weight: 500;">${data.payTo.name || 'Your name'}</div>
            <div style="white-space: pre-line;">${data.payTo.address || 'Address'}</div>
          </div>
        </div>
      </div>

      <!-- Currency -->
      <div style="text-align: right; margin-bottom: 30px;">
        <div style="font-size: 14px;">
          <span style="color: #666; margin-right: 16px;">SET CURRENCY</span>
          <span style="background: #f3f4f6; padding: 4px 12px; border-radius: 4px;">${data.currency}</span>
        </div>
      </div>

      <!-- Line Items -->
      <div style="margin-bottom: 40px;">
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 16px; font-size: 14px; color: #666; border-bottom: 1px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 20px; font-weight: 500;">
          <div>DESCRIPTION</div>
          <div style="text-align: center;">QUANTITY</div>
          <div style="text-align: right;">AMOUNT</div>
        </div>

        ${data.lineItems.map(item => `
          <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 16px; font-size: 14px; margin-bottom: 16px;">
            <div>${item.description || 'Description'}</div>
            <div style="text-align: center;">${item.quantity}</div>
            <div style="text-align: right;">${(item.quantity * item.amount).toFixed(2)}</div>
          </div>
        `).join('')}
      </div>

      <!-- Totals -->
      <div style="margin-left: auto; width: 300px;">
        <div style="margin-bottom: 12px; font-size: 14px; display: flex; justify-content: space-between;">
          <span style="color: #666;">SUBTOTAL</span>
          <span>${subtotal.toFixed(2)} ${data.currency}</span>
        </div>
        
        ${tax > 0 ? `
          <div style="margin-bottom: 12px; font-size: 14px; display: flex; justify-content: space-between;">
            <span style="color: #666;">TAX</span>
            <span>${tax.toFixed(2)} ${data.currency}</span>
          </div>
        ` : ''}

        <div style="border-top: 1px solid #e5e7eb; padding-top: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 600; font-size: 16px;">TOTAL</span>
            <span style="font-size: 20px; font-weight: bold;">${total.toFixed(2)} ${data.currency}</span>
          </div>
        </div>
      </div>
    </div>
  `;
};
