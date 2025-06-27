
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  storeId?: string;
  variantId?: string;
}

export interface SubscriptionProfile {
  user_type: string;
  subscription_status: string;
  subscription_id: string;
}
