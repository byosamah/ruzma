
export interface SharedInvoiceData {
  invoice: {
    id: string;
    transactionId: string;
    amount: number;
    date: Date;
    projectName: string;
  };
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

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
}

export const generateInvoiceHTML = (data: SharedInvoiceData): string => {
  console.log('Generating shared HTML template for invoice:', data.invoice.transactionId);
  
  const subtotal = data.lineItems.reduce((sum, item) => sum + (item.quantity * item.amount), 0);
  const tax = data.tax || 0;
  const total = subtotal + tax;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Invoice ${data.invoice.transactionId}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: Arial, sans-serif;
          font-size: 14px;
          line-height: 1.4;
          color: #000000;
          background: #ffffff;
        }
        .invoice-container {
          width: 800px;
          min-height: 1000px;
          margin: 0 auto;
          padding: 40px;
          background: #ffffff;
        }
        .header-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
        }
        .invoice-title {
          font-size: 36px;
          font-weight: bold;
          color: #000000;
          margin-bottom: 30px;
        }
        .invoice-details {
          margin-bottom: 20px;
        }
        .detail-row {
          display: flex;
          margin-bottom: 4px;
        }
        .detail-label {
          color: #666666;
          width: 140px;
          padding: 4px 0;
        }
        .detail-value {
          color: #000000;
          padding: 4px 0;
          font-weight: 500;
        }
        .detail-value.highlight {
          color: #f97316;
        }
        .logo-section {
          text-align: right;
        }
        .logo-img {
          max-width: 100px;
          max-height: 100px;
          border-radius: 8px;
        }
        .logo-placeholder {
          width: 100px;
          height: 100px;
          background: #f3f4f6;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
          font-size: 14px;
        }
        .billing-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
        }
        .billing-column {
          width: 48%;
        }
        .billing-title {
          font-weight: 600;
          margin-bottom: 12px;
          font-size: 16px;
          color: #000000;
        }
        .billing-name {
          color: #000000;
          font-weight: 500;
          margin-bottom: 4px;
        }
        .billing-address {
          color: #666666;
          white-space: pre-line;
        }
        .currency-section {
          text-align: right;
          margin-bottom: 30px;
        }
        .currency-label {
          color: #666666;
          margin-right: 16px;
        }
        .currency-value {
          background: #f3f4f6;
          padding: 4px 12px;
          border-radius: 4px;
          color: #000000;
        }
        .line-items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 40px;
        }
        .line-items-header {
          border-bottom: 1px solid #e5e7eb;
        }
        .line-items-header th {
          text-align: left;
          color: #666666;
          font-weight: 500;
          padding: 12px 8px;
        }
        .line-items-header .qty-col {
          text-align: center;
          width: 100px;
        }
        .line-items-header .amount-col {
          text-align: right;
          width: 120px;
        }
        .line-item-row td {
          color: #000000;
          padding: 8px;
          border-bottom: 1px solid #f3f4f6;
        }
        .line-item-qty {
          text-align: center;
        }
        .line-item-amount {
          text-align: right;
        }
        .totals-section {
          margin-left: auto;
          width: 300px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
        }
        .total-label {
          color: #666666;
        }
        .total-value {
          color: #000000;
        }
        .total-final {
          border-top: 1px solid #e5e7eb;
          padding-top: 12px;
          margin-top: 8px;
        }
        .total-final .total-label {
          font-weight: 600;
          font-size: 16px;
          color: #000000;
        }
        .total-final .total-value {
          font-size: 20px;
          font-weight: bold;
          color: #000000;
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Header Section -->
        <div class="header-section">
          <div class="invoice-info">
            <h1 class="invoice-title">Invoice</h1>
            <div class="invoice-details">
              <div class="detail-row">
                <span class="detail-label">Invoice ID:</span>
                <span class="detail-value highlight">${data.invoice.transactionId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Invoice Date:</span>
                <span class="detail-value">${formatDate(data.invoiceDate)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Due date:</span>
                <span class="detail-value">${formatDate(data.dueDate)}</span>
              </div>
              ${data.purchaseOrder ? `
                <div class="detail-row">
                  <span class="detail-label">Purchase Order:</span>
                  <span class="detail-value">${data.purchaseOrder}</span>
                </div>
              ` : ''}
              ${data.paymentTerms ? `
                <div class="detail-row">
                  <span class="detail-label">Payment Terms:</span>
                  <span class="detail-value">${data.paymentTerms}</span>
                </div>
              ` : ''}
            </div>
          </div>
          <div class="logo-section">
            ${data.logoUrl ? `
              <img src="${data.logoUrl}" alt="Logo" class="logo-img" />
            ` : `
              <div class="logo-placeholder">Logo</div>
            `}
          </div>
        </div>

        <!-- Billing Information -->
        <div class="billing-section">
          <div class="billing-column">
            <h3 class="billing-title">Billed to:</h3>
            <div class="billing-name">${data.billedTo.name}</div>
            <div class="billing-address">${data.billedTo.address}</div>
          </div>
          <div class="billing-column">
            <h3 class="billing-title">Pay to:</h3>
            <div class="billing-name">${data.payTo.name}</div>
            <div class="billing-address">${data.payTo.address}</div>
          </div>
        </div>

        <!-- Currency -->
        <div class="currency-section">
          <span class="currency-label">CURRENCY</span>
          <span class="currency-value">${data.currency}</span>
        </div>

        <!-- Line Items -->
        <table class="line-items-table">
          <thead class="line-items-header">
            <tr>
              <th>DESCRIPTION</th>
              <th class="qty-col">QUANTITY</th>
              <th class="amount-col">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            ${data.lineItems.map(item => `
              <tr class="line-item-row">
                <td>${item.description}</td>
                <td class="line-item-qty">${item.quantity}</td>
                <td class="line-item-amount">${(item.quantity * item.amount).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Totals -->
        <div class="totals-section">
          <div class="total-row">
            <span class="total-label">SUBTOTAL</span>
            <span class="total-value">${subtotal.toFixed(2)} ${data.currency}</span>
          </div>
          ${tax > 0 ? `
            <div class="total-row">
              <span class="total-label">TAX</span>
              <span class="total-value">${tax.toFixed(2)} ${data.currency}</span>
            </div>
          ` : ''}
          <div class="total-row total-final">
            <span class="total-label">TOTAL</span>
            <span class="total-value">${total.toFixed(2)} ${data.currency}</span>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return html;
};
