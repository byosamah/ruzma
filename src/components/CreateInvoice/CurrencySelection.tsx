
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EnhancedCurrencySelect } from '@/components/ui/enhanced-currency-select';
import { InvoiceFormData } from './types';
import { useAuth } from '@/hooks/core/useAuth';
import { useProfileQuery } from '@/hooks/core/useProfileQuery';
import { useUserCurrency } from '@/hooks/useUserCurrency';
import { useProjects } from '@/hooks/useProjects';
import { useT } from '@/lib/i18n';

interface CurrencySelectionProps {
  invoiceData: InvoiceFormData;
  updateField: (field: keyof InvoiceFormData, value: string | number | boolean | Date) => void;
}

const CurrencySelection = ({
  invoiceData,
  updateField
}) => {
  const t = useT();
  const { user } = useAuth();
  const { data: profile } = useProfileQuery(user);
  const { currency: userCurrency, currencyService } = useUserCurrency(profile);
  const { projects } = useProjects(user);

  // Find selected project to get its currency
  const selectedProject = projects.find(p => p.id === invoiceData.projectId);
  const projectCurrency = selectedProject?.currency || selectedProject?.freelancer_currency;

  // Set the user's preferred currency when component mounts only (if no project is selected)
  useEffect(() => {
    if (userCurrency && !invoiceData.currency && !projectCurrency) {
      updateField('currency', userCurrency);
    }
  }, [userCurrency, updateField, invoiceData.currency, projectCurrency]);

  const resetToDefault = () => {
    if (userCurrency) {
      updateField('currency', userCurrency);
    }
  };

  const resetToProject = () => {
    if (projectCurrency) {
      updateField('currency', projectCurrency);
    }
  };

  const isUsingDefault = invoiceData.currency === userCurrency;
  const isUsingProjectCurrency = invoiceData.currency === projectCurrency;
  const currencySource = isUsingProjectCurrency ? 'project' : (isUsingDefault ? 'profile' : 'custom');

  return (
    <Card className="card-hover">
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold">{t('currency')}</label>
              {currencySource === 'project' && (
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-md">
                  From project
                </span>
              )}
              {currencySource === 'profile' && (
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                  Profile default
                </span>
              )}
              {currencySource === 'custom' && (
                <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-md">
                  Custom
                </span>
              )}
            </div>
            <div className="flex gap-1">
              {projectCurrency && !isUsingProjectCurrency && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetToProject}
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <span className="text-sm mr-1">🏗️</span>
                  Use project ({projectCurrency})
                </Button>
              )}
              {userCurrency && !isUsingDefault && userCurrency !== projectCurrency && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetToDefault}
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <span className="text-sm mr-1">🔄</span>
                  Use default ({userCurrency})
                </Button>
              )}
            </div>
          </div>
          
          <EnhancedCurrencySelect
            value={invoiceData.currency}
            onChange={(value) => updateField('currency', value)}
            placeholder={t('selectCurrency')}
            showSearch={true}
            showCountryFlags={true}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrencySelection;
