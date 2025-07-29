import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CreateProjectFormData } from '@/lib/validators/project';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, DollarSign, Target, RotateCcw } from 'lucide-react';

interface ContractTermsSectionProps {
  form: UseFormReturn<CreateProjectFormData>;
}

export const ContractTermsSection: React.FC<ContractTermsSectionProps> = ({ form }) => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Contract Terms
        </CardTitle>
        <CardDescription>
          Define the contract terms and conditions for this project. These will be sent to your client for approval.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="contract" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="contract" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Contract
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Payment
            </TabsTrigger>
            <TabsTrigger value="scope" className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              Scope
            </TabsTrigger>
            <TabsTrigger value="revisions" className="flex items-center gap-1">
              <RotateCcw className="h-4 w-4" />
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
                      className="min-h-[200px] resize-y"
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
                      className="min-h-[200px] resize-y"
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
                      className="min-h-[200px] resize-y"
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
                      className="min-h-[200px] resize-y"
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
      </CardContent>
    </Card>
  );
};