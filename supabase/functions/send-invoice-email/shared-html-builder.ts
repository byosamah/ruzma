import type { SharedInvoiceData } from './shared-types.ts';
import { calculateInvoiceTotals, formatInvoiceDate } from './shared-utils.ts';

// Function to detect Arabic text
function containsArabic(text: string): boolean {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicRegex.test(text);
}

// Function to detect if any content contains Arabic text
function hasArabicContent(data: SharedInvoiceData): boolean {
  // Check all text fields for Arabic content
  const textsToCheck = [
    data.billedTo.name,
    data.billedTo.address,
    data.payTo.name,
    data.payTo.address,
    data.purchaseOrder || '',
    data.paymentTerms || '',
    ...data.lineItems.map(item => item.description)
  ];
  
  return textsToCheck.some(text => containsArabic(text));
}

export const buildInvoiceHTML = (data: SharedInvoiceData, styles: string): string => {
  const { subtotal, total } = calculateInvoiceTotals(data.lineItems, data.tax);
  const isRTL = hasArabicContent(data);

  return `
    <!DOCTYPE html>
    <html lang="${isRTL ? 'ar' : 'en'}">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Invoice ${data.invoice.transactionId}</title>
      <style>${styles}</style>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">
    </head>
    <body${isRTL ? ' class="rtl"' : ''}>
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
                <span class="detail-value">${formatInvoiceDate(data.invoiceDate)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Due date:</span>
                <span class="detail-value">${formatInvoiceDate(data.dueDate)}</span>
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
                <td class="line-item-description">${item.description}</td>
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
          ${data.tax > 0 ? `
            <div class="total-row">
              <span class="total-label">TAX</span>
              <span class="total-value">${data.tax.toFixed(2)} ${data.currency}</span>
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
};