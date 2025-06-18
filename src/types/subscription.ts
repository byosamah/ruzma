
export interface UserSubscription {
  user_type: 'free' | 'plus';
  storage_used: number;
  project_count: number;
  subscription_status?: string;
  grace_period_end?: string;
}

export interface CheckoutSessionData {
  user_id: string;
  variant_id: number;
  store_id: string;
  webhook_url: string;
  redirect_url: string;
  receipt_link_url: string;
}
