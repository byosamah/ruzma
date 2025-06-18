
import { supabase } from '@/integrations/supabase/client';

export interface CheckoutData {
  data: {
    type: 'checkouts';
    attributes: {
      checkout_data?: Record<string, any>;
      checkout_options?: Record<string, any>;
      expires_at?: string;
      preview?: boolean;
      test_mode?: boolean;
    };
    relationships: {
      store: {
        data: {
          type: 'stores';
          id: string;
        };
      };
      variant: {
        data: {
          type: 'variants';
          id: string;
        };
      };
    };
  };
}

export interface CheckoutResponse {
  data: {
    id: string;
    type: 'checkouts';
    attributes: {
      url: string;
      created_at: string;
      updated_at: string;
    };
  };
}

export class LemonSqueezyService {
  private apiKey: string;
  private baseUrl = 'https://api.lemonsqueezy.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`LemonSqueezy API error: ${response.status} - ${errorData}`);
    }

    return response.json();
  }

  async createCheckout(storeId: string, variantId: string, checkoutData?: Record<string, any>): Promise<CheckoutResponse> {
    const payload: CheckoutData = {
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: checkoutData,
          test_mode: process.env.NODE_ENV !== 'production',
        },
        relationships: {
          store: {
            data: {
              type: 'stores',
              id: storeId,
            },
          },
          variant: {
            data: {
              type: 'variants',
              id: variantId,
            },
          },
        },
      },
    };

    return this.makeRequest<CheckoutResponse>('/checkouts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getSubscription(subscriptionId: string) {
    return this.makeRequest(`/subscriptions/${subscriptionId}`);
  }

  async updateSubscription(subscriptionId: string, data: any) {
    return this.makeRequest(`/subscriptions/${subscriptionId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}
