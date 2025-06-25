import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { InvoiceFormData } from './types';
import { useBranding } from '@/hooks/useBranding';
import { useAuth } from '@/hooks/dashboard/useAuth';

interface InvoiceHeaderProps {
  invoiceData: InvoiceFormData;
  updateField: (field: keyof InvoiceFormData, value: any) => void;
}

const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({ invoiceData, updateField }) => {
  const { user } = useAuth();
  const { branding } = useBranding(user);

  // Set the profile logo as default when branding data loads
  useEffect(() => {
    if (branding?.logo_url && !invoiceData.logoUrl) {
      updateField('logoUrl', branding.logo_url);
    }
  }, [branding, invoiceData.logoUrl, updateField]);

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

  return (
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
            <label className="text-sm text-gray-600 mb-2">
              {branding?.logo_url && !invoiceData.logoUrl ? 'Using Profile Logo' : 'Add Logo'}
            </label>
            <div className="relative w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
              {invoiceData.logoUrl ? (
                <img src={invoiceData.logoUrl} alt="Logo" className="w-full h-full object-contain rounded-lg" />
              ) : (
                <div className="text-center">
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                  <span className="text-xs text-gray-500">
                    {branding?.logo_url ? 'Use different logo' : 'Add logo'}
                  </span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            {branding?.logo_url && !invoiceData.logoUrl && (
              <p className="text-xs text-gray-500 mt-1 text-center">
                Using logo from profile
              </p>
            )}
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
  );
};

export default InvoiceHeader;
