
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// Icons replaced with emojis
import { InvoiceFormData } from './types';
import { useClients } from '@/hooks/useClients';
import { useAuth } from '@/hooks/core/useAuth';
import AddClientDialog from '@/components/Clients/AddClientDialog';
import { useT } from '@/lib/i18n';

interface BillingInformationProps {
  invoiceData: InvoiceFormData;
  updateAddressField: (section: 'billedTo' | 'payTo', field: 'name' | 'address', value: string) => void;
  onClientEmailChange: (email: string) => void;
}

const BillingInformation = ({
  invoiceData,
  updateAddressField,
  onClientEmailChange
}) => {
  const t = useT();
  const { user } = useAuth();
  const { clients, createClient } = useClients(user);
  const [showAddClientDialog, setShowAddClientDialog] = useState(false);

  const handleClientSelect = (clientEmail: string) => {
    if (clientEmail === 'add-new') {
      setShowAddClientDialog(true);
      return;
    }
    const selectedClient = clients.find(client => client.email === clientEmail);
    if (selectedClient) {
      updateAddressField('billedTo', 'name', selectedClient.name);
      onClientEmailChange(clientEmail);
    }
  };

  const handleAddClient = async (clientData: { name: string; email: string }) => {
    const success = await createClient(clientData);
    if (success) {
      // Auto-select the newly created client
      updateAddressField('billedTo', 'name', clientData.name);
      onClientEmailChange(clientData.email);
    }
    return success;
  };

  return (
    <>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('billedTo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Select onValueChange={handleClientSelect} value={invoiceData.selectedClientEmail || ""}>
                <SelectTrigger className="border-gray-300 border">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.email}>
                      <div className="flex flex-col">
                        <span className="font-medium">{client.name}</span>
                        <span className="text-sm text-muted-foreground">{client.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                  <SelectItem value="add-new">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">➕</span>
                      {t('addNewClient')}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Textarea 
                placeholder={t('address')} 
                value={invoiceData.billedTo.address} 
                onChange={(e) => updateAddressField('billedTo', 'address', e.target.value)} 
                rows={4}
                className="border-gray-300 border"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('payTo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input 
                placeholder={t('yourName')} 
                value={invoiceData.payTo.name} 
                onChange={(e) => updateAddressField('payTo', 'name', e.target.value)} 
                className="border-gray-300 border"
              />
            </div>
            <div>
              <Textarea 
                placeholder={t('address')} 
                value={invoiceData.payTo.address} 
                onChange={(e) => updateAddressField('payTo', 'address', e.target.value)} 
                rows={4}
                className="border-gray-300 border"
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
