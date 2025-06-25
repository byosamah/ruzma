
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
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

  return (
    <>
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="flex-1 justify-between"
            >
              {selectedClient ? (
                <div className="flex flex-col items-start">
                  <span className="font-medium">{selectedClient.name}</span>
                  <span className="text-sm text-gray-500">{selectedClient.email}</span>
                </div>
              ) : value ? (
                <span>{value}</span>
              ) : (
                <span className="text-gray-500">Select client or enter email</span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput 
                placeholder="Search clients or enter email..." 
                value={value}
                onValueChange={onChange}
              />
              <CommandList>
                <CommandEmpty>
                  <div className="p-2 text-sm text-gray-500">
                    {value ? `Use "${value}" as client email` : 'No clients found'}
                  </div>
                </CommandEmpty>
                <CommandGroup>
                  {clients.map((client) => (
                    <CommandItem
                      key={client.id}
                      value={client.email}
                      onSelect={(currentValue) => {
                        onChange(currentValue);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === client.email ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{client.name}</span>
                        <span className="text-sm text-gray-500">{client.email}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setShowAddDialog(true)}
          title="Add new client"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <AddClientDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={handleAddClient}
      />
    </>
  );
};

export default ClientDropdown;
