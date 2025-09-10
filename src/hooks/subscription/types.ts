
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  interval: 'month' | 'year' | 'lifetime';
  features: string[];
  storeId?: string;
  variantId?: string;
}

export interface SubscriptionProfile {
  user_type: string;
  subscription_status: string;
  subscription_id: string;
  expires_at?: string;
}
