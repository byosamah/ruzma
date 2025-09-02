
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { InvoiceFormData } from './types';
import { getCurrencySymbol, formatCurrency, CurrencyCode } from '@/lib/currency';
import { useT } from '@/lib/i18n';
import { useLanguage } from '@/contexts/LanguageContext';

interface InvoicePreviewProps {
  invoiceData: InvoiceFormData;
}

const InvoicePreview = ({ invoiceData }: InvoicePreviewProps) => {
  const t = useT();
  const { language } = useLanguage();
  const currencySymbol = getCurrencySymbol(invoiceData.currency as CurrencyCode, language);
  
  const formatAmount = (amount: number) => {
    return formatCurrency(amount, invoiceData.currency as CurrencyCode, language);
  };

  return (
    <div className="sticky top-6">
      <Card className="bg-gray-900 text-white">
        <CardContent className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-6">{t('invoice')}</h1>
              <div className="space-y-2 text-sm">
                <div className="flex">
                  <span className="text-gray-400 w-32">{t('invoiceId')}:</span>
                  <span className="text-orange-400">{invoiceData.invoiceId || t('addInvoiceId')}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-400 w-32">{t('invoiceDate')}:</span>
                  <span>{format(invoiceData.invoiceDate, 'MM/dd/yyyy')}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-400 w-32">{t('dueDate')}:</span>
                  <span>{format(invoiceData.dueDate, 'MM/dd/yyyy')}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-400 w-32">{t('purchaseOrder')}:</span>
                  <span className="text-gray-400">{invoiceData.purchaseOrder || t('addPurchaseOrderNumber')}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-400 w-32">{t('paymentTerms')}:</span>
                  <span className="text-gray-400">{invoiceData.paymentTerms || t('addPaymentTerms')}</span>
                </div>
              </div>
            </div>
            
            <div className="w-24 h-24 bg-gray-800 rounded-lg flex items-center justify-center">
              {invoiceData.logoUrl ? (
                <img src={invoiceData.logoUrl} alt="Logo" className="w-full h-full object-contain rounded-lg" />
              ) : (
                <div className="text-center">
                  <div className="w-8 h-8 bg-gray-600 rounded mx-auto mb-1"></div>
                  <span className="text-xs text-gray-500">{t('addLogo')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Billing Information */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-medium mb-2">{t('billedTo')}:</h3>
              <div className="text-sm text-gray-300">
                <div className="mb-1">{invoiceData.billedTo.name || t('clientName')}</div>
                <div className="whitespace-pre-line">{invoiceData.billedTo.address || t('address')}</div>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">{t('payTo')}:</h3>
              <div className="text-sm text-gray-300">
                <div className="mb-1">{invoiceData.payTo.name || t('yourName')}</div>
                <div className="whitespace-pre-line">{invoiceData.payTo.address || t('address')}</div>
              </div>
            </div>
          </div>

          {/* Currency */}
          <div className="flex justify-end mb-6">
            <div className="text-sm">
              <span className="text-gray-400 mr-4">{t('setCurrency').toUpperCase()}</span>
              <span className="bg-gray-800 px-3 py-1 rounded">{invoiceData.currency}</span>
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-8">
            <div className="grid grid-cols-12 gap-4 text-sm text-gray-400 border-b border-gray-700 pb-2 mb-4">
              <div className="col-span-6">{t('description').toUpperCase()}</div>
              <div className="col-span-3 text-center">{t('quantity').toUpperCase()}</div>
              <div className="col-span-3 text-right">{t('amount').toUpperCase()}</div>
            </div>

            {invoiceData.lineItems.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 text-sm mb-3">
                <div className="col-span-6">
                  {item.description || t('description')}
                </div>
                <div className="col-span-3 text-center">
                  {item.quantity}
                </div>
                <div className="col-span-3 text-right">
                  {formatAmount(item.quantity * item.amount)}
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">{t('subtotal').toUpperCase()}</span>
              <span>{formatAmount(invoiceData.subtotal)}</span>
            </div>
            
            {invoiceData.tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{t('tax').toUpperCase()}</span>
                <span>{formatAmount(invoiceData.tax)}</span>
              </div>
            )}

            <div className="border-t border-gray-700 pt-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">{t('total').toUpperCase()}</span>
                <span className="text-xl font-bold">{formatAmount(invoiceData.total)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoicePreview;
