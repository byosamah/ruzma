
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClients } from '@/hooks/useClients';
import { useAuth } from '@/hooks/dashboard/useAuth';
import AddClientDialog from '@/components/Clients/AddClientDialog';

interface ClientDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

const ClientDropdown: React.FC<ClientDropdownProps> = ({ value, onChange }) => {
  const { user } = useAuth();
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
              <span className="text-gray-500 text-sm">Select client or enter email</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandList>
              <CommandEmpty>
                <div className="p-2 text-sm text-gray-500">
                  No clients found
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
                    <Check
                      className={cn(
                        "h-4 w-4",
                        value === client.email ? "opacity-100" : "opacity-0"
                      )}
                    />
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
                  <Plus className="h-4 w-4" />
                  <span className="text-sm font-medium">Add new client</span>
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
