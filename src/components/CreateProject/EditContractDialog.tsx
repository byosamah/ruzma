import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Icons replaced with emojis
import { DatabaseProject } from '@/hooks/projectTypes';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const contractEditSchema = z.object({
  contractTerms: z.string().optional(),
  paymentTerms: z.string().optional(),
  projectScope: z.string().optional(),
  revisionPolicy: z.string().optional(),
});

type ContractEditFormData = z.infer<typeof contractEditSchema>;

interface EditContractDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project: DatabaseProject;
  onContractUpdated: () => void;
}

const EditContractDialog: React.FC<EditContractDialogProps> = ({
  isOpen,
  onClose,
  project,
  onContractUpdated
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('contract');

  const form = useForm<ContractEditFormData>({
    resolver: zodResolver(contractEditSchema),
    defaultValues: {
      contractTerms: project.contract_terms || '',
      paymentTerms: project.payment_terms || '',
      projectScope: project.project_scope || '',
      revisionPolicy: project.revision_policy || '',
    },
  });

  const handleUpdateAndResend = async (data: ContractEditFormData) => {
    if (!project.id) return;

    setIsUpdating(true);
    try {
      // First update the project with new contract terms
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          contract_terms: data.contractTerms,
          payment_terms: data.paymentTerms,
          project_scope: data.projectScope,
          revision_policy: data.revisionPolicy,
          contract_status: 'pending',
          contract_sent_at: new Date().toISOString(),
          contract_rejection_reason: null, // Clear previous rejection reason
        })
        .eq('id', project.id);

      if (updateError) throw updateError;

      // Then resend the contract
      const { error: resendError } = await supabase.functions.invoke('resend-contract', {
        body: { projectId: project.id }
      });

      if (resendError) throw resendError;

      toast.success('Contract updated and resent successfully');
      onContractUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating contract:', error);
      toast.error('Failed to update contract');
    } finally {
      setIsUpdating(false);
    }
  };

  const defaultContractTerms = `Terms and Conditions:

1. SCOPE OF WORK
The freelancer agrees to provide the services outlined in the project scope and milestones detailed in this agreement.

2. PAYMENT TERMS
Payment will be made according to the milestone schedule outlined below. All payments are due within 7 days of milestone completion and approval.

3. INTELLECTUAL PROPERTY
Upon full payment, all intellectual property rights for the completed work will transfer to the client.

4. CONFIDENTIALITY
Both parties agree to maintain confidentiality of all proprietary information shared during this project.

5. REVISIONS
Revisions are included as outlined in the revision policy. Additional revisions beyond the scope may incur extra charges.

6. TERMINATION
Either party may terminate this agreement with 7 days written notice. Client will pay for all completed work up to the termination date.`;

  const defaultPaymentTerms = `Payment Schedule:
- Payments due within 7 days of milestone completion
- Late payments may incur a 1.5% monthly fee
- All payments in the agreed project currency
- Payment methods: Bank transfer, PayPal, or as agreed
- Partial refunds available for incomplete milestones only`;

  const defaultProjectScope = `Project Deliverables:
[Outline specific deliverables, features, and requirements]

Timeline:
[Specify project duration and key deadlines]

Included Services:
[List what is included in the project price]

Not Included:
[Specify what is not included to avoid scope creep]`;

  const defaultRevisionPolicy = `Revision Policy:
- Up to 2 rounds of revisions included per milestone
- Revisions must be requested within 7 days of delivery
- Additional revisions: $50 per hour
- Major scope changes require separate agreement
- Revisions must be specific and actionable`;

  console.log('EditContractDialog loading'); // Debug log
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">📄</span>
            Edit Contract Terms
          </DialogTitle>
          <DialogDescription>
            Update the contract terms and conditions, then resend to your client for approval.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleUpdateAndResend)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="contract" className="flex items-center gap-1">
                  <span className="text-lg">📄</span>
                  Contract
                </TabsTrigger>
                <TabsTrigger value="payment" className="flex items-center gap-1">
                  <span className="text-lg">💰</span>
                  Payment
                </TabsTrigger>
                <TabsTrigger value="scope" className="flex items-center gap-1">
                  <span className="text-lg">🎯</span>
                  Scope
                </TabsTrigger>
                <TabsTrigger value="revisions" className="flex items-center gap-1">
                  <span className="text-lg">🔄</span>
                  Revisions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="contract" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="contractTerms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>General Contract Terms</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter contract terms and conditions..."
                          className="min-h-[300px] resize-y"
                          {...field}
                          value={field.value || defaultContractTerms}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="payment" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="paymentTerms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Terms and Schedule</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter payment terms..."
                          className="min-h-[300px] resize-y"
                          {...field}
                          value={field.value || defaultPaymentTerms}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="scope" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="projectScope"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Scope and Deliverables</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Define project scope..."
                          className="min-h-[300px] resize-y"
                          {...field}
                          value={field.value || defaultProjectScope}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="revisions" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="revisionPolicy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Revision Policy</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter revision policy..."
                          className="min-h-[300px] resize-y"
                          {...field}
                          value={field.value || defaultRevisionPolicy}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="gap-2"
              >
                <span className="text-lg">
                  {isUpdating ? '🔄' : '📧'}
                </span>
                Update & Resend Contract
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditContractDialog;