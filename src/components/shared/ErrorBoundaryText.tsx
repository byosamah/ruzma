import { useT } from '@/lib/i18n';

// Title components
export function CriticalErrorTitle() {
  const t = useT();
  return <>{t('criticalErrorTitle')}</>;
}

export function ComponentErrorTitle() {
  const t = useT();
  return <>{t('somethingWentWrong')}</>;
}

// Alert Title components
export function ApplicationErrorAlertTitle() {
  const t = useT();
  return <>{t('applicationError')}</>;
}

export function ComponentErrorAlertTitle() {
  const t = useT();
  return <>{t('componentError')}</>;
}

// Description components
export function CriticalErrorDescription() {
  const t = useT();
  return <>{t('criticalErrorDescription')}</>;
}

export function ComponentErrorDescription() {
  const t = useT();
  return <>{t('componentErrorDescription')}</>;
}

// Button text components
export function TryAgainText() {
  const t = useT();
  return <>{t('tryAgain')}</>;
}

export function RefreshPageText() {
  const t = useT();
  return <>{t('refreshPage')}</>;
}

export function GoHomeText() {
  const t = useT();
  return <>{t('goHome')}</>;
}

// Other text components
export function ErrorDetailsText({ errorId }: { errorId: string }) {
  const t = useT();
  return <>{t('errorDetailsWithId')} ({t('errorIdLabel')} {errorId})</>;
}

export function RetryAttemptText({ retryCount, maxRetries }: { retryCount: number; maxRetries: number }) {
  const t = useT();
  return <>{t('retryAttempt')} {retryCount} {t('of')} {maxRetries}</>;
}

export function ErrorIdText({ errorId }: { errorId: string }) {
  const t = useT();
  return <>{t('errorIdLabel')} {errorId}</>;
}

export function ErrorText() {
  const t = useT();
  return <>{t('error')}</>;
}

export function StackTraceText() {
  const t = useT();
  return <>{t('stackTrace')}</>;
}

export function ComponentStackText() {
  const t = useT();
  return <>{t('componentStack')}</>;
}