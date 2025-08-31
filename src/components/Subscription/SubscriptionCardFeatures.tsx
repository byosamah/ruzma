
import React from 'react';
import { CardContent } from '@/components/ui/card';
import { useT } from '@/lib/i18n';

interface SubscriptionCardFeaturesProps {
  features: string[];
}

export function SubscriptionCardFeatures({
  features
}: SubscriptionCardFeaturesProps) {
  const t = useT();

  // Since features now include emojis and are pre-formatted, we don't need translation
  // but we keep the structure for consistency
  const displayFeatures = (features: string[]) => {
    return features.map(feature => {
      // For features that might need translation, we can add specific handling here
      // For now, return features as-is since they include emojis and are descriptive
      return feature;
    });
  };

  return (
    <CardContent className="space-y-3 pb-4 px-4 sm:px-6">
      {displayFeatures(features).map((feature, index) => (
        <div key={index} className="flex items-start gap-3">
          <span className="text-sm sm:text-base text-gray-700 leading-relaxed break-words">
            {feature}
          </span>
        </div>
      ))}
    </CardContent>
  );
};
