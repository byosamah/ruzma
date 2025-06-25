
export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  amount: number;
}

export interface AddressInfo {
  name: string;
  address: string;
}

export interface InvoiceFormData {
  invoiceId: string;
  invoiceDate: Date;
  dueDate: Date;
  purchaseOrder: string;
  paymentTerms: string;
  billedTo: AddressInfo;
  payTo: AddressInfo;
  currency: string;
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  logoUrl: string | null;
}
