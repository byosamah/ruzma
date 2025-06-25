
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { InvoiceFormData } from './types';

interface BillingInformationProps {
  invoiceData: InvoiceFormData;
  updateAddressField: (section: 'billedTo' | 'payTo', field: 'name' | 'address', value: string) => void;
}

const BillingInformation: React.FC<BillingInformationProps> = ({ invoiceData, updateAddressField }) => {
  return (
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
  );
};

export default BillingInformation;
