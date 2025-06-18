
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { SubscriptionPlan } from '@/hooks/useSubscription';

interface SubscriptionCardProps {
  plan: SubscriptionPlan;
  isPopular?: boolean;
  onSelectPlan: (planId: string) => void;
  isLoading?: boolean;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  plan,
  isPopular = false,
  onSelectPlan,
  isLoading = false,
}) => {
  return (
    <Card className={`relative ${isPopular ? 'border-primary shadow-lg scale-105' : ''}`}>
      {isPopular && (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
          Most Popular
        </Badge>
      )}
      
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
        <div className="mt-2">
          <span className="text-3xl font-bold">${plan.price}</span>
          <span className="text-muted-foreground">/{plan.interval}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-center">
            <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
            <span className="text-sm">{feature}</span>
          </div>
        ))}
      </CardContent>

      <CardFooter>
        <Button
          onClick={() => onSelectPlan(plan.id)}
          disabled={isLoading}
          className="w-full"
          variant={isPopular ? 'default' : 'outline'}
        >
          {isLoading ? 'Creating checkout...' : 'Choose Plan'}
        </Button>
      </CardFooter>
    </Card>
  );
};
