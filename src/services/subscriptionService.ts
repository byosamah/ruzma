
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserSubscription, CheckoutSessionData } from '@/types/subscription';

export const fetchUserSubscription = async (user: User): Promise<UserSubscription> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('user_type, storage_used, project_count, subscription_status, grace_period_end')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  
  return {
    ...data,
    user_type: (data.user_type as 'free' | 'plus') || 'free'
  };
};

export const createLemonSqueezyCheckout = async (checkoutData: CheckoutSessionData): Promise<string> => {
  const requestBody = {
    data: {
      type: 'checkouts',
      attributes: {
        checkout_options: {
          embed: false,
          media: true,
          logo: true,
        },
        checkout_data: [
          {
            variant_id: checkoutData.variant_id,
            custom: {
              user_id: checkoutData.user_id,
            },
          }
        ],
        product_options: {
          enabled_variants: [checkoutData.variant_id],
          redirect_url: checkoutData.redirect_url,
          receipt_link_url: checkoutData.receipt_link_url,
        },
        expires_at: null,
        preview: false,
        test_mode: false,
      },
      relationships: {
        store: {
          data: {
            type: 'stores',
            id: checkoutData.store_id,
          },
        },
        variant: {
          data: {
            type: 'variants',
            id: checkoutData.variant_id.toString(),
          },
        },
      },
    },
  };

  console.log('Request body:', JSON.stringify(requestBody, null, 2));

  const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5NGQ1OWNlZi1kYmI4LTRlYTUtYjE3OC1kMjU0MGZjZDY5MTkiLCJqdGkiOiJiOGE3MmM2MmM5ZmFhNWFmMzgxYmFjNzEzMmFjOGY3ODUwOTc4Njk4YjljYmZkYWYzODBjYzZmMzk3M2M5ODFiNTI4NGZhNjllMGRhZDVmMyIsImlhdCI6MTc1MDIyNzkyNS4zMzA4MTYsIm5iZiI6MTc1MDIyNzkyNS4zMzA4MTksImV4cCI6MjA2NTc2MDcyNS4yODQ4NTMsInN1YiI6IjIzMTEwMzgiLCJzY29wZXMiOltdfQ.apdJ7D7pagrLUIak_drLN_BAqR4K7EF9xTapJ2_gWqLUrGtwFTQZ3iLI00w2WiL6epftaLPrzQz0Yc4-O7la5lBjEfbPeL9AISYps3v_rraa4HrazVeYflCg8gdPLZjoLUyWetzVcpAcUCkPzQQgBbysxDiSvSx2RQo3TjwldHS9lfNTgeT1XW2NrDjqV4lOIKzzeiBKcijFBFi8NGw0ZaI-XarV5ucF4QgmpZL_d__PYT2dSR_1S_mN1fQDzLPQKcI-1FLo4i1Sb_6L6x9lB5r32CLLEtH62L8RNazETNilEfNoghCPfnCACJHgFM0rpyei0FiTwKEuDIAsmXMgdSHCKne3x_jVLPXYuzdbGg7uxHRpU6YCqNcG9Exf5s9t1oO8VtaKpYOhISsboRhODhmPJlvI_spG2R3lfOe0tNYgDTlg970svUBITEwIWfMWFkSxaIdDU1toTOLG9w-xw01kJc3CU045AFjr-vvlOtZoJ0XSSy52nbatRr4QGW6z',
      'Content-Type': 'application/vnd.api+json',
      'Accept': 'application/vnd.api+json',
    },
    body: JSON.stringify(requestBody),
  });

  console.log('Response status:', response.status);
  console.log('Response headers:', response.headers);

  const responseText = await response.text();
  console.log('Response text:', responseText);

  let data;
  try {
    data = JSON.parse(responseText);
  } catch (parseError) {
    console.error('Failed to parse response as JSON:', parseError);
    throw new Error('Invalid response from payment provider');
  }
  
  if (!response.ok) {
    console.error('API Error Response:', data);
    const errorMessage = data.errors?.[0]?.detail || data.message || 'Failed to create checkout session';
    throw new Error(errorMessage);
  }

  if (!data.data?.attributes?.url) {
    console.error('No checkout URL in response:', data);
    throw new Error('No checkout URL received');
  }

  console.log('Checkout URL:', data.data.attributes.url);
  return data.data.attributes.url;
};

export const checkUserLimits = async (userId: string, action: 'project' | 'storage', size: number = 0): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('check_user_limits', {
      _user_id: userId,
      _action: action,
      _size: size
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error checking user limits:', error);
    return false;
  }
};

export const updateUserStorage = async (userId: string, sizeChange: number): Promise<void> => {
  const { error } = await supabase.rpc('update_user_storage', {
    _user_id: userId,
    _size_change: sizeChange
  });

  if (error) throw error;
};

export const updateProjectCount = async (userId: string, countChange: number): Promise<void> => {
  const { error } = await supabase.rpc('update_project_count', {
    _user_id: userId,
    _count_change: countChange
  });

  if (error) throw error;
};
