export const calculateInvoiceTotals = (lineItems: Array<{quantity: number; amount: number}>, tax: number) => {
  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.amount), 0);
  const total = subtotal + (tax || 0);
  return { subtotal, total };
};

export const formatInvoiceDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
};