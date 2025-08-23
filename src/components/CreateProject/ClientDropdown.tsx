
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
// Icons replaced with emojis
import { cn } from '@/lib/utils';
import { useClients } from '@/hooks/useClients';
import AddClientDialog from '@/components/Clients/AddClientDialog';
import { useT } from '@/lib/i18n';

import { User } from '@supabase/supabase-js';

interface ClientDropdownProps {
  value: string;
  onChange: (value: string) => void;
  user?: User | null;
}

const ClientDropdown: React.FC<ClientDropdownProps> = ({ value, onChange, user }) => {
  const t = useT();
  const { clients, createClient } = useClients(user);
  const [open, setOpen] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const selectedClient = clients.find(client => client.email === value);

  const handleAddClient = async (clientData: { name: string; email: string }) => {
    const success = await createClient(clientData);
    if (success) {
      onChange(clientData.email);
    }
    return success;
  };

  const handleClientSelect = (clientEmail: string) => {
    if (clientEmail === 'add-new') {
      setShowAddDialog(true);
      return;
    }
    onChange(clientEmail);
    setOpen(false);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-10"
          >
            {selectedClient ? (
              <div className="flex flex-col items-start text-left">
                <span className="font-medium text-sm">{selectedClient.name}</span>
                <span className="text-xs text-gray-500">{selectedClient.email}</span>
              </div>
            ) : value ? (
              <span className="text-sm">{value}</span>
            ) : (
              <span className="text-gray-500 text-sm">{t('selectClientOrEnterEmail')}</span>
            )}
            <span className="ml-2 text-sm shrink-0 opacity-50">⬍</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandList>
              <CommandEmpty>
                <div className="p-2 text-sm text-gray-500">
                  {t('noClientsFound')}
                </div>
              </CommandEmpty>
              <CommandGroup>
                {clients.map((client) => (
                  <CommandItem
                    key={client.id}
                    value={client.email}
                    onSelect={handleClientSelect}
                    className="flex items-center gap-2 px-3 py-2"
                  >
                    <span
                      className={cn(
                        "text-lg",
                        value === client.email ? "opacity-100" : "opacity-0"
                      )}
                    >✓</span>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-medium text-sm truncate">{client.name}</span>
                      <span className="text-xs text-gray-500 truncate">{client.email}</span>
                    </div>
                  </CommandItem>
                ))}
                <CommandItem
                  value="add-new"
                  onSelect={handleClientSelect}
                  className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-700"
                >
                  <span className="text-lg">➕</span>
                  <span className="text-sm font-medium">{t('addNewClient')}</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      <AddClientDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={handleAddClient}
      />
    </>
  );
};

export default ClientDropdown;
