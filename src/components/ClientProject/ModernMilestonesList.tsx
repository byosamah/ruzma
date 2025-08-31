import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import ModernMilestoneCard from './ModernMilestoneCard';
import { CurrencyCode } from '@/lib/currency';
import { useT } from '@/lib/i18n';
import { FreelancerBranding } from '@/types/branding';
import { Target, Filter, Grid, List } from 'lucide-react';
interface Milestone {
  id: string;
  title: string;
  description?: string;
  price: number;
  status: 'pending' | 'in_progress' | 'delivered' | 'payment_submitted' | 'approved' | 'rejected' | 'revision_requested';
  deliverable_link?: string;
  paymentProofUrl?: string;
  start_date?: string;
  end_date?: string;
}
import { DatabaseMilestone } from '@/types/shared';

interface ModernMilestonesListProps {
  milestones: DatabaseMilestone[];
  onPaymentUpload: (milestoneId: string, file: File) => Promise<boolean>;
  onRevisionRequest?: (milestoneId: string, feedback: string, images: string[]) => Promise<void>;
  currency: CurrencyCode;
  freelancerCurrency?: CurrencyCode | null;
  branding?: FreelancerBranding | null;
  paymentProofRequired?: boolean;
  token?: string;
}
const ModernMilestonesList = ({
  milestones,
  onPaymentUpload,
  onRevisionRequest,
  currency,
  freelancerCurrency,
  branding,
  paymentProofRequired = false,
  token
}) => {
  const t = useT();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'all' | 'active' | 'completed'>('all');

  // Transform database milestones to match expected interface
  const transformedMilestones: Milestone[] = milestones.map(milestone => ({
    id: milestone.id,
    title: milestone.title,
    description: milestone.description,
    price: milestone.price,
    status: milestone.status,
    deliverable_link: milestone.deliverable_link,
    paymentProofUrl: milestone.payment_proof_url,
    start_date: milestone.start_date,
    end_date: milestone.end_date
  }));

  // Filter milestones based on view mode and status filter
  const filteredMilestones = transformedMilestones.filter(milestone => {
    // View mode filter
    if (viewMode === 'active' && ['approved', 'rejected'].includes(milestone.status)) {
      return false;
    }
    if (viewMode === 'completed' && !['approved', 'rejected'].includes(milestone.status)) {
      return false;
    }

    // Status filter
    if (statusFilter !== 'all' && milestone.status !== statusFilter) {
      return false;
    }
    return true;
  });

  // Get status counts for badges
  const statusCounts = {
    all: transformedMilestones.length,
    active: transformedMilestones.filter(m => !['approved', 'rejected'].includes(m.status)).length,
    completed: transformedMilestones.filter(m => ['approved', 'rejected'].includes(m.status)).length
  };
  const getStatusOptions = () => {
    const statuses = [...new Set(transformedMilestones.map(m => m.status))];
    return statuses.map(status => ({
      value: status,
      label: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count: transformedMilestones.filter(m => m.status === status).length
    }));
  };
  return <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            {t('projectMilestones')}
          </CardTitle>
          
          {/* Status Filter */}
          
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={viewMode} onValueChange={value => setViewMode(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Grid className="w-4 h-4" />
              {t('all')}
              <Badge variant="secondary" className="ml-1">
                {statusCounts.all}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Active
              <Badge variant="default" className="ml-1">
                {statusCounts.active}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Completed
              <Badge variant="outline" className="ml-1">
                {statusCounts.completed}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={viewMode} className="mt-6">
            <div className="space-y-4">
              {filteredMilestones.length ? filteredMilestones.map((milestone, index) => <div key={milestone.id}>
                    <ModernMilestoneCard milestone={milestone} currency={currency} onPaymentUpload={onPaymentUpload} onRevisionRequest={onRevisionRequest} paymentProofRequired={paymentProofRequired} isClient={true} />
                    {index < filteredMilestones.length - 1 && <Separator className="my-4" />}
                  </div>) : <div className="text-center py-12">
                  <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {t('noMilestonesFound')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {viewMode === 'all' ? 'No milestones have been created for this project yet.' : viewMode === 'active' ? 'No active milestones at the moment.' : 'No completed milestones yet.'}
                  </p>
                </div>}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>;
};
export default ModernMilestonesList;