
import type { SharedInvoiceData } from './shared-invoice-template.ts';
import { formatDate } from './pdf-utils.ts';

export function generatePDFContent(data: SharedInvoiceData, subtotal: number, total: number): string {
  // Create PDF drawing commands that match the HTML layout
  const commands = [
    'BT', // Begin text
    
    // Invoice Title (large, bold)
    '/F2 24 Tf',
    '50 750 Td',
    '(Invoice) Tj',
    
    // Invoice details section
    '/F1 10 Tf',
    '0 -40 Td',
    `(Invoice ID: ${data.invoice.transactionId}) Tj`,
    '0 -15 Td',
    `(Invoice Date: ${formatDate(data.invoiceDate)}) Tj`,
    '0 -15 Td',
    `(Due date: ${formatDate(data.dueDate)}) Tj`,
  ];

  // Add purchase order and payment terms if they exist
  if (data.purchaseOrder) {
    commands.push('0 -15 Td', `(Purchase Order: ${data.purchaseOrder}) Tj`);
  }
  if (data.paymentTerms) {
    commands.push('0 -15 Td', `(Payment Terms: ${data.paymentTerms}) Tj`);
  }

  // Billing information
  commands.push(
    '0 -30 Td',
    '/F2 12 Tf',
    '(Billed to:) Tj',
    '/F1 10 Tf',
    '0 -15 Td',
    `(${data.billedTo.name}) Tj`
  );

  // Add billing address lines
  const billingAddressLines = data.billedTo.address.split('\n');
  billingAddressLines.forEach(line => {
    commands.push('0 -12 Td', `(${line}) Tj`);
  });

  // Pay to section (positioned to the right - simulate two columns)
  commands.push(
    '300 60 Td', // Move to right column, up to align with "Billed to"
    '/F2 12 Tf',
    '(Pay to:) Tj',
    '/F1 10 Tf',
    '0 -15 Td',
    `(${data.payTo.name}) Tj`
  );

  // Add pay-to address lines
  const payToAddressLines = data.payTo.address.split('\n');
  payToAddressLines.forEach(line => {
    commands.push('0 -12 Td', `(${line}) Tj`);
  });

  // Currency section
  commands.push(
    '-300 -40 Td', // Move back to left, down
    '/F1 10 Tf',
    `(CURRENCY: ${data.currency}) Tj`
  );

  // Line items table header
  commands.push(
    '0 -30 Td',
    '/F2 10 Tf',
    '(DESCRIPTION) Tj',
    '300 0 Td',
    '(QUANTITY) Tj',
    '100 0 Td',
    '(AMOUNT) Tj'
  );

  // Line items
  commands.push('-400 -20 Td', '/F1 10 Tf');
  data.lineItems.forEach(item => {
    const itemTotal = (item.quantity * item.amount).toFixed(2);
    commands.push(
      `(${item.description}) Tj`,
      '300 0 Td',
      `(${item.quantity}) Tj`,
      '100 0 Td',
      `(${itemTotal}) Tj`,
      '-400 -15 Td'
    );
  });

  // Totals section
  commands.push(
    '300 -20 Td',
    '/F1 10 Tf',
    `(SUBTOTAL: ${subtotal.toFixed(2)} ${data.currency}) Tj`
  );

  if (data.tax > 0) {
    commands.push(
      '0 -15 Td',
      `(TAX: ${data.tax.toFixed(2)} ${data.currency}) Tj`
    );
  }

  commands.push(
    '0 -15 Td',
    '/F2 12 Tf',
    `(TOTAL: ${total.toFixed(2)} ${data.currency}) Tj`
  );

  commands.push('ET'); // End text

  return commands.join('\n');
}
