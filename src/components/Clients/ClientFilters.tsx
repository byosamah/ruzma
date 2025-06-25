
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';

interface ClientFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddClient: () => void;
}

const ClientFilters: React.FC<ClientFiltersProps> = ({
  searchTerm,
  onSearchChange,
  onAddClient
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search clients by name or email..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Button onClick={onAddClient} className="flex items-center gap-2">
        <Plus className="w-4 h-4" />
        Add Client
      </Button>
    </div>
  );
};

export default ClientFilters;
