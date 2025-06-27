
import { supabase } from '@/integrations/supabase/client';

export const createStorageBuckets = async () => {
  try {
    // Create profile-pictures bucket
    const { error: profileBucketError } = await supabase.storage.createBucket('profile-pictures', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      fileSizeLimit: 5242880, // 5MB
    });

    if (profileBucketError && !profileBucketError.message.includes('already exists')) {
      console.error('Error creating profile-pictures bucket:', profileBucketError);
    }

    // Create brand-logos bucket
    const { error: brandBucketError } = await supabase.storage.createBucket('brand-logos', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
      fileSizeLimit: 5242880, // 5MB
    });

    if (brandBucketError && !brandBucketError.message.includes('already exists')) {
      console.error('Error creating brand-logos bucket:', brandBucketError);
    }
  } catch (error) {
    console.error('Error setting up storage buckets:', error);
  }
};
