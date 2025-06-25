
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, Upload, Plus, Trash2, Save, Send } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { InvoiceFormData, LineItem } from './types';
import { CURRENCIES } from '@/lib/currency';
import { toast } from 'sonner';

interface InvoiceFormProps {
  invoiceData: InvoiceFormData;
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceFormData>>;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoiceData, setInvoiceData }) => {
  const [showTaxInput, setShowTaxInput] = React.useState(false);

  const updateField = (field: keyof InvoiceFormData, value: any) => {
    setInvoiceData(prev => ({ ...prev, [field]: value }));
  };

  const updateAddressField = (section: 'billedTo' | 'payTo', field: 'name' | 'address', value: string) => {
    setInvoiceData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      amount: 0
    };
    setInvoiceData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, newItem]
    }));
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setInvoiceData(prev => {
      const updatedItems = prev.lineItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      );
      
      // Calculate totals immediately
      const subtotal = updatedItems.reduce((sum, item) => sum + (item.quantity * item.amount), 0);
      const total = subtotal + prev.tax;
      
      return {
        ...prev,
        lineItems: updatedItems,
        subtotal,
        total
      };
    });
  };

  const removeLineItem = (id: string) => {
    setInvoiceData(prev => {
      const updatedItems = prev.lineItems.filter(item => item.id !== id);
      
      // Recalculate totals
      const subtotal = updatedItems.reduce((sum, item) => sum + (item.quantity * item.amount), 0);
      const total = subtotal + prev.tax;
      
      return {
        ...prev,
        lineItems: updatedItems,
        subtotal,
        total
      };
    });
  };

  const updateTax = (taxAmount: number) => {
    setInvoiceData(prev => ({
      ...prev,
      tax: taxAmount,
      total: prev.subtotal + taxAmount
    }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateField('logoUrl', e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!invoiceData.invoiceId.trim()) {
      toast.error('Please enter an invoice ID');
      return;
    }
    if (!invoiceData.billedTo.name.trim()) {
      toast.error('Please enter client name');
      return;
    }
    toast.success('Invoice saved as draft');
  };

  const handleSend = () => {
    if (!invoiceData.invoiceId.trim()) {
      toast.error('Please enter an invoice ID');
      return;
    }
    if (!invoiceData.billedTo.name.trim()) {
      toast.error('Please enter client name');
      return;
    }
    if (invoiceData.lineItems.every(item => !item.description.trim())) {
      toast.error('Please add at least one line item with description');
      return;
    }
    toast.success('Invoice sent successfully');
  };

  return (
    <div className="space-y-6">
      {/* Invoice Header */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Invoice ID</label>
              <Input
                placeholder="Add invoice ID"
                value={invoiceData.invoiceId}
                onChange={(e) => updateField('invoiceId', e.target.value)}
              />
            </div>
            <div className="flex flex-col items-end">
              <label className="text-sm text-gray-600 mb-2">Add Logo</label>
              <div className="relative w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                {invoiceData.logoUrl ? (
                  <img src={invoiceData.logoUrl} alt="Logo" className="w-full h-full object-contain rounded-lg" />
                ) : (
                  <div className="text-center">
                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                    <span className="text-xs text-gray-500">Add logo</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Invoice Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !invoiceData.invoiceDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {invoiceData.invoiceDate ? format(invoiceData.invoiceDate, "MM/dd/yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={invoiceData.invoiceDate}
                    onSelect={(date) => date && updateField('invoiceDate', date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Due Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !invoiceData.dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {invoiceData.dueDate ? format(invoiceData.dueDate, "MM/dd/yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={invoiceData.dueDate}
                    onSelect={(date) => date && updateField('dueDate', date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Purchase Order</label>
            <Input
              placeholder="Add purchase order number"
              value={invoiceData.purchaseOrder}
              onChange={(e) => updateField('purchaseOrder', e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Payment Terms</label>
            <Input
              placeholder="Add payment terms"
              value={invoiceData.paymentTerms}
              onChange={(e) => updateField('paymentTerms', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Billing Information */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Billed to:</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                placeholder="Client name"
                value={invoiceData.billedTo.name}
                onChange={(e) => updateAddressField('billedTo', 'name', e.target.value)}
              />
            </div>
            <div>
              <Textarea
                placeholder="Address"
                value={invoiceData.billedTo.address}
                onChange={(e) => updateAddressField('billedTo', 'address', e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pay to:</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                placeholder="Your name"
                value={invoiceData.payTo.name}
                onChange={(e) => updateAddressField('payTo', 'name', e.target.value)}
              />
            </div>
            <div>
              <Textarea
                placeholder="Address"
                value={invoiceData.payTo.address}
                onChange={(e) => updateAddressField('payTo', 'address', e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Currency Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <span className="font-medium">SET CURRENCY</span>
            <Select value={invoiceData.currency} onValueChange={(value) => updateField('currency', value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CURRENCIES).map(([code]) => (
                  <SelectItem key={code} value={code}>
                    {code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-600 border-b pb-2">
              <div className="col-span-6">DESCRIPTION</div>
              <div className="col-span-2 text-center">QUANTITY</div>
              <div className="col-span-3 text-right">AMOUNT</div>
              <div className="col-span-1"></div>
            </div>

            {invoiceData.lineItems.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-6">
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    value={item.amount}
                    onChange={(e) => updateLineItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="col-span-1">
                  {invoiceData.lineItems.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLineItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            <Button
              variant="ghost"
              onClick={addLineItem}
              className="text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add custom charge
            </Button>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">SUBTOTAL</span>
              <span className="font-medium">{invoiceData.subtotal.toFixed(2)} {invoiceData.currency}</span>
            </div>

            {!showTaxInput ? (
              <Button
                variant="ghost"
                className="text-blue-600 hover:text-blue-700 p-0 h-auto"
                onClick={() => setShowTaxInput(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add tax
              </Button>
            ) : (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">TAX</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={invoiceData.tax}
                    onChange={(e) => updateTax(parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    className="w-24 h-8"
                  />
                  <span className="text-gray-600">{invoiceData.currency}</span>
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">TOTAL</span>
                <span className="text-xl font-bold">{invoiceData.total.toFixed(2)} {invoiceData.currency}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={handleSave} className="flex-1">
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
        <Button onClick={handleSend} className="flex-1">
          <Send className="w-4 h-4 mr-2" />
          Send
        </Button>
      </div>
    </div>
  );
};

export default InvoiceForm;
