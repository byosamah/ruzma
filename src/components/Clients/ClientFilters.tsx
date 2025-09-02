
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
// Icons replaced with emojis
import { useT } from '@/lib/i18n';

interface ClientFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddClient: () => void;
}

const ClientFilters = ({
  searchTerm,
  onSearchChange,
  onAddClient
}) => {
  const t = useT();

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
      <div className="relative w-full sm:flex-1 sm:max-w-sm">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-base sm:text-lg">🔍</span>
        <Input
          placeholder={t('searchByNameOrEmail')}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 border-gray-300 border h-10 sm:h-9 text-base sm:text-sm"
        />
      </div>
      <Button 
        onClick={onAddClient} 
        className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 w-full sm:w-auto mobile-touch-target"
        size="sm"
      >
        <span className="text-base sm:text-lg">➕</span>
        <span className="text-sm sm:text-base">{t('addClient')}</span>
      </Button>
    </div>
  );
};

export default ClientFilters;
