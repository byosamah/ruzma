
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
// Icons replaced with emojis
import { useT } from '@/lib/i18n';

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
  const t = useT();

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
      <div className="relative flex-1 max-w-sm">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">🔍</span>
        <Input
          placeholder={t('searchByNameOrEmail')}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 border-gray-300 border"
        />
      </div>
      <Button 
        onClick={onAddClient} 
        className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2"
        size="sm"
      >
        <span className="text-lg">➕</span>
        {t('addClient')}
      </Button>
    </div>
  );
};

export default ClientFilters;
