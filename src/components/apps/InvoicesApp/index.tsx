/**
 * Invoices App Component
 *
 * macOS-style window for managing invoices.
 * Features:
 * - Invoice list with filters
 * - Invoice statistics
 * - Create/Download/Send actions
 *
 * This replaces the Invoices page in macOS mode.
 */

import React, { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWindowManager } from '@/contexts/WindowManagerContext';
import { useAuth } from '@/hooks/core/useAuth';
import { useProfileQuery } from '@/hooks/core/useProfileQuery';
import { useInvoices } from '@/hooks/useInvoices';
import { useT } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import InvoicesHeader from '@/components/Invoices/InvoicesHeader';
import InvoicesStats from '@/components/Invoices/InvoicesStats';
import InvoicesSection from '@/components/Invoices/InvoicesSection';
import { UserProfile } from '@/types/profile';

// =============================================================================
// TYPES
// =============================================================================

interface InvoicesAppProps {
  /** Window ID (passed by WindowRenderer) */
  windowId?: string;
  /** Optional data passed when opening window */
  data?: Record<string, unknown>;
}

// =============================================================================
// LOADING COMPONENT
// =============================================================================

function InvoicesLoading() {
  const t = useT();
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4" />
      <p className="text-sm text-gray-500">{t('loadingInvoices') || 'Loading invoices...'}</p>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function InvoicesApp({ windowId, data }: InvoicesAppProps) {
  const { dir } = useLanguage();
  const { openApp } = useWindowManager();
  const t = useT();
  const isRTL = dir === 'rtl';

  // Auth & profile
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfileQuery(user);

  // Invoices data
  const {
    invoices,
    loading: invoicesLoading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    handleDownloadPDF,
    handleSendToClient,
    handleDeleteInvoice,
  } = useInvoices();

  /**
   * Handle creating new invoice
   * Opens the create invoice window
   */
  const handleCreateInvoice = useCallback(() => {
    openApp('create-invoice');
  }, [openApp]);

  // Show loading state
  if (profileLoading || invoicesLoading) {
    return <InvoicesLoading />;
  }

  return (
    <div
      className={cn(
        'invoices-app h-full overflow-y-auto',
        'bg-white/50',
        isRTL && 'text-right'
      )}
      style={{ direction: dir }}
    >
      <div className="p-4 space-y-4">
        {/* Header with Create Button */}
        <div className={cn(
          'flex items-center justify-between gap-4',
          isRTL && 'flex-row-reverse'
        )}>
          <InvoicesHeader />
          <Button
            onClick={handleCreateInvoice}
            className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg"
          >
            <span className="text-lg mr-2">🧾</span>
            {t('newInvoice') || 'New Invoice'}
          </Button>
        </div>

        {/* Statistics */}
        <InvoicesStats invoices={invoices} profile={profile as UserProfile} />

        {/* Invoices List */}
        <InvoicesSection
          invoices={invoices}
          profile={profile as UserProfile}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          handleDownloadPDF={handleDownloadPDF}
          handleSendToClient={handleSendToClient}
          handleDeleteInvoice={handleDeleteInvoice}
        />
      </div>
    </div>
  );
}

export default InvoicesApp;
