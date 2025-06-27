
import React from 'react';
import { CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { useT } from '@/lib/i18n';

interface SubscriptionCardFeaturesProps {
  features: string[];
}

export const SubscriptionCardFeatures: React.FC<SubscriptionCardFeaturesProps> = ({
  features
}) => {
  const t = useT();

  const translateFeatures = (features: string[]) => {
    return features.map(feature => {
      if (feature.includes('project') && !feature.includes('projects')) {
        return `1 ${t('project')}`;
      }
      if (feature.includes('projects')) {
        const match = feature.match(/(\d+)\s+projects/);
        if (match) {
          return `${match[1]} ${t('projects')}`;
        }
        if (feature.includes('Unlimited')) {
          return t('unlimitedProjects');
        }
      }
      
      if (feature.includes('storage') || feature.includes('GB')) {
        const match = feature.match(/(\d+)GB/);
        if (match) {
          return `${match[1]}GB ${t('storage')}`;
        }
      }
      
      if (feature.includes('Basic support')) {
        return t('basicSupport');
      }
      if (feature.includes('Priority support')) {
        return t('prioritySupport');
      }
      
      if (feature.includes('Standard analytics')) {
        return t('standardAnalytics');
      }
      if (feature.includes('Advanced analytics')) {
        return t('advancedAnalytics');
      }
      
      if (feature.includes('Links-sharing only')) {
        return t('linksSharing');
      }
      if (feature.includes('File uploads')) {
        return t('fileUploads');
      }
      if (feature.includes('Custom branding')) {
        return t('customBranding');
      }
      
      return feature;
    });
  };

  return (
    <CardContent className="space-y-3 pb-6">
      {translateFeatures(features).map((feature, index) => (
        <div key={index} className="flex items-start gap-3">
          <Check className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-gray-700 leading-relaxed">{feature}</span>
        </div>
      ))}
    </CardContent>
  );
};
