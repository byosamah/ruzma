
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
// Icons replaced with emojis
import { InvoiceFormData } from './types';
import { useAuth } from '@/hooks/core/useAuth';
import { useProjects } from '@/hooks/useProjects';
import { useT } from '@/lib/i18n';
import { getCurrencySymbol } from '@/lib/currency';
import { useLanguage } from '@/contexts/LanguageContext';

interface LineItemsSectionProps {
  invoiceData: InvoiceFormData;
  updateLineItem: (id: string, field: keyof import('./types').LineItem, value: string | number) => void;
  addLineItem: () => void;
  removeLineItem: (id: string) => void;
  updateTax: (taxAmount: number) => void;
  showTaxInput: boolean;
  setShowTaxInput: (show: boolean) => void;
}

const LineItemsSection: React.FC<LineItemsSectionProps> = ({
  invoiceData,
  updateLineItem,
  addLineItem,
  removeLineItem,
  updateTax,
  showTaxInput,
  setShowTaxInput
}) => {
  const t = useT();
  const { user } = useAuth();
  const { projects } = useProjects(user);
  const { language } = useLanguage();
  const currencySymbol = getCurrencySymbol(invoiceData.currency as any, language);

  // Populate line items with project milestones when project is selected
  useEffect(() => {
    if (invoiceData.projectId && projects.length) {
      const selectedProject = projects.find(p => p.id === invoiceData.projectId);
      if (selectedProject?.milestones?.length) {
        // Clear existing line items and populate with milestones
        const milestoneLineItems = selectedProject.milestones.map((milestone, index) => ({
          id: milestone.id,
          description: milestone.title,
          quantity: 1,
          amount: Number(milestone.price) || 0
        }));
        
        // Update parent component with milestone data
      }
    }
  }, [invoiceData.projectId, projects]);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-600 border-b pb-2">
            <div className="col-span-6">{t('description').toUpperCase()}</div>
            <div className="col-span-2 text-center">{t('quantity').toUpperCase()}</div>
            <div className="col-span-3 text-right">{t('amount').toUpperCase()} ({currencySymbol})</div>
            <div className="col-span-1"></div>
          </div>

          {invoiceData.lineItems.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-6">
                <Input
                  placeholder={t('description')}
                  value={item.description}
                  onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                  className="border-gray-300 border"
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  className="border-gray-300 border"
                />
              </div>
              <div className="col-span-3">
                <Input
                  type="number"
                  value={item.amount}
                  onChange={(e) => updateLineItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  placeholder={`0.00 ${currencySymbol}`}
                  className="border-gray-300 border"
                />
              </div>
              <div className="col-span-1">
                {invoiceData.lineItems.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLineItem(item.id)}
                  >
                    <span className="text-lg text-red-500">🗑️</span>
                  </Button>
                )}
              </div>
            </div>
          ))}

          <Button
            variant="ghost"
            onClick={addLineItem}
            className="text-blue-600 hover:text-blue-700"
          >
            <span className="text-lg mr-2">➕</span>
            {t('addCustomCharge')}
          </Button>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">{t('subtotal').toUpperCase()}</span>
            <span className="font-medium">{currencySymbol}{invoiceData.subtotal.toFixed(2)}</span>
          </div>

          {!showTaxInput ? (
            <Button
              variant="ghost"
              className="text-blue-600 hover:text-blue-700 p-0 h-auto"
              onClick={() => setShowTaxInput(true)}
            >
              <span className="text-lg mr-2">➕</span>
              {t('addTax')}
            </Button>
          ) : (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">{t('tax').toUpperCase()}</span>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={invoiceData.tax}
                  onChange={(e) => updateTax(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  className="w-24 h-8"
                  placeholder={`0.00`}
                />
                <span className="text-gray-600">{currencySymbol}</span>
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">{t('total').toUpperCase()}</span>
              <span className="text-xl font-bold">{currencySymbol}{invoiceData.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LineItemsSection;
