
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { InvoiceFormData } from './types';
import { useClients } from '@/hooks/useClients';
import { useAuth } from '@/hooks/dashboard/useAuth';
import AddClientDialog from '@/components/Clients/AddClientDialog';

interface BillingInformationProps {
  invoiceData: InvoiceFormData;
  updateAddressField: (section: 'billedTo' | 'payTo', field: 'name' | 'address', value: string) => void;
}

const BillingInformation: React.FC<BillingInformationProps> = ({ invoiceData, updateAddressField }) => {
  const { user } = useAuth();
  const { clients, createClient } = useClients(user);
  const [showAddClientDialog, setShowAddClientDialog] = useState(false);

  const handleClientSelect = (clientId: string) => {
    if (clientId === 'add-new') {
      setShowAddClientDialog(true);
      return;
    }
    
    const selectedClient = clients.find(client => client.id === clientId);
    if (selectedClient) {
      updateAddressField('billedTo', 'name', selectedClient.name);
    }
  };

  const handleAddClient = async (clientData: { name: string; email: string }) => {
    const success = await createClient(clientData);
    if (success) {
      // Auto-select the newly created client
      updateAddressField('billedTo', 'name', clientData.name);
    }
    return success;
  };

  return (
    <>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Billed to:</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Select onValueChange={handleClientSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client or enter manually" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="add-new">
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Add new client
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
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

      <AddClientDialog
        open={showAddClientDialog}
        onOpenChange={setShowAddClientDialog}
        onSubmit={handleAddClient}
      />
    </>
  );
};

export default BillingInformation;
