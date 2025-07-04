
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
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Invoice {TRANSACTION_ID}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif, 'Noto Sans Arabic', 'Arial Unicode MS', sans-serif;
      font-size: 14px;
      line-height: 1.4;
      color: #000000;
      background: #ffffff;
      direction: ltr;
    }
    /* RTL support for Arabic text */
    .rtl {
      direction: rtl;
      text-align: right;
    }
    .rtl .header-section {
      flex-direction: row-reverse;
    }
    .rtl .billing-section {
      flex-direction: row-reverse;
    }
    .rtl .detail-row {
      flex-direction: row-reverse;
    }
    .rtl .total-row {
      flex-direction: row-reverse;
    }
    .rtl .line-items-header th:first-child {
      text-align: right;
    }
    .rtl .line-items-header th:last-child {
      text-align: left;
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
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    .billing-address {
      color: #666666;
      white-space: pre-line;
      word-wrap: break-word;
      overflow-wrap: break-word;
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
      word-wrap: break-word;
      overflow-wrap: break-word;
      vertical-align: top;
    }
    .line-item-description {
      max-width: 400px;
      white-space: normal;
      word-wrap: break-word;  
      overflow-wrap: break-word;
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
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">
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
            <span class="detail-value highlight">{TRANSACTION_ID}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Invoice Date:</span>
            <span class="detail-value">{INVOICE_DATE}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Due date:</span>
            <span class="detail-value">{DUE_DATE}</span>
          </div>
          <!-- Optional Purchase Order -->
          <div class="detail-row">
            <span class="detail-label">Purchase Order:</span>
            <span class="detail-value">{PURCHASE_ORDER}</span>
          </div>
          <!-- Optional Payment Terms -->
          <div class="detail-row">
            <span class="detail-label">Payment Terms:</span>
            <span class="detail-value">{PAYMENT_TERMS}</span>
          </div>
        </div>
      </div>
      <div class="logo-section">
        <!-- Logo if provided, otherwise placeholder -->
        <img src="{LOGO_URL}" alt="Logo" class="logo-img" />
        <!-- OR -->
        <div class="logo-placeholder">Logo</div>
      </div>
    </div>

    <!-- Billing Information -->
    <div class="billing-section">
      <div class="billing-column">
        <h3 class="billing-title">Billed to:</h3>
        <div class="billing-name">{CLIENT_NAME}</div>
        <div class="billing-address">{CLIENT_ADDRESS}</div>
      </div>
      <div class="billing-column">
        <h3 class="billing-title">Pay to:</h3>
        <div class="billing-name">{FREELANCER_NAME}</div>
        <div class="billing-address">{FREELANCER_ADDRESS}</div>
      </div>
    </div>

    <!-- Currency -->
    <div class="currency-section">
      <span class="currency-label">CURRENCY</span>
      <span class="currency-value">{CURRENCY}</span>
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
        <!-- Dynamic line items -->
        <tr class="line-item-row">
          <td class="line-item-description">{ITEM_DESCRIPTION}</td>
          <td class="line-item-qty">{QUANTITY}</td>
          <td class="line-item-amount">{AMOUNT}</td>
        </tr>
        <!-- More line items... -->
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals-section">
      <div class="total-row">
        <span class="total-label">SUBTOTAL</span>
        <span class="total-value">{SUBTOTAL} {CURRENCY}</span>
      </div>
      <!-- Optional Tax -->
      <div class="total-row">
        <span class="total-label">TAX</span>
        <span class="total-value">{TAX} {CURRENCY}</span>
      </div>
      <div class="total-row total-final">
        <span class="total-label">TOTAL</span>
        <span class="total-value">{TOTAL} {CURRENCY}</span>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};
