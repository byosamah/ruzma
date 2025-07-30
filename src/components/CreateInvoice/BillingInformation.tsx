
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
import { useT } from '@/lib/i18n';

interface BillingInformationProps {
  invoiceData: InvoiceFormData;
  updateAddressField: (section: 'billedTo' | 'payTo', field: 'name' | 'address', value: string) => void;
}

const BillingInformation: React.FC<BillingInformationProps> = ({
  invoiceData,
  updateAddressField
}) => {
  const t = useT();
  const { user } = useAuth();
  const { clients, createClient } = useClients(user);
  const [showAddClientDialog, setShowAddClientDialog] = useState(false);

  // Find client that matches the current billedTo name or email
  const selectedClientId = React.useMemo(() => {
    if (!invoiceData.billedTo.name || !clients.length) return '';
    
    // Try to find client by exact name match first
    const clientByName = clients.find(client => 
      client.name.toLowerCase() === invoiceData.billedTo.name.toLowerCase()
    );
    
    if (clientByName) return clientByName.id;
    
    // If no exact match, try to find by email if billedTo.name looks like email
    if (invoiceData.billedTo.name.includes('@')) {
      const clientByEmail = clients.find(client => 
        client.email.toLowerCase() === invoiceData.billedTo.name.toLowerCase()
      );
      if (clientByEmail) return clientByEmail.id;
    }
    
    return '';
  }, [clients, invoiceData.billedTo.name]);

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
            <CardTitle className="text-lg">{t('billedTo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Select onValueChange={handleClientSelect} value={selectedClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Client" />
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
                      {t('addNewClient')}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input 
                placeholder="Client Name" 
                value={invoiceData.billedTo.name} 
                onChange={(e) => updateAddressField('billedTo', 'name', e.target.value)} 
              />
            </div>
            <div>
              <Textarea 
                placeholder={t('address')} 
                value={invoiceData.billedTo.address} 
                onChange={(e) => updateAddressField('billedTo', 'address', e.target.value)} 
                rows={4} 
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
              />
            </div>
            <div>
              <Textarea 
                placeholder={t('address')} 
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
