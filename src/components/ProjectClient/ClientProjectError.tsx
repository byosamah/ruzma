
import { Card, CardContent } from '@/components/ui/card';
import { useT } from '@/lib/i18n';

interface ClientProjectErrorProps {
  error?: string;
}

function ClientProjectError({ error }: ClientProjectErrorProps) {
  const t = useT();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <Card className="max-w-md mx-auto text-center">
        <CardContent className="pt-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">{t('projectNotFoundError')}</h1>
          <p className="text-slate-600">{error || t('projectNotFoundDesc')}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientProjectError;
