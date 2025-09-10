import { useT } from '@/lib/i18n';
import { CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function ErrorBoundaryTitle() {
  const t = useT();
  return (
    <CardTitle className="text-destructive">
      {t('somethingWentWrong')}
    </CardTitle>
  );
}

export function ErrorBoundaryDetails() {
  const t = useT();
  return (
    <summary className="cursor-pointer font-medium">
      {t('errorDetails')}
    </summary>
  );
}

export function ErrorBoundaryMessage() {
  const t = useT();
  return (
    <p className="text-sm text-muted-foreground text-center">
      {t('somethingWentWrong')}
    </p>
  );
}

export function ErrorBoundaryButtons({ onTryAgain, onGoHome }: { 
  onTryAgain: () => void; 
  onGoHome: () => void; 
}) {
  const t = useT();
  return (
    <div className="flex gap-3 justify-center">
      <Button variant="outline" onClick={onTryAgain} className="flex items-center gap-2">
        {t('tryAgain')}
      </Button>
      <Button onClick={onGoHome} className="flex items-center gap-2">
        {t('reloadPage')}
      </Button>
    </div>
  );
}