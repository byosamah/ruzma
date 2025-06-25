import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { InvoiceFormData } from './types';
import { useAuth } from '@/hooks/dashboard/useAuth';
import { useProjects } from '@/hooks/useProjects';

interface LineItemsSectionProps {
  invoiceData: InvoiceFormData;
  updateLineItem: (id: string, field: keyof import('./types').LineItem, value: any) => void;
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
  const { user } = useAuth();
  const { projects } = useProjects(user);

  // Populate line items with project milestones when project is selected
  useEffect(() => {
    if (invoiceData.projectId && projects.length > 0) {
      const selectedProject = projects.find(p => p.id === invoiceData.projectId);
      if (selectedProject && selectedProject.milestones && selectedProject.milestones.length > 0) {
        // Clear existing line items and populate with milestones
        const milestoneLineItems = selectedProject.milestones.map((milestone, index) => ({
          id: milestone.id,
          description: milestone.title,
          quantity: 1,
          amount: Number(milestone.price) || 0
        }));
        
        // Update parent component with milestone data
        // This would typically be done through a callback prop
        console.log('Project milestones loaded:', milestoneLineItems);
      }
    }
  }, [invoiceData.projectId, projects]);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-600 border-b pb-2">
            <div className="col-span-6">DESCRIPTION</div>
            <div className="col-span-2 text-center">QUANTITY</div>
            <div className="col-span-3 text-right">AMOUNT</div>
            <div className="col-span-1"></div>
          </div>

          {invoiceData.lineItems.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-6">
                <Input
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="col-span-3">
                <Input
                  type="number"
                  value={item.amount}
                  onChange={(e) => updateLineItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="col-span-1">
                {invoiceData.lineItems.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLineItem(item.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
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
            <Plus className="w-4 h-4 mr-2" />
            Add custom charge
          </Button>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">SUBTOTAL</span>
            <span className="font-medium">{invoiceData.subtotal.toFixed(2)} {invoiceData.currency}</span>
          </div>

          {!showTaxInput ? (
            <Button
              variant="ghost"
              className="text-blue-600 hover:text-blue-700 p-0 h-auto"
              onClick={() => setShowTaxInput(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add tax
            </Button>
          ) : (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">TAX</span>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={invoiceData.tax}
                  onChange={(e) => updateTax(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  className="w-24 h-8"
                />
                <span className="text-gray-600">{invoiceData.currency}</span>
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">TOTAL</span>
              <span className="text-xl font-bold">{invoiceData.total.toFixed(2)} {invoiceData.currency}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LineItemsSection;
