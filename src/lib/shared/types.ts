
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
